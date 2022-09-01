// ghost?

import { game } from './Game';
import { R90, DIALOG_HINT_E1 } from './Constants';
import { vectorBetween, clamp, vector2angle, xy2qr, floodTarget, qr2xy, xy2uv, rgba, centerxy } from './Util';
import { Sprite } from './Sprite';
import { CHASE, DEAD, ATTACK, RELOAD } from './systems/Behavior';
import { Gore } from './Gore';
import { World } from './World';
import { Viewport } from './Viewport';
import { Text } from './Text';

import { Moth } from './Moth';

/**
 * Monster
 */
export class Ghost {
    constructor(pos) {
        this.pos = { ...pos };
        this.hp = 100;
        this.damage = [];
        this.vel = { x: 0, y: 0 };
        this.radius = 2;
        this.mass = 0.2;
        this.lastAttack = 0;
        this.state = CHASE;
        this.enemy = true;
    }

    think() {
        let targets = game.entities.filter(x => x instanceof Moth);
        let bestTarget = targets[0];
        let bestDiff = vectorBetween(this.pos, bestTarget.pos);
        for (let i = 1; i < targets.length; i++) {
            let diff = vectorBetween(this.pos, targets[i].pos);
            if (diff.m < bestDiff.m) {
                bestTarget = targets[i];
                bestDiff = diff;
            }
        }

        let qrthis = xy2qr(this.pos);
        let qrthat = xy2qr(bestTarget.pos);

        this.targetField = floodTarget(World.floors[0].tiles, qrthis, qrthat);

        let options = [
            [qrthis.q + 1, qrthis.r],
            [qrthis.q - 1, qrthis.r],
            [qrthis.q, qrthis.r + 1],
            [qrthis.q, qrthis.r - 1]
        ];
        for (let option of options) {
            option.push(this.targetField[option[1]][option[0]]);
        }
        options.sort((a, b) => a[2] - b[2]);

        this.lastQR = qrthis;
        this.nextQR = { q: options[0][0], r: options[0][1] };

        //console.log('option', options[0]);
        let realTarget = centerxy(qr2xy({ q: options[0][0], r: options[0][1] }));

        let diff = vectorBetween(this.pos, realTarget);


        if (this.state === CHASE) {
           diff.m = clamp(diff.m, 0, 0.4);
           this.vel = {
                x: (this.vel.x + diff.x * diff.m) / 2,
                y: (this.vel.y + diff.y * diff.m) / 2
           };
            //console.log('ghost', 'vel', this.vel);
        } else if (this.state === DEAD) {
            this.cull = true;
            Gore.kill(this);
        }
    }

    draw() {
        let sprite = Sprite.ghost[0];

        /*for (let r = 0; r < this.targetField.length; r++) {
            for (let q = 0; q < this.targetField[0].length; q++) {
                let uv = xy2uv(qr2xy({ q, r }));
                Text.drawText(
                    Viewport.ctx,
                    '' + this.targetField[r][q] || '',
                    uv.u,
                    uv.v
                );
            }
        }*/

        let uv = xy2uv(qr2xy(this.lastQR));
        Viewport.ctx.fillStyle = rgba(255, 0, 0, 0.2);
        Viewport.ctx.fillRect(uv.u + 1, uv.v + 1, 7, 7);

        uv = xy2uv(qr2xy(this.nextQR));
        Viewport.ctx.fillStyle = rgba(0, 255, 0, 0.2);
        Viewport.ctx.fillRect(uv.u + 1, uv.v + 1, 7, 7);

        /*let sprite = Sprite.stabguts[((game.frame / 12) | 0) % 2];
        this.state === RELOAD && (sprite = Sprite.stabguts[2]);
        this.state === ATTACK && (sprite = Sprite.stabguts[3]);*/
        Sprite.drawViewportSprite(
            sprite,
            this.pos //,
            //this.facingAngle + R90
        );
    }
}
