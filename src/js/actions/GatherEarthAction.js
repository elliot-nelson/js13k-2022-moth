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
import { Gore } from '../Gore';
import { Viewport } from '../Viewport';
import { Camera } from '../Camera';
import { World } from '../World';
import { Moth } from '../Moth';
import { Text } from '../Text';
import { Ghost } from '../Ghost';

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

    drawSelectedText(u, v) {
        let text = 'GATHER EARTH';

        Text.drawParagraph(
            Viewport.ctx,
            text,
            u,
            v
        );
    },

    tap() {
        Moth.assign(moth => moth.gather(World.selected));
        return true;
    }
};
