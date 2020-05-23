class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene,-300000, -10000, 'bullet');
    }

    fire(x, y, x1, y1) {
        this.body.reset(x, y);

        let dx = x1 - x
        let dy = y1 - y
        let angle = Math.atan2(dy, dx)
        this.setActive(true);
        this.setVisible(true);
        this.setVelocityY(10000 * Math.sin(angle))
        this.setVelocityX(10000 * Math.cos(angle))
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
            bullet.fire(x, y, posx, posy);
        }
    }
}
var Keys
var bullet
var info
var timer
var kills = 0;
var rect
var graphics
var users = {};
var users_id = [];
var cur_players = 0;
var my_x_y = [];
var health = 100;
var overlap_ship_list = [];

class Example extends Phaser.Scene {
    constructor() {
        super();

        this.bullets;
        this.ship;
    }

    preload() {
        this.load.image('bg', 'assets/zeldaEpic.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('ship', 'assets/arrow.png');
    }

    create() {
        this.cameras.main.setBounds(0, 0, 10000, 10000);
        this.physics.world.setBounds(0, 0, 10000, 10000);
        this.add.image(0, 0, 'bg').setOrigin(0,0);
        this.add.image(1000,1000,'ship');
        this.bullets = new Bullets(this);
        this.ship = this.physics.add.sprite(100 ,200, 'ship');        
        this.rect = new Phaser.Geom.Rectangle(200, 500, 400, 2);
        graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x00FF00}, fillStyle: { color: 0x0000aa } });
        this.health_bar = graphics.strokeRectShape(this.rect);
        this.health_bar.setScrollFactor(0);
   
        this.cameras.main.startFollow(this.ship, true, 1, 1);

        this.input.on('pointermove', (pointer) => {
            let dx = this.cameras.main.scrollX + pointer.x - this.ship.x;
            console.log("camera x:"+this.cameras.main.scrollX)
            let dy = this.cameras.main.scrollY + pointer.y - this.ship.y;
            let angle = Math.atan2(dy, dx)
            let turn_angle = angle * (180 / Math.PI)
            this.ship.angle = 90 + turn_angle;
        });
        this.input.on('pointerdown', (pointer) => {
            var posx = pointer.x;
            var posy = pointer.y;
            this.bullets.fireBullet(this.ship.x, this.ship.y, posx, posy);
        });
  
        Keys = this.input.keyboard.addKeys('W,S,A,D');
    }
    update() {
        if(this.ship != undefined){
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
    }

    remove(arr, value){
        return arr.filter(function(ele){ return ele != value; });
    }

    gameOver() {

        this.input.off('pointermove');
        this.input.off('pointerdown');
        Keys.W.enabled = false; 
        Keys.A.enabled = false; 
        Keys.S.enabled = false; 
        Keys.D.enabled = false; 
        this.ship.setVelocityX(0);
        this.ship.setVelocityY(0);
    }
    been_shot(ship,bullets){
        console.log("wow epic lol kill")
        this.health_bar.clear();
        ship = ship
        this.rect = new Phaser.Geom.Rectangle(200, 500, 400 - 4*(100-health), 2);
        this.health_bar = graphics.strokeRectShape(this.rect)
        if(health <= 0){
            pokemon =1000000000;
        }
        health--;
    }
}
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}


const config = {
    type: Phaser.CANVAS,
    width: 800,
    height: 600,
    pixelArt: true,
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

var game = new Phaser.Game(config);
