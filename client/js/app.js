var socket = io();

$('#chat').hide();

$("#connect").click(function() {
	if($("#username").val() != ""){
		socket.emit("C", {
			un: $("#username").val(), 
		});
	}
});

$("form").submit(function(e){
	e.preventDefault();

	socket.emit('M', {
		message: $("#message").val().toString(),
	});
	$("#message").val("");
	return false;
});

var messages = $("#messages");

setInterval(function(){
    var pos = messages.scrollTop();
    messages.scrollTop(pos + 100);
}, 200)

socket.on('E', function(data){
	$("#error").text(data.err);
});

socket.on('A', function(){
	$('#login').hide();
	$('#chat').show();
});

socket.on('BM', function(data){
	//console.log("I got a message");
	var msg = data.username + ": " + data.message;
	$("#messages").append($("<li>").text(msg).css("color", "#" + data.color));
});

socket.on('BN', function(data){
	var msg = data.old + " changed their name to " + data.username;
	$("#messages").append($("<li>").text(msg).css("color", "#" + data.color));
});

socket.on('BC', function(data){
	var msg = data.username + " changed their color to #" + data.color;
	$("#messages").append($("<li>").text(msg).css("color", "#" + data.color));
});

socket.on('BU', function(data){
	var msg = data.username + " joined the room #" + data.room;
	$("#messages").append($("<li>").text(msg).css("color", "#eeeeee"));
});

socket.on('BJ', function(data){
	var msg = data.username + " joined the room";
	$("#messages").append($("<li>").text(msg).css("color", "#eeeeee"));
});

socket.on('BL', function(data){
	var msg = data.username + " has switched to room #" + data.room;
	$("#messages").append($("<li>").text(msg).css("color", "#eeeeee"));
});