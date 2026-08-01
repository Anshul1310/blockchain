import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface ClientConnection {
  ws: WebSocket;
  walletAddress?: string;
}

export class WebSocketRelayServer {
  private wss: WebSocketServer;
  private clients = new Map<WebSocket, string>(); // WebSocket -> walletAddress

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('[WebSocket] Client connected to E2E relay server.');

      ws.on('message', (data: string) => {
        try {
          const payload = JSON.parse(data.toString());
          this.handleMessage(ws, payload);
        } catch (err) {
          console.error('[WebSocket] Failed to parse message JSON:', err);
          ws.send(JSON.stringify({ error: 'Invalid JSON payload format' }));
        }
      });

      ws.on('close', () => {
        const addr = this.clients.get(ws);
        if (addr) {
          console.log(`[WebSocket] Client disconnected: ${addr}`);
          this.clients.delete(ws);
        }
      });
    });
  }

  private handleMessage(ws: WebSocket, payload: any) {
    const { action, walletAddress, recipientWallet, encryptedCid, projectId } = payload;

    switch (action) {
      case 'register':
        if (walletAddress) {
          const normalized = walletAddress.toLowerCase();
          this.clients.set(ws, normalized);
          console.log(`[WebSocket] Registered active session for wallet: ${normalized}`);
          ws.send(JSON.stringify({ type: 'registered', status: 'connected', walletAddress: normalized }));
        }
        break;

      case 'relay_encrypted_cid':
        if (!recipientWallet || !encryptedCid) {
          ws.send(JSON.stringify({ error: 'Missing recipientWallet or encryptedCid parameter' }));
          return;
        }

        const targetAddr = recipientWallet.toLowerCase();
        let delivered = false;

        // Relay encrypted CID payload ONLY to the recipient's active WebSocket connection
        for (const [clientWs, addr] of this.clients.entries()) {
          if (addr === targetAddr && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(
              JSON.stringify({
                type: 'encrypted_message',
                senderWallet: this.clients.get(ws),
                projectId,
                encryptedCid,
                timestamp: Date.now(),
              })
            );
            delivered = true;
            console.log(`[WebSocket] Relayed encrypted CID ${encryptedCid} to ${targetAddr}`);
          }
        }

        // Send confirmation receipt to sender
        ws.send(
          JSON.stringify({
            type: 'relay_ack',
            encryptedCid,
            delivered,
            timestamp: Date.now(),
          })
        );
        break;

      default:
        ws.send(JSON.stringify({ error: `Unknown action type: ${action}` }));
    }
  }
}
