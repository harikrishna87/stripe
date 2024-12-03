const express = require("express");
const stripe = require("stripe")("sk_test_51QS0U3SGl1phSp270WaCWhEyA3bzxtpSCPq9krMZKz7prxIjqfeicuLFdboQjWl3wMh7UOeuJtO9tJUG3X9wBPkm00ZnuJM2mV"); // Replace with your secret key
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.post("/create-checkout-session", async (req, res) => {
    const { cartItems } = req.body;

    const lineItems = cartItems.map((item) => ({
        price_data: {
            currency: "inr",
            product_data: { name: item.name },
            unit_amount: item.price * 100, // Convert price to smallest unit
        },
        quantity: item.quantity,
    }));

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: "https://your-website.com/success",
            cancel_url: "https://your-website.com/cancel",
        });

        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
