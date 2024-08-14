import express from 'express';
import dotenv from 'dotenv';
import setupMiddleware from './utils/setupMiddleware.js';
import { initializeWebSocketServer } from './utils/websocket.js';
import routes from './routes/index.js';

const app = express();
dotenv.config();

// Start WebSocket Server
initializeWebSocketServer(app);

setupMiddleware(app);

app.use('/', routes);



// API route to initialize WebSocket server
// app.post('/initialize-websocket', (req, res) => {
//     initializeWebSocketServer(app);
//     res.json({ success: true });
// });

const PORT = process.env.PORT || 3010;
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
