class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 20;
        this.height = 12;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 50;
        this.baseSpeed = 4;
        this.bullets = [];
        this.lastShot = 0;
        this.shotDelay = 300;
        this.mouseControl = false;
        this.targetX = this.x;

        // Adicionar controle do mouse
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.targetX = e.clientX - rect.left - this.width / 2;
            this.mouseControl = true;
        });

        canvas.addEventListener('click', () => {
            this.shoot();
        });

        // Desativar mouse ao usar teclado
        window.addEventListener('keydown', () => {
            this.mouseControl = false;
        });
    }

    get speed() {
        return this.baseSpeed * (game.powerUps.speedBoost ? 1.5 : 1);
    }

    update(keys) {
        if (this.mouseControl) {
            // Movimento suave em direção ao mouse
            this.x += (this.targetX - this.x) * 0.1;
        } else {
            if (keys['ArrowLeft'] && this.x > 0) {
                this.x -= this.speed;
            }
            if (keys['ArrowRight'] && this.x < this.canvas.width - this.width) {
                this.x += this.speed;
            }
        }

        // Manter nave dentro dos limites
        this.x = Math.max(0, Math.min(this.x, this.canvas.width - this.width));

        // Atualizar tiros
        this.bullets = this.bullets.filter(bullet => bullet.active);
        this.bullets.forEach(bullet => bullet.update());
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShot >= this.shotDelay) {
            if (game.powerUps.doubleShot) {
                const bulletY = this.y - 8;
                this.bullets.push(new Bullet(this.x + 4, bulletY, -6));
                this.bullets.push(new Bullet(this.x + this.width - 8, bulletY, -6));
            } else {
                const bulletX = this.x + this.width / 2 - 2;
                const bulletY = this.y - 8;
                this.bullets.push(new Bullet(bulletX, bulletY, -6));
            }
            this.lastShot = now;
        }
    }

    draw() {
        // Desenhar o player
        drawSprite(ctx, SPRITES.player, this.x, this.y);
        
        // Desenhar os tiros
        this.bullets.forEach(bullet => bullet.draw(ctx));
    }
} 