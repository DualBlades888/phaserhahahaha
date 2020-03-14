class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        console.log(x,y)
        super(scene,-300000, -10000, 'bullet');
    }

    fire(x, y, x1, y1) {
        this.body.reset(x, y);

        let dx = x1 - x
        let dy = y1 - y
        let angle = Math.atan2(dy, dx)
        this.setActive(true);
        this.setVisible(true);
        this.setVelocityY(400 * Math.sin(angle))
        this.setVelocityX(400 * Math.cos(angle))
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.y <= -32 || this.x <= -32 || this.x >= 800 || this.y > 600) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

class Bullets extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
        this.createMultiple({
            frameQuantity: 30,
            key: 'bullet',
            active: false,
            visible: false,
            classType: Bullet
        });
    }

    fireBullet(x, y, posx, posy) {
        let bullet = this.getFirstDead(false);

        if (bullet) {
            console.log(50)
            bullet.fire(x, y, posx, posy);
        }
    }
}
var Keys
var bullet
var enemy
var info
var timer
var kills = 0;
class Example extends Phaser.Scene {
    constructor() {
        super();

        this.bullets;
        this.ship;
    }

    preload() {
        console.log(30)
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('ship', 'assets/arrow.png');
        this.load.image('enemy', 'assets/enemy.png')
    }

    create() {
        enemy = this.physics.add.sprite(100, 200, 'enemy')
        bullet = this.physics.add.group()
        this.bullets = new Bullets(this);
        this.ship = this.physics.add.sprite(400, 500, 'ship');
        this.ship.angle = 0
        this.input.on('pointermove', (pointer) => {
            let dx = pointer.x - this.ship.x
            let dy = pointer.y - this.ship.y
            let angle = Math.atan2(dy, dx)
            let turn_angle = angle * (180 / Math.PI)
            this.ship.angle = 90 + turn_angle;
        });
        this.input.on('pointerdown', (pointer) => {
            console.log(30)
            var posx = pointer.x;
            var posy = pointer.y;
            this.bullets.fireBullet(this.ship.x, this.ship.y, posx, posy);

        });
        info = this.add.text(10, 10, '', { font: '48px Arial', fill: '#ffffff' });
        timer = this.time.addEvent({ delay: 10000, callback: this.gameOver, callbackScope: this });
        this.physics.add.collider(this.ship, enemy);
        this.ship.setCollideWorldBounds(true);
        enemy.setCollideWorldBounds(true);
        Keys = this.input.keyboard.addKeys('W,S,A,D');
    }
    update() {
        this.physics.add.overlap(enemy, this.bullets, null, this.happy, this);
        info.setText('Kills: ' + kills + '\nTime: ' + Math.floor(timer.getElapsed()));
        if (Keys.S.isDown) {
            this.ship.setVelocityY(330);
        }
        else if (Keys.W.isDown) {
            this.ship.setVelocityY(-330);
        }
        else if (Keys.A.isDown) {
            this.ship.setVelocityX(-300);

        }
        else if (Keys.D.isDown) {
            this.ship.setVelocityX(300);

        }
        else {
            this.ship.setVelocityX(0);
            this.ship.setVelocityY(0);
        }
    }
    happy(enemy_good, bullet) {
        bullet.destroy();
        console.log(bullet.x,bullet.y);
        enemy_good.destroy();
        this.add_emeny()
        kills++
    };
    add_emeny() {
        let xemeny = getRandomInt(800)
        let yemeny = getRandomInt(600)
        enemy = this.physics.add.sprite(xemeny, yemeny, 'enemy');
        this.physics.add.collider(this.ship, enemy);
        enemy.setCollideWorldBounds(true);

    }
    gameOver() {
        this.input.off('pointermove');
        this.input.off('pointerdown');
        Keys.W.enabled = false; 
        Keys.A.enabled = false; 
        Keys.S.enabled = false; 
        Keys.D.enabled = false; 
    }
}
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}


const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: Example
};

let game = new Phaser.Game(config);
