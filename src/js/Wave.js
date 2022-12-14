// Wave

import { game } from './Game';
import { Ghost } from './Ghost';
import { Audio } from './Audio';
import { World } from './World';

const WAVES = [
    // Wave 1
    [
        [0,   0],
        [5,   0],
        [10,  0],
        [15,  0],
    ],
    // Wave 2
    [
        [0,   0],
        [1,   0],
        [2,   0],
        [3,   0],
        [10,  0],
        [11,  0],
        [12,  0],
        [15,  0],
        [15,  0],
        [15,  0],
    ],
    // Wave 3
    [
        [0,   0],
        [1,   0],
        [2,   0],
        [3,   0],
        [4,   0],
        [5,   0],
        [10,  0],
        [15,  1],
    ],
    // Wave 4
    [
        [0,   1],
        [5,   0],
        [5,   0],
        [10,  1],
        [15,  0],
        [15,  0],
        [20,  1],
    ],
    // Wave 5
    [
        [0,   1],
        [5,   0],
        [5,   0],
        [10,  0],
        [10,  0],
        [15,  0],
        [15,  1],
        [20,  2],
    ],
    // Wave 6
    [
        [0,   0],
        [1,   0],
        [2,   0],
        [3,   0],
        [4,   0],
        [5,   2],
        [6,   0],
        [7,   0],
        [8,   0],
        [9,   0],
        [10,  2],
        [15,  1],
        [19,  1],
        [20,  1],
    ],
    // Wave 7
    [
        [0,   2],
        [3,   2],
        [6,   2],
        [9,   2],
        [12,  2],
        [15,  0],
        [15,  0],
        [15,  0],
        [15,  0],
        [15,  0],
    ]
];

export class Wave {
    constructor(waveNumber) {
        this.waveNumber = waveNumber;

        waveNumber = waveNumber % WAVES.length;

        this.upcoming = [...WAVES[waveNumber]];
        this.countdown = 60 * 60;
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

            // Handle music transitions
            Audio.startWave();
            if (World.visibleEnemies().length > 0) {
                Audio.startCombat();
            }

            for (let i = 0; i < this.upcoming.length; i++) {
                if (this.frame === this.upcoming[i][0] * 60) {
                    game.monstersPending.push(xy => new Ghost(xy, this.upcoming[i][1]));
                }
            }

            this.frame++;
        }

        if (this.frame >= this.lastFrame) {
            let enemies = game.entities.filter(e => e.enemy);
            if (enemies.length === 0) {
                game.wave = undefined;
                Audio.stopWave();
                Audio.stopCombat();
            }
        }
    }
}
