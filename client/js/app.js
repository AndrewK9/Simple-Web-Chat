var socket = io();

$('#chat').hide();

$('#connect').click(function () {
  if ($('#username').val() != '') {
    socket.emit('C', {
      un: $('#username').val()
    });
  }
});

$('form').submit(function (e) {
  e.preventDefault();

  socket.emit('M', {
    message: $('#message').val().toString()
  });
  $('#message').val('');
  return false;
});

var messages = $('#messages');

setInterval(function () {
  var pos = messages.scrollTop();
  messages.scrollTop(pos + 100);
}, 200);

socket.on('E', function (data) {
  $('#error').text(data.err);
});

socket.on('A', function () {
  $('#login').hide();
  $('#chat').show();
});

socket.on('BM', function (data) {
	// console.log("I got a message");
  var msg = data.username + ': ' + data.message;
  $('#messages').append($('<li>').text(msg).css('color', '#' + data.color));
});

socket.on('BN', function (data) {
  var msg = data.old + ' changed their name to ' + data.username;
  $('#messages').append($('<li>').text(msg).css('color', '#EFFF52'));
});

socket.on('BC', function (data) {
  var msg = data.username + ' changed their color to #' + data.color;
  $('#messages').append($('<li>').text(msg).css('color', '#' + data.color));
});

socket.on('BU', function (data) {
  var msg = data.username + ' joined the room #' + data.room;
  $('#messages').append($('<li>').text(msg).css('color', '#52C0FF'));
});

socket.on('BJ', function (data) {
  var msg = data.username + ' joined the room';
  $('#messages').append($('<li>').text(msg).css('color', '#52C0FF'));
});

socket.on('BL', function (data) {
  var msg = data.username + ' has switched to room #' + data.room;
  $('#messages').append($('<li>').text(msg).css('color', '#52C0FF'));
});

socket.on('BH', function (data) {
  var msg = data.cmd;
  $('#messages').append($('<li>').text(msg).css('color', '#6CE565'));
});

socket.on('BR', function (data) {
  var msg = 'You are in room #' + data.room;
  $('#messages').append($('<li>').text(msg).css('color', '#52C0FF'));
});

socket.on('BRL', function (data) {
  var msg = '';
  if (data.users <= 0) {
    msg = '#' + data.room + ' - ' + 'empty';
  }
  if (data.users == 1) {
    msg = '#' + data.room + ' - ' + data.users + ' lonely user';
  }
  if (data.users > 1) {
    msg = '#' + data.room + ' - ' + data.users + ' users';
  }

  $('#messages').append($('<li>').text(msg).css('color', '#FF52AE'));
});

socket.on('BCR', function () {
  $('#messages').empty();
});
