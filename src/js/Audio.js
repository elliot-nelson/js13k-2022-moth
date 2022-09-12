'use strict';

import { TITLE } from './Constants';
import { zzfx, zzfxP, zzfxX } from './lib/zzfx';
import { zzfxM } from './lib/zzfxm';
import { ObliqueMystique } from './songs/ObliqueMystique';

export const Audio = {
    init() {
        Audio.readyToPlay = false;

        Audio.ctx = zzfxX;
        Audio.gain_ = Audio.ctx.createGain();
        Audio.gain_.connect(Audio.ctx.destination);
        zzfx.destination_ = Audio.gain_;

        Audio.shellReload = [,,68,0.01,,0.14,1,1.53,7.5,0.1,50,0.02,-0.01,-0.2,0.1,0.2,,0.47,0.01];
        Audio.damage = [,,391,,.19,.01,2,.54,-4,20,,,,,,,.02,.9];
        Audio.alarm = [,,970,.12,.25,.35,,.39,8.1,,10,.1,.2,,.1,,,.6,.09,.13];
        // [,,961,.05,.06,1.17,1,4.67,.8,,,,,.8,-0.8,.1,.49,.62,.09];
        Audio.victory = [,,454,.06,.86,.71,2,.63,-0.7,1.7,-83,.09,.27,.3,.2,,.18,.95,.02,.02];
        //Audio.song = zzfxM(...ObliqueMystique);

        Audio.mothDeath = [1.04,,363,.01,.08,.52,2,.31,.3,,,,,1.5,,.9,,.34,.07];
        Audio.towerShoot = [1.56,,225,,.05,,3,.79,-7.6,.2,,,.08,,2.1,,.07,.99];
        Audio.ghostDeath = [1.35,,968,.01,.02,,2,.12,-0.7,.1,-105,.06,,.1,,,.01,.66,.04];

        Audio.buildingFinished = [2.03,0,65.40639,.03,.66,.18,2,.95,,,,,.3,.4,,,.19,.21,.1,.04];

        Audio.waveCountdown = [1.56,0,261.6256,,.13,.3,,.41,,,,,,.2,,,.05,.2,.19,.22];
        // Save our background music in os13k, for fun!
        //localStorage[`OS13kMusic,${TITLE} - Oblique Mystique`] = JSON.stringify(ObliqueMystique);
    },

    update() {
        if (!Audio.readyToPlay) return;

        return;

        if (!Audio.musicPlaying) {
            Audio.bgmusicnode = zzfxP(...Audio.song);
            Audio.bgmusicnode.loop = true;
            Audio.musicPlaying = true;
        }
    },

    play(sound) {
        if (!Audio.readyToPlay) return;
        zzfx(...sound);
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
