"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Flag } from "lucide-react";

export default function CreateNationPage() {
  const router = useRouter();
  const params = useSearchParams();
  const serverId = params.get("serverId");

  const [form, setForm] = useState({
    name: "",
    governmentType: "democracy",
    flagColor: "#16a34a",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!serverId) router.push("/dashboard");
  }, [serverId, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/nation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, serverId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create nation");
      router.push(`/server/${serverId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 text-white">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Flag className="w-5 h-5 text-emerald-400" />Create Nation</h1>
        <div>
          <label className="block mb-1">Nation Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600"
          />
        </div>
        <div>
          <label className="block mb-1">Government Type</label>
          <select
            value={form.governmentType}
            onChange={(e) => setForm({ ...form, governmentType: e.target.value })}
            className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600"
          >
            <option value="democracy">Democracy</option>
            <option value="monarchy">Monarchy</option>
            <option value="dictatorship">Dictatorship</option>
            <option value="theocracy">Theocracy</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Flag Color</label>
          <input
            type="color"
            value={form.flagColor}
            onChange={(e) => setForm({ ...form, flagColor: e.target.value })}
            className="w-16 h-10 p-0 border-none"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 w-full py-2 rounded"
        >
          {loading ? "Creating…" : "Create Nation"}
        </button>
      </form>
    </div>
  );
}
