"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [server, setServer] = useState(null);

  const userToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // fetch server info via invite
  useEffect(() => {
    async function fetchInvite() {
      if (!inviteToken) {
        setError("Missing invite token");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/invite/accept?token=${inviteToken}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Invalid invite");
        setServer(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchInvite();
  }, [inviteToken]);

  const handleJoin = async () => {
    if (!userToken) {
      router.push(`/login?next=/join?token=${inviteToken}`);
      return;
    }
    try {
      const payload = JSON.parse(atob(userToken.split(".")[1]));
      const userId = payload.id;

      // does user already have a nation?
      const natRes = await fetch(`/api/nation?serverId=${server.serverId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (!natRes.ok) throw new Error("Failed to fetch nations");
      const nations = await natRes.json();
      const mine = nations.find((n) => n.ownerId === userId);
      if (mine) {
        router.push(`/server/${server.serverId}`);
      } else {
        router.push(`/create-nation?serverId=${server.serverId}`);
      }
    } catch (e) {
      alert(e.message || "Failed to join");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading invite…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
      <div className="bg-slate-800 p-8 rounded-lg w-full max-w-md text-center space-y-6">
        <h1 className="text-2xl font-bold">Join Server</h1>
        <p>You have been invited to <span className="text-emerald-400 font-semibold">{server.name}</span>.</p>
        <button
          onClick={handleJoin}
          className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded text-lg font-medium w-full"
        >
          Join Now
        </button>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading invite...
      </div>
    }>
      <JoinForm />
    </Suspense>
  );
}
