// World

import { FLICKER_FRAME_1, STATUS_COL, TYPE_HIDDEN } from './Constants';
//import { FieldOfView } from './FieldOfView';
import { Game } from './Game';
import { game } from './Game';
import { Viewport } from './Viewport';
import { WorldData } from './WorldData-gen';
import { Sprite } from './Sprite';
import { xy2uv, xy2qr, uv2xy } from './Util';
import { Camera } from './Camera';
import { Moth } from './Moth';
import { Building } from './Building';

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
                if (tiles[y][x] > 0) {
                    Viewport.ctx.drawImage(Sprite.tiles[tiles[y][x] - 1].img, x * 8 + offset.u, y * 8 + offset.v);
                }
            }
        }

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
                objects: floor.objects.map(object => ({ id: object[0], x: object[1], y: object[2], type: object[3] })),
                // *COMBAT*
                //triggers: floor.triggers.map(trigger => ({ ...trigger }))
            };
        });
        this.bounds = WorldData.bounds;
        this.spawn = WorldData.spawn;

        this.buildings = [];

        this.selected = undefined;
    },

    tileAt(pos) {
        let tiles = this.floors[pos.z].tiles;
        if (pos.x < 0 || pos.y < 0 || pos.x >= tiles[0].length || pos.y >= tiles.length) return ' ';
        return tiles[pos.y][pos.x];
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
        this.selected = xy2qr(uv2xy(uv));

        let tile = this.selectedTile();
        if (!tile || tile === 2) {
            this.selected = undefined;
            console.log('nah, no good man');
        }

        console.log('new moth');
        //game.entities.push(new Moth(uv2xy(uv)));
        //this.buildings.push(new Building(this.selectedTile));
    },

    selectedTile() {
        if (this.selected) {
            return this.floors[0].tiles[this.selected.r]?.[this.selected.q];
        }
    }
};
