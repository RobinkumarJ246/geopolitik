import clientPromise from "../../../../../lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
      });
    }

    const client = await clientPromise;
    const db = client.db("geopolitik");
    const users = db.collection("users");

    const existing = await users.findOne({ email });
    if (existing) {
      return new Response(JSON.stringify({ error: "Email already in use" }), {
        status: 409,
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    await users.insertOne({
      email,
      password: hashed,
      name,
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (e) {
    console.error("Register error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
