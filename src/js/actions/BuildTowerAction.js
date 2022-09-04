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
import { Gore } from '../Gore';
import { Viewport } from '../Viewport';
import { Camera } from '../Camera';
import { World } from '../World';
import { TowerBuilding } from '../buildings/TowerBuilding';

const MOVE = 1;
const CIRCLE = 2;
const IDLE = 3;

/**
 * Monster
 */
export const BuildTowerAction = {
    buttonSprite() {
        return Sprite.buttons2[6];
    },

    buttonSelectedSprite() {
        return Sprite.buttons2[7];
    },

    selectedText() {
        let cost = 15;

        if (game.canAfford(cost)) {
            return 'BUILD TOWER \ne' + cost;
        } else {
            return 'BUILD TOWER \ne' + cost;
        }
    },

    tap() {
        let cost = 0;

        if (game.canAfford(cost)) {
            game.payCost(cost);
            World.buildings.push(new TowerBuilding(World.selected));
        }
    }
};
