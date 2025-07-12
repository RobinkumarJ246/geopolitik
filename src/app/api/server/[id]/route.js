import clientPromise from "../../../../../lib/mongodb";
import { verifyToken } from "../../../../../lib/auth";
import { ObjectId } from "mongodb";

export async function GET(request, context) {
  const { params } = context;
  try {
    const auth = request.headers.get("authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    verifyToken(auth.replace("Bearer ", ""));

    const { id } = params;
    const client = await clientPromise;
    const db = client.db("geopolitik");
    const servers = db.collection("servers");
    const server = await servers.findOne({ _id: new ObjectId(id) });
    if (!server) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    return new Response(JSON.stringify(server), { status: 200 });
  } catch (e) {
    console.error("Server detail error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
