
class Example extends Phaser.Scene {
    constructor() {
        super();
        this.joystick = null;
        this.joystickBase = null;
        this.joystickThumb = null;
        this.isDragging = false;
        this.logo = null;
        this.enemy = null;
        this.joystickRadius = 50;
        this.maxSpeed = 300;
        this.changeDirectionTimer = null;
        this.trapButton = null;
        this.trapCount = 5;
        this.trapCountText = null;
        this.trapGroup = null;
        this.trapPlacementDistance = 60;
    }

    preload() {
        // No preload needed for rectangle
    }

    create() {
        this.cameras.main.setBackgroundColor('#222222');
        this.createPlayer();
        this.trapGroup = this.physics.add.group();
        this.createEnemy();
        this.createJoystick();
        this.createTrapButton();
        this.setupInputEvents();
        this.physics.add.overlap(this.trapGroup, this.enemy, this.enemyTrapped, null, this);
    }

    createPlayer() {
        this.logo = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            50, 50, 0x00ff00
        );
        this.physics.add.existing(this.logo);
        this.logo.body.setCollideWorldBounds(true);
        this.logo.body.setBounce(0.2, 0.2);
        this.logo.body.setDamping(true);
        this.logo.body.setDrag(0.95);
    }

    setupInputEvents() {
        this.input.on('pointerdown', this.handlePointerDown, this);
        this.input.on('pointermove', this.moveJoystick, this);
        this.input.on('pointerup', this.stopJoystick, this);
        this.input.on('pointerout', this.stopJoystick, this);
    }

    createEnemy() {
        this.enemy = this.add.rectangle(
            Phaser.Math.Between(100, this.cameras.main.width - 100),
            Phaser.Math.Between(100, this.cameras.main.height - 100),
            40, 40, 0xff0000
        );
        this.physics.add.existing(this.enemy);
        this.enemy.body.setCollideWorldBounds(true);
        this.setRandomEnemyDirection();
        this.changeDirectionTimer = this.time.addEvent({
            delay: Phaser.Math.Between(2000, 5000),
            callback: this.setRandomEnemyDirection,
            callbackScope: this,
            loop: true
        });
    }

    setRandomEnemyDirection() {
        if (!this.enemy || !this.enemy.body) return;
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const speed = Phaser.Math.Between(50, 100);
        this.enemy.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
        if (this.changeDirectionTimer) {
            this.changeDirectionTimer.delay = Phaser.Math.Between(2000, 5000);
        }
    }

    createJoystick() {
        const x = 120;
        const y = this.cameras.main.height - 120;
        this.joystick = this.add.container(x, y);
        this.joystickBase = this.add.circle(0, 0, this.joystickRadius, 0x000000, 0.5);
        this.joystickThumb = this.add.circle(0, 0, this.joystickRadius / 2, 0xffffff, 0.7);
        this.joystick.add(this.joystickBase);
        this.joystick.add(this.joystickThumb);
    }

    createTrapButton() {
        const x = this.cameras.main.width - 120;
        const y = this.cameras.main.height - 120;
        this.trapButton = this.add.container(x, y);
        const trapBase = this.add.circle(0, 0, this.joystickRadius, 0x000000, 0.5);
        const triangleSize = 20;
        const triangle = this.add.triangle(0, 0, -triangleSize, triangleSize,
            triangleSize, triangleSize, 0, -triangleSize, 0xffff00);
        this.trapCountText = this.add.text(-this.joystickRadius + 10, -this.joystickRadius + 5,
            this.trapCount.toString(), {
                fontSize: '24px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            });
        this.trapButton.add(trapBase);
        this.trapButton.add(triangle);
        this.trapButton.add(this.trapCountText);
        trapBase.setInteractive();
    }

    handlePointerDown(pointer) {
        const distanceToTrapButton = Phaser.Math.Distance.Between(
            pointer.x, pointer.y,
            this.trapButton.x, this.trapButton.y
        );
        if (distanceToTrapButton <= this.joystickRadius) {
            this.placeTrap();
            return;
        }
        const distanceToJoystick = Phaser.Math.Distance.Between(
            pointer.x, pointer.y,
            this.joystick.x, this.joystick.y
        );
        if (distanceToJoystick <= this.joystickRadius * 1.5) {
            this.isDragging = true;
            this.moveJoystick(pointer);
        }
    }

    moveJoystick(pointer) {
        if (!this.isDragging) return;
        const dx = pointer.x - this.joystick.x;
        const dy = pointer.y - this.joystick.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        let angle = Math.atan2(dy, dx);
        let thumbX, thumbY;
        if (distance > this.joystickRadius) {
            thumbX = Math.cos(angle) * this.joystickRadius;
            thumbY = Math.sin(angle) * this.joystickRadius;
        } else {
            thumbX = dx;
            thumbY = dy;
        }
        this.joystickThumb.x = thumbX;
        this.joystickThumb.y = thumbY;
        const percentDistanceFromCenter = Math.min(distance / this.joystickRadius, 1);
        this.logo.body.setVelocity(
            Math.cos(angle) * this.maxSpeed * percentDistanceFromCenter,
            Math.sin(angle) * this.maxSpeed * percentDistanceFromCenter
        );
        this.currentAngle = angle;
    }

    stopJoystick() {
        if (this.isDragging) {
            this.isDragging = false;
            this.joystickThumb.x = 0;
            this.joystickThumb.y = 0;
            this.logo.body.setVelocity(0, 0);
        }
    }

    placeTrap() {
        if (this.trapCount <= 0) return;
        let angle = this.currentAngle;
        if (angle === undefined) {
            angle = -Math.PI / 2;
        }
        const trapX = this.logo.x + Math.cos(angle) * this.trapPlacementDistance;
        const trapY = this.logo.y + Math.sin(angle) * this.trapPlacementDistance;
        const trap = this.add.triangle(
            trapX, trapY,
            -15, 15,
            15, 15,
            0, -15,
            0xffff00
        );
        this.physics.add.existing(trap);
        this.trapGroup.add(trap);
        this.trapCount--;
        this.trapCountText.setText(this.trapCount.toString());
        this.tweens.add({
            targets: this.trapButton,
            scale: 1.2,
            duration: 100,
            yoyo: true
        });
        this.tweens.add({
            targets: trap,
            fillColor: 0xffffff,
            duration: 200,
            yoyo: true,
            repeat: 1
        });
    }

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
        this.enemy = null;
        this.time.delayedCall(1000, () => {
            this.createEnemy();
        });
    }

    update() {
        if (this.enemy && this.enemy.body) {
            this.physics.world.collide(this.logo, this.enemy, this.handleCollision, null, this);
        }
    }

    handleCollision() {
        if (!this.enemy || !this.enemy.body) return;
        this.tweens.add({
            targets: this.enemy,
            fillColor: 0xffff00,
            duration: 100,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                if (this.enemy) {
                    this.enemy.fillColor = 0xff0000;
                }
            }
        });
        const angle = Phaser.Math.Angle.Between(
            this.logo.x, this.logo.y,
            this.enemy.x, this.enemy.y
        );
        this.enemy.body.setVelocity(
            Math.cos(angle) * 150,
            Math.sin(angle) * 150
        );
        if (this.changeDirectionTimer) {
            this.changeDirectionTimer.reset({
                delay: Phaser.Math.Between(2000, 5000),
                callback: this.setRandomEnemyDirection,
                callbackScope: this,
                loop: true
            });
        }
    }
}

export default Example;
