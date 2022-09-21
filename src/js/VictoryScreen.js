// VictoryScreen

import { Text } from './Text';
import { Viewport } from './Viewport';
import { rgba, createCanvas, clamp, partialText, uv2xy, xy2qr, xy2uv, qr2xy, centerxy } from './Util';
import { game } from './Game';

export class VictoryScreen {
    constructor() {
        this.frames = 0;
    }

    update() {
        this.frames++;

        return true;
    }

    draw() {
        //Viewport.ctx.fillStyle = rgba(13, 43, 69, clamp(this.frames / 200, 0, 1));
        Viewport.ctx.fillStyle = rgba(36, 26, 20, clamp(this.frames / 200, 0, 1));
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        let width = Viewport.width - 32;
        let x = 16;
        let y = 16;

        let message = 'ESCAPE! \n' +
            '                    \n' +
            'VILLAGERS STIR UNEASILY IN THEIR BEDS AS YOU EMERGE INTO MOONLIGHT. YOU SENSE WARM BODIES ALL AROUND YOU, RIPE FOR PICKING. IT IS ONLY A MATTER OF TIME NOW BEFORE YOU REGAIN YOUR FULL NECROMANTIC POWER. \n' +
            '                    \n' +
            'CONGRATULATIONS... AND THE END.  ' + game.fervor + 'f';

        message = message.slice(0, this.frames);

        Text.drawParagraph(
            Viewport.ctx,
            message,
            x,
            y,
            width,
            1,
            1
        );
    }
}
