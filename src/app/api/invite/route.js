import clientPromise from "../../../../lib/mongodb";
import { verifyToken, signToken } from "../../../../lib/auth";
import { ObjectId } from "mongodb";

/**
 * POST /api/invite  { serverId }
 *  -> returns a signed token that can be shared.
 */
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

    // only host can invite for now
    if (server.hostUserId !== decoded.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    const inviteToken = signToken({ serverId, type: "invite" }, "7d");
    return new Response(JSON.stringify({ token: inviteToken }), { status: 201 });
  } catch (e) {
    console.error("Invite generate error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
