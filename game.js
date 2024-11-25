const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = 400;
canvas.height = 600;

class Game {
    constructor() {
        this.player = new Player(canvas);
        this.enemies = [];
        this.score = 0;
        this.keys = {};
        this.lastEnemySpawn = 0;
        this.enemySpawnDelay = 2500;
        this.gameOver = false;
        this.highScore = localStorage.getItem('highScore') || 0;
        document.getElementById('highScore').textContent = this.highScore;
        this.stars = Array(50).fill().map(() => new Star(canvas));
        this.explosions = [];
        this.language = localStorage.getItem('gameLanguage') || 'pt-BR';
        this.powerUps = {
            doubleShot: false,
            speedBoost: false
        };
        this.powerUpTimers = {
            doubleShot: 0,
            speedBoost: 0
        };
        this.lives = 3;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        
        this.updateTranslations();

        // Event listeners
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
        window.addEventListener('keypress', (e) => {
            if (e.key === ' ') {
                this.player.shoot();
            }
        });

        document.getElementById('restartButton').addEventListener('click', () => {
            this.restart();
        });
    }

    restart() {
        this.player = new Player(canvas);
        this.enemies = [];
        this.score = 0;
        this.lastEnemySpawn = 0;
        this.enemySpawnDelay = 2500;
        this.gameOver = false;
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('score').textContent = 'SCORE: 0';
        this.lives = 3;
        this.updateLives();
    }

    updateLives() {
        const livesContainer = document.querySelector('.lives');
        livesContainer.classList.add('shake');
        setTimeout(() => livesContainer.classList.remove('shake'), 500);
        
        livesContainer.innerHTML = Array(3).fill('♥')
            .map((heart, index) => `
                <div class="life ${index >= this.lives ? 'empty' : ''}">
                    ${heart}
                </div>
            `).join('');
    }

    spawnEnemy() {
        const now = Date.now();
        if (now - this.lastEnemySpawn >= this.enemySpawnDelay) {
            this.enemies.push(new Enemy(canvas));
            this.lastEnemySpawn = now;
            // Aumentar dificuldade mais lentamente
            this.enemySpawnDelay = Math.max(1000, this.enemySpawnDelay - 5);
        }
    }

    checkCollisions() {
        this.enemies.forEach(enemy => {
            this.player.bullets.forEach(bullet => {
                if (enemy.active && bullet.active && enemy.checkCollision(bullet)) {
                    enemy.active = false;
                    bullet.active = false;
                    this.score += 100;
                    scoreElement.textContent = `${TRANSLATIONS[this.language].score}: ${this.score}`;
                    
                    this.explosions.push({
                        x: enemy.x,
                        y: enemy.y,
                        timeLeft: 30
                    });
                }
            });

            // Colisão com o player
            if (!this.invulnerable && enemy.active && 
                enemy.x < this.player.x + this.player.width &&
                enemy.x + enemy.width > this.player.x &&
                enemy.y < this.player.y + this.player.height &&
                enemy.y + enemy.height > this.player.y) {
                    this.lives--;
                    this.updateLives();
                    enemy.active = false;

                    if (this.lives <= 0) {
                        this.gameOver = true;
                    } else {
                        // Período de invulnerabilidade
                        this.invulnerable = true;
                        this.invulnerableTimer = 120; // 2 segundos a 60fps
                    }
            }
        });
    }

    updateTranslations() {
        document.getElementById('score').textContent = `${TRANSLATIONS[this.language].score}: ${this.score}`;
        document.querySelector('.high-score').innerHTML = `${TRANSLATIONS[this.language].highScore}<br>${this.highScore}`;
        document.getElementById('gameOver').querySelector('h2').textContent = TRANSLATIONS[this.language].gameOver;
        document.getElementById('finalScore').parentElement.innerHTML = 
            `${TRANSLATIONS[this.language].finalScore}: <span id="finalScore">${this.score}</span>`;
        document.getElementById('restartButton').textContent = TRANSLATIONS[this.language].playAgain;
        
        // Atualizar textos dos controles
        const controls = document.querySelectorAll('.controls div');
        
        // Atualizar texto "Mover"
        controls[0].innerHTML = `
            <span class="control-key">←</span>
            <span class="control-key">→</span>
            ${TRANSLATIONS[this.language].move}
        `;
        
        // Atualizar texto "Atirar"
        controls[1].innerHTML = `
            <span class="control-key">SPACE</span>
            ${TRANSLATIONS[this.language].shoot}
        `;
        
        // Atualizar texto "Controle Alternativo"
        controls[2].innerHTML = `
            <span class="control-key">MOUSE</span>
            ${TRANSLATIONS[this.language].alternativeControl}
        `;

        // Atualizar tooltips dos power-ups
        document.querySelector('.power-up[data-type="doubleShot"]').setAttribute(
            'data-tooltip', 
            TRANSLATIONS[this.language].powerUps.doubleShot
        );
        document.querySelector('.power-up[data-type="speedBoost"]').setAttribute(
            'data-tooltip', 
            TRANSLATIONS[this.language].powerUps.speedBoost
        );

        // Atualizar legenda dos power-ups
        document.querySelector('.power-ups-legend h3').textContent = 
            TRANSLATIONS[this.language].powerUpsLegend.title;
        
        const legendItems = document.querySelectorAll('.legend-item span');
        legendItems[0].textContent = TRANSLATIONS[this.language].powerUpsLegend.doubleShot;
        legendItems[1].textContent = TRANSLATIONS[this.language].powerUpsLegend.speedBoost;
    }

    spawnPowerUp() {
        if (Math.random() < 0.003) { // 0.3% de chance por frame
            const type = Math.random() < 0.5 ? 'doubleShot' : 'speedBoost';
            this.activePowerUps = this.activePowerUps || [];
            this.activePowerUps.push({
                type,
                x: Math.random() * (canvas.width - 20),
                y: -20,
                width: 20,
                height: 20,
                speed: 2
            });
        }
    }

    checkPowerUpCollision(powerUp) {
        return (powerUp.x < this.player.x + this.player.width &&
                powerUp.x + powerUp.width > this.player.x &&
                powerUp.y < this.player.y + this.player.height &&
                powerUp.y + powerUp.height > this.player.y);
    }

    updatePowerUps() {
        if (this.activePowerUps) {
            this.activePowerUps.forEach((powerUp, index) => {
                powerUp.y += powerUp.speed;
                
                // Verificar colisão com o player
                if (this.checkPowerUpCollision(powerUp)) {
                    this.activatePowerUp(powerUp.type);
                    this.activePowerUps.splice(index, 1);
                }
                
                // Remover power-ups que saíram da tela
                if (powerUp.y > canvas.height) {
                    this.activePowerUps.splice(index, 1);
                }
            });
        }

        // Atualizar timers dos power-ups ativos
        Object.keys(this.powerUpTimers).forEach(type => {
            if (this.powerUpTimers[type] > 0) {
                this.powerUpTimers[type]--;
                if (this.powerUpTimers[type] === 0) {
                    this.powerUps[type] = false;
                    document.querySelector(`.power-up[data-type="${type}"]`).classList.remove('active');
                }
            }
        });
    }

    activatePowerUp(type) {
        this.powerUps[type] = true;
        this.powerUpTimers[type] = 600; // 10 segundos
        document.querySelector(`.power-up[data-type="${type}"]`).classList.add('active');
    }

    update() {
        if (this.gameOver) return;

        // Atualizar invulnerabilidade
        if (this.invulnerable) {
            this.invulnerableTimer--;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }

        // Atualizar estrelas
        this.stars.forEach(star => star.update());
        
        // Atualizar explosões
        this.explosions = this.explosions.filter(exp => {
            exp.timeLeft--;
            return exp.timeLeft > 0;
        });

        this.player.update(this.keys);
        this.spawnEnemy();

        this.enemies = this.enemies.filter(enemy => enemy.active);
        this.enemies.forEach(enemy => enemy.update());

        this.checkCollisions();
        this.updatePowerUps();
        this.spawnPowerUp();
    }

    draw() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Desenhar estrelas
        this.stars.forEach(star => star.draw(ctx));
        
        // Desenhar explosões
        this.explosions.forEach(exp => {
            drawSprite(ctx, SPRITES.explosion, exp.x, exp.y);
        });

        // Efeito visual de invulnerabilidade
        if (this.invulnerable) {
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.4;
            this.player.draw();
            ctx.restore();
        } else {
            this.player.draw();
        }

        this.enemies.forEach(enemy => enemy.draw(ctx));

        // Desenhar power-ups ativos
        if (this.activePowerUps) {
            this.activePowerUps.forEach(powerUp => {
                ctx.save();
                ctx.shadowBlur = 15;
                if (powerUp.type === 'doubleShot') {
                    // Design do tiro duplo (2×)
                    ctx.fillStyle = '#ffff00';
                    ctx.shadowColor = '#ffff00';
                    ctx.font = '20px "Press Start 2P"';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('2×', powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2);
                } else {
                    // Design da velocidade (↑)
                    ctx.fillStyle = '#00ffff';
                    ctx.shadowColor = '#00ffff';
                    ctx.font = '20px "Press Start 2P"';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('↑', powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2);
                }
                ctx.restore();
            });
        }

        if (this.gameOver) {
            document.getElementById('gameOver').style.display = 'block';
            document.getElementById('finalScore').textContent = this.score;
            
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('highScore', this.highScore);
                document.getElementById('highScore').textContent = this.highScore;
            }
        }
    }
}

const game = new Game();

function gameLoop() {
    game.update();
    game.draw();
    requestAnimationFrame(gameLoop);
}

gameLoop(); 

// Função para mudar o idioma
function changeLanguage(lang) {
    game.language = lang;
    localStorage.setItem('gameLanguage', lang);
    game.updateTranslations();
    // Atualizar botão ativo
    document.querySelectorAll('.language-selector button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.language-selector button[onclick*="${lang}"]`).classList.add('active');
}

// Definir botão ativo inicial
document.addEventListener('DOMContentLoaded', () => {
    const currentLang = localStorage.getItem('gameLanguage') || 'pt-BR';
    document.querySelector(`.language-selector button[onclick*="${currentLang}"]`).classList.add('active');
}); 