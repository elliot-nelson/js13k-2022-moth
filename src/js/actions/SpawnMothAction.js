import { game } from '../Game';
import { R20, R70, R90, R360, DIALOG_HINT_E2 } from '../Constants';
import {
    vector2angle,
    angle2vector,
    vectorBetween,
    normalizeVector,
    vector2point,
    uv2xy,
    xy2uv,
    qr2xy,
    centerxy
} from '../Util';
import { Sprite } from '../Sprite';
import { CHASE, DEAD } from '../systems/Behavior';
import { Page } from '../Page';
import { Gore } from '../Gore';
import { Viewport } from '../Viewport';
import { Camera } from '../Camera';
import { World } from '../World';
import { Moth } from '../Moth';

const MOVE = 1;
const CIRCLE = 2;
const IDLE = 3;

/**
 * Monster
 */
export const SpawnMothAction = {
    buttonSprite() {
        return Sprite.buttons2[0];
    },

    buttonSelectedSprite() {
        return Sprite.buttons2[1];
    },

    selectedText() {
        return 'MOTH xyz';
    },

    tap() {
        game.entities.push(new Moth(centerxy(qr2xy(World.selected))));
    }
};
