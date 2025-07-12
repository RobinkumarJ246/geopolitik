import clientPromise from "../../../../../lib/mongodb";
import { verifyToken } from "../../../../../lib/auth";
import { ObjectId } from "mongodb";

// POST /api/server/start { serverId }
export async function POST(request) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    const decoded = verifyToken(auth.replace("Bearer ", ""));

    const body = await request.json();
    const { serverId } = body;
    if (!serverId) return new Response(JSON.stringify({ error: "Missing serverId" }), { status: 400 });

    const client = await clientPromise;
    const db = client.db("geopolitik");

    const servers = db.collection("servers");
    const server = await servers.findOne({ _id: new ObjectId(serverId) });
    if (!server) return new Response(JSON.stringify({ error: "Server not found" }), { status: 404 });
    if (server.hostUserId !== decoded.id)
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });

    if (server.status === "in-progress") {
      return new Response(JSON.stringify({ error: "Game already started" }), { status: 409 });
    }

    const nations = db.collection("nations");
    const humans = await nations.distinct("ownerId", { serverId: new ObjectId(serverId), ownerId: { $ne: "BOT" } });
    // ensure each human has a nation
    if (humans.length === 0) return new Response(JSON.stringify({ error: "No players" }), { status: 400 });

    const playersReady = server.playersReady || [];
    const allReady = humans.every((id) => playersReady.includes(id));
    if (!allReady) return new Response(JSON.stringify({ error: "Not all players ready" }), { status: 400 });

    await servers.updateOne({ _id: server._id }, { $set: { status: "in-progress" } });

    return new Response(JSON.stringify({ status: "in-progress" }), { status: 200 });
  } catch (e) {
    console.error("Start game error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
