// server.js
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 3000;

// Configurar carpeta pública
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// 🧾 Crear PaymentIntent y devolver clientSecret
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { name, email, phone } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: "Falta el correo (email)." });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 40000, // 💰 $400.00 MXN (en centavos)
      currency: "mxn",
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      metadata: { buyer_name: name || "Sin nombre", buyer_phone: phone || "No proporcionado" },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("❌ Error creando PaymentIntent:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🩺 Ruta de prueba
app.get("/health", (req, res) => res.json({ ok: true }));

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
});
