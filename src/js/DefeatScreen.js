

import { Sprite } from './Sprite';
import { Input } from './input/Input';
import { Text } from './Text';
import { Viewport } from './Viewport';
import { TITLE } from './Constants';
import { rgba, createCanvas, clamp, partialText, uv2xy, xy2qr, xy2uv, qr2xy, centerxy } from './Util';
import { Audio } from './Audio';
//import { Brawl } from './systems/Brawl';
import { Movement } from './systems/Movement';
import { Damage } from './systems/Damage';
import { DialogScheduling } from './systems/DialogScheduling';
import { Victory } from './systems/Victory';
import { Hud } from './Hud';
import { ScreenShake } from './ScreenShake';
import { Maze } from './Maze';

import { World } from './World';
import { Camera } from './Camera';
import { Moth } from './Moth';
import { Ghost } from './Ghost';
import { Wave } from './Wave';
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
        Viewport.ctx.fillStyle = rgba(13, 43, 69, clamp(this.frames / 200, 0, 1));
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        let width = Viewport.width - 32;
        let x = 16;
        let y = 16;

        let message = 'DEFEAT... \n' +
            '                    \n' +
            'YOUR LAST MOTH GONE, THIS WORLD SLIPS FROM YOUR GRASP. YOU CURSE THE VILLAGE AND ITS INHABITANTS AS YOU TUMBLE TOWARDS THAT BLEAK BEYOND. YOUR REIGN OF TERROR IS AT AN END.\n \n' +
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
