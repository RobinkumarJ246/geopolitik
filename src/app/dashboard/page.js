"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Settings } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchServers() {
      try {
        const res = await fetch("/api/server", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load servers");
        const data = await res.json();
        setServers(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchServers();
  }, [router]);

  return (
    <div className="min-h-screen p-6 bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Servers</h1>
          <button
            onClick={() => router.push("/create-server")}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded"
          >
            <Plus className="w-4 h-4" /> Create Server
          </button>
        </header>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : servers.length === 0 ? (
          <p>No servers yet. Click "Create Server" to start.</p>
        ) : (
          <ul className="space-y-4">
            {servers.map((srv) => (
              <li
                key={srv._id}
                className="bg-slate-800 p-4 rounded flex justify-between items-center"
              >
                <div>
                  <h2 className="text-xl font-semibold">{srv.name}</h2>
                  <p className="text-sm text-gray-400">Players: {srv.maxPlayers} | Status: {srv.status}</p>
                </div>
                <Link
                  href={`/server/${srv._id}`}
                  className="flex items-center gap-1 text-emerald-400 hover:underline"
                >
                  Manage <Settings className="w-4 h-4" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
