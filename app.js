import express from 'express';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import setupMiddleware from './utils/setupMiddleware.js';
import routes from './routes/index.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
setupMiddleware(app);

app.use('/', routes);

// Create an HTTP server using the Express app
const PORT = process.env.PORT || 3010;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Initialize WebSocket Server using the same HTTP server
const wss = new WebSocketServer({ server });

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('Client connected');

    // Example of sending data to the client every second
    const intervalId = setInterval(() => {
        ws.send(new Date().toTimeString());
    }, 1000);

    ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(intervalId); // Clear the interval when the client disconnects
    });
});

// Serve a simple index.html for WebSocket testing
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});
