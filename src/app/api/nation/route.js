import clientPromise from "../../../../lib/mongodb";
import { verifyToken } from "../../../../lib/auth";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    const token = auth.replace("Bearer ", "");
    const decoded = verifyToken(token);
    const ownerName = decoded.name || decoded.email || "Player";

    const body = await request.json();
    const { serverId, name, governmentType = "democracy", flagColor = "#16a34a" } = body;
    if (!serverId || !name) return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });

    const client = await clientPromise;
    const db = client.db("geopolitik");
    const servers = db.collection("servers");

    // ensure server exists and user is part of it (host for now)
    const server = await servers.findOne({ _id: new ObjectId(serverId) });
    if (!server) return new Response(JSON.stringify({ error: "Server not found" }), { status: 404 });

    // allow any authenticated user to create one nation per server (host or invited)
    // TODO: later validate that user is part of server's player list


    const nations = db.collection("nations");
    const existing = await nations.findOne({ serverId: new ObjectId(serverId), ownerId: decoded.id });
    if (existing) return new Response(JSON.stringify({ error: "Nation already exists" }), { status: 409 });

    // basic starting data template
    const startingData = {
      population: 5000000,
      treasury: 1000000,
      food: 200000,
      oil: 50000,
      gdp: 50000000,
      military: {
        soldiers: 10000,
        tanks: 50,
        aircraft: 20,
      },
    };

    const result = await nations.insertOne({
      serverId: new ObjectId(serverId),
      ownerId: decoded.id,
      name,
      governmentType,
      flagColor,
      ownerName,
      data: startingData,
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ id: result.insertedId }), { status: 201 });
  } catch (e) {
    console.error("Nation create error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

export async function GET(request) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    verifyToken(auth.replace("Bearer ", ""));

    const url = new URL(request.url);
    const serverId = url.searchParams.get("serverId");
    if (!serverId) return new Response(JSON.stringify({ error: "Missing serverId" }), { status: 400 });

    const client = await clientPromise;
    const db = client.db("geopolitik");
    const nations = db.collection("nations");

    const list = await nations.find({ serverId: new ObjectId(serverId) }).toArray();
    return new Response(JSON.stringify(list), { status: 200 });
  } catch (e) {
    console.error("Nation list error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
