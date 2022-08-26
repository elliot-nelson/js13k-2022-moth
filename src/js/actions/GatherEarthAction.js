// GatherEarthAction

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
import { Ghost } from '../Ghost';

const MOVE = 1;
const CIRCLE = 2;
const IDLE = 3;

const SPAWN_COST_EARTH = [0, 4];
for (let i = 2; i <= 20; i++) {
    SPAWN_COST_EARTH[i] = Math.ceil(SPAWN_COST_EARTH[i - 1] * 1.3 + 4);
}

export const GatherEarthAction = {
    defaultTapAction: true,

    buttonSprite() {
        return Sprite.buttons2[2];
    },

    buttonSelectedSprite() {
        return Sprite.buttons2[3];
    },

    selectedText() {
        return 'GATHER EARTH';
    },

    tap() {
        let moth;

        for (let entity of game.entities) {
            if (entity instanceof Moth) {
                moth = entity;
                entity.gather(World.selected);
            }
        }

        let pos = {
            x: moth.pos.x - 30,
            y: moth.pos.y
        };
        game.entities.push(new Ghost(pos));
    }
};
