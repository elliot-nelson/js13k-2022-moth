

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


export class VictoryScreen {
    constructor() {
        this.frames = 0;
    }

    update() {
        this.frames++;

        return;
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
            'CONGRATULATIONS... AND THE END.';

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
