// World

import { FLICKER_FRAME_1, STATUS_COL, TYPE_HIDDEN, TILE_SIZE } from './Constants';
//import { FieldOfView } from './FieldOfView';
import { Game } from './Game';
import { game } from './Game';
import { Viewport } from './Viewport';
import { WorldData } from './WorldData-gen';
import { Sprite } from './Sprite';
import { xy2uv, xy2qr, uv2xy, array2d, clamp } from './Util';
import { Camera } from './Camera';
import { Moth } from './Moth';
import { TowerBuilding } from './buildings/TowerBuilding';
import { CoffinBuilding } from './buildings/CoffinBuilding';
import { EarthBuilding } from './buildings/EarthBuilding';
import { ExitBuilding } from './buildings/ExitBuilding';
import { Hud } from './Hud';

export const World = {
    init() {
        this.reset();
    },

    draw() {
        let tiles = this.floors[0].tiles;
        //console.log(Camera.pos);
        //Camera.pos.x++;
        let offset = xy2uv({ x: 0, y: 0 });

        //console.log(offset);

        for (let y = 0; y < tiles.length; y++) {
            for (let x = 0; x < tiles[y].length; x++) {
                Viewport.ctx.globalAlpha = clamp(this.lightmap[y][x] / 5, 0.1, 1);
                if (tiles[y][x] > 0) {
                   Viewport.ctx.drawImage(Sprite.tiles[tiles[y][x] - 1].img, x * TILE_SIZE + offset.u, y * TILE_SIZE + offset.v);
                }
            }
        }

        Viewport.ctx.globalAlpha = 1;

        /*
        if (Game.frame % 133 === 0) {
            //console.log('generating visions');
            this.visions = [];
            for (let i = 0; i < 10; i++) {
                this.visions.push([
                    Math.floor(Math.random() * tiles[0].length),
                    Math.floor(Math.random() * tiles.length),
                    String.fromCharCode(97 + Math.floor(Math.random() * 26))
                ]);
            }
        } else if (Game.frame % 133 >= 5 && Game.frame % 133 <= 25) {
            for (let vision of this.visions) {
                Screen.writeOnMap(vision[0], vision[1], vision[2], Screen.RED);
            }
        }
        */

        for (let building of this.buildings) {
            building.draw();
        }
    },

    reset() {
        // We want to be careful and CLONE (not reference) the world data, because
        // this will be our "working copy" -- rooms and objects and even tiles might
        // get updated and moved during game logic.
        this.floors = WorldData.floors.map(floor => {
            return {
                tiles: floor.tiles.map(row => [...row]),
                objects: floor.objects.map(object => ({ ...object })),
                //objects: floor.objects.map(object => ({ id: object[0], x: object[1], y: object[2], type: object[3] })),
                // *COMBAT*
                //triggers: floor.triggers.map(trigger => ({ ...trigger }))
            };
        });
        this.bounds = WorldData.bounds;
        this.spawn = { q: WorldData.spawn[0], r: WorldData.spawn[1] };

        this.buildings = [];
        this.buildings.push(new CoffinBuilding(this.spawn));

        for (let b of this.floors[0].objects) {
            console.log(b);
            if (b.name === 'EARTH') {
                this.buildings.push(new EarthBuilding({ q: b.x, r: b.y }));
            } else if (b.name === 'EXIT') {
                this.buildings.push(new ExitBuilding({ q: b.x, r: b.y }));
            }
        }

        this.selected = undefined;

        this.tiles = this.floors[0].tiles;
        this.width = this.tiles[0].length;
        this.height = this.tiles.length;

        this.lightmap = array2d(this.width, this.height, () => 0);
    },

    update() {
        for (let building of this.buildings) {
            building.think();
        }

        this.updateLightmap();
    },

    canMoveInto(pos) {
        let tile = this.tileAt(pos);
        if (tile === 46 /* . */) return true;
        return false;
    },

    colorForObject(object) {
        if (object.finished) return Screen.DIM;
        if (object.interacted) return Screen.YELLOW;
        return Screen.BLUE;
    },

    colorForTile(tile) {
        return tile === '.' ? Screen.DIM : Screen.WHITE;
    },

    isSeeThrough(pos) {
        return this.SEE_THROUGH.includes(this.floors[pos.z].tiles[pos.y][pos.x]);
    },

    refreshVisible(pos) {
        const floor = this.floors[pos.z];
        //FieldOfView.resetVisible(floor.visible);
        //FieldOfView.refreshVisible(pos, floor.visible, floor.seen);
    },

    tap(uv) {
        let qr = xy2qr(uv2xy(uv));
        let tile = this.tileAt(qr);

        if (!tile || tile === 2) {
            this.selected = undefined;
            console.log('nah, no good man');
        } else {
            if (this.selected && this.selected.q === qr.q && this.selected.r === qr.r) {
                let building = this.buildingAt(this.selected);
                if (building) {
                    let actions = building.hudActions();
                    if (actions[0] && actions[0].defaultTapAction) {
                        actions[0].tap();
                    }
                }
            } else {
                console.log('single tap, reselect!');
                this.selected = qr;
                let building = this.buildingAt(this.selected);
                /*if (building) {
                    let actions = building.hudActions();
                    if (actions[0] && actions[0].defaultTapAction) {
                        Hud.selectedAction = actions[0];
                    }
                }*/
            }
        }
    },

    tileAt(qr) {
        if (qr) {
            return this.floors[0].tiles[qr.r]?.[qr.q];
        }
    },

    buildingAt(qr) {
        if (qr) {
            for (let building of this.buildings) {
                if (building.qr.q === qr.q && building.qr.r === qr.r) return building;
            }
        }
    },

    assignJob(qr) {
        console.log('i am assigning the moths a job');

        for (let entity of game.entities) {
            if (entity instanceof Moth) {
                entity.gather(qr);
            }
        }
    },

    updateLightmap() {
        for (let r = 0; r < this.height; r++) {
            for (let q = 0; q < this.width; q++) {
                this.lightmap[r][q] = 0;
            }
        }

        for (let b of this.buildings) {
            for (let r = -3; r <= 3; r++) {
                for (let q = -3; q <= 3; q++) {
                    let diff = 5 - Math.abs(r) - Math.abs(q);
                    if (diff <= 0) continue;

                    let tq = b.qr.q + q, tr = b.qr.r + r;
                    if (tq >= 0 && tr >= 0 && tq < this.width && tr < this.height) {
                        if (this.lightmap[tr][tq] < diff) {
                            this.lightmap[tr][tq] = diff;
                        }
                    }
                }
            }
        }

        for (let e of game.entities) {
            if (!(e instanceof Moth)) continue;
            let qr = xy2qr(e.pos);
            for (let r = -4; r <= 4; r++) {
                for (let q = -4; q <= 4; q++) {
                    let diff = 9 - Math.abs(r) - Math.abs(q);
                    if (diff <= 0) continue;

                    let tq = qr.q + q, tr = qr.r + r;
                    if (tq >= 0 && tr >= 0 && tq < this.width && tr < this.height) {
                        if (this.lightmap[tr][tq] < diff) {
                            this.lightmap[tr][tq] = diff;
                        }
                    }
                }
            }
        }
    }
};
