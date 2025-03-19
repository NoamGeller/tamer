import Example from './scene.js';

const getGameConfig = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
        type: Phaser.AUTO,
        width: width,
        height: height,
        scene: Example,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        }
    };
};

export { getGameConfig };
