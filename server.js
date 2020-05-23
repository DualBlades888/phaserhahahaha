var app = require('express')();
var http = require('http').createServer(app);
var Server = require('socket.io')(http);
var socket_id = [];

var users = {};
var players = 0;


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.get('/phaser.min.js', function(req, res){
  res.sendFile(__dirname + '/phaser.min.js');
});
app.get('/game.js', function(req, res){
  res.sendFile(__dirname + '/game.js');
});
app.get('/assets/bullet.png', function(req, res){
  res.sendFile(__dirname + '/assets/bullet.png');
});



app.get('/assets/arrow.png', function(req, res){
  res.sendFile(__dirname + '/assets/arrow.png');
});




app.get('/assets/enemy.png', function(req, res){
  res.sendFile(__dirname + '/assets/enemy.png');
});


function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}



Server.on('connection', function(socket){
  console.log('a user connected');
  socket.on('new player', ()=>{
    players++;
    let user = {}
    user.x = getRndInteger(0,800)
    user.y = getRndInteger(0,800)
    user.angle = 0;
    users[socket.id] = user
    socket.broadcast.emit('new player',[users,'']);
    socket.emit('new player',[users,socket.id]);
  });
  socket.on('disconnect', function(){
    socket.broadcast.emit('player disconnect',socket.id);
    console.log('a player disconnect')
    users[socket.id] = {}
    delete users[socket.id]
  });
  socket.on('player move',([x,y])=>{
    socket.broadcast.emit('player move',[socket.id,x,y])
    users[socket.id].x =x;
    users[socket.id].y =y;
  })
  socket.on('fire',([a,b,c,d])=>{
    socket.broadcast.emit('fire',[socket.id,a,b,c,d])
    console.log("okok")
    
  })
  socket.on('ship angle', (angle)=>{
    users[socket.id].angle = angle;
    socket.broadcast.emit('ship angle',[angle,socket.id]);
  });
});



http.listen(3000, function(){
  console.log('listening on *:3000');
});
Server.emit('some event', { someProperty: 'some value', otherProperty: 'other value' });

