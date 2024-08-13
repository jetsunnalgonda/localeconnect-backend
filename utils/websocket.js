import https from 'https';
import { WebSocketServer } from 'ws';

const clients = new Set(); // Set to store WebSocket connections

export function initializeWebSocketServer(app) {
    const serverIsLocal = process.env.NODE_ENV !== 'production';
    const server = https.createServer(app);
    const wss = serverIsLocal ? new WebSocketServer({ port: process.env.WEBSOCKET_PORT }) : new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        // Add the new connection to the set of clients
        clients.add(ws);

        console.log('New client connected via WebSocket');

        ws.on('message', (message) => {
            console.log('Received:', message);
            // Here you can implement logic to broadcast the message or handle it
        });

        ws.on('close', () => {
            console.log('WebSocket connection closed');
            clients.delete(ws); // Remove the connection when closed
        });
    });

    // Start the server if it's local
    // if (serverIsLocal) {
    //     server.listen(process.env.WEBSOCKET_PORT || 3020, () => {
    //         console.log(`WebSocket server running on port ${process.env.WEBSOCKET_PORT || 3020}`);
    //     });
    // }
}

export { clients };
