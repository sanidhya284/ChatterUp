import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import Chat from './chatter.schema.js';
import { connectDB } from './db.config.js';

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use('/images', express.static(join(__dirname, 'images')));

app.get('/', (req, res) => {
	res.sendFile(join(__dirname, 'index.html'));
});

let onlineUser = [];

io.on('connection', (socket) => {
	console.log('a user connected');

	socket.on('join', async (name) => {
		const oldMessages = await Chat.find();
		onlineUser.push({ id: socket.id, name });
		io.emit("onlineUser", onlineUser);
		socket.emit("joined", oldMessages);
	});

	socket.on("sendMessage", async (newMessage) => {
		if (!newMessage.message || !newMessage.name) {
			return;
		}
		const newUser = new Chat({
			name: newMessage.name,
			message: newMessage.message,
			timestamp: new Date(),
		});
		const msg = await newUser.save();
		io.emit("newMessage", { msg, socketId: socket.id });
	});

	socket.on("typing", (userName) => {
		io.emit("typing", { userId: socket.id, userName });
	});

	socket.on("disconnect", () => {
		console.log('user disconnected');
		const indexToRemove = onlineUser.findIndex((user) => user.id === socket.id);
		if (indexToRemove !== -1) {
			onlineUser.splice(indexToRemove, 1);
		}
		io.emit("onlineUser", onlineUser);
	});
});

server.listen(3000, () => {
	console.log('server running at http://localhost:3000');
	connectDB();
});

