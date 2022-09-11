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
    xy2qr,
    qr2xy
} from '../Util';
import { Sprite } from '../Sprite';
import { Gore } from '../Gore';
import { Viewport } from '../Viewport';
import { Camera } from '../Camera';
import { GatherEarthAction } from '../actions/GatherEarthAction';
import { MoveAction } from '../actions/MoveAction';
import { Moth } from '../Moth';
import { VictoryScreen } from '../VictoryScreen';

/**
 * Monster
 */
export class ExitBuilding {
    constructor(qr) {
        this.qr = { ...qr };

        this.title = 'REACH THE EXIT \nTO SURVIVE';
        this.portraitSprite = Sprite.buildings[3];
        this.lightlevel = 4;
    }

    think() {
        let moths = Moth.sortMoths();
        for (let moth of moths) {
            let qr = xy2qr(moth.pos);
            if (qr.q === this.qr.q && qr.r === this.qr.r) {
                game.screen = new VictoryScreen();
                return;
            }
        }
    }

    draw() {
        let xy = qr2xy(this.qr);

        //Viewport.ctx.drawImage(Sprite.tiles[tiles[y][x] - 1].img, x * 8 + offset.u, y * 8 + offset.v);
        Sprite.drawViewportSprite(Sprite.buildings[3], xy);

        //Sprite.drawViewportSprite(Sprite.spindoctor[0], this.pos, game.frame / 5);
        //Sprite.drawViewportSprite(Sprite.spindoctor[1], this.pos);
    }

    hudActions() {
        return [MoveAction];
    }
}
