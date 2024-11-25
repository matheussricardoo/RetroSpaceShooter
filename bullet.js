class Bullet {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.width = 3;
        this.height = 3;
        this.active = true;
    }

    update() {
        this.y += this.speed;
        if (this.y < 0 || this.y > 600) {
            this.active = false;
        }
    }

    draw(ctx) {
        drawSprite(ctx, SPRITES.bullet, this.x, this.y);
    }

    isActive() {
        return this.active;
    }
} 