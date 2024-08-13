import express from 'express';
import dotenv from 'dotenv';
import setupMiddleware from './utils/setupMiddleware.js';
import { initializeWebSocketServer } from './utils/websocket.js';
import routes from './routes/index.js';

const app = express();
dotenv.config();

setupMiddleware(app);

app.use('/', routes);

// Start WebSocket Server
initializeWebSocketServer(app);

// API route to initialize WebSocket server
// app.post('/initialize-websocket', (req, res) => {
//     initializeWebSocketServer(app);
//     res.json({ success: true });
// });

const PORT = process.env.PORT;
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
