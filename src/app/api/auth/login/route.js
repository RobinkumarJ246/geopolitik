import clientPromise from "../../../../../lib/mongodb";
import bcrypt from "bcryptjs";
import { signToken } from "../../../../../lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Missing credentials" }), {
        status: 400,
      });
    }

    const client = await clientPromise;
    const db = client.db("geopolitik");
    const users = db.collection("users");

    const user = await users.findOne({ email });
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid email or password" }), {
        status: 401,
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return new Response(JSON.stringify({ error: "Invalid email or password" }), {
        status: 401,
      });
    }

    const token = signToken({ id: user._id, email: user.email, name: user.name });

    return new Response(JSON.stringify({ token, user: { id: user._id, email: user.email, name: user.name } }), {
      status: 200,
    });
  } catch (e) {
    console.error("Login error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
