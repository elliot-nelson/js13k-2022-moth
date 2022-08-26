// Hud

import { game } from './Game';
import { HUD_PAGE_U, HUD_PAGE_V, HUD_PAGE_TEXT_U, R90 } from './Constants';
import { clamp, vectorBetween, vectorAdd, vector2angle, uv2xy, rgba, xy2uv, xy2qr } from './Util';
import { Input } from './input/Input';
import { Sprite } from './Sprite';
import { Text } from './Text';
import { Viewport } from './Viewport';
import { ScreenShake } from './ScreenShake';
import { Victory } from './systems/Victory';
import { World } from './World';
import { TowerBuilding } from './buildings/TowerBuilding';
import { BuildTowerAction } from './actions/BuildTowerAction';

const TRAY_HEIGHT = 20;

/**
 * Hud
 *
 * Health bars, ammo, etc.
 */
export const Hud = {
    update() {
        this.trayHeight = 20;

        if (World.selected) {
            if (World.tileAt(World.selected) === 3) {
                this.actions = [];
            } else {
                let building = World.buildingAt(World.selected);
                if (building) {
                console.log('BUILDING!');
                    this.actions = building.hudActions();
                } else {
                    this.actions = [BuildTowerAction];
                }
            }
        } else {
            this.actions = [];
        }
    },

    draw() {
        // Glyphs
        if (game.frogger) {
            console.log(game.frogger);
          Text.drawText(Viewport.ctx, game.frogger, 30, 60, 2, Text.blue, Text.blue_shadow);
        }

        Viewport.ctx.drawImage(Sprite.tiles[0].img, 30, 30);
        Viewport.ctx.drawImage(Sprite.tiles[1].img, 40, 40);

        Text.drawText(Viewport.ctx, 'EARTH ' + game.earth, Viewport.width - 100, 10);

        if (Input.pointer) {
            let u = Input.pointer.u;
            let v = Input.pointer.v;
            let xy = uv2xy(Input.pointer);
            let qr = xy2qr(xy);

            Text.drawText(Viewport.ctx, '' + u + ',' + v + '. ' + xy.x + ',' + xy.y + '. ' + qr.q + ',' + qr.r + '.', Viewport.width - 100, 20);
            if (World.selected) {
                Text.drawText(Viewport.ctx, '' + World.selected.q + ',' + World.selected.r + '.', Viewport.width - 100, 29);
            }
        }

        // Health
        /*
        let hp = clamp(game.player.hp, 0, 100);
        Viewport.ctx.drawImage(Sprite.hud_healthbar[0].img, 2, 2);
        Viewport.ctx.drawImage(
            Sprite.hud_healthbar[1].img,
            0,
            0,
            hp + 8,
            8,
            2,
            2,
            hp + 8,
            8
        );
        */

        // Shells
        /*let sprite = Sprite.hud_shells_full;
        for (let i = 0; i < game.player.shellsMax; i++) {
            if (i + 1 > game.player.shellsLeft)
                sprite = Sprite.hud_shells_empty;
            Viewport.ctx.drawImage(sprite.img, 15 + 6 * i, 10);
        }*/

        // Glyphs
        // Text.drawText(Viewport.ctx, 'stuvw', Viewport.width - HUD_PAGE_TEXT_U - 60, 4, 2, Text.blue, Text.blue_shadow);

        Viewport.ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        Viewport.ctx.fillRect(0, Viewport.height - this.trayHeight, Viewport.width, this.trayHeight);

        Viewport.ctx.drawImage(Sprite.tiles[1].img, 25, 110);


        if (World.selected) {
            Viewport.ctx.fillStyle = rgba(255, 255, 0, 0.2);
            let uv = xy2uv({ x: World.selected.q * 8, y: World.selected.r * 8 });
            Viewport.ctx.fillRect(uv.u, uv.v, 9, 9);
        }

        // Debugging - viewport width/height
        /*
        Text.drawRightText(
            Viewport.ctx,
            [Viewport.scale, Viewport.width, Viewport.height, 'stuvwx'].join(', '),
            Viewport.width - 4,
            Viewport.height - 18
        );
        */

        Viewport.ctx.fillStyle = '#ffd4a3';
        Viewport.ctx.fillRect(0, Viewport.height - TRAY_HEIGHT, Viewport.width, 1);

        Viewport.ctx.fillStyle = '#8d697a';
        Viewport.ctx.fillRect(0, Viewport.height - TRAY_HEIGHT + 1, Viewport.width, 1);

        Viewport.ctx.fillStyle = '#203c56';
        Viewport.ctx.fillRect(0, Viewport.height - TRAY_HEIGHT + 2, Viewport.width, TRAY_HEIGHT - 2);

        let selectedActionIndex;

        for (let i = 0; i < this.actions.length; i++) {
            let action = this.actions[i];
            let uvAction = this.uvTrayAction(i);
            Viewport.ctx.drawImage(action.buttonSprite().img, uvAction.u, uvAction.v);

            if (this.selectedAction === action) selectedActionIndex = i;
        }

        if (selectedActionIndex >= 0) {
            let uvAction = this.uvTrayAction(selectedActionIndex);
            Viewport.ctx.drawImage(this.selectedAction.buttonSelectedSprite().img, uvAction.u, uvAction.v);

            Text.drawText(
                Viewport.ctx,
                this.selectedAction.selectedText(),
                uvAction.u + 14,
                uvAction.v
            );
        }

        if (Input.pointer) {
            if (game.dialog) {
                Viewport.ctx.globalAlpha = 0.5;
            }
            //Sprite.drawViewportSprite(Sprite.hud_crosshair[0], uv2xy(Input.pointer), game.frame / 72);
            Sprite.drawViewportSprite(Sprite.hud_mouse, uv2xy(Input.pointer));
            Viewport.ctx.globalAlpha = 1;
        }

    },

    uvTrayAction(i) {
        return { u: 20 + i * 20, v: Viewport.height - 16 };
    },

    tap(uv) {
        if (uv.v > Viewport.height - TRAY_HEIGHT) {
            for (let i = 0; i < this.actions.length; i++) {
                let uvAction = this.uvTrayAction(i);
                if (uv.u >= uvAction.u && uv.u <= uvAction.u + 12 && uv.v >= uvAction.v && uv.v <= uvAction.v + 12) {
                    if (this.actions[i] === this.selectedAction) {
                        this.selectedAction.tap();
                        this.selectedAction = undefined;
                    } else {
                        this.selectedAction = this.actions[i];
                    }
                    return true;
                }
            }

            this.selectedAction = undefined;
            return true;
        }

        this.selectedAction = undefined;
        return false;
    }
};
