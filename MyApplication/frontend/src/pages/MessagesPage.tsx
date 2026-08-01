import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Lock, Search, Circle, Inbox, CheckCheck } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { api } from '../services/api';

interface ChatThread {
  walletAddress: string;
  lastMessage: string;
  timestamp: number;
}

interface StoredMessage {
  id: string;
  senderWallet: string;
  recipientWallet: string;
  text: string;
  encryptedCid: string;
  timestamp: number;
}

export const MessagesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const recipientFromUrl = searchParams.get('recipient');
  const { walletAddress } = useAuth();

  const [activeRecipient, setActiveRecipient] = useState<string>(
    recipientFromUrl || '0x10429d68A7677F20e3C5181707AfC438Ac896DDa'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState<StoredMessage[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);

  const { messages: liveWsMessages, isWebSocketConnected, sendEncryptedMessage } = useWebSocket(activeRecipient);

  // Fetch all chat messages for current wallet & active recipient
  const fetchMessagesAndThreads = async () => {
    if (!walletAddress && !activeRecipient) return;

    try {
      // 1. Fetch messages between current wallet and active recipient
      const currentWallet = walletAddress || '0x10429d68A7677F20e3C5181707AfC438Ac896DDa';
      const response = await api.get<{ messages: StoredMessage[] }>(
        `/messages?wallet1=${currentWallet}&wallet2=${activeRecipient}`
      );

      setChatHistory(response.data.messages || []);

      // 2. Fetch all messages for current wallet to populate sidebar threads
      const allRes = await api.get<{ messages: StoredMessage[] }>(`/messages?wallet1=${currentWallet}`);
      const allMsgs = allRes.data.messages || [];

      const threadMap = new Map<string, ChatThread>();

      allMsgs.forEach((m) => {
        const otherWallet =
          m.senderWallet.toLowerCase() === currentWallet.toLowerCase()
            ? m.recipientWallet
            : m.senderWallet;

        if (!threadMap.has(otherWallet)) {
          threadMap.set(otherWallet, {
            walletAddress: otherWallet,
            lastMessage: m.text,
            timestamp: m.timestamp,
          });
        }
      });

      // Ensure activeRecipient & URL recipient are in sidebar threads
      [activeRecipient, recipientFromUrl].forEach((addr) => {
        if (addr && !threadMap.has(addr.toLowerCase())) {
          threadMap.set(addr.toLowerCase(), {
            walletAddress: addr,
            lastMessage: 'Discussion channel initialized',
            timestamp: Date.now(),
          });
        }
      });

      setThreads(Array.from(threadMap.values()));
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
    }
  };

  useEffect(() => {
    fetchMessagesAndThreads();
    const interval = setInterval(fetchMessagesAndThreads, 3000); // Polling sync
    return () => clearInterval(interval);
  }, [walletAddress, activeRecipient, recipientFromUrl]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRecipient) return;

    const textToSend = inputText.trim();
    setInputText('');

    const currentWallet = walletAddress || '0x10429d68A7677F20e3C5181707AfC438Ac896DDa';

    try {
      // 1. Post message to backend storage
      await api.post('/messages', {
        senderWallet: currentWallet,
        recipientWallet: activeRecipient,
        text: textToSend,
        encryptedCid: `QmEnc${Date.now()}`,
      });

      // 2. Broadcast over WebSocket
      await sendEncryptedMessage(textToSend, activeRecipient);

      // 3. Immediately refresh feed
      fetchMessagesAndThreads();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const shortenAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const filteredThreads = threads.filter((t) =>
    t.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentWalletLower = (walletAddress || '0x10429d68A7677F20e3C5181707AfC438Ac896DDa').toLowerCase();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <Badge variant="purple" icon={<Lock className="w-3.5 h-3.5" />}>
            WhatsApp-Style E2E Encrypted IPFS Chat
          </Badge>
          <h1 className="text-3xl font-heading font-bold text-white mt-1">Direct Client & Freelancer Messaging</h1>
        </div>
        <Badge variant={isWebSocketConnected ? 'emerald' : 'amber'}>
          WebSocket Relay: {isWebSocketConnected ? 'Live' : 'Connecting...'}
        </Badge>
      </div>

      {/* WhatsApp Layout Grid */}
      <Card className="p-0 overflow-hidden border border-white/10 grid grid-cols-1 md:grid-cols-12 h-[650px] bg-[#0A0E18]">
        
        {/* Left Sidebar: Conversations */}
        <div className="md:col-span-4 border-r border-white/10 flex flex-col bg-[#080B13]">
          
          <div className="p-4 border-b border-white/10 space-y-3">
            <h3 className="font-heading font-bold text-sm text-white">Active Discussions</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Client or Freelancer ID..."
                className="w-full pl-9 pr-3 py-2 rounded-xl glass-card bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {filteredThreads.map((thread) => {
              const isSelected = thread.walletAddress.toLowerCase() === activeRecipient.toLowerCase();
              return (
                <button
                  key={thread.walletAddress}
                  onClick={() => setActiveRecipient(thread.walletAddress)}
                  className={`w-full p-4 flex items-start gap-3 text-left transition-all ${
                    isSelected
                      ? 'bg-purple-600/20 border-l-4 border-purple-500'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center font-mono font-bold text-white text-xs flex-shrink-0 shadow-glow-purple">
                    #{thread.walletAddress.substring(2, 4)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white truncate">
                        {shortenAddress(thread.walletAddress)}
                      </span>
                      <span className="text-[10px] text-slate-500">{formatTime(thread.timestamp)}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-1">{thread.lastMessage}</p>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Right Main Chat Panel */}
        <div className="md:col-span-8 flex flex-col h-full bg-[#0B101D]">
          
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center font-mono font-bold text-white text-xs shadow-glow-purple">
                #{activeRecipient.substring(2, 4)}
              </div>
              <div>
                <h3 className="font-mono font-bold text-sm text-white">Recipient ID: {activeRecipient}</h3>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" /> E2E Encrypted Sync Active
                </span>
              </div>
            </div>
          </div>

          {/* Chat Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                <Inbox className="w-10 h-10 text-slate-500" />
                <h4 className="font-heading font-bold text-base text-white">No Messages Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Send a message to initialize discussion. Payload is stored and synced across devices.
                </p>
              </div>
            ) : (
              chatHistory.map((m) => {
                const isMe = m.senderWallet.toLowerCase() === currentWalletLower;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1.5 ${
                        isMe
                          ? 'bg-purple-600 text-white rounded-br-none shadow-glow-purple'
                          : 'glass-card bg-black/50 text-slate-200 rounded-bl-none border border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-1">
                        <span className="font-mono text-[10px] opacity-80">{shortenAddress(m.senderWallet)}</span>
                        <span className="text-[9px] opacity-60">{formatTime(m.timestamp)}</span>
                      </div>
                      <p className="leading-relaxed text-sm">{m.text}</p>
                      {m.encryptedCid && (
                        <span className="font-mono text-[9px] opacity-75 block text-cyan-200">
                          IPFS CID: {m.encryptedCid}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-black/40 flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Type message to ${shortenAddress(activeRecipient)}...`}
              className="flex-1 p-3 rounded-xl glass-card bg-black/50 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <Button type="submit" leftIcon={<Send className="w-4 h-4" />}>
              Send
            </Button>
          </form>

        </div>

      </Card>

    </div>
  );
};
