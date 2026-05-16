import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import jsonServer from "json-server";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config(); 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());


const allowedOrigins = [
  "http://localhost:4200", 
  "https://luxebelle.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));

const CONFIG = {
  API_KEY: process.env.PAYMOB_API_KEY,
  INTEGRATION_ID: process.env.PAYMOB_INTEGRATION_ID,
  IFRAME_ID: process.env.PAYMOB_IFRAME_ID,
  BASE_URL: "https://accept.paymob.com/api",
  GH_TOKEN: process.env.GH_TOKEN,
  GH_REPO: process.env.GH_REPO,
  GH_OWNER: process.env.GH_OWNER
};

async function paymobPost(pathStr, body) {
  const res = await fetch(`${CONFIG.BASE_URL}${pathStr}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Paymob ${pathStr} failed: ${JSON.stringify(data)}`);
  return data;
}


async function syncDatabaseToGitHub(updatedDbObject) {
  if (process.env.NODE_ENV !== 'production') return; 
  
  try {
    const url = `https://api.github.com/repos/${CONFIG.GH_OWNER}/${CONFIG.GH_REPO}/contents/Backend/db.json`;
    
    const getRes = await fetch(url, {
      headers: { "Authorization": `token ${CONFIG.GH_TOKEN}` }
    });
    const getData = await getRes.json();
    const sha = getData.sha;

    const contentBase64 = Buffer.from(JSON.stringify(updatedDbObject, null, 2)).toString("base64");
    
    await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `token ${CONFIG.GH_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "database live update: synchronization commit",
        content: contentBase64,
        sha: sha
      })
    });
    console.log("Database file successfully synchronized to GitHub repository.");
  } catch (error) {
    console.error("Failed to synchronize database update to GitHub:", error.message);
  }
}


let dbPath = path.resolve(__dirname, "db.json");
if (!fs.existsSync(dbPath)) {
  dbPath = path.resolve(__dirname, "../db.json");
}

const rawData = fs.readFileSync(dbPath, "utf8");
const dbObject = JSON.parse(rawData);

const router = jsonServer.router(dbObject); 
const middlewares = jsonServer.defaults();

app.use(middlewares);

app.use(async (req, res, next) => {
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH" || req.method === "DELETE") {
    const key = req.path.split("/")[1]; 
    
    if (dbObject[key]) {
      let responseData;

      if (req.method === "POST") {
        responseData = { id: Math.random().toString(36).substr(2, 9), ...req.body };
        dbObject[key].push(responseData);
        res.status(201).json(responseData);
      }
      
      else if (req.method === "PUT" || req.method === "PATCH") {
        const itemId = req.path.split("/")[2];
        const item = dbObject[key].find(i => i.id === itemId);
        if (item) {
          Object.assign(item, req.body);
          responseData = item;
          res.json(item);
        } else {
          return res.status(404).json({ error: "Item not found" });
        }
      }

      else if (req.method === "DELETE") {
        const itemId = req.path.split("/")[2];
        dbObject[key] = dbObject[key].filter(i => i.id !== itemId);
        res.status(204).end();
      }

      await syncDatabaseToGitHub(dbObject);
      return; 
    }
  }
  next();
});

app.use(router);


app.post("/payment/initiate", async (req, res) => {
  try {
    const { amountEGP, billing = {} } = req.body;
    if (!amountEGP) return res.status(400).json({ error: "amountEGP is required" });
    const amountCents = Math.round(amountEGP * 100);

    const authData = await paymobPost("/auth/tokens", { api_key: CONFIG.API_KEY });
    const token = authData.token;

    const order = await paymobPost("/ecommerce/orders", {
      auth_token: token, delivery_needed: false, amount_cents: amountCents, currency: "EGP", items: []
    });

    const paymentKeyResponse = await paymobPost("/acceptance/payment_keys", {
      auth_token: token, amount_cents: amountCents, expiration: 3600, order_id: order.id, currency: "EGP",
      integration_id: Number(CONFIG.INTEGRATION_ID),
      billing_data: {
        first_name: billing.firstName || "NA", last_name: billing.lastName || "NA",
        email: billing.email || "NA", phone_number: billing.phone || "NA",
        apartment: "NA", floor: "NA", street: "NA", building: "NA", shipping_method: "NA", postal_code: "NA", city: "NA", country: "EG", state: "NA",
      },
    });

    res.json({ checkoutUrl: `https://accept.paymob.com/api/acceptance/iframes/${CONFIG.IFRAME_ID}?payment_token=${paymentKeyResponse.token}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/payment/response", (req, res) => {
  const { success, order, id, amount_cents } = req.query;
  const frontendUrl = process.env.NODE_ENV === 'production' ? 'https://luxebelle.vercel.app' : 'http://localhost:4200';
  res.redirect(`${frontendUrl}/payment-result?success=${success}&orderId=${order}&transactionId=${id}&amount=${Number(amount_cents) / 100}`);
});

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
}

export default app;