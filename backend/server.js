const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const path = require("path");

const app = express();
app.use(cors({ origin: process.env.PUBLIC_URL || "http://localhost:4242" }));
app.use(express.json());

const staticDir = path.resolve(__dirname, "..");
console.log("Static dir:", staticDir);
app.use(express.static(staticDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

// ENV'lerden okunur
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const priceId = process.env.STRIPE_PRICE_ID;
const publicUrl = process.env.PUBLIC_URL; // ör: http://127.0.0.1:5500

if (!stripeSecretKey || !priceId || !publicUrl) {
  console.error("Missing env vars. Required: STRIPE_SECRET_KEY, STRIPE_PRICE_ID, PUBLIC_URL");
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${publicUrl}/success.html`,
      cancel_url: `${publicUrl}/payment.html?canceled=1`
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));