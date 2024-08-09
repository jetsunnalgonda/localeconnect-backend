import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import corsMiddleware from './utils/cors.js';
import { initializeWebSocketServer } from './utils/websocket.js';

import serveStatic  from 'serve-static';
import path from 'path';
import compression from 'compression'; // <-- import this library


import registerRoute from './routes/registerRoute.js';
import profileRoutes from './routes/profileRoutes.js'; 
import loginRoute from './routes/loginRoute.js';
import likeRoutes from './routes/likeRoutes.js';
import feedRoutes from './routes/feedRoutes.js';
import urlRoutes from './routes/urlRoutes.js';

const app = express();
dotenv.config();

// Middleware to parse JSON bodies
app.use(express.json());

// app.use(corsMiddleware);
// app.options('*', cors()); // Respond to preflight requests

// For Client Side Routing
// use compression
app.use(compression()); // <-- use the library
//here we are configuring dist to serve app files
app.use("/", serveStatic(path.join(__dirname, "/dist")));
// this * route is to serve project on different page routes except root `/`
app.get(/.*/, function(req, res) {
  res.sendFile(path.join(__dirname, "/dist/index.html"));
});


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/test', (req, res) => {
    res.status(200).json({ message: 'Backend is working!' });
});

app.use('/', registerRoute);
app.use('/', loginRoute);
app.use('/', profileRoutes);
app.use('/', likeRoutes);
app.use('/', feedRoutes);
app.use('/', urlRoutes);

// Start WebSocket Server
initializeWebSocketServer(app);

const PORT = process.env.PORT;
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
