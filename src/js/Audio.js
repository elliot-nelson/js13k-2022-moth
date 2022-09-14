'use strict';

import { CPlayer } from './vendor/player-small';
import { song } from './songs/Hey3';
import { ZZFX } from './lib/zzfx';

export const Audio = {
    init() {
        Audio.readyToPlay = false;

        //Audio.damage = [,,391,,.19,.01,2,.54,-4,20,,,,,,,.02,.9];
        // [,,961,.05,.06,1.17,1,4.67,.8,,,,,.8,-0.8,.1,.49,.62,.09];
        //Audio.victory = [,,454,.06,.86,.71,2,.63,-0.7,1.7,-83,.09,.27,.3,.2,,.18,.95,.02,.02];
        //Audio.song = zzfxM(...ObliqueMystique);

        //Audio.towerShoot = [1.56,,225,,.05,,3,.79,-7.6,.2,,,.08,,2.1,,.07,.99];
        //Audio.towerShoot = [,,1626,.01,.04,.13,1,.39,,,,,,,.9,,,.93,.04];
        Audio.towerShoot = [1.01,,1250,.01,.09,.14,,1.77,-6.3,,,,,,23,,,.46,.02];

        Audio.mothDeath = [1.04,,363,.01,.08,.52,2,.31,.3,,,,,1.5,,.9,,.34,.07];

        //Audio.ghostDeath = [1.35,,968,.01,.02,,2,.12,-0.7,.1,-105,.06,,.1,,,.01,.66,.04];
        Audio.ghostDeath = [2.01,,332,.02,.05,.16,1,.53,-0.8,,-7,.01,,.1,,,.03,.48,.04];

        Audio.buildingFinished = [2.03,0,65.40639,.03,.66,.18,2,.95,,,,,.3,.4,,,.19,.21,.1,.04];

        Audio.waveCountdown = [1.56,0,261.6256,,.13,.3,,.41,,,,,,.2,,,.05,.2,.19,.22];

        Audio.tile = [1.68,,0,.01,.01,0,,1.83,-28,-7,,,,,,,.02,,.01];
        // Save our background music in os13k, for fun!
        //localStorage[`OS13kMusic,${TITLE} - Oblique Mystique`] = JSON.stringify(ObliqueMystique);
    },

    update() {
        if (!Audio.readyToPlay) return;

        if (!Audio.musicPlaying) {
            if (!this.player) {
                this.player = new CPlayer();
                this.player.init(song);
            }

            if (this.player.generate() === 1) {
                let buffer = this.player.createAudioBuffer(Audio.ctx);
                this.songSource = Audio.ctx.createBufferSource();
                this.songSource.buffer = buffer;
                this.songSource.loop = true;
                this.songSource.connect(Audio.gain_);
                this.songSource.start();
                Audio.musicPlaying = true;
            }
        }
    },

    play(sound) {
        if (!Audio.readyToPlay) return;
        ZZFX.play(...sound);
    },

    markReady() {
        if (Audio.readyToPlay) return;

        // In Safari, ensure our target AudioContext is created inside a
        // click or tap event (this ensures we don't interact with it until
        // after user input).
        //
        // Chrome and Firefox are more relaxed, but this approach works for all 3.
        ZZFX.x = Audio.ctx = new AudioContext();
        Audio.gain_ = Audio.ctx.createGain();
        Audio.gain_.connect(Audio.ctx.destination);
        ZZFX.destination = Audio.gain_;

        Audio.readyToPlay = true;
    },

    // It's important we do pausing and unpausing as specific events and not in general update(),
    // because update() is triggered by the animation frame trigger which does not run if the
    // page is not visible. (So, if you want the music to fade in the background, for example,
    // that's not helpful if it won't work because you aren't looking at the page!)

    pause() {
        Audio.gain_.gain.linearRampToValueAtTime(0, Audio.ctx.currentTime + 1);
    },

    unpause() {
        Audio.gain_.gain.linearRampToValueAtTime(1, Audio.ctx.currentTime + 1);
    }
};
