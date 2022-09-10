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
import { Gore } from '../Gore';
import { Viewport } from '../Viewport';
import { Camera } from '../Camera';
import { World } from '../World';
import { TowerBuilding } from '../buildings/TowerBuilding';
import { Text } from '../Text';
import { Moth } from '../Moth';


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

    drawSelectedText(u, v) {
        let cost = 15;
        let text = game.canAfford(cost) ? 'BUILD TOWER \ne' + cost : 'BUILD TOWER \ner' + cost;

        Text.drawParagraph(
            Viewport.ctx,
            text,
            u,
            v
        );
    },

    tap() {
        let cost = 15;

        if (game.canAfford(cost)) {
            game.payCost(cost);
            World.buildings.push(new TowerBuilding(World.selected));
            Moth.next().construct(World.selected);
            return true;
        }
    }
};
