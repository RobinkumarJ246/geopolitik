"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Users, Flag, Plus, Copy, UserPlus, Bot, Crown, TrendingUp, DollarSign, Shield, Zap } from "lucide-react";

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

  // Mark bots and sort
  const hostId = server?.hostUserId;
  const nationsWithFlags = nations.map(n=> ({...n, isBot: n.ownerId === 'BOT'}));
  const playerNations = nationsWithFlags.filter(n=>!n.isBot).
    sort((a,b)=> (a.ownerId===hostId?-1:b.ownerId===hostId?1:0));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
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
                  {/*}
                  <button
                    onClick={handleAddBot}
                    disabled={botLoading}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {botLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Add Bot
                  </button>
                  {*/}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
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
          <div className="ml-auto flex items-center gap-3">
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

          {filteredNations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flag className="w-12 h-12 text-gray-500" />
              </div>
              <p className="text-gray-400 text-lg mb-2">
                {tab === 'all' ? 'No nations yet' : `No ${tab} found`}
              </p>
              <p className="text-gray-500 text-sm">
                {tab === 'all' ? 'Be the first to create a nation in this server!' : `Switch to another tab to see more nations.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredNations.map((nation) => (
                <div 
                  key={nation._id} 
                  className="group bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-slate-700/50 hover:border-slate-600/50 p-6 transition-all duration-200 hover:shadow-lg hover:shadow-slate-900/50 transform hover:scale-105"
                >
                  {/* Nation Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: nation.flagColor || '#6b7280' }}
                      >
                        <Flag className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
                          {nation.name}
                        </h3>
                        <p className="text-sm text-gray-400">{nation.governmentType}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {nation.ownerId === userId && (
                        <div className="bg-emerald-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                          Your Nation
                        </div>
                      )}
                      {nation.isBot && (
                        <div className="bg-purple-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                          Bot
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Player Info */}
                  <div className="text-sm text-gray-400 mb-4 pb-4 border-b border-slate-700/50">
                    <span>Ruler: </span>
                    <span className="text-gray-300">{nation.ownerName}</span>
                    {nation.ownerId === userId && (
                      <span className="text-emerald-400"> (You)</span>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-400">Population</span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        {(nation.data?.population ?? 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-gray-400">Treasury</span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        ${(nation.data?.treasury ?? 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-400">GDP</span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        ${(nation.data?.gdp ?? 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="text-xs">
                        <span className="text-gray-500">Food: </span>
                        <span className="text-orange-400">{(nation.data?.food ?? 0).toLocaleString()}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Oil: </span>
                        <span className="text-purple-400">{(nation.data?.oil ?? 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-gray-400">Military</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <div>
                          <span className="text-gray-500">Soldiers</span>
                          <div className="text-red-400 font-medium">
                            {(nation.data?.military?.soldiers ?? 0).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Tanks</span>
                          <div className="text-red-400 font-medium">
                            {(nation.data?.military?.tanks ?? 0).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Aircraft</span>
                          <div className="text-red-400 font-medium">
                            {(nation.data?.military?.aircraft ?? 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}