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
    qr2xy
} from '../Util';
import { Sprite } from '../Sprite';
import { CHASE, DEAD } from '../systems/Behavior';
import { Page } from '../Page';
import { Gore } from '../Gore';
import { Viewport } from '../Viewport';
import { Camera } from '../Camera';

const MOVE = 1;
const CIRCLE = 2;
const IDLE = 3;

/**
 * Monster
 */
export const SpawnMothAction = {
    buttonSprite() {
        return Sprite.buttons[6];
    },

    tap() {
        console.log('i fuck up a mouse baton');
    }
};
