require("dotenv").config();
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");

const app = express();
app.use(express.json());

const corsOptions = {
    origin: "https://harikrishna87.github.io/Foodi-Website/Main_Doc/index.html",
    methods: ["GET", "POST"],
};
app.use(cors(corsOptions));

app.post("/create-checkout-session", async (req, res) => {
    const { cartItems } = req.body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ error: "Invalid cart items" });
    }

    const isValidCartItem = (item) =>
        item.name && typeof item.name === "string" &&
        item.price && typeof item.price === "number" &&
        item.quantity && typeof item.quantity === "number";

    if (!cartItems.every(isValidCartItem)) {
        return res.status(400).json({ error: "Invalid cart item data" });
    }

    const lineItems = cartItems.map((item) => ({
        price_data: {
            currency: "inr",
            product_data: { name: item.name },
            unit_amount: item.price * 100,
        },
        quantity: item.quantity,
    }));

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/success`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
        });

        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
