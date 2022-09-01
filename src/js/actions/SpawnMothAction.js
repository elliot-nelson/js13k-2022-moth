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
import { Gore } from '../Gore';
import { Viewport } from '../Viewport';
import { Camera } from '../Camera';
import { World } from '../World';
import { Moth } from '../Moth';

const MOVE = 1;
const CIRCLE = 2;
const IDLE = 3;

const SPAWN_COST_EARTH = [0, 2];
for (let i = 2; i <= 19; i++) {
    SPAWN_COST_EARTH[i] = Math.floor(SPAWN_COST_EARTH[i - 1] * 1.5 + 1);
}
for (let i = 0; i < 20; i++) {
    SPAWN_COST_EARTH[i] = SPAWN_COST_EARTH[i] * 5;
}

export const SpawnMothAction = {
    buttonSprite() {
        return Sprite.buttons2[0];
    },

    buttonSelectedSprite() {
        return Sprite.buttons2[1];
    },

    selectedText() {
        let cost = SPAWN_COST_EARTH[game.activeMoths()];

        if (game.canAfford(cost)) {
            return 'MOTH ' + cost;
        } else {
            return 'MOTH RED e' + cost;
        }
    },

    tap() {
        let cost = SPAWN_COST_EARTH[game.activeMoths()];

        if (game.canAfford(cost)) {
            game.payCost(cost);
            game.entities.push(new Moth(centerxy(qr2xy(World.selected))));
        }
    }
};
