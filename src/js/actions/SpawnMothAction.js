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
import { Gore } from '../Gore';
import { Viewport } from '../Viewport';
import { Camera } from '../Camera';
import { World } from '../World';
import { Moth } from '../Moth';
import { Text } from '../Text';

const SPAWN_COST_EARTH = [0, 2];
for (let i = 2; i <= 19; i++) {
    SPAWN_COST_EARTH[i] = Math.floor(SPAWN_COST_EARTH[i - 1] * 1.5 + 1);
}
for (let i = 0; i < 20; i++) {
    SPAWN_COST_EARTH[i] = SPAWN_COST_EARTH[i] * 5;
}

export const SpawnMothAction = {
    defaultTapAction() {
        return false;
    },

    buttonSprite() {
        return Sprite.buttons[0];
    },

    buttonSelectedSprite() {
        return Sprite.buttons[1];
    },

    drawSelectedText(u, v) {
        let costs = [SPAWN_COST_EARTH[game.activeMoths()], 0];
        let text = 'LURE MOTH \n' + game.formatCost(...costs);

        Text.drawParagraph(
            Viewport.ctx,
            text,
            u,
            v
        );
    },

    tap() {
        let costs = [SPAWN_COST_EARTH[game.activeMoths()], 0];

        if (game.canAfford(...costs)) {
            game.payCost(...costs);
            game.entities.push(new Moth(centerxy(qr2xy(World.selected))));
            return true;
        }
    }
};
