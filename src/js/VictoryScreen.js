

import { Sprite } from './Sprite';
import { Input } from './input/Input';
import { MapLoader } from './MapLoader';
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
    }

    update() {
    }

    draw() {
        Text.drawParagraph(
            Viewport.ctx,
            'ESCAPE!\n',
            15,
            15
        );
    }
}
