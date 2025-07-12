import clientPromise from "../../../../lib/mongodb";
import { verifyToken } from "../../../../lib/auth";

export async function PUT(request) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    const token = auth.replace("Bearer ", "");
    const decoded = verifyToken(token);

    const body = await request.json();
    const { name, avatar } = body;

    const client = await clientPromise;
    const db = client.db("geopolitik");
    const users = db.collection("users");

    await users.updateOne({ _id: decoded.id }, { $set: { name, avatar } });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    console.error("Profile update error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
