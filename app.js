import express from 'express';
import https from 'https';
import dotenv from 'dotenv';
// import { WebSocketServer } from 'ws';
import setupMiddleware from './utils/setupMiddleware.js';
import routes from './routes/index.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initializeWebSocketServer } from './utils/websocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
setupMiddleware(app);

app.use('/', routes);

var server = https.createServer(app)

const PORT = process.env.PORT || 3010;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

initializeWebSocketServer(server);

// Initialize WebSocket Server using the same HTTP server
// const wss = new WebSocketServer({ server });
// console.log("websocket server created")

// // Handle WebSocket connections
// wss.on('connection', (ws) => {
//     console.log('Client connected');

//     // Example of sending data to the client every second
//     // const intervalId = setInterval(() => {
//     //     ws.send(new Date().toTimeString());
//     // }, 1000);

//     const intervalId = setInterval(() => {
//         const message = JSON.stringify({ time: new Date().toTimeString() });
//         ws.send(message);
//     }, 1000);    
//     console.log("websocket connection open")

//     ws.on('close', () => {
//         console.log('Client disconnected');
//         clearInterval(intervalId); // Clear the interval when the client disconnects
//     });
// });

// Serve a simple index.html for WebSocket testing
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});
