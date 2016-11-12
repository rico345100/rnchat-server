var chat = document.getElementById('chat');
var form = document.getElementsByTagName('form')[0];
var chatMessage = document.getElementById('message');
var socket = new WebSocket("ws://YOUR_DOMAIN_HERE");
var username = '';
var isConnected = false;

document.getElementById('set-name').addEventListener('click', function() {
	var oldname = username;
	username = prompt('Type your name.', username) || username;

	if(oldname !== username) {
		socket.send(JSON.stringify({
			type: 'system',
			action: 'rename',
			data: username,
			message: oldname + ' user change his name to ' + username
		}));
	}
});

form.addEventListener('submit', (e) => {
	e.preventDefault();

	if(chatMessage.value) {
		socket.send(JSON.stringify({
			type: 'plain',
			message: username + ': ' + chatMessage.value
		}));
		chatMessage.value = '';
	}
});

function createMessage(text) {
	var p = document.createElement('p');
	p.innerText ? p.innerText = text : p.textContent = text;
	chat.appendChild(p);

	chat.scrollTop = chat.scrollHeight;
}

socket.addEventListener('open', (e) => {
	createMessage('> Socket opened.');
});
socket.addEventListener('close', (e) => {
	createMessage('> Socket closed.');
});
socket.addEventListener('error', (e) => {
	createMessage('> Error occured.');
	createMessage(e.message);
	createMessage(e.stack);
});
socket.addEventListener('message', (e) => {
	try {
		let data = JSON.parse(e.data);

		switch(data.type) {
			case 'set-username':
				username = data.id;
				createMessage('> Entering the channel. User name is ' + data.id + '.');
				break;
			case 'system':
				createMessage('> ' + data.message);
				break;
			default:
				createMessage(data.message);
				break;
		}
	}
	catch(err) {
		createMessage('> Failed to get message from server. Invalid message was sent.');
	}
});