import https from 'https';
import { WebSocketServer } from 'ws';

const clients = new Map(); // Map to store userId -> WebSocket connection

export function initializeWebSocketServer(app) {
    const serverIsLocal = process.env.NODE_ENV !== 'production';
    const server = https.createServer(app);
    const wss = serverIsLocal ? new WebSocketServer({ port: process.env.WEBSOCKET_PORT }) : new WebSocketServer({ server });

    wss.on('connection', (ws, req) => {
        // Extract userId from the request (assuming userId is passed in query or headers)
        const userId = extractUserId(req); // Implement this function based on your setup

        if (userId) {
            clients.set(userId, ws); // Store the WebSocket connection

            console.log(`User ${userId} connected via WebSocket`);

            ws.on('message', (message) => {
                console.log('Received:', message);
            });

            ws.on('close', () => {
                console.log(`User ${userId} WebSocket connection closed`);
                clients.delete(userId); // Remove the connection when closed
            });
        } else {
            console.log('Connection without userId, closing WebSocket');
            ws.close();
        }
    });

    // Start the server if it's local
    // if (serverIsLocal) {
    //     server.listen(process.env.WEBSOCKET_PORT || 3020, () => {
    //         console.log(`WebSocket server running on port ${process.env.WEBSOCKET_PORT || 3020}`);
    //     });
    // }
}

// Helper function to extract userId from the request
function extractUserId(req) {
    // This is just an example. Replace it with how you're passing userId
    return req.headers['x-user-id'] || new URL(req.url, `http://${req.headers.host}`).searchParams.get('userId');
}

export { clients };
