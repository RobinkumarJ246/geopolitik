import clientPromise from "../../../../lib/mongodb";
import { verifyToken } from "../../../../lib/auth";
import { ObjectId } from "mongodb";

// POST /api/chat - Send a new chat message or emoji
// Body: { serverId: string, content: string, type: 'message' | 'emoji' }
export async function POST(request) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    
    const decoded = verifyToken(auth.replace("Bearer ", ""));
    const body = await request.json();
    const { serverId, content, type = 'message' } = body;
    
    if (!serverId || !content) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("geopolitik");

    // Verify server exists
    const server = await db.collection("servers").findOne({ _id: new ObjectId(serverId) });
    if (!server) {
      return new Response(JSON.stringify({ error: "Server not found" }), { status: 404 });
    }

    // Create new message
    const message = {
      serverId: new ObjectId(serverId),
      userId: decoded.id,
      username: decoded.username, // Store username to avoid extra lookups
      content,
      type,
      timestamp: new Date()
    };

    // Store message in database
    await db.collection("chat_messages").insertOne(message);

    return new Response(JSON.stringify({ success: true, message }), { status: 201 });
  } catch (e) {
    console.error("Chat send error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

// GET /api/chat?serverId=...&lastMessageTime=... - Get chat messages
export async function GET(request) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    
    const decoded = verifyToken(auth.replace("Bearer ", ""));
    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get("serverId");
    const lastMessageTime = searchParams.get("lastMessageTime");
    
    if (!serverId) {
      return new Response(JSON.stringify({ error: "Missing serverId" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("geopolitik");

    // Build query
    const query = { serverId: new ObjectId(serverId) };
    if (lastMessageTime) {
      query.timestamp = { $gt: new Date(lastMessageTime) };
    }

    // Get messages
    const messages = await db
      .collection("chat_messages")
      .find(query)
      .sort({ timestamp: 1 })
      .limit(50) // Limit to 50 most recent messages
      .toArray();

    return new Response(JSON.stringify({ messages }), { status: 200 });
  } catch (e) {
    console.error("Chat fetch error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
