// World

import { FLICKER_FRAME_1, STATUS_COL, TYPE_HIDDEN, TILE_SIZE, TILE_WALL, TILE_CORNER_INNER, TILE_DYNAMIC } from './Constants';
//import { FieldOfView } from './FieldOfView';
import { Game } from './Game';
import { game } from './Game';
import { Viewport } from './Viewport';
import { WorldData } from './generated/WorldData-gen';
import { Sprite } from './Sprite';
import { xy2uv, xy2qr, uv2xy, array2d, clamp, flood, centerxy, qr2xy, manhattan, floodlight, rgba } from './Util';
import { Camera } from './Camera';
import { Moth } from './Moth';
import { TowerBuilding } from './buildings/TowerBuilding';
import { CoffinBuilding } from './buildings/CoffinBuilding';
import { EarthBuilding } from './buildings/EarthBuilding';
import { ExitBuilding } from './buildings/ExitBuilding';
import { Hud } from './Hud';
import { MoveAction } from './actions/MoveAction';
import { Text } from './Text';
import { Audio } from './Audio';

import { AttackAnimation } from './AttackAnimation';

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

        for (let r = 0; r < tiles.length; r++) {
            for (let q = 0; q < tiles[0].length; q++) {
                //Viewport.ctx.globalAlpha = clamp(this.lightmap[y][x] / 5, 0.1, 1);
                if (tiles[r][q] > 0) {
                    //console.log(x, y, tiles[y][x], Sprite.tiles[tiles[y][x] - 1]);
                   Viewport.ctx.drawImage(Sprite.tiles[tiles[r][q] - 1].img, q * TILE_SIZE + offset.u, r * TILE_SIZE + offset.v);


                   //Text.drawText(Viewport.ctx, '' + this.lightmap[y][x], x * TILE_SIZE + offset.u, y * TILE_SIZE + offset.v);
                }
            }
        }

        //Viewport.ctx.globalAlpha = 1;

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

    drawLightmap() {
        let tiles = this.tiles;
        let offset = xy2uv({ x: 0, y: 0 });

        for (let r = 0; r < tiles.length; r++) {
            for (let q = 0; q < tiles[0].length; q++) {
                if (tiles[r][q] > 0) {
                    let lightlevel = 1 - clamp(this.lightmap[r][q] / 5, 0.1, 1);
                    if (this.fogofwar[r][q] === 0) lightlevel = 1;

                    Viewport.ctx.globalAlpha = lightlevel;
                    Viewport.ctx.drawImage(Sprite.tile_background[0].img, q * TILE_SIZE + offset.u, r * TILE_SIZE + offset.v);

                    //Viewport.ctx.fillStyle = rgba(36, 26, 20, lightlevel);
                    //Viewport.ctx.fillRect(q * TILE_SIZE + offset.u, r * TILE_SIZE + offset.v, TILE_SIZE, TILE_SIZE);
                }
            }
        }

        Viewport.ctx.globalAlpha = 1;
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
        this.buildings.push(new CoffinBuilding(this.spawn, true));

        for (let b of this.floors[0].objects) {
            if (b.name === 'EARTH') {
                this.buildings.push(new EarthBuilding({ q: b.x, r: b.y }));
            } else if (b.name === 'EXIT') {
                this.buildings.push(new ExitBuilding({ q: b.x, r: b.y }));
                this.exit = { q: b.x, r: b.y };
            }
        }

        this.selected = undefined;

        this.tiles = this.floors[0].tiles;
        this.width = this.tiles[0].length;
        this.height = this.tiles.length;

        this.lightmap = array2d(this.width, this.height, () => 0);
        this.fogofwar = array2d(this.width, this.height, () => 0);

        this.cachedFields = {};

        this.makePrettyWalls();
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

        if (!tile || tile > 8 || !this.fogofwar[qr.r][qr.q]) {
            this.selected = undefined;
        } else {
            if (this.selected && this.selected.q === qr.q && this.selected.r === qr.r) {
                let building = this.buildingAt(this.selected);
                if (building) {
                    let actions = building.hudActions();
                    if (actions[0] && actions[0].defaultTapAction()) {
                        actions[0].tap();
                    }
                } else {
                    MoveAction.tap();
                }
            } else {
                // single tap, reselect
                this.selected = qr;
                Audio.play(Audio.tile);
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

    updateLightmap() {
        /*
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
        }*/

        let lights = [];

        for (let building of this.buildings) {
            if (building.lightlevel) {
                lights.push({ ...building.qr, light: building.lightlevel });
            }
        }

        for (let entity of game.entities) {
            if (entity.lightlevel) {
                lights.push({ ...xy2qr(entity.pos), light: entity.lightlevel });
            }
        }

        this.lightmap = floodlight(this.tiles, lights);
        for (let r = 0; r < this.lightmap.length; r++) {
            for (let q = 0; q < this.lightmap[0].length; q++) {
                if (this.lightmap[r][q] > this.fogofwar[r][q]) {
                    this.fogofwar[r][q] = 1;
                }
            }
        }
    },

    pathToTarget(from, to) {
        let qrFrom = xy2qr(from);
        let qrTo = xy2qr(to);

        let dist = manhattan(qrFrom, qrTo);
        if (dist <= 1) {
            return to;
        }

        let key = [qrTo.q, qrTo.r].join(',');

        // Our game doesn't support any kinds of doors or world destruction or
        // anything like that, so once we've calculated a field we don't need to
        // recalculate it.
        let field = this.cachedFields[key];
        if (!field) {
            field = this.cachedFields[key] = flood(this.tiles, qrTo);
        }

        let options = [
            [qrFrom.q + 1, qrFrom.r],
            [qrFrom.q - 1, qrFrom.r],
            [qrFrom.q, qrFrom.r + 1],
            [qrFrom.q, qrFrom.r - 1]
        ];

        for (let option of options) {
            option.push(field[option[1]][option[0]]);
        }
        options.sort((a, b) => a[2] - b[2]);

        return centerxy(qr2xy({ q: options[0][0], r: options[0][1] }));
    },

    makePrettyWalls() {
        for (let r = 0; r < this.tiles.length; r++) {
            for (let q = 0; q < this.tiles[0].length; q++) {
                if (this.tiles[r][q] === TILE_CORNER_INNER) {
                    let bitmask = 0;

                    if ((this.tiles[r - 1]?.[q - 1] || 99) < 8) bitmask |= 0b100_000_000;
                    if ((this.tiles[r - 1]?.[q] || 99) < 8)     bitmask |= 0b010_000_000;
                    if ((this.tiles[r - 1]?.[q + 1] || 99) < 8) bitmask |= 0b001_000_000;
                    if ((this.tiles[r]?.[q - 1] || 99) < 8)     bitmask |= 0b000_100_000;
                    if ((this.tiles[r]?.[q + 1] || 99) < 8)     bitmask |= 0b000_001_000;
                    if ((this.tiles[r + 1]?.[q - 1] || 99) < 8) bitmask |= 0b000_000_100;
                    if ((this.tiles[r + 1]?.[q] || 99) < 8)     bitmask |= 0b000_000_010;
                    if ((this.tiles[r + 1]?.[q + 1] || 99) < 8) bitmask |= 0b000_000_001;

                    Sprite.getDynamicTile(bitmask);
                    this.tiles[r][q] = TILE_DYNAMIC + bitmask;
                }
            }
        }
    }
};
