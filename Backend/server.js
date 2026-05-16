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


app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith("http://localhost") || origin.includes("vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
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


async function syncDatabaseToGitHub(updatedDbObject) {
  if (process.env.NODE_ENV !== 'production') return;
  
  try {
    const url = `https://api.github.com/repos/${CONFIG.GH_OWNER}/${CONFIG.GH_REPO}/contents/Backend/db.json`;
    
    const getRes = await fetch(url, {
      headers: { "Authorization": `token ${CONFIG.GH_TOKEN}` }
    });
    
    if (!getRes.ok) {
      console.error(" GitHub SHA Fetch Failed:", getRes.statusText);
      return;
    }
    
    const getData = await getRes.json();
    const sha = getData.sha;

    const contentBase64 = Buffer.from(JSON.stringify(updatedDbObject, null, 2)).toString("base64");
    
    const putRes = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `token ${CONFIG.GH_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: " Live Production Database Sync: Record Added/Updated",
        content: contentBase64,
        sha: sha
      })
    });

    if (putRes.ok) {
      console.log("db.json successfully synced and committed to GitHub!");
    } else {
      console.error("GitHub Commit Failed:", putRes.statusText);
    }
  } catch (error) {
    console.error(" Failed to sync update to GitHub:", error.message);
  }
}


let dbPath = path.resolve(__dirname, "db.json");
if (!fs.existsSync(dbPath)) {
  dbPath = path.resolve(__dirname, "../db.json");
}

const rawData = fs.readFileSync(dbPath, "utf8");
let dbObject = JSON.parse(rawData);

if (process.env.NODE_ENV === 'production') {
  
  app.get("/users", (req, res) => {
    const { email } = req.query;
    if (email) return res.json(dbObject.users.filter(u => u.email === email));
    res.json(dbObject.users);
  });

  app.post("/users", async (req, res) => {
    const newUser = { id: Math.random().toString(36).substr(2, 9), ...req.body };
    dbObject.users.push(newUser);
    res.status(201).json(newUser);
    await syncDatabaseToGitHub(dbObject); 
  });

  app.patch("/users/:id", async (req, res) => {
    const user = dbObject.users.find(u => u.id === req.params.id);
    if (user) {
      Object.assign(user, req.body);
      res.json(user);
      await syncDatabaseToGitHub(dbObject); 
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.get("/products", (req, res) => res.json(dbObject.products));
  app.get("/products/:id", (req, res) => {
    const p = dbObject.products.find(prod => prod.id === req.params.id);
    p ? res.json(p) : res.status(404).json({ error: "Not Found" });
  });

  app.get("/cart", (req, res) => {
    const { email } = req.query;
    if (email) return res.json(dbObject.cart.filter(c => c.email === email));
    res.json(dbObject.cart);
  });

  app.post("/cart", async (req, res) => {
    const newCart = { id: Math.random().toString(36).substr(2, 9), ...req.body };
    dbObject.cart.push(newCart);
    res.status(201).json(newCart);
    await syncDatabaseToGitHub(dbObject);
  });

  app.put("/cart/:id", async (req, res) => {
    const index = dbObject.cart.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
      dbObject.cart[index] = { ...dbObject.cart[index], ...req.body };
      res.json(dbObject.cart[index]);
      await syncDatabaseToGitHub(dbObject);
    } else { 
      res.status(404).json({ error: "Not found" }); 
    }
  });

  app.delete("/cart/:id", async (req, res) => {
    dbObject.cart = dbObject.cart.filter(c => c.id !== req.params.id);
    res.status(204).end();
    await syncDatabaseToGitHub(dbObject);
  });

  app.get("/payments", (req, res) => {
    const { email } = req.query;
    if (email) return res.json(dbObject.payments.filter(p => p.email === email));
    res.json(dbObject.payments);
  });

  app.post("/payments", async (req, res) => {
    const newPay = { id: Math.random().toString(36).substr(2, 9), ...req.body };
    dbObject.payments.push(newPay);
    res.status(201).json(newPay);
    await syncDatabaseToGitHub(dbObject);
  });

} else {
  const router = jsonServer.router(dbPath);
  const middlewares = jsonServer.defaults();
  app.use(middlewares);
  app.use(router);
}


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

app.post("/payment/initiate", async (req, res) => {
  try {
    const { amountEGP, billing = {} } = req.body;
    if (!amountEGP) return res.status(400).json({ error: "amountEGP is required" });

    const amountCents = Math.round(amountEGP * 100);
    const authData = await paymobPost("/auth/tokens", { api_key: CONFIG.API_KEY });
    const token = authData.token;

    const order = await paymobPost("/ecommerce/orders", {
      auth_token: token, delivery_needed: false, amount_cents: amountCents, currency: "EGP", items: [],
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
  app.listen(PORT, () => {
    console.log(`Unified API running locally on port ${PORT}`);
  });
}

export default app;