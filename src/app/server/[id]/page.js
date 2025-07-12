"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Users, Flag, Plus, Copy, UserPlus, Bot, Crown, TrendingUp, DollarSign, Shield, Zap, MessageSquare, ChevronRight, ChevronDown, X, Maximize2, Minimize2 } from "lucide-react";
import dynamic from 'next/dynamic';

// Dynamically import the chat component with SSR disabled
const LobbyChat = dynamic(
  () => import('@/components/LobbyChat').then(mod => mod.default),
  { ssr: false }
);

export default function ServerLobbyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [server, setServer] = useState(null);
  const [nations, setNations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playersReady, setPlayersReady] = useState([]);
  const [allReady, setAllReady] = useState(false);
  const [populateLoading, setPopulateLoading] = useState(false);
  const [tab, setTab] = useState("all");
  const [botLoading, setBotLoading] = useState(false);
  const [botCountInput, setBotCountInput] = useState(100);
  const [error, setError] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [activeEmojis, setActiveEmojis] = useState({});
  const [showChat, setShowChat] = useState(false);
  
  // Chat state
  const [chatExpanded, setChatExpanded] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [chatFullscreen, setChatFullscreen] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // fetch server + nations
  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchData() {
      try {
        const [srvRes, natRes] = await Promise.all([
          fetch(`/api/server/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/nation?serverId=${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        
        if (!srvRes.ok) throw new Error("Failed to load server");
        if (!natRes.ok) throw new Error("Failed to load nations");
        
        const srv = await srvRes.json();
        const natList = await natRes.json();
        setServer(srv);
        setNations(natList);

        // after initial data, also fetch ready info
        try {
          const readyRes = await fetch(`/api/ready?serverId=${id}`, { 
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store' 
          });
          if (readyRes.ok) {
            const r = await readyRes.json();
            setPlayersReady(r.playersReady || []);
            setAllReady(r.allReady || false);
            setServer(prev=> prev ? { ...prev, status: r.status } : prev );
          }
        } catch (readyError) {
          console.warn("Failed to fetch ready status:", readyError);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id, token, router]);

  // poll ready state every 5s
  useEffect(() => {
    if (!server || !token) return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/ready?serverId=${id}`, { 
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store' 
        });
        if (res.ok) {
          const r = await res.json();
          setPlayersReady(r.playersReady || []);
          setAllReady(r.allReady || false);
          setServer(prev=> prev ? { ...prev, status: r.status } : prev );
        }
      } catch (error) {
        console.warn("Failed to poll ready status:", error);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [server, id, token]);

  // Handle new message notifications
  const handleNewMessage = (messageTime) => {
    if ((!chatExpanded && !chatFullscreen) || chatMinimized) {
      setHasNewMessages(true);
      setLastMessageTime(messageTime);
    }
  };

  // Clear new message indicator when chat is opened
  useEffect(() => {
    if (chatExpanded || chatFullscreen) {
      setHasNewMessages(false);
    }
  }, [chatExpanded, chatFullscreen]);

  // Mark bots and sort
  const hostId = server?.hostUserId;
  const nationsWithFlags = nations.map(n=> ({...n, isBot: n.ownerId === 'BOT'}));
  const playerNations = nationsWithFlags.filter(n=>!n.isBot).
    sort((a,b)=> (a.ownerId===hostId?-1:b.ownerId===hostId?1:0));
    
  // Update active emojis when new emoji reactions come in
  const handleNewEmoji = (userId, emojiData) => {
    setActiveEmojis(prev => ({
      ...prev,
      [userId]: emojiData
    }));
  };
  
  const botNations = nationsWithFlags.filter(n=>n.isBot);
  const orderedNations = [...playerNations, ...botNations];

  // Get filtered nations based on tab
  const filteredNations = orderedNations.filter(nation => {
    if (tab === "all") return true;
    if (tab === "players") return !nation.isBot;
    if (tab === "bots") return nation.isBot;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading server...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center bg-red-900/20 border border-red-500/30 rounded-lg p-8 backdrop-blur-sm">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <p className="text-red-300 text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!server) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <p className="text-white text-lg">Server not found</p>
        </div>
      </div>
    );
  }

  const payload = JSON.parse(atob(token.split('.')[1]));
  const userId = payload.id;
  const hasNation = nations.some((n) => n.ownerId === userId);
  const isHost = server.hostUserId === userId;

  const handleInvite = async () => {
    setInviteLoading(true);
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ serverId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        await navigator.clipboard.writeText(`${window.location.origin}/join?token=${data.token}`);
        setInviteCopied(true);
        setTimeout(() => setInviteCopied(false), 2000);
      } else {
        alert(data.error || 'Failed to generate invite');
      }
    } catch (error) {
      console.error('Invite error:', error);
      alert('Failed to generate invite');
    } finally {
      setInviteLoading(false);
    }
  };

  const handlePopulateBots = async () => {
    const countStr = prompt("How many bots to generate? (50-200)", String(botCountInput));
    if (!countStr) return;
    
    const num = parseInt(countStr);
    if (isNaN(num) || num < 50 || num > 200) {
      alert("Enter number between 50 and 200");
      return;
    }
    
    setPopulateLoading(true);
    try {
      const res = await fetch('/api/bots/populate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ serverId: id, count: num }),
      });
      
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to populate bots');
      }
    } catch (error) {
      console.error('Populate bots error:', error);
      alert('Failed to populate bots');
    } finally {
      setPopulateLoading(false);
    }
  };

  const handleAddBot = async () => {
    setBotLoading(true);
    try {
      const res = await fetch('/api/bots/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ serverId: id }),
      });
      
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add bot');
      }
    } catch (error) {
      console.error('Add bot error:', error);
      alert('Failed to add bot');
    } finally {
      setBotLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'text-emerald-400';
      case 'paused': return 'text-yellow-400';
      case 'ended': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const handleReadyToggle = async () => {
    try {
      const res = await fetch('/api/ready', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ serverId: id }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setPlayersReady(data.playersReady || []);
        setAllReady(data.allReady || false);
        setServer(prev=> prev ? { ...prev, status: data.status } : prev );
      }
    } catch (error) {
      console.error('Ready toggle error:', error);
    }
  };

  // Feature flag for start game implementation
  const ENABLE_START_GAME = false;

  const startGame = async () => {
    if (!ENABLE_START_GAME) {
      alert('🤩 Thank you for checking out the beta release, you are an early star. Please wait until the game is ready.');
      return;
    }
    try {
      const res = await fetch('/api/server/start', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ serverId: id }),
      });
      
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Cannot start');
      } else {
        alert('Game started!');
        // Optionally redirect to game view
        // router.push(`/game/${id}`);
      }
    } catch (error) {
      console.error('Start game error:', error);
      alert('Start failed');
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'ready': return '🟢';
      case 'waiting': return '🟡';
      case 'ended': return '🔴';
      default: return '⚪';
    }
  };

  // Chat toggle functions
  const toggleChat = () => {
    setChatExpanded(!chatExpanded);
    if (!chatExpanded) {
      setHasNewMessages(false);
    }
  };

  const toggleChatMinimize = () => {
    setChatMinimized(!chatMinimized);
    if (!chatMinimized) {
      setHasNewMessages(false);
    } else {
      setChatExpanded(false);
      setChatFullscreen(false);
    }
  };

  const toggleChatFullscreen = () => {
    setChatFullscreen(!chatFullscreen);
    if (!chatFullscreen) {
      setHasNewMessages(false);
    }
  };

  const closeChatFullscreen = () => {
    setChatFullscreen(false);
  };

  const openChat = () => {
    setChatMinimized(false);
    setChatExpanded(true);
    setHasNewMessages(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 sm:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {server.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg">{getStatusIcon(server.status)}</span>
                    <span className={`text-sm font-medium ${getStatusColor(server.status)}`}>
                      {server.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{nations.length} nations</span>
                </div>
                {isHost && (
                  <div className="flex items-center gap-1">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400">Host</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {!hasNation && (
                <button
                  onClick={() => router.push(`/create-nation?serverId=${id}`)}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Create Nation
                </button>
              )}
              
              {isHost && (
                <div className="flex gap-2">
                  <button
                    onClick={handleInvite}
                    disabled={inviteLoading}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {inviteLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    {inviteCopied ? 'Copied!' : 'Invite Players'}
                  </button>
                  <button
                    onClick={handlePopulateBots}
                    disabled={populateLoading}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {populateLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                    Populate Bots
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`${chatFullscreen ? 'hidden' : ''} lg:grid lg:grid-cols-3 lg:gap-8`}>
          {/* Left Column - Tabs and Nations */}
          <div className={`${chatExpanded ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-6`}>
            {/* Tabs and Ready Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex gap-2">
                {['all', 'players', 'bots'].map(t => (
                  <button 
                    key={t} 
                    onClick={() => setTab(t)} 
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      tab === t 
                        ? 'bg-emerald-600 text-white shadow-lg' 
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-3 sm:ml-auto">
                <span className={allReady ? 'text-emerald-400' : 'text-yellow-400'}>
                  {allReady ? 'All players ready' : 'Waiting...'}
                </span>
                {playersReady.includes(userId) ? (
                  <button 
                    onClick={handleReadyToggle} 
                    className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    Unready
                  </button>
                ) : (
                  <button 
                    onClick={handleReadyToggle} 
                    className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    Ready
                  </button>
                )}
                {isHost && (
                  <button 
                    onClick={startGame} 
                    disabled={!allReady} 
                    className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Start Game
                  </button>
                )}
              </div>
            </div>

            {/* Nations Section */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Flag className="w-6 h-6 text-emerald-400" />
                <h2 className="text-2xl font-bold">Nations</h2>
                <div className="ml-auto bg-slate-700/50 px-3 py-1 rounded-full text-sm">
                  {filteredNations.length} of {nations.length}
                </div>
              </div>

              <div className="space-y-4">
                {filteredNations.map((nation) => (
                  <div key={nation._id} className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Flag className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{nation.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>{nation.isBot ? 'Bot' : 'Player'}</span>
                            {nation.ownerId === hostId && (
                              <span className="text-yellow-400">• Host</span>
                            )}
                            {playersReady.includes(nation.ownerId) && !nation.isBot && (
                              <span className="text-emerald-400">• Ready</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {activeEmojis[nation.ownerId] && (
                        <div className="animate-bounce">
                          {activeEmojis[nation.ownerId]}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-1 mb-2">
                          <DollarSign className="w-4 h-4 text-emerald-400" />
                          <span className="text-gray-400">Economy</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">GDP</span>
                            <span className="text-emerald-400 font-medium">
                              ${(nation.data?.economy?.gdp ?? 0).toLocaleString()}B
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Population</span>
                            <span className="text-blue-400 font-medium">
                              {(nation.data?.economy?.population ?? 0).toLocaleString()}M
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 mb-2">
                          <Shield className="w-4 h-4 text-red-400" />
                          <span className="text-gray-400">Military</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Soldiers</span>
                            <span className="text-red-400 font-medium">
                              {(nation.data?.military?.soldiers ?? 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Tanks</span>
                            <span className="text-red-400 font-medium">
                              {(nation.data?.military?.tanks ?? 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Chat (Desktop) */}
          {!chatExpanded && (
            <div className="mt-6 lg:mt-0 hidden lg:block">
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 h-[600px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold">Lobby Chat</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleChatMinimize}
                      className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Minimize chat"
                    >
                      <Minimize2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={toggleChatFullscreen}
                      className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Fullscreen"
                    >
                      <Maximize2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <LobbyChat 
                    serverId={id} 
                    userId={server?.currentUser?.id} 
                    username={server?.currentUser?.username}
                    onNewEmoji={handleNewEmoji}
                    onNewMessage={handleNewMessage}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Chat Button (Minimized State) */}
        {(chatMinimized || (!chatExpanded && !chatFullscreen)) && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={openChat}
              className="relative bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <MessageSquare className="w-6 h-6" />
              {hasNewMessages && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </button>
          </div>
        )}

        {/* Expanded Chat Overlay (Mobile/Tablet) */}
        {chatExpanded && (
          <div className="lg:hidden fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-40 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-semibold">Lobby Chat</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleChatMinimize}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Minimize chat"
                >
                  <Minimize2 className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={toggleChat}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <LobbyChat 
                serverId={id} 
                userId={server?.currentUser?.id} 
                username={server?.currentUser?.username}
                onNewEmoji={handleNewEmoji}
                onNewMessage={handleNewMessage}
              />
            </div>
          </div>
        )}

        {/* Fullscreen Chat (Desktop) */}
        {chatFullscreen && (
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-40 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-semibold">Lobby Chat</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleChatMinimize}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Minimize chat"
                >
                  <Minimize2 className="w-6 h-6 text-gray-400" />
                </button>
                <button
                  onClick={closeChatFullscreen}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden p-6">
              <LobbyChat 
                serverId={id} 
                userId={server?.currentUser?.id} 
                username={server?.currentUser?.username}
                onNewEmoji={handleNewEmoji}
                onNewMessage={handleNewMessage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}