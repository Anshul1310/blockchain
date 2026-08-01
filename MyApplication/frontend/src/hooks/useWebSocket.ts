import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { IPFSClient } from '../services/ipfsClient';
import { EncryptionService } from '../services/encryptionService';

export interface DecryptedChatMessage {
  id: string;
  senderWallet: string;
  projectId: string;
  text: string;
  encryptedCid: string;
  timestamp: number;
  isMe: boolean;
}

export function useWebSocket(targetRecipientWallet?: string, projectId: string = 'proj-101') {
  const { walletAddress, isConnected } = useAuth();
  const [messages, setMessages] = useState<DecryptedChatMessage[]>([]);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  const sharedPassphrase = `blindhire_shared_${projectId}`;

  useEffect(() => {
    if (!isConnected || !walletAddress) return;

    const wsUrl = `ws://${window.location.hostname}:5000/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WebSocket Client] Connected to E2E Relay');
      setIsWebSocketConnected(true);
      // Register active wallet session
      ws.send(JSON.stringify({ action: 'register', walletAddress }));
    };

    ws.onmessage = async (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === 'encrypted_message') {
          const { senderWallet, encryptedCid, timestamp } = payload;

          // Fetch encrypted payload JSON from IPFS
          const ipfsData = await IPFSClient.fetchJSON<{ ciphertextBase64: string; ivBase64: string }>(encryptedCid);

          // Decrypt locally using Web Crypto API
          const plaintext = await EncryptionService.decryptMessage(
            ipfsData.ciphertextBase64,
            ipfsData.ivBase64,
            sharedPassphrase
          );

          const newMsg: DecryptedChatMessage = {
            id: `msg-${timestamp}`,
            senderWallet,
            projectId,
            text: plaintext,
            encryptedCid,
            timestamp,
            isMe: senderWallet.toLowerCase() === walletAddress.toLowerCase(),
          };

          setMessages((prev) => [...prev, newMsg]);
        }
      } catch (err) {
        console.error('[WebSocket Client] Message handling error:', err);
      }
    };

    ws.onclose = () => {
      console.log('[WebSocket Client] Disconnected from E2E Relay');
      setIsWebSocketConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [isConnected, walletAddress, projectId]);

  /**
   * Encrypt message -> Upload to IPFS -> Send CID over WebSocket
   */
  const sendEncryptedMessage = useCallback(
    async (plaintext: string, recipientWallet: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket connection is not active.');
      }
      if (!walletAddress) throw new Error('Wallet not connected.');

      // 1. Encrypt message locally
      const { ciphertextBase64, ivBase64 } = await EncryptionService.encryptMessage(plaintext, sharedPassphrase);

      // 2. Upload encrypted payload to IPFS
      const encryptedCid = await IPFSClient.uploadJSON({ ciphertextBase64, ivBase64, sender: walletAddress });

      // 3. Relay CID through WebSocket
      wsRef.current.send(
        JSON.stringify({
          action: 'relay_encrypted_cid',
          walletAddress,
          recipientWallet,
          projectId,
          encryptedCid,
        })
      );

      // Optimistically append to local message list
      const selfMsg: DecryptedChatMessage = {
        id: `msg-${Date.now()}`,
        senderWallet: walletAddress,
        projectId,
        text: plaintext,
        encryptedCid,
        timestamp: Date.now(),
        isMe: true,
      };

      setMessages((prev) => [...prev, selfMsg]);
    },
    [walletAddress, projectId]
  );

  return {
    messages,
    isWebSocketConnected,
    sendEncryptedMessage,
  };
}
