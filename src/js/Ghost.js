// ghost?

import { game } from './Game';
import { R90, DIALOG_HINT_E1, CHASE, DEAD, ATTACK } from './Constants';
import { vectorBetween, clamp, vector2angle, xy2qr, floodTarget, qr2xy, xy2uv, rgba, centerxy } from './Util';
import { Sprite } from './Sprite';
import { Gore } from './Gore';
import { World } from './World';
import { Viewport } from './Viewport';
import { Text } from './Text';

import { Moth } from './Moth';
import { Audio } from './Audio';
import { AttackAnimation } from './AttackAnimation';

/**
 * Monster
 */
export class Ghost {
    constructor(pos, variant) {
        this.pos = { ...pos };
        this.damage = [];
        this.vel = { x: 0, y: 0 };
        this.radius = 2;
        this.mass = 0.2;
        this.lastAttack = 0;
        this.state = CHASE;
        this.enemy = true;

        this.variant = variant;

        if (!variant) {
            this.hp = 100;
            this.attackDistance = 8;
            this.moveSpeed = 0.3;
        } else if (variant === 1) {
            this.hp = 300;
            this.attackDistance = 8;
            this.moveSpeed = 0.3;
        } else if (variant === 2) {
            this.hp = 800;
            this.attackDistance = 16;
            this.moveSpeed = 0.1;
        }

        this.maxhp = this.hp;
    }

    think() {
        let targets = game.entities.filter(x => x instanceof Moth);
        let bestTarget = targets[0];

        if (!bestTarget) return;

        let bestDiff = vectorBetween(this.pos, bestTarget.pos);
        for (let i = 1; i < targets.length; i++) {
            let diff = vectorBetween(this.pos, targets[i].pos);
            if (diff.m < bestDiff.m) {
                bestTarget = targets[i];
                bestDiff = diff;
            }
        }

        const pathToTarget = World.pathToTarget(this.pos, bestTarget.pos);

        let diff = vectorBetween(this.pos, pathToTarget);

        if (this.state === CHASE) {
            if (bestDiff.m < this.attackDistance) {
                this.state = ATTACK;
                this.attackFrames = 10;
                this.attackTarget = bestTarget;
            } else {
                diff.m = clamp(diff.m, 0, this.moveSpeed);
                this.vel = {
                    x: (this.vel.x + diff.x * diff.m) / 2,
                    y: (this.vel.y + diff.y * diff.m) / 2
                };
            }
        } else if (this.state === ATTACK) {
            this.vel = {
                x: this.vel.x * 0.9,
                y: this.vel.y * 0.9
            };
            this.attackFrames--;
            if (this.attackFrames === 5) {
                this.attackTarget.damage.push({ amount: 10, vector: { x: 0, y: 0, m: 0 }, knockback: 0 });
                game.entities.push(new AttackAnimation(this.attackTarget.pos));
            } else if (this.attackFrames === -30) {
                this.state = CHASE;
            }
        } else if (this.state === DEAD) {
            Audio.play(Audio.ghostDeath);
            this.cull = true;
            game.fervor += (this.variant + 1);
            Gore.kill(this);
        }
    }

    draw() {
        //if (!this.lastQR) return;
        let frame = (this.variant * 2) + (this.state === ATTACK ? 1 : 0);
        let sprite = Sprite.ghost[frame];


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

        /*
        let uv = xy2uv(qr2xy(this.lastQR));
        Viewport.ctx.fillStyle = rgba(255, 0, 0, 0.2);
        Viewport.ctx.fillRect(uv.u + 1, uv.v + 1, 7, 7);

        uv = xy2uv(qr2xy(this.nextQR));
        Viewport.ctx.fillStyle = rgba(0, 255, 0, 0.2);
        Viewport.ctx.fillRect(uv.u + 1, uv.v + 1, 7, 7);
        */

        /*let sprite = Sprite.stabguts[((game.frame / 12) | 0) % 2];
        this.state === RELOAD && (sprite = Sprite.stabguts[2]);
        this.state === ATTACK && (sprite = Sprite.stabguts[3]);*/
        Sprite.drawViewportSprite(
            sprite,
            this.pos //,
            //this.facingAngle + R90
        );

        if (this.hp < this.maxhp) {
            let hp = Math.ceil(this.hp / this.maxhp * 7);
            if (hp >= 0) {
                Sprite.drawViewportSprite(
                    Sprite.enemy_healthbar[hp],
                    this.pos
                );
            }
        }
    }
}
