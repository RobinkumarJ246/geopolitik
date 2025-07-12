"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateServerPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    isPublic: true,
    maxPlayers: 8,
    gameSpeed: 1,
    victoryType: "endless",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      const res = await fetch("/api/server", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create server");
      router.push(`/server/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded w-full max-w-lg space-y-6">
        <h1 className="text-2xl font-bold mb-4">Create Server</h1>
        <div>
          <label className="block mb-1">Server Name</label>
          <input
            className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isPublic}
            onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
          />
          <span>Public server (anyone can join)</span>
        </div>
        <div>
          <label className="block mb-1">Max Players</label>
          <input
            type="number"
            min="2"
            max="32"
            className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600"
            value={form.maxPlayers}
            onChange={(e) => setForm({ ...form, maxPlayers: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="block mb-1">Game Speed</label>
          <select
            className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600"
            value={form.gameSpeed}
            onChange={(e) => setForm({ ...form, gameSpeed: Number(e.target.value) })}
          >
            <option value={0.5}>Slow</option>
            <option value={1}>Normal</option>
            <option value={2}>Fast</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Victory Condition</label>
          <select
            className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600"
            value={form.victoryType}
            onChange={(e) => setForm({ ...form, victoryType: e.target.value })}
          >
            <option value="endless">Endless</option>
            <option value="score">Score Limit</option>
            <option value="time">Time Limit</option>
          </select>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 py-2 px-6 rounded w-full"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}
