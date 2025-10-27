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

// 🧾 Endpoint: crear PaymentIntent y devolver clientSecret
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { name, email } = req.body || {};

    // Validaciones básicas
    if (!email) {
      return res.status(400).send({ error: "Falta el correo (email)." });
    }

    // ⚙️ Creamos el PaymentIntent sin Stripe Link ni métodos automáticos
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 40000, // 💰 $400.00 MXN (en centavos)
      currency: "mxn",
      payment_method_types: ["card"], // 💳 Solo tarjetas
      receipt_email: email, // Opcional: para recibo
      metadata: { buyer_name: name || "Sin nombre" },
    });

    // Devolvemos el clientSecret al frontend
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("❌ Error creando PaymentIntent:", error);
    res.status(500).send({ error: error.message });
  }
});

// 🩺 Ruta simple para chequear el estado del servidor
app.get("/health", (req, res) => res.send({ ok: true }));

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
});
