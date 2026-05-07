import express from "express";

import dotenv from "dotenv"
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());



app.use(cors({ origin: "http://localhost:4200" }))
const CONFIG = {
  API_KEY: process.env.PAYMOB_API_KEY,
  INTEGRATION_ID: process.env.PAYMOB_INTEGRATION_ID,
  IFRAME_ID: process.env.PAYMOB_IFRAME_ID,
  BASE_URL: "https://accept.paymob.com/api",
};

async function paymobPost(path, body) {
  const res = await fetch(`${CONFIG.BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Paymob ${path} failed: ${await res.text()}`);
  return res.json();
}

app.post("/payment/initiate", async (req, res) => {
  try {
    const { amountEGP, billing = {} } = req.body;
    const amountCents = Math.round(amountEGP * 100);

    const { token, profile } = await paymobPost("/auth/tokens", {
      api_key: CONFIG.API_KEY,
    });

    const order = await paymobPost("/ecommerce/orders", {
      auth_token: token,
      delivery_needed: false,
      merchant_id: profile.id,
      amount_cents: amountCents,
      currency: "EGP",
      items: [],
    });

    const { token: paymentKey } = await paymobPost("/acceptance/payment_keys", {
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
        apartment: "NA", floor: "NA", street: "NA",
        building: "NA", shipping_method: "NA",
        postal_code: "NA", city: "NA", country: "EG", state: "NA",
      },
    });

    res.json({
      checkoutUrl: `https://accept.paymob.com/api/acceptance/iframes/${CONFIG.IFRAME_ID}?payment_token=${paymentKey}`,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/payment/response", (req, res) => {
  const { success, order, id, amount_cents } = req.query;
    res.redirect(
    `http://localhost:4200/payment-result?success=${success}&orderId=${order}&transactionId=${id}&amount=${amount_cents / 100}`
  );
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
