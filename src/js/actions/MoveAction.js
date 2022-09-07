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
import { Ghost } from '../Ghost';
import { Text } from '../Text';

const SPAWN_COST_EARTH = [0, 4];
for (let i = 2; i <= 20; i++) {
    SPAWN_COST_EARTH[i] = Math.ceil(SPAWN_COST_EARTH[i - 1] * 1.3 + 4);
}

export const MoveAction = {
    defaultTapAction: true,

    buttonSprite() {
        return Sprite.buttons2[4];
    },

    buttonSelectedSprite() {
        return Sprite.buttons2[5];
    },

    drawSelectedText(u, v) {
        let text = 'EXPLORE';

        Text.drawParagraph(
            Viewport.ctx,
            text,
            u,
            v
        );
    },

    tap() {
        let moths = game.entities.filter(e => e instanceof Moth);

        for (let i = 0; i < moths.length; i++) {
            if (!moths[i].isBusy()) {
                moths[i].moveTo(World.selected);
            }
        }

        return true;
    }
};