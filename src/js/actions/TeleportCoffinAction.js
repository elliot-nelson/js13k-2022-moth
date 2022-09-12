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
import { CoffinBuilding } from '../buildings/CoffinBuilding';


/**
 * Monster
 */
export const TeleportCoffinAction = {
    defaultTapAction() {
        let building = World.buildingAt(World.selected);
        return !!building;
    },

    buttonSprite() {
        return Sprite.buttons[8];
    },

    buttonSelectedSprite() {
        return Sprite.buttons[9];
    },

    drawSelectedText(u, v) {
        let building = World.buildingAt(World.selected);
        let costs = [60, 10];
        let text = 'MOVE COFFIN \n' + game.formatCost(...costs);

        if (building) {
            text = 'FINISH BUILDING';
        }

        Text.drawParagraph(
            Viewport.ctx,
            text,
            u,
            v
        );
    },

    tap() {
        let building = World.buildingAt(World.selected);
        let costs = [60, 10];

        if (building) {
            Moth.assign(moth => moth.construct(World.selected));
        } else if (game.canAfford(...costs)) {
            game.payCost(...costs);
            World.buildings.push(new CoffinBuilding(World.selected));
            Moth.assign(moth => moth.construct(World.selected));
            return true;
        }
    }
};
