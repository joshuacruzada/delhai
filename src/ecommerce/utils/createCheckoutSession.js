export const createCheckoutSession = async (cartItems) => {
  try {
    const response = await fetch("/system/api/createPaymongoCheckout.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: cartItems }),
    });
    

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Unknown error");
    }

    return result.checkout_url;
  } catch (error) {
    console.error("Failed to create PayMongo session:", error);
    throw error;
  }
};
