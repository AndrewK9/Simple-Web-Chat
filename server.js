var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

server.listen(1234);
console.log("[++STARTING SERVER++]");
console.log("[SERVER] Server Started on port 1234");

//This is where we send the files to the client
app.get('/', function(req, res){
    res.sendFile(__dirname + "/client/index.html");
});
app.use('/client',express.static(__dirname + "/client"));

///////////////////////////////////////////////////////////////SERVER STUFF
var clients = [];

io.sockets.on('connection', function(socket){
    console.log('[SERVER] New client connected (id: ' + socket.id + ').');
    socket.username = "";
    clients.push(socket);

    socket.on('C', function(data){
    	for(var k = 0; k < clients.length; k++){
    		if(clients[k].id == socket.id){
    			for(var x = 0; x < clients.length; x++){
    				if(data.un.toLowerCase() == clients[x].username.toLowerCase()){
    					socket.emit('E', {
    						err: "Username unavailable",
    					});
    					console.log("[SERVER] " + clients[k].username + " has already been taken.");
    					return;
    				}

    				if(x == clients.length - 1){
    					clients[k].username = data.un;
    					clients[k].room = "default";
    					socket.join(clients[k].room);
    					clients[k].color = "eeeeee";
    					socket.emit('A');
    					io.sockets.in(clients[k].room).emit('BU', {
    						username: clients[k].username,
    						color: clients[k].color,
    						room: clients[k].room
    					});
    					console.log("[SERVER] " + clients[k].username + " has joined the default chatroom.");
    				}
    			}	
    		}
    	}
    });//end of user connection event

    //M - Incoming Message from Client
    //OUTPUT: BM - Broadcast Message | BN - Broadcast Name | BC - Broadcast Color | BJ - Broadcast Join | BL - Broadcast Leave
    //We need to take the incoming message and relay it to everyone is the smae room as the sender.
    socket.on('M', function(data){
    	for(var k = 0; k < clients.length; k++){
    		if(socket.id == clients[k].id){

    			//If the client is trying to run a command we need to chop off the / index and run the following command
    			if(data.message.indexOf("/") == 0){
    				var cmd = data.message.substr(1);
    				//console.log("Someone sent in a command");
    				if(cmd.toLowerCase().indexOf("color ") == 0){
    					var newColor = cmd.substr(6);

    					//Checking to see if we need to remove the # from our color code that the user sent in
    					if(newColor.indexOf("#") == 0){
    						var color = newColor.substr(1);
    						if(isHex(color)){
    							clients[k].color = color;

    							io.sockets.in(clients[k].room).emit('BC', {
    								username: clients[k].username,
    								color: clients[k].color,
    							});

    							console.log("[ROOM: " + clients[k].room +"] " + clients[k].username + " changed their color to " + clients[k].color);
    						}
    					}else{
    						if(isHex(newColor)){
    							clients[k].color = color;

    							io.sockets.in(clients[k].room).emit('BC', {
    								username: clients[k].username,
    								color: clients[k].color,
    							});
    							console.log("[ROOM: " + clients[k].room +"] " + clients[k].username + " changed their color to " + clients[k].color);
    						}
    					}
    				}//end of color command
    				else if(cmd.toLowerCase().indexOf("nick ") == 0){
    					var newName = cmd.substr(5);
    					var prevName = clients[k].username;
    					clients[k].username = newName;

    					io.sockets.in(clients[k].room).emit('BN', {
    						username: clients[k].username,
    						color: clients[k].color,
    						old: prevName,
    					});

    					console.log("[ROOM: " + clients[k].room +"] " + prevName + " changed their name to " + clients[k].username);
    				}
    				else if(cmd.toLowerCase().indexOf("join ") == 0){
    					var cmd = data.message.substr(6);

    					if(cmd.indexOf("#") == 0){
    						var roomName = cmd.substr(1);

    						//Inform users that a client left the room
    						io.sockets.in(clients[k].room).emit('BL', {
    							username: clients[k].username,
    							room: roomName
    						});
    						socket.leave(oldRoom);
    						clients[k].room = roomName;
    						socket.join(clients[k].room);
    						io.sockets.in(clients[k].room).emit('BJ', {
    							username: clients[k].username,
    							color: clients[k].color,
    							room: clients[k].room
    						});
	
	    						console.log("[ROOM: " + clients[k].room +"] " + clients[k]	.username + " has joined room #" + clients[k].room);
    					}//end of # name
    					else{
    						//Inform users that a client left the room
    						io.sockets.in(clients[k].room).emit('BL', {
    							username: clients[k].username,
    							room: cmd
    						});
    						socket.leave(oldRoom);
    						clients[k].room = cmd;
    						socket.join(clients[k].room);
    						io.sockets.in(clients[k].room).emit('BJ', {
    							username: clients[k].username,
    							color: clients[k].color,
    							room: clients[k].room
    						});
	
	    						console.log("[ROOM: " + clients[k].room +"] " + clients[k]	.username + " has joined room #" + clients[k].room);
    					}

    					
    				}
    				else if(cmd.toLowerCase().indexOf("leave") == 0){
    					var cmd = data.message.substr(5);
    					var oldRoom = clients[k].room;

    					//Inform users that a client left the room
    					io.sockets.in(clients[k].room).emit('BL', {
    						username: clients[k].username,
    						room: cmd
    					});

    					clients[k].room = 'default';
    					socket.leave(oldRoom);

    					//Client rejoined the default room after leaving
    					socket.join(clients[k].room);
    					io.sockets.in(clients[k].room).emit('BJ', {
    						username: clients[k].username
    					});

    					console.log("[ROOM: " + clients[k].room +"] " + clients[k].username + " has joined room #" + clients[k].room);
    				}
    			}
    			else{
    				//console.log("I should send a BM message");
    				//This is a standard message, send it to everyone in the room
    				io.sockets.in(clients[k].room).emit('BM', {
    					message: data.message,
    					username: clients[k].username,
    					color: clients[k].color
    				});
    				console.log("[ROOM: " + clients[k].room +"] " + clients[k].username + ": " + data.message);
    			}

    			//console.log("[ROOM: " + clients[k].room +"] " + clients[k].username + ": " + data.message);
    		}
    	}
    });
});

//This funciton checks to see if the input is a hex color code
function isHex(sNum){
	return (typeof sNum === "string") && sNum.length === 6 && ! isNaN(parseInt(sNum, 16));
}

//////////////////////////////////////////////////////////////Server error stuff
var errorhandler = require('errorhandler');

process.on('uncaughtException', function(exception){
    console.log(exception);
});
app.use(errorhandler({dumpExceptions: true, showStack: true}));