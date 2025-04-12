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
      quantity: item.quantity,
      currency: item.currency || "PHP",
    }));

    const response = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            payment_method_types: ["gcash", "paymaya"],
            line_items: lineItems,
            success_url: "https://your-vercel-site.vercel.app/payment-success",
            cancel_url: "https://your-vercel-site.vercel.app/payment-cancel",
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

    const checkoutUrl = response.data.data.attributes.checkout_url;
    res.status(200).json({ checkout_url: checkoutUrl });
  } catch (error) {
    console.error("PayMongo API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
}
