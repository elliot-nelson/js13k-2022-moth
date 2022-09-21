// Game

import { Sprite } from './Sprite';
import { Input } from './input/Input';
import { Text } from './Text';
import { Viewport } from './Viewport';
import { rgba, createCanvas, clamp, partialText, uv2xy, xy2qr, xy2uv, qr2xy, centerxy } from './Util';
import { Audio } from './Audio';
import { Movement } from './systems/Movement';
import { Damage } from './systems/Damage';
import { Hud } from './Hud';

import { World } from './World';
import { Camera } from './Camera';
import { Moth } from './Moth';
import { Ghost } from './Ghost';
import { Wave } from './Wave';
import { VictoryScreen } from './VictoryScreen';
import { DefeatScreen } from './DefeatScreen';

/**
 * Game state.
 */
export class Game {
    init() {
        Sprite.loadSpritesheet(() => {
            Viewport.init();
            Sprite.init();
            Text.init();
            Input.init();
            Audio.init();
            Hud.init();

            Camera.init();
            World.init();

            window.addEventListener('blur', () => this.pause());
            window.addEventListener('focus', () => this.unpause());

            this.reset();

            this.start();
        });
    }

    reset() {
        this.entities = [];
        this.dialogPending = {};
        this.dialogSeen = {};
        this.roomsCleared = {};
        this.shadowOffset = 0;
        this.screenshakes = [];
        this.monstersPending = [];
        this.waveNumber = 0;
        this.earth = 0;
        this.fervor = 0;
        this.entities.push(new Moth(qr2xy(World.spawn)));
        this.screen = undefined;
        this.wave = undefined;
        World.reset();

        Camera.pos = centerxy(qr2xy(World.exit));
        Camera.forceTarget = centerxy(qr2xy(World.spawn));
    }

    start() {
        this.frame = 0;
        this.framestamps = [0];
        this.update();
        window.requestAnimationFrame((xyz) => this.onFrame(xyz));
    }

    onFrame(currentms) {
        let startTime= new Date().getTime();

        /*this.framestamps.push(currentms);*/
        if (this.framestamps.length >= 40) {
            this.framestamps.shift();
        }
        this.fps = 1000 / ((this.framestamps[this.framestamps.length - 1] - this.framestamps[0]) / this.framestamps.length);

        this.frame++;
        Viewport.resize();
        this.update();
        this.draw(Viewport.ctx);
        window.requestAnimationFrame((xyz) => this.onFrame(xyz));

        let endTime = new Date().getTime();
        this.framestamps.push(this.framestamps[this.framestamps.length - 1] + endTime - startTime);
    }

    update() {
        if (!this.wave) {
            this.wave = new Wave(this.waveNumber++);
        }

        // Pull in frame by frame button pushes / keypresses / mouse clicks
        Input.update();

        if (this.screen) {
            if (this.screen.update()) return;
        }

        if (Input.pressed[Input.Action.TAP]) {
            this.tap(Input.pointer);
        }

        Hud.update();

        //if (Input.pressed[Input.Action.MENU]) {
        //    this.paused ? this.unpause() : this.pause();
        //}

        if (this.paused) return;

        // Handle Input

        // End Handle Input

        // perform any per-frame audio updates
        Audio.update();

        this.wave.update();

        this.spawnMonsterIfPossible();

        // Behavior (AI, player input, etc.)
        //perform(this.entities); <-- cut to save space
        for (let entity of game.entities) {
            if (entity.think) entity.think();
        }

        // perform any queued damage
        Damage.perform(this.entities);

        // Movement (perform entity velocities to position)
        Movement.perform(this.entities);

        Camera.update();

        // Culling (typically when an entity dies)
        this.entities = this.entities.filter(entity => !entity.cull);
        World.buildings = World.buildings.filter(building => !building.cull);

        World.update();

        if (this.entities.filter(e => e instanceof Moth).length === 0) {
            game.screen = new DefeatScreen();
        }

        // Initial "click" to get game started
        // if (Input.pressed[Input.Action.ATTACK] && !game.started) game.started = true;
    }

    draw() {
        // Reset canvas transform and scale
        Viewport.ctx.setTransform(1, 0, 0, 1, 0, 0);
        Viewport.ctx.scale(Viewport.scale, Viewport.scale);

        //Viewport.ctx.fillStyle = rgba(13, 43, 69, 1);
        //Viewport.ctx.fillStyle = rgba(84, 78, 104, 1);
        //Viewport.ctx.fillStyle = rgba(32, 60, 86, 1);
        Viewport.ctx.fillStyle = rgba(36, 26, 20, 1);
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        World.draw();

        for (let entity of this.entities) {
            if (!entity.z || entity.z < 100) entity.draw();
        }

        for (let entity of this.entities) {
            if (entity.z && entity.z > 100) entity.draw();
        }

        World.drawLightmap();

        Hud.draw();

        if (game.frame < 120) {
            Viewport.ctx.fillStyle = rgba(0, 0, 0, 1 - game.frame / 120);
            Viewport.fillViewportRect();
        }

        if (this.screen) {
            this.screen.draw();
        }
    }

    pause() {
        if (this.paused) return;
        this.paused = true;
        Audio.pause();
    }

    unpause() {
        if (!this.paused) return;
        this.paused = false;
        Audio.unpause();
    }

    tap(uv) {
        for (let ui of [Hud, World]) {
            if (ui.tap(uv)) break;
        }
    }

    activeMoths() {
        return this.entities.filter(x => x instanceof Moth).length;
    }

    formatCost(earth, fervor) {
        return (earth > this.earth ? 're' : 'we') + earth + (fervor > 0 ? (fervor > this.fervor ? ' rf' : ' wf') + fervor : '');
    }

    canAfford(earth, fervor) {
        return (this.earth >= earth && this.fervor >= fervor);
    }

    payCost(earth, fervor) {
        this.earth -= earth;
        this.fervor -= fervor;
    }

    spawnMonsterIfPossible() {
        let spawnFn = this.monstersPending[0];

        if (spawnFn) {
            // A spawn is attempted up to 10 times
            for (let i = 0; i < 10; i++) {
                let q = Math.floor(Math.random() * World.floors[0].tiles[0].length);
                let r = Math.floor(Math.random() * World.floors[0].tiles.length);
                if (World.tiles[r][q] !== 1) {
                    continue;
                }
                if (World.lightmap[r][q] !== 0) {
                    continue;
                }

                let xy = qr2xy({ q, r });
                game.entities.push(spawnFn(xy));
                this.monstersPending.shift();
                break;
            }
        }
    }
}

export const game = new Game();
