class Enemy {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 15;
        this.height = 9;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.speed = 2;
        this.active = true;
    }

    update() {
        this.y += this.speed;
        if (this.y > this.canvas.height) {
            if (game.lives > 0) {
                game.lives--;
                game.updateLives();
                if (game.lives <= 0) {
                    game.gameOver = true;
                }
            }
            this.active = false;
        }
    }

    draw(ctx) {
        drawSprite(ctx, SPRITES.enemy, this.x, this.y);
    }

    checkCollision(bullet) {
        return (bullet.x < this.x + this.width &&
                bullet.x + bullet.width > this.x &&
                bullet.y < this.y + this.height &&
                bullet.y + bullet.height > this.y);
    }
} 