"use strict";
const express = require('express');
const app = express();
const ws = require('express-ws')(app);
const uuid = require('node-uuid');

app.get('/', (req, res, next) => {
	res.sendFile(__dirname + '/index.html');
});

app.get('/app.js', (req, res, next) => {
	res.sendFile(__dirname + '/app.js');
});

app.get('/app.css', (req, res, next) => {
	res.sendFile(__dirname + '/app.css');
});

const sockets = {};
let userIdCount = 0;

function broadcast(data) {
	for(let uid in sockets) {
		let socket = sockets[uid];
		socket.send(data);
	}
}

app.ws('/', (socket, req) => {
	// Give user id
	socket.username = `User${userIdCount++}`;
	socket.send(JSON.stringify({
		type: 'set-username',
		id: socket.username
	}));

	// Generate unique id to socket and save to socket list
	const uid = uuid.v4();
	socket.uid = uid;

	console.log(`Socket ${uid} connected.`);
	sockets[uid] = socket;
	
	socket.on('error', (err) => {
		console.error(`Error from ${uid} socket: ${err.message}`);
		console.error(err.stack);
	});
	socket.on('message', (data) => {
		if(data.type === 'system') {
			if(data.action === 'rename') {
				socket.username = data.username
			}
		}

		console.log(`Socket(${uid}): ${data}`);
		broadcast(data);
	});
	socket.on('close', () => {
		console.log(`Socket ${uid} disconnected.`);
		delete sockets[uid];

		broadcast(JSON.stringify({
			type: 'plain',
			message: `User ${socket.username} leaved the channel.`
		}));
		socket = null;	// make sure to remove socket
	});
});

app.listen(3300, () => {
	console.log('WebSocket Server with Express listens at port 3300...');
});