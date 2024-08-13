import https from 'https';
// import fs from 'fs';
import { WebSocketServer } from 'ws';

// const options = {
//     key: fs.readFileSync('private.key'),
//     cert: fs.readFileSync('certificate.crt'),
// };

export function initializeWebSocketServer(app) {
    // const server = https.createServer(options, app);
    const serverIsLocal = process.env.NODE_ENV !== 'production';
    const server = https.createServer(app);
    // const wss = new WebSocketServer({ server });
    const wss = serverIsLocal ? new WebSocketServer({ port: process.env.WEBSOCKET_PORT }) : new WebSocketServer({ server });   


    wss.on('connection', (ws) => {
        console.log('New WebSocket connection');

        ws.on('message', (message) => {
            console.log('Received:', message);
        });

        ws.on('close', () => {
            console.log('WebSocket connection closed');
        });
    });

    // server.listen(process.env.WEBSOCKET_PORT || 3020, () => {
    //     console.log(`WebSocket server running on port ${process.env.WEBSOCKET_PORT || 3020}`);
    // });
}