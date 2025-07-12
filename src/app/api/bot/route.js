import clientPromise from "../../../../lib/mongodb";
import { verifyToken } from "../../../../lib/auth";
import { ObjectId } from "mongodb";
import { randomUUID } from "crypto";

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

    if (server.hostUserId !== decoded.id) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });

    const nations = db.collection("nations");
    const botName = `Bot-${randomUUID().slice(0, 4)}`;
    const flagColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6,'0')}`;
    const botData = {
      population: 4000000 + Math.floor(Math.random()*2000000),
      treasury: 800000 + Math.floor(Math.random()*400000),
      food: 150000,
      oil: 40000,
      gdp: 40000000,
      military: {
        soldiers: 8000,
        tanks: 40,
        aircraft: 15,
      },
    };
    const result = await nations.insertOne({
      serverId: new ObjectId(serverId),
      ownerId: "BOT",
      ownerName: "AI",
      name: botName,
      governmentType: "ai",
      flagColor,
      data: botData,
      createdAt: new Date(),
    });
    return new Response(JSON.stringify({ id: result.insertedId }), { status: 201 });
  } catch (e) {
    console.error("Add bot error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
