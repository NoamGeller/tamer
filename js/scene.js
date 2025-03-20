export default class Example extends Phaser.Scene {
    // ...

    enemyTrapped(trap, enemy) {
        const enemyX = enemy.x;
        const enemyY = enemy.y;
        const flash = this.add.circle(enemyX, enemyY, 30, 0xffffff);
        this.tweens.add({
            targets: flash,
            scale: 2,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                flash.destroy();
            }
        });
        if (this.changeDirectionTimer) {
            this.changeDirectionTimer.remove();
            this.changeDirectionTimer = null;
        }
        trap.destroy();
        enemy.destroy();
        this.enemy = null; // Reset enemy to null
        this.time.delayedCall(1000, () => {
            this.createEnemy();
        });
    }

    // ...
}
