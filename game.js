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
        this.socket = io();
    }

    preload() {
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('ship', 'assets/arrow.png');
    }

    create() {
        this.bullets = new Bullets(this);
        this.socket.on('new player',([socket_list,socket_number])=>{
            for(let key in socket_list){
                if(!(key in users)){
                    let user = {};
                    user.id = key;
                    user.x = socket_list[key].x
                    user.y = socket_list[key].y
                    if(key === socket_number){
                        my_x_y[0] = user.x;
                        my_x_y[1] = user.y;
                        this.ship = this.physics.add.sprite(my_x_y[0], my_x_y[1], 'ship');
                        this.ship.setCollideWorldBounds(true);
                        users[user.id] = {};
                    }else{
                        console.log("I am a big pro")
                        user.ship = this.physics.add.sprite(socket_list[key].x, socket_list[key].y, 'ship')
                        overlap_ship_list.push(user.ship);
                        console.log("x:"+socket_list[key].x)
                        console.log("y:"+socket_list[key].y)
                        user.bullets = new Bullets(this);
                        users[user.id] = user
                        users[user.id].ship.setVisible(true);
                        console.log("add socket number"+user.id)
                        this.physics.add.overlap(users[user.id].ship,this.bullets, null, this.been_shot, this);
                    }
                }
            }
        })
        for(let times = 0; times< overlap_ship_list.length;times++){
            this.physics.add.overlap(overlap_ship_list[times], this.bullets, null, this.been_shot, this);
        }
        this.socket.on('ship angle',([angle,socket_number])=>{
            users[socket_number].ship.angle = angle;
        })

        this.socket.on('player disconnect',(socket_number)=>{
            if(users[socket_number] != undefined){
                console.log('users: '+socket_number);
                console.log("socket number"+socket_number)
                users[socket_number].ship.destroy()
                delete users[socket_number].ship;
                console.log("nope")
            } 
            
        })
        this.socket.on('player move',([socket_number,x,y])=>{
            users[socket_number].ship.x = x;
            users[socket_number].ship.y = y;
        })
        this.socket.on("fire",([socket_number,shipx,shipy,posx,posy])=>{
            users[socket_number].bullets.fireBullet(shipx,shipy,posx,posy);
        })
        this.socket.emit('new player')
        this.rect = new Phaser.Geom.Rectangle(200, 500, 400, 2);
        graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x00FF00}, fillStyle: { color: 0x0000aa } });
        this.health_bar = graphics.strokeRectShape(this.rect);
        console.log(this.health_bar)
        bullet = this.physics.add.group()
        
       
        this.input.on('pointermove', (pointer) => {
            let dx = pointer.x - this.ship.x;
            let dy = pointer.y - this.ship.y;
            let angle = Math.atan2(dy, dx)
            let turn_angle = angle * (180 / Math.PI)
            this.ship.angle = 90 + turn_angle;
            this.socket.emit('ship angle',90 + turn_angle)
        });
        this.input.on('pointerdown', (pointer) => {
            var posx = pointer.x;
            var posy = pointer.y;
            this.bullets.fireBullet(this.ship.x, this.ship.y, posx, posy);
            this.socket.emit('fire',[this.ship.x, this.ship.y, posx, posy]);
        });
        //info = this.add.text(10, 10, '', { font: '48px Arial', fill: '#ffffff' });
        //timer = this.time.addEvent({ delay: 10000, callback: this.gameOver, callbackScope: this });
        
        
        Keys = this.input.keyboard.addKeys('W,S,A,D');

            
    }
    update() {
        //this.physics.add.overlap(enemy, this.bullets, null, this.happy, this);
        //info.setText('Kills: ' + kills + '\nTime: ' + Math.floor(timer.getElapsed()));
        if(this.ship != undefined){
            if (Keys.S.isDown) {
                this.ship.setVelocityY(330);
                this.socket.emit('player move',[this.ship.x,this.ship.y])
            }
            else if (Keys.W.isDown) {
                this.ship.setVelocityY(-330);
                this.socket.emit('player move',[this.ship.x,this.ship.y])
            }
            else if (Keys.A.isDown) {
                this.ship.setVelocityX(-300);
                this.socket.emit('player move',[this.ship.x,this.ship.y])
            }
            else if (Keys.D.isDown) {
                this.ship.setVelocityX(300);
                this.socket.emit('player move',[this.ship.x,this.ship.y])
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

var game = new Phaser.Game(config);
