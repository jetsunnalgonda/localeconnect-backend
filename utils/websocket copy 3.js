// import http from 'http';
// import https from 'https';
import { WebSocketServer } from 'ws';

const clients = new Set(); // Set to store WebSocket connections

export function initializeWebSocketServer(server) {
    // const serverIsLocal = process.env.NODE_ENV !== 'production';
    // const server = serverIsLocal ? http.createServer(app) : https.createServer(app);
    // const wss = serverIsLocal ? new WebSocketServer({ port: process.env.WEBSOCKET_PORT }) : new WebSocketServer({ server });

    // const wss = new WebSocketServer({ port: process.env.PORT || 3020 }); // Attach WebSocket server to the existing HTTP server
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        // Add the new connection to the set of clients
        clients.add(ws);

        console.log('New client connected via WebSocket');

        ws.on('message', (message) => {
            console.log('[WebSocket Server] Received message from client:', message);
            // Here you can implement logic to broadcast the message or handle it
        });

        ws.on('close', () => {
            console.log('WebSocket connection closed');
            clients.delete(ws); // Remove the connection when closed
        });
    });

    // server.listen(process.env.PORT, () => {
    //     console.log(`Websocket Server is running on port ${process.env.PORT}`);
    // });
    // Start the server if it's local
    // if (serverIsLocal) {
    //     server.listen(process.env.WEBSOCKET_PORT || 3020, () => {
    //         console.log(`WebSocket server running on port ${process.env.WEBSOCKET_PORT || 3020}`);
    //     });
    // }
}

export { clients };
