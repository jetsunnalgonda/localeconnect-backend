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

// import serveStatic from 'serve-static';
import history from 'connect-history-api-fallback';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
setupMiddleware(app);

// Serve static files from the dist directory (built Vue.js app)
const staticFileMiddleware = express.static(path.join(__dirname, 'dist'));

// Use connect-history-api-fallback middleware before serving static files
// app.use(history({
//   index: '/index.html',
//   rewrites: [
//     { from: /^\/api/, to: context => context.parsedUrl.pathname }, // Skip API routes
//     {
//       from: /^\/login\/.*$/,
//       to: function(context) {
//         return '/#' + context.parsedUrl.pathname;
//       }
//     },
//     {
//       from: /^\/profile\/.*$/,
//       to: function(context) {
//         return '/#' + context.parsedUrl.pathname;
//       }
//     },
//     {
//       from: /^\/notifications\/.*$/,
//       to: function(context) {
//         return '/#' + context.parsedUrl.pathname;
//       }
//     },
//     { from: /./, to: '/index.html' } // Redirect all other routes to index.html
//   ]
// }));

// Serve the static files after the history fallback middleware
app.use(staticFileMiddleware);

// Middleware to rewrite URLs to hash-based routes
// app.get('*', (req, res, next) => {
//   // Ignore API routes or specific paths that shouldn't be redirected
//   if (req.path.startsWith('/api')) {
//     return next();
//   }
//   if (req.path.startsWith('/#')) {
//     return next();
//   }

//   // Rewrite URL to hash-based routing for the frontend
//   const frontendUrl = `/#/${req.url}`;
  
//   // Redirect to hash-based URL
//   res.redirect(frontendUrl);
// });

// Serve static files from the 'dist' directory
// app.use(express.static(path.join(__dirname, 'dist')));

app.use((req, res, next) => {
  console.log(`Request URL: ${req.url} | Method: ${req.method}`);
  next();
});

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
