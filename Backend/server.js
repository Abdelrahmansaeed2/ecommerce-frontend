import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config({ path: '/Users/abdelrahmansaeed/angularr/ecommerce-frontend/.env' });

const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:4200" }));

const CONFIG = {
  API_KEY: process.env.PAYMOB_API_KEY,
  INTEGRATION_ID: process.env.PAYMOB_INTEGRATION_ID,
  IFRAME_ID: process.env.PAYMOB_IFRAME_ID,
  BASE_URL: "https://accept.paymob.com/api",
};

if (!CONFIG.API_KEY) {
  console.error(" ERROR: PAYMOB_API_KEY still not found! Check the path and key name in your .env file.");
} else {
  console.log(" Environment variables loaded successfully from frontend directory.");
}


async function paymobPost(path, body) {
  const res = await fetch(`${CONFIG.BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Paymob ${path} failed: ${JSON.stringify(data)}`);
  }
  return data;
}


app.post("/payment/initiate", async (req, res) => {
  try {
    const { amountEGP, billing = {} } = req.body;
    
    if (!amountEGP) {
      return res.status(400).json({ error: "amountEGP is required" });
    }

    const amountCents = Math.round(amountEGP * 100);

    const authData = await paymobPost("/auth/tokens", {
      api_key: CONFIG.API_KEY,
    });
    const token = authData.token;

    const order = await paymobPost("/ecommerce/orders", {
      auth_token: token,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: "EGP",
      items: [],
    });

    const paymentKeyResponse = await paymobPost("/acceptance/payment_keys", {
      auth_token: token,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: order.id,
      currency: "EGP",
      integration_id: Number(CONFIG.INTEGRATION_ID),
      billing_data: {
        first_name: billing.firstName || "NA",
        last_name: billing.lastName || "NA",
        email: billing.email || "NA",
        phone_number: billing.phone || "NA",
        apartment: "NA", 
        floor: "NA", 
        street: "NA",
        building: "NA", 
        shipping_method: "NA",
        postal_code: "NA", 
        city: "NA", 
        country: "EG", 
        state: "NA",
      },
    });

    res.json({
      checkoutUrl: `https://accept.paymob.com/api/acceptance/iframes/${CONFIG.IFRAME_ID}?payment_token=${paymentKeyResponse.token}`,
    });

  } catch (err) {
    console.error("Payment Initiation Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


app.get("/payment/response", (req, res) => {
  const { success, order, id, amount_cents } = req.query;
  
  res.redirect(
    `http://localhost:4200/payment-result?success=${success}&orderId=${order}&transactionId=${id}&amount=${Number(amount_cents) / 100}`
  );
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});