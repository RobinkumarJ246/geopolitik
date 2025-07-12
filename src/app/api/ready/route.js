import clientPromise from "../../../../lib/mongodb";
import { verifyToken } from "../../../../lib/auth";
import { ObjectId } from "mongodb";

// POST /api/ready { serverId }  -> toggles current user's ready state
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

    // toggle ready status
    let ready = server.playersReady || [];
    if (ready.includes(decoded.id)) {
      ready = ready.filter((id) => id !== decoded.id);
    } else {
      ready.push(decoded.id);
    }

    // determine if all human players ready
    const nations = db.collection("nations");
    const humans = await nations.distinct("ownerId", { serverId: new ObjectId(serverId), ownerId: { $ne: "BOT" } });
    const allReady = humans.every((id) => ready.includes(id));
    const status = allReady ? "ready" : "waiting";

    await servers.updateOne(
      { _id: server._id },
      { $set: { playersReady: ready, status } }
    );

    return new Response(JSON.stringify({ playersReady: ready, status, allReady }), { status: 200 });
  } catch (e) {
    console.error("Ready toggle error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

// GET /api/ready?serverId=...
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const serverId = url.searchParams.get("serverId");
    if (!serverId) return new Response(JSON.stringify({ error: "Missing serverId" }), { status: 400 });

    const client = await clientPromise;
    const db = client.db("geopolitik");
    const servers = db.collection("servers");
    const server = await servers.findOne({ _id: new ObjectId(serverId) });
    if (!server) return new Response(JSON.stringify({ error: "Server not found" }), { status: 404 });

    const nations = db.collection("nations");
    const humans = await nations.distinct("ownerId", { serverId: new ObjectId(serverId), ownerId: { $ne: "BOT" } });
    const ready = server.playersReady || [];
    const allReady = humans.every((id) => ready.includes(id));

    return new Response(JSON.stringify({ playersReady: ready, status: server.status, allReady }), { status: 200 });
  } catch (e) {
    console.error("Ready get error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
