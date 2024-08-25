import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
// import { WebSocketServer } from 'ws';
import setupMiddleware from './utils/setupMiddleware.js';
import routes from './routes/index.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initializeWebSocketServer } from './utils/websocket.js';

import serveStatic from 'serve-static';
import history from 'connect-history-api-fallback';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
setupMiddleware(app);

app.use(history({
  // verbose: true
}));
app.use(express.static(__dirname + '/dist'));

// Middleware to rewrite URLs to hash-based routes
app.get('*', (req, res, next) => {
  // Ignore API routes or specific paths that shouldn't be redirected
  // if (req.path.startsWith('/api')) {
  //   return next();
  // }

  // Rewrite URL to hash-based routing for the frontend
  const frontendUrl = `/#/${req.url}`;
  
  // Redirect to hash-based URL
  res.redirect(frontendUrl);
});

// Serve static files from the 'dist' directory
// app.use(express.static(path.join(__dirname, 'dist')));

app.use('/', routes);

var server = http.createServer(app)

const PORT = process.env.PORT || 3010;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

initializeWebSocketServer(server);

// Serve a simple index.html for WebSocket testing
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});
