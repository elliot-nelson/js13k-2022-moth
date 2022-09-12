// Wave

import { game } from './Game';
import { Ghost } from './Ghost';
import { Audio } from './Audio';

const WAVES = [
    // Wave 1
    [
        [0, 1],
        [5, 1],
        [10, 1],
        [15, 1],
        [20, 1],
        [21, 1],
        [22, 1]
    ]
];

export class Wave {
    constructor(waveNumber) {
        waveNumber = waveNumber % WAVES.length;

        this.upcoming = [...WAVES[waveNumber]];
        this.countdown = 4 * 60;
        this.incoming = false;
        this.frame = 0;
        this.lastFrame = this.upcoming[this.upcoming.length - 1][0] * 60;
    }

    update() {
        this.countdown--;

        if (this.countdown >= 0 && this.countdown <= 2 * 60 && this.countdown % 60 === 0) {
            Audio.play(Audio.waveCountdown);
        }

        if (this.countdown <= 0) {
            this.incoming = true;

            for (let i = 0; i < this.upcoming.length; i++) {
                if (this.frame === this.upcoming[i][0] * 60) {
                    game.monstersPending.push(xy => new Ghost(xy, Math.floor(Math.random() * 3)));
                }
            }

            this.frame++;
        }

        if (this.frame >= this.lastFrame) {
            game.wave = undefined;
        }
    }
}
