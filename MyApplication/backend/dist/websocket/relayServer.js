import { WebSocketServer, WebSocket } from 'ws';
export class WebSocketRelayServer {
    wss;
    clients = new Map();
    constructor(server) {
        this.wss = new WebSocketServer({ server, path: '/ws' });
        this.wss.on('connection', (ws) => {
            console.log('[WebSocket] Client connected to E2E relay server.');
            ws.on('message', (data) => {
                try {
                    const payload = JSON.parse(data.toString());
                    this.handleMessage(ws, payload);
                }
                catch (err) {
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
    handleMessage(ws, payload) {
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
                for (const [clientWs, addr] of this.clients.entries()) {
                    if (addr === targetAddr && clientWs.readyState === WebSocket.OPEN) {
                        clientWs.send(JSON.stringify({
                            type: 'encrypted_message',
                            senderWallet: this.clients.get(ws),
                            projectId,
                            encryptedCid,
                            timestamp: Date.now(),
                        }));
                        delivered = true;
                        console.log(`[WebSocket] Relayed encrypted CID ${encryptedCid} to ${targetAddr}`);
                    }
                }
                ws.send(JSON.stringify({
                    type: 'relay_ack',
                    encryptedCid,
                    delivered,
                    timestamp: Date.now(),
                }));
                break;
            default:
                ws.send(JSON.stringify({ error: `Unknown action type: ${action}` }));
        }
    }
}
