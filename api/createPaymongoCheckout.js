import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { items } = req.body;

    const lineItems = items.map((item) => ({
      name: item.name,
      amount: item.amount,
      currency: item.currency || "PHP",
      quantity: item.quantity,
    }));

    // 🔍 Add logging here for debugging
    console.log("📦 Incoming Items:", items);
    console.log("🧾 Line Items:", lineItems);
    console.log("✅ SUCCESS_URL:", process.env.SUCCESS_URL);
    console.log("✅ CANCEL_URL:", process.env.CANCEL_URL);
    console.log("🔑 PAYMONGO_SECRET_KEY exists:", !!process.env.PAYMONGO_SECRET_KEY);
    

    const response = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            payment_method_types: ["gcash", "paymaya"],
            line_items: lineItems,
            success_url: process.env.SUCCESS_URL,
            cancel_url: process.env.CANCEL_URL,
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({ checkout_url: response.data.data.attributes.checkout_url });
  } catch (error) {
    console.error(" PayMongo Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
}
