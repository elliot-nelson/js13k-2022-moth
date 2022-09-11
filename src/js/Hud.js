// Hud

import { game } from './Game';
import { HUD_PAGE_U, HUD_PAGE_V, HUD_PAGE_TEXT_U, R90 } from './Constants';
import { clamp, vectorBetween, vectorAdd, vector2angle, uv2xy, rgba, xy2uv, xy2qr, qr2xy } from './Util';
import { Input } from './input/Input';
import { Sprite } from './Sprite';
import { Text } from './Text';
import { Viewport } from './Viewport';
import { ScreenShake } from './ScreenShake';
import { Victory } from './systems/Victory';
import { World } from './World';
import { TowerBuilding } from './buildings/TowerBuilding';
import { BuildTowerAction } from './actions/BuildTowerAction';
import { MoveAction } from './actions/MoveAction';
import { Moth } from './Moth';

const TRAY_HEIGHT = 18;

/**
 * Hud
 *
 * Health bars, ammo, etc.
 */
export const Hud = {
    update() {
        if (World.selected) {
            let building = World.buildingAt(World.selected);
            if (building) {
                this.actions = building.hudActions();
            } else {
                this.actions = [MoveAction, BuildTowerAction];
            }
        } else {
            this.actions = [];
        }

        if (Input.dragging) {
            this.selectedAction = undefined;
        }
    },

    draw() {
        // Glyphs

        if (game.wave) {
            if (game.wave.incoming) {
                Text.drawText(Viewport.ctx, 'INCOMING', 40, 3);
            } else {
                let seconds = Math.ceil(game.wave.countdown / 60);
                Text.drawText(Viewport.ctx, 'COUNTDOWN ' + seconds, 40, 3);
            }
        }

        let moths = game.entities.filter(x => x instanceof Moth);
        for (let i = 0; i < moths.length; i++) {
            Viewport.ctx.drawImage(Sprite.moth[1].img, 2 + i * 4, 2);
        }

        let cornerText = '' + game.earth + 'e';
        let cornerWidth = Text.measureWidth(cornerText, 1);

        Viewport.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        Text.drawText(Viewport.ctx, cornerText, Viewport.width - cornerWidth - 2, 2);

        if (Input.pointer) {
            let u = Input.pointer.u;
            let v = Input.pointer.v;
            let xy = uv2xy(Input.pointer);
            let qr = xy2qr(xy);

            Text.drawText(Viewport.ctx, '' + u + ',' + v + '. ' + xy.x + ',' + xy.y + '. ' + qr.q + ',' + qr.r + '.', Viewport.width - 100, 20);
            if (World.selected) {
                let tile = World.tiles[World.selected.r][World.selected.q];
                if (tile > 20) tile = tile - 20;
                Text.drawText(Viewport.ctx, '' + World.selected.q + ',' + World.selected.r + '. ' + tile.toString(2).padStart(9, '0'), Viewport.width - 100, 29);
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

        if (World.selected) {
            /*Viewport.ctx.globalAlpha = 0.5;
            let uv = xy2uv(qr2xy(World.selected));
            Viewport.ctx.drawImage(Sprite.hud_tile_selected[Math.floor(game.frame / 30) % 2].img, uv.u, uv.v);
            Viewport.ctx.globalAlpha = 1;*/

            let uv = xy2uv({ x: World.selected.q * 8, y: World.selected.r * 8 });
            Viewport.ctx.fillStyle = rgba(255, 212, 163, 0.25);
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

        Viewport.ctx.fillStyle = '#8d697a';
        Viewport.ctx.fillRect(0, Viewport.height - 2, Viewport.width, 2);

        //Viewport.ctx.drawImage(Sprite.hud_tray_building[0].img, 0, Viewport.height - TRAY_HEIGHT + 1);

        Viewport.ctx.drawImage(Sprite.hud_tray_divider[0].img, -2, Viewport.height - TRAY_HEIGHT + 1);
        Viewport.ctx.drawImage(Sprite.hud_tray_divider[0].img, 64, Viewport.height - TRAY_HEIGHT + 1);
        Viewport.ctx.drawImage(Sprite.hud_tray_divider[0].img, Viewport.width - 3, Viewport.height - TRAY_HEIGHT + 1);

        if (World.selected) {
            let building = World.buildingAt(World.selected);
            if (building) {
                Viewport.ctx.drawImage(building.portraitSprite.img, 2, Viewport.height - TRAY_HEIGHT - 1);

                Text.drawParagraph(
                    Viewport.ctx,
                    building.title,
                    13,
                    Viewport.height - TRAY_HEIGHT + 3,
                    Viewport.width
                );
            } else {
                let tile = World.tileAt(World.selected);
                Viewport.ctx.drawImage(Sprite.tile_background[1].img, 3, Viewport.height - TRAY_HEIGHT + 6);
                Viewport.ctx.drawImage(Sprite.tiles[tile - 1].img, 2, Viewport.height - TRAY_HEIGHT + 5);
                Text.drawParagraph(
                    Viewport.ctx,
                    'EMPTY SPACE',
                    13,
                    Viewport.height - TRAY_HEIGHT + 3,
                    Viewport.width
                );
            }
        }

        let selectedActionIndex;

        for (let i = 0; i < this.actions.length; i++) {
            let action = this.actions[i];
            let uvAction = this.uvTrayAction(i);
            Viewport.ctx.drawImage(Sprite.hud_tray_divider[0].img, uvAction.u + 11, Viewport.height - TRAY_HEIGHT + 1);
            Viewport.ctx.drawImage(action.buttonSprite().img, uvAction.u, uvAction.v);

            if (this.selectedAction === action) selectedActionIndex = i;
        }

        if (selectedActionIndex >= 0) {
            let uvAction = this.uvTrayAction(selectedActionIndex);

            Viewport.ctx.drawImage(Sprite.hud_tray_popup[0].img, uvAction.u - 23, uvAction.v - 19);

            Viewport.ctx.drawImage(this.selectedAction.buttonSelectedSprite().img, uvAction.u, uvAction.v);

            this.selectedAction.drawSelectedText(uvAction.u - 23 + 3, uvAction.v - 19 + 3);
        }

        if (Input.pointer) {
            if (game.dialog) {
                Viewport.ctx.globalAlpha = 0.5;
            }
            //Sprite.drawViewportSprite(Sprite.hud_crosshair[0], uv2xy(Input.pointer), game.frame / 72);
            Sprite.drawViewportSprite(Sprite.hud_mouse, uv2xy(Input.pointer));
            Viewport.ctx.globalAlpha = 1;
        }


        /*
        Visual Effect Warning
        let gorp = game.frame % 60;
        let x = (gorp / 60) * (Viewport.width + 100) - 50;

        Viewport.ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
        Viewport.ctx.beginPath();
        Viewport.ctx.moveTo(x + 20, 0);
        Viewport.ctx.lineTo(x +0, Viewport.height);
        Viewport.ctx.lineTo(x+40, Viewport.height);
        Viewport.ctx.lineTo(x+60, 0);
        Viewport.ctx.closePath();
        Viewport.ctx.fill();
        */
    },

    uvTrayAction(i) {
        return { u: 68 + i * 15, v: Viewport.height - 15 };
    },

    tap(uv) {
        if (uv.v > Viewport.height - TRAY_HEIGHT) {
            for (let i = 0; i < this.actions.length; i++) {
                let uvAction = this.uvTrayAction(i);
                if (uv.u >= uvAction.u && uv.u <= uvAction.u + 12 && uv.v >= uvAction.v && uv.v <= uvAction.v + 12) {
                    if (this.actions[i] === this.selectedAction) {
                        if (this.selectedAction.tap()) {
                            this.selectedAction = undefined;
                        }
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
