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
var commands = ["/help - list all user commands", "/nick <name> - you can change your username", "/color <hex> - change your color", "/join <room> - switch to a different chat room", "/leave - leave your current chat room", "/list - list all open rooms", "/room - tells you what room you're in", "/clear - clear all chat messages"];
var rooms = [{name: "default", users: 0, private: false, password: ""},];

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
                        rooms[0].users++;
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
    //OUTPUT: BM - Broadcast Message | BN - Broadcast Name | BC - Broadcast Color | BJ - Broadcast Join | BL - Broadcast Leave | BR - Broadcast Room | BH - Broadcast Help | BCR - Broadcast Clear Request
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
    							clients[k].color = newColor;

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
                        var oldRoom = clients[k].room;
    					if(cmd.indexOf("#") == 0){
    						var roomName = cmd.substr(1);

    						//Inform users that a client left the room
    						io.sockets.in(clients[k].room).emit('BL', {
    							username: clients[k].username,
    							room: roomName
    						});
    						clients[k].room = roomName;
    						socket.join(clients[k].room);
                            socket.leave(oldRoom);
    						io.sockets.in(clients[k].room).emit('BJ', {
    							username: clients[k].username,
    							color: clients[k].color,
    							room: clients[k].room
    						});

                            for(var x = 0; x < rooms.length; x++){
                                if(rooms[x].name == oldRoom){
                                    rooms[x].users--;

                                    if(rooms[x].users <= 0 && rooms[x].name != "default"){
                                        rooms.splice(rooms.indexOf(x));
                                    }
                                }

                                //If the room already exist we just add a user to the user count
                                if(clients[k].room == rooms[x].name){
                                    rooms[x].users++;
                                    return;
                                }

                                //We hit the end of all rooms, add this new room to the list
                                if(x == rooms.length - 1){
                                    var newRoom = {name: clients[k].room, users: 1, private: false, password: ""};
                                    rooms.push(newRoom);
                                    return;
                                }
                            }
	
	    					console.log("[ROOM: " + clients[k].room +"] " + clients[k]	.username + " has joined room #" + clients[k].room);
    					}//end of # name
    					else{
    						//Inform users that a client left the room
    						io.sockets.in(clients[k].room).emit('BL', {
    							username: clients[k].username,
    							room: cmd
    						});
    						clients[k].room = cmd;
    						socket.join(clients[k].room);
                            socket.leave(oldRoom);
    						io.sockets.in(clients[k].room).emit('BJ', {
    							username: clients[k].username,
    							color: clients[k].color,
    							room: clients[k].room
    						});
	                           
                            for(var x = 0; x < rooms.length; x++){
                                if(rooms[x].name == oldRoom){
                                    rooms[x].users--;

                                    if(rooms[x].users <= 0 && rooms[x].name != "default"){
                                        rooms.splice(rooms.indexOf(x));
                                    }
                                }

                                //If the room already exist we just add a user to the user count
                                if(clients[k].room == rooms[x].name){
                                    rooms[x].users++;
                                    return;
                                }

                                //We hit the end of all rooms, add this new room to the list
                                if(x == rooms.length - 1){
                                    var newRoom = {name: clients[k].room, users: 1, private: false, password: ""};
                                    rooms.push(newRoom);
                                    return;
                                }
                            }

	    					console.log("[ROOM: " + clients[k].room +"] " + clients[k]	.username + " has joined room #" + clients[k].room);
    					}

    					
    				}
    				else if(cmd.toLowerCase().indexOf("leave") == 0){
    					var cmd = "default";
                        var oldRoom = clients[k].room;
    					//Inform users that a client left the room
    					io.sockets.in(clients[k].room).emit('BL', {
    						username: clients[k].username,
    						room: cmd
    					});
    					
                        clients[k].room = 'default';
    					//Client rejoined the default room after leaving
    					socket.join(clients[k].room);
                        //console.log(oldRoom + " : " + clients[k].room);
                        socket.leave(oldRoom);
    					io.sockets.in(clients[k].room).emit('BJ', {
    						username: clients[k].username
    					});

                        //loop through all the rooms until it matches our clients old room, then remove the user, if it hits 0 we need to remove th room from the list
                        for(var x = 0; x < rooms.length; x++){
                            if(rooms[x].name == 'default') rooms[x].users++;
                            if(oldRoom == rooms[x].name && oldRoom != "default"){
                                rooms[x].users--;

                                if(rooms[x].users <= 0){
                                    rooms.splice(rooms.indexOf(x));
                                    return;
                                }
                            }
                        }

    					console.log("[ROOM: " + clients[k].room +"] " + clients[k].username + " has joined room #" + clients[k].room);
    				}
                    else if(cmd.toLowerCase().indexOf("help") == 0){
                        //loop through the help command array and send all the strings to the client
                        for(var x = 0; x < commands.length; x++){
                            io.to(clients[k].id).emit('BH', {
                                cmd: commands[x],
                            });
                        }

                        console.log("[ROOM: " + clients[k].room +"] " + clients[k].username + " asked for help");
                    }
                    else if(cmd.toLowerCase().indexOf("room") == 0){
                        //tell the user what room they are in
                        io.to(clients[k].id).emit('BR', {
                                room: clients[k].room,
                        });
                        console.log("[ROOM: " + clients[k].room +"] " + clients[k].username + " asked what room they are in");
                    }
                    else if(cmd.toLowerCase().indexOf("list") == 0){
                        //loop through all possible rooms and send their name and current user count
                        for(var x = 0; x < rooms.length; x++){
                            io.to(clients[k].id).emit('BRL', {
                                room: rooms[x].name,
                                users: rooms[x].users,
                            });
                        }

                        console.log("[ROOM: " + clients[k].room +"] " + clients[k].username + " asked for the list of rooms");
                    }
                    else if(cmd.toLowerCase().indexOf("clear") == 0){
                        //tell the user what room they are in
                        io.to(clients[k].id).emit('BCR');
                        console.log("[ROOM: " + clients[k].room +"] " + clients[k].username + " cleared their chat log");
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