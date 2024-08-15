import { WebSocketServer } from 'ws';

const clients = new Set(); // Store all connected clients

// Initialize WebSocket Server
export function initializeWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, request) => {
    clients.add(ws); // Add the new connection to the set of clients

    console.log('New client connected via WebSocket');

    // Extract userId from the connection URL (e.g., ws://localhost:3020/?userId=2)
    const urlParams = new URLSearchParams(request.url.split('?')[1]);
    const userId = urlParams.get('userId');
    ws.userId = userId; // Associate the WebSocket connection with the userId

    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        const { action, data } = parsedMessage;

        console.log(`[WebSocket Server] Received action: ${action} from userId: ${ws.userId}`);

        // Handle different actions using a switch statement
        handleUserAction(action, ws, data);

      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      clients.delete(ws); // Remove the client when the connection closes
    });
  });
}

// Generalized handler for user actions
function handleUserAction(action, ws, data) {
  switch (action) {
    case 'LIKE':
      broadcastNotification('LIKE', ws, data, `liked your profile`);
      break;
    case 'COMMENT':
      broadcastNotification('COMMENT', ws, data, `commented: ${data.comment}`);
      break;
    case 'FOLLOW':
      broadcastNotification('FOLLOW', ws, data, `started following you`);
      break;
    default:
      console.warn('Unknown action:', action);
  }
}

// Broadcast a notification to the target user
function broadcastNotification(actionType, ws, data, message) {
  console.log(`[WebSocket Server] User ${ws.userId} performed ${actionType} on user with ID: ${data.userId}`);

  broadcastMessageToUser(data.userId, {
    action: 'notification',
    data: {
      type: actionType,
      userId: ws.userId,
      userName: data.userName,
      message,
    },
  });
}

// Function to broadcast a message to a specific user
function broadcastMessageToUser(targetUserId, message) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.userId === targetUserId) {
      client.send(JSON.stringify(message));
      console.log('[WebSocket Server] Broadcasted message to user:', targetUserId);
    }
  });
}

export { clients };
