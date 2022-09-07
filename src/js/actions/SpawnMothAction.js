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
    buttonSprite() {
        return Sprite.buttons2[0];
    },

    buttonSelectedSprite() {
        return Sprite.buttons2[1];
    },

    drawSelectedText(u, v) {
        let cost = SPAWN_COST_EARTH[game.activeMoths()];
        let text = game.canAfford(cost) ? 'LURE MOTH \ne' + cost : 'LURE MOTH \ner' + cost;

        Text.drawParagraph(
            Viewport.ctx,
            text,
            u,
            v
        );
    },

    tap() {
        let cost = SPAWN_COST_EARTH[game.activeMoths()];

        if (game.canAfford(cost)) {
            game.payCost(cost);
            game.entities.push(new Moth(centerxy(qr2xy(World.selected))));
            return true;
        }
    }
};
