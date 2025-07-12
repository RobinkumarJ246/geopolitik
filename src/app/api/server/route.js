import clientPromise from "../../../../lib/mongodb";
import { verifyToken } from "../../../../lib/auth";

export async function POST(request) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    const token = auth.replace("Bearer ", "");
    const decoded = verifyToken(token);

    const body = await request.json();
    const {
      name,
      isPublic = true,
      maxPlayers = 8,
      gameSpeed = 1,
      victoryType = "endless",
    } = body;

    if (!name) {
      return new Response(JSON.stringify({ error: "Missing server name" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("geopolitik");
    const servers = db.collection("servers");

    const result = await servers.insertOne({
      name,
      hostUserId: decoded.id,
      isPublic,
      maxPlayers,
      gameSpeed,
      victoryType,
      createdAt: new Date(),
      status: "waiting", // waiting, running, finished
    });

    return new Response(JSON.stringify({ id: result.insertedId }), { status: 201 });
  } catch (e) {
    console.error("Create server error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

export async function GET(request) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    const token = auth.replace("Bearer ", "");
    const decoded = verifyToken(token);

    const client = await clientPromise;
    const db = client.db("geopolitik");
    const servers = db.collection("servers");

    const list = await servers.find({ hostUserId: decoded.id }).toArray();

    return new Response(JSON.stringify(list), { status: 200 });
  } catch (e) {
    console.error("List servers error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
