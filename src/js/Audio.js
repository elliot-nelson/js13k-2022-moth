// Audio

import { ZZFX } from './lib/zzfx';
import { CPlayer } from './lib/player-small';
import { song } from './songs/WindyCave';

export const TRACK_COMBAT = 5;
export const TRACK_WAVE = 6;

export const Audio = {
    init() {
        Audio.readyToPlay = false;

        Audio.towerShoot = [1.01,,1250,.01,.09,.14,,1.77,-6.3,,,,,,23,,,.46,.02];
        Audio.mothDeath = [1.04,,363,.01,.08,.52,2,.31,.3,,,,,1.5,,.9,,.34,.07];
        Audio.ghostDeath = [2.01,,332,.02,.05,.16,1,.53,-0.8,,-7,.01,,.1,,,.03,.48,.04];
        Audio.buildingFinished = [2.03,0,65.40639,.03,.66,.18,2,.95,,,,,.3,.4,,,.19,.21,.1,.04];
        Audio.waveCountdown = [1.56,0,261.6256,,.13,.3,,.41,,,,,,.2,,,.05,.2,.19,.22];
        Audio.tile = [1.68,,0,.01,.01,0,,1.83,-28,-7,,,,,,,.02,,.01];
    },

    update() {
        if (!Audio.readyToPlay) return;

        // This is goofy, but unfortunately we cannot generate our audio buffer until
        // after a user clicks when in Safari. (I'll try to find a more elegant solution
        // for this in the future.)
        if (!Audio.musicPlaying) {
            if (!this.player) {
                this.player = new CPlayer();
                this.player.init(song);
            }

            if (this.player.generate() === 1) {
                this.musicGainNodes = [];
                this.songSources = [];

                for (let i = 0; i < song.numChannels; i++) {
                    let buffer = this.player.createAudioBuffer(Audio.ctx, i);
                    this.songSource = Audio.ctx.createBufferSource();

                    let gainNode = Audio.ctx.createGain();
                    gainNode.connect(Audio.gain_);
                    this.musicGainNodes.push(gainNode);

                    if (i === TRACK_COMBAT || i === TRACK_WAVE) {
                        gainNode.gain.value = 0;
                    }

                    this.songSource.buffer = buffer;
                    this.songSource.loop = true;
                    this.songSource.connect(gainNode);
                    this.songSources.push(this.songSource);
                }

                this.musicStartTime = Audio.ctx.currentTime + 0.1;

                for (let i = 0; i < song.numChannels; i++) {
                    this.songSources[i].start(this.musicStartTime);
                }

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

    startWave() {
        if (!Audio.musicPlaying) return;

        if (!this.trackWavePlaying) {
            let sequenceLength = song.rowLen * 4 / 44100;
            let intoPattern = (Audio.ctx.currentTime - this.musicStartTime) % sequenceLength;
            let startTime = Audio.ctx.currentTime - intoPattern + sequenceLength;

            //this.musicGainNodes[TRACK_WAVE].gain.linearRampToValueAtTime(1, Audio.ctx.currentTime + 3);
            this.musicGainNodes[TRACK_WAVE].gain.setValueAtTime(1, startTime);
            this.trackWavePlaying = true;
        }
    },

    stopWave() {
        if (!Audio.musicPlaying) return;

        if (this.trackWavePlaying) {
            this.musicGainNodes[TRACK_WAVE].gain.linearRampToValueAtTime(0, Audio.ctx.currentTime + 4);
            this.trackWavePlaying = false;
        }
    },

    startCombat() {
        if (!Audio.musicPlaying) return;

        if (!this.trackCombatPlaying) {
            let sequenceLength = song.rowLen * 4 / 44100;
            let intoPattern = (Audio.ctx.currentTime - this.musicStartTime) % sequenceLength;
            let startTime = Audio.ctx.currentTime - intoPattern + sequenceLength;

            //this.musicGainNodes[TRACK_COMBAT].gain.linearRampToValueAtTime(1, Audio.ctx.currentTime + 1);
            this.musicGainNodes[TRACK_COMBAT].gain.setValueAtTime(1, startTime);
            this.trackCombatPlaying = true;
        }
    },

    stopCombat() {
        if (!Audio.musicPlaying) return;

        if (this.trackCombatPlaying) {
            this.musicGainNodes[TRACK_COMBAT].gain.linearRampToValueAtTime(0, Audio.ctx.currentTime + 4);
            this.trackCombatPlaying = false;
        }
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
