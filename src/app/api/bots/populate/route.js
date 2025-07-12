import clientPromise from "../../../../../lib/mongodb";
import { verifyToken } from "../../../../../lib/auth";
import { ObjectId } from "mongodb";
import { randomUUID } from "crypto";

const countryNames = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia","Botswana","Brazil","Brunei","Bulgaria","Burkina","Burundi","Cambodia","Cameroon","Canada","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czechia","Denmark","Dominica","Dominican","Ecuador","Egypt","El Salvador","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Korea","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Macedonia","Norway","Oman","Pakistan","Palau","Panama","Papua","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts","Saint Lucia","Samoa","San Marino","Sao Tome","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon","Somalia","South Africa","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Tonga","Trinidad","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe","Albia","Beleria","Caledor","Dornia","Eldoria","Falkland","Galicia","Hibernia","Istria","Junonia","Karelia","Lothian","Moravia","Norland","Ossyria","Pannonia","Qandahar","Rhenland","Syldavia","Thessia","Umbria","Valoria","Westoria","Xandria","Yorvik","Zephyria"
];

const tiers = [
  { name: "weak", weight: 0.5, pop: [1, 5], gdp: [1, 10] },
  { name: "mid", weight: 0.3, pop: [5, 25], gdp: [10, 50] },
  { name: "strong", weight: 0.15, pop: [25, 80], gdp: [50, 200] },
  { name: "super", weight: 0.05, pop: [80, 200], gdp: [200, 1000] },
];

function pickTier() {
  const r = Math.random();
  let acc = 0;
  for (const t of tiers) {
    acc += t.weight;
    if (r <= acc) return t;
  }
  return tiers[0];
}

function randRange([min, max]) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function POST(request) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    const decoded = verifyToken(auth.replace("Bearer ", ""));

    const body = await request.json();
    const { serverId, count } = body;
    if (!serverId || !count) return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    const cnt = Math.max(50, Math.min(200, parseInt(count)));

    const client = await clientPromise;
    const db = client.db("geopolitik");

    const servers = db.collection("servers");
    const server = await servers.findOne({ _id: new ObjectId(serverId) });
    if (!server) return new Response(JSON.stringify({ error: "Server not found" }), { status: 404 });
    if (server.hostUserId !== decoded.id)
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });

    const nations = db.collection("nations");
    const currentCount = await nations.countDocuments({ serverId: new ObjectId(serverId) });
    const toCreate = cnt - currentCount;
    if (toCreate <= 0) {
      return new Response(JSON.stringify({ message: "Already populated" }), { status: 200 });
    }

    const docs = [];
    // track used names
    const used = new Set(await nations.distinct("name", { serverId: new ObjectId(serverId) }));

    for (let i = 0; i < toCreate; i++) {
      const tier = pickTier();
      let name;
      if (countryNames.length) {
        // pick a unique country name
        const available = countryNames.filter((n) => !used.has(n));
        if (available.length) {
          name = available[Math.floor(Math.random() * available.length)];
        }
      }
      if (!name) {
        name = `Nation-${randomUUID().slice(0, 6)}`;
        while (used.has(name)) name = `Nation-${randomUUID().slice(0, 6)}`;
      }
      used.add(name);
      const flagColor = `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`;
      const pop = randRange(tier.pop) * 1_000_000;
      const gdp = randRange(tier.gdp) * 1_000_000;
      const treasury = Math.floor(gdp * 0.1);
      const food = Math.floor(pop * 10);
      const oil = Math.floor(gdp / 1000);
      const govTypes = ["democracy","monarchy","dictatorship","republic","theocracy","communist","sultanate"];
function randomGov(){return govTypes[Math.floor(Math.random()*govTypes.length)];}

      const strengthMult = { weak: 0.5, mid: 1, strong: 1.5, super: 2 }[tier.name];
      const soldiers = Math.floor(pop * 0.002 * strengthMult);
      const tanks = Math.floor(soldiers / 500 * strengthMult);
      const aircraft = Math.floor(soldiers / 2000 * strengthMult);

      docs.push({
        serverId: new ObjectId(serverId),
        ownerId: "BOT",
        ownerName: "AI",
        name,
        governmentType: randomGov(),
        flagColor,
        tier: tier.name,
        data: {
          population: pop,
          treasury,
          food,
          oil,
          gdp,
          military: { soldiers, tanks, aircraft },
        },
        createdAt: new Date(),
      });
    }

    if (docs.length) await nations.insertMany(docs);

    return new Response(JSON.stringify({ added: docs.length }), { status: 201 });
  } catch (e) {
    console.error("Populate bots error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
