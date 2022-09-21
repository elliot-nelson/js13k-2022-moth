// AttackAnimation

import { game } from './Game';
import { Sprite } from './Sprite';
import { Audio } from './Audio';
import { Viewport } from './Viewport';

export class AttackAnimation {
    constructor(pos) {
        this.pos = { ...pos };
        this.t = -1;
        this.d = 3;
        this.z = 101;
        this.rot = Math.random() * Math.PI * 2;
    }

    think() {
        if (++this.t === this.d) this.cull = true;
        this.rot += 0.1;
    }

    draw() {
        let frame = this.t < 2 ? 0 : 1;
        Sprite.drawViewportSprite(Sprite.attack[frame], this.pos, this.rot);
    }
}
