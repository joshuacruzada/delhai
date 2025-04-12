const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors({ origin: true })); // ✅ allow all origins or lock to http://localhost:3000

app.post("/createPaymongoCheckout", async (req, res) => {
  const { items } = req.body;

  console.log("🛒 Incoming cart items:", items);

  if (!items || !Array.isArray(items) || items.length === 0) {
    console.error("❌ Invalid or empty cart items!");
    return res.status(400).json({ error: "Cart items are invalid or empty." });
  }

  const lineItems = items.map((item) => ({
    name: item.name,
    amount: item.amount, // already in cents
    quantity: item.quantity,
    currency: item.currency,
  }));

  try {
    const response = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            payment_method_types: ["gcash", "paymaya"],
            line_items: lineItems,
            success_url: "http://localhost:3000/payment-success",
            cancel_url: "http://localhost:3000/payment-cancel",
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from("sk_test_smYoupVbvkiFFGPDYezyYaKc").toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({
      checkout_url: response.data.data.attributes.checkout_url,
    });
  } catch (error) {
    console.error("❌ PayMongo error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// export the express app as a Firebase function
exports.api = functions.https.onRequest(app);
