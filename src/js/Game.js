'use strict';

import { Sprite } from './Sprite';
import { Input } from './input/Input';
import { MapLoader } from './MapLoader';
import { Text } from './Text';
import { Viewport } from './Viewport';
import { TITLE } from './Constants';
import { rgba, createCanvas, clamp, partialText, uv2xy, xy2qr, xy2uv, qr2xy, centerxy } from './Util';
import { Audio } from './Audio';
//import { Brawl } from './systems/Brawl';
import { Movement } from './systems/Movement';
import { Damage } from './systems/Damage';
import { DialogScheduling } from './systems/DialogScheduling';
import { Victory } from './systems/Victory';
import { Hud } from './Hud';
import { ScreenShake } from './ScreenShake';
import { Maze } from './Maze';

import { World } from './World';
import { Camera } from './Camera';
import { Moth } from './Moth';
import { Ghost } from './Ghost';
import { Wave } from './Wave';


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

            Camera.init();
            World.init();

            this.maze = MapLoader.loadMap();
            this.entities = [];
            this.dialogPending = {};
            this.dialogSeen = {};
            this.roomsCleared = {};
            this.shadowOffset = 0;
            this.screenshakes = [];
            this.monstersPending = [];

            this.waveNumber = 0;

            Camera.pos = centerxy(qr2xy(World.spawn));

            this.entities.push(new Moth(Camera.pos));

            window.addEventListener('blur', () => this.pause());
            window.addEventListener('focus', () => this.unpause());

            this.earth = 0;
            this.blood = 0;

            this.start();
        });
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

        Hud.update();

        if (Input.pressed[Input.Action.TAP]) {
            this.tap(Input.pointer);
        }

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
        console.log(game.entities);
        for (let entity of game.entities) {
            if (entity.think) entity.think();
        }

        // perform any queued damage
        Damage.perform(this.entities);

        // Movement (perform entity velocities to position)
        Movement.perform(this.entities);

        console.log('entities', this.entities.length);
        let moths = this.entities.filter(x => x instanceof Moth);
        console.log(moths.map(x => x.hp));
        // Dialog scheduling
        //DialogScheduling.perform();

        // Brawl system (aka "room battles")
        //Brawl.perform();

        // Victory condtions
        Victory.perform();

        Camera.update();

        // Culling (typically when an entity dies)
        this.entities = this.entities.filter(entity => !entity.cull);

        // Camera logic
        /*let diff = {
            x: this.player.pos.x - this.camera.pos.x,
            y: this.player.pos.y - this.camera.pos.y
        };
        this.camera.pos.x += diff.x * 0.2;
        this.camera.pos.y += diff.y * 0.2;*/

        // Tick screenshakes and cull finished screenshakes
        this.screenshakes = this.screenshakes.filter(screenshake =>
            screenshake.update()
        );

        World.update();


        if (this.entities.filter(e => e instanceof Moth).length === 0) {
            game.lost = true;
        }

        // Flickering shadows
        if (game.frame % 6 === 0) this.shadowOffset = (Math.random() * 10) | 0;

        // Intro screenshake
        if (game.frame === 30) game.screenshakes.push(new ScreenShake(20, 20, 20));

        // Initial "click" to get game started
        if (Input.pressed[Input.Action.ATTACK] && !game.started) game.started = true;
    }

    draw() {
        // Reset canvas transform and scale
        Viewport.ctx.setTransform(1, 0, 0, 1, 0, 0);
        Viewport.ctx.scale(Viewport.scale, Viewport.scale);

        Viewport.ctx.fillStyle = 'rgba(40, 30, 20)';
        Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        if (game.lost) {

        }

        // Render screenshakes (canvas translation)
        /*
        let shakeX = 0, shakeY = 0;
        this.screenshakes.forEach(shake => {
            shakeX += shake.x;
            shakeY += shake.y;
        });
        Viewport.ctx.translate(shakeX, shakeY);
        */

        //Maze.draw();


        /*
        Viewport.ctx.drawImage(
            Sprite.shadow.img,
            0, 0,
            500, 500,
            -this.shadowOffset, -this.shadowOffset,
            Viewport.width + this.shadowOffset * 2,
            Viewport.height + this.shadowOffset * 2
        );
        */

        World.draw();

        Hud.draw();

        Viewport.ctx.fillStyle = 'rgba(200, 10, 10, 0.2)';
        Viewport.ctx.fillRect(0, Viewport.height / 2, Viewport.width, 1);
        Viewport.ctx.fillRect(Viewport.width / 2, 0, 1, Viewport.height);

        for (let entity of this.entities) {
            if (!entity.z || entity.z < 100) entity.draw();
        }

        for (let entity of this.entities) {
            if (entity.z && entity.z > 100) entity.draw();
        }

        if (game.frame < 120) {
            Viewport.ctx.fillStyle = rgba(0, 0, 0, 1 - game.frame / 120);
            Viewport.fillViewportRect();
        }

        /*
        if (game.frame >= 30 && !game.started) {
            //let width = Text.measureWidth(TITLE, 3);
            Text.drawText(
                Viewport.ctx, TITLE, Viewport.center.u - Text.measureWidth(TITLE, 3) / 2, Viewport.center.v, 3,
                Text.white,
                Text.red
            );
        }
        */

        if (game.lost) {
            Viewport.ctx.fillStyle = rgba(240, 0, 0, 0.5);
            Viewport.fillViewportRect();

            let text = 'YOU LOSE';
            Text.drawParagraph(
                Viewport.ctx,
                text,
                40, 40,
                Viewport.width - 80,
                Viewport.ctx.height - 80,
                2,
                Text.white,
                Text.red
            );
        }

        if (game.victory) {
            Viewport.ctx.fillStyle = rgba(240, 0, 0, clamp(Victory.frame / 1800, 0, 0.7));
            Viewport.fillViewportRect();

            let text = 'WAIT! THE PORTAL HOME... \n \nIT STINKS LIKE ROTTEN MEAT, BUT IT LOOKS LIKE YOU ARE STUCK IN THE DUNGEONS. \n \nWELCOME HOME...';
            Text.drawParagraph(
                Viewport.ctx,
                partialText(text, Victory.frame, 600),
                40, 40,
                Viewport.width - 80,
                Viewport.ctx.height - 80,
                2,
                Text.white,
                Text.red
            );
        }

        /*
        if (game.frame % 100 === 0) {
            let pos = {
                x: Math.random() * 100 - 50,
                y: Math.random() * 100 - 50
            };
            game.entities.push(new Ghost(pos));
        }
        */
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

    canAfford(earth) {
        if (this.earth >= earth) {
            return true;
        }
    }

    payCost(earth) {
        this.earth -= earth;
    }

    spawnMonsterIfPossible() {
        let entityClass = this.monstersPending[0];

        if (entityClass) {
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
                console.log('NEW monster' + xy.x + ',' + xy.y + ',' + World.lightmap[r][q]);
                game.entities.push(new entityClass(xy));
                this.monstersPending.shift();
                break;
            }
        }
    }
}

export const game = new Game();
