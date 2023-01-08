const jsChessEngine = require('js-chess-engine');
const canvas = require('canvas');
const fs = require("fs")

const CELL_SIZE = 50; // size of each cell in pixels
const BOARD_SIZE = 8; // number of rows and columns on the board

// Chess.com colors SSHHH!!!!
const colors = ['#eeeed5', '#7d945d'];
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

var images = null;
(async () => {
    images = {
        white: {
            p: await canvas.loadImage('./images/v2/w_pawn.png'),
            n: await canvas.loadImage('./images/v2/w_knight.png'),
            b: await canvas.loadImage('./images/v2/w_bishop.png'),
            r: await canvas.loadImage('./images/v2/w_rook.png'),
            q: await canvas.loadImage('./images/v2/w_queen.png'),
            k: await canvas.loadImage('./images/v2/w_king.png'),
        },
        black: {
            p: await canvas.loadImage('./images/v2/b_pawn.png'),
            n: await canvas.loadImage('./images/v2/b_knight.png'),
            b: await canvas.loadImage('./images/v2/b_bishop.png'),
            r: await canvas.loadImage('./images/v2/b_rook.png'),
            q: await canvas.loadImage('./images/v2/b_queen.png'),
            k: await canvas.loadImage('./images/v2/b_king.png'),
        },
    };
})();


function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

class Chess {
    constructor(data) {
        if (data) this.game = new jsChessEngine.Game(data); else this.game = new jsChessEngine.Game();
    }
    async render() {
        if (images === null) await wait(1000)
        if (images === null) throw new Error("Images are not loaded!");
        const array = [];
        var pieces = this.game.exportJson().pieces
        for (const key in pieces) {
            const [x, y] = key.split('');
            const xCoord = x.charCodeAt(0) - 'A'.charCodeAt(0);
            const yCoord = 8 - parseInt(y);
            const color = pieces[key] === pieces[key].toLowerCase() ? 'black' : 'white';
            array.push({ color, type: pieces[key].toLowerCase(), x: xCoord, y: yCoord });
        }

        // Create a canvas element
        const canvasElement = canvas.createCanvas(BOARD_SIZE * CELL_SIZE, BOARD_SIZE * CELL_SIZE);
        const ctx = canvasElement.getContext('2d');

        // I should prob have the whole board Pre-Rendered or something
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const colorIndex = (i + j) % 2;
                const color = colors[colorIndex];

                ctx.fillStyle = color;
                ctx.fillRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);

                // Set the text color to the opposite of the background color
                ctx.fillStyle = (color === colors[0]) ? colors[1] : colors[0];

                ctx.textAlign = 'left';
                ctx.textBaseline = 'bottom';
                ctx.font = '13px Comic Sans MS';

                
                if (j === 7) { // Letters
                    ctx.fillText(letters[i], i * CELL_SIZE, (j + 1) * CELL_SIZE);
                }
                if (i === 0) { // Numbers
                    ctx.fillText(8 - j, i * CELL_SIZE, (j + 1) * CELL_SIZE);
                }
            }
        }

        array.forEach((piece) => {
            // console.log(piece, images[piece.color][piece.type])
            const pieceSize = CELL_SIZE * 1; // Not needed, Leaving it just incase!
            const offset = (CELL_SIZE - pieceSize) / 2;
            ctx.drawImage(images[piece.color][piece.type], piece.x * CELL_SIZE + offset, piece.y * CELL_SIZE + offset, pieceSize, pieceSize);
        });

        const out = fs.createWriteStream(__dirname + '/test.png')
        const stream = canvasElement.createPNGStream()
        stream.pipe(out)
        out.on('finish', () => console.log('The PNG file was created.'))
        return canvasElement.toBuffer()
    }
}

module.exports = {
    Chess
}