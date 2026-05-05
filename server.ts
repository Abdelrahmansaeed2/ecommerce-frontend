import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = "YOUR_API_KEY";
const INTEGRATION_ID = 123456; // card integration id

async function getAuthToken() {
  const res = await axios.post(
    "https://accept.paymob.com/api/auth/tokens",
    {
      api_key: API_KEY,
    }
  );
  return res.data.token;
}

async function createOrder(token: string) {
  const res = await axios.post(
    "https://accept.paymob.com/api/ecommerce/orders",
    {
      auth_token: token,
      delivery_needed: "false",
      amount_cents: "10000", 
      currency: "EGP",
      items: [],
    }
  );
  return res.data.id;
}

async function getPaymentKey(token: string, orderId: number) {
  const res = await axios.post(
    "https://accept.paymob.com/api/acceptance/payment_keys",
    {
      auth_token: token,
      amount_cents: "10000",
      expiration: 3600,
      order_id: orderId,
      billing_data: {
        first_name: "Test",
        last_name: "User",
        email: "test@test.com",
        phone_number: "01000000000",
        apartment: "NA",
        floor: "NA",
        street: "NA",
        building: "NA",
        shipping_method: "NA",
        postal_code: "NA",
        city: "Cairo",
        country: "EG",
        state: "NA",
      },
      currency: "EGP",
      integration_id: INTEGRATION_ID,
    }
  );

  return res.data.token;
}

app.post("/pay", async (req, res) => {
  try {
    const authToken = await getAuthToken();
    const orderId = await createOrder(authToken);
    const paymentKey = await getPaymentKey(authToken, orderId);

    res.json({ paymentKey });
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Payment failed" });
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
