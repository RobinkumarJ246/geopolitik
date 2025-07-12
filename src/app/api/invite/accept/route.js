import clientPromise from "../../../../../lib/mongodb";
import { verifyToken } from "../../../../../lib/auth";
import { ObjectId } from "mongodb";

// GET /api/invite/accept?token=...
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    if (!token) return new Response(JSON.stringify({ error: "Missing token" }), { status: 400 });

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 400 });
    }
    if (payload.type !== "invite" || !payload.serverId) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("geopolitik");
    const server = await db.collection("servers").findOne({ _id: new ObjectId(payload.serverId) });
    if (!server) return new Response(JSON.stringify({ error: "Server not found" }), { status: 404 });

    return new Response(JSON.stringify({ serverId: payload.serverId, name: server.name }), { status: 200 });
  } catch (e) {
    console.error("Invite accept error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
