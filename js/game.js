
import { getGameConfig } from './config.js';
import Example from './scene.js';

const game = new Phaser.Game(getGameConfig());

window.addEventListener('resize', () => {
    if (game) {
        game.scale.resize(window.innerWidth, window.innerHeight);
    }
});
