const SPRITES = {
    player: [
        "  B  ",
        " BBB ",
        "BBBBB",
    ],
    
    enemy: [
        "R   R",
        " RRR ",
        "RRRRR",
    ],
    
    bullet: [
        "Y",
    ],

    explosion: [
        "Y R Y",
        "R Y R",
        "Y R Y",
    ],

    powerUpSpeed: [
        "  C  ",
        " CCC ",
        "CCCCC",
    ],

    powerUpShot: [
        "  Y  ",
        " YYY ",
        "YYYYY",
    ]
};

const COLORS = {
    B: '#00ff00', // Verde para o player
    R: '#ff0000', // Vermelho para inimigos
    Y: '#ffff00', // Amarelo para tiros e explosões
    C: '#00ffff'  // Ciano para power-up de velocidade
};

function drawSprite(ctx, sprite, x, y, pixelSize = 4) {
    sprite.forEach((row, i) => {
        [...row].forEach((pixel, j) => {
            if (pixel !== ' ') {
                ctx.fillStyle = COLORS[pixel];
                ctx.fillRect(
                    x + j * pixelSize, 
                    y + i * pixelSize, 
                    pixelSize, 
                    pixelSize
                );
            }
        });
    });
} 