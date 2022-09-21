// DefeatScreen

import { Input } from './input/Input';
import { Text } from './Text';
import { Viewport } from './Viewport';
import { rgba, createCanvas, clamp, partialText, uv2xy, xy2qr, xy2uv, qr2xy, centerxy } from './Util';
import { game } from './Game';

export class DefeatScreen {
    constructor() {
        this.frames = 0;
    }

    update() {
        this.frames++;

        if (Input.pressed[Input.Action.TAP] && this.frames > 30) {
            // Reset sequence
            game.reset();
        }

        return true;
    }

    draw() {
        //Viewport.ctx.fillStyle = rgba(13, 43, 69, clamp(this.frames / 200, 0, 1));
        Viewport.ctx.fillStyle = rgba(36, 26, 20, clamp(this.frames / 200, 0, 1));
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        let width = Viewport.width - 32;
        let x = 16;
        let y = 16;

        let message = 'DEFEAT... \n' +
            '                    \n' +
            'YOUR LAST MOTH GONE, THIS WORLD SLIPS FROM YOUR GRASP. YOU CURSE THE VILLAGE AND ITS INHABITANTS AS YOU TUMBLE TOWARDS THAT BLEAK BEYOND. \n \n'  +
            'YOUR REIGN OF TERROR HAS ENDED. \n \n' +
            'TAP TO TRY AGAIN!';

        message = message.slice(0, this.frames);

        Text.drawParagraph(
            Viewport.ctx,
            message,
            x,
            y,
            width,
            1,
            1,
            Text.duotone_red
        );
    }
}
