// server.js
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 🔹 Cargar variables de entorno desde .env
dotenv.config();

// 🔹 Verificar que la clave secreta se cargó
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ No se encontró STRIPE_SECRET_KEY en .env");
  process.exit(1); // detener el servidor si no hay clave
}
console.log("Stripe Key cargada: ✅");

// 🔹 Inicializar Express y Stripe
const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 3000;

// 🔹 Configuración de rutas y archivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// 🔹 Endpoint para crear PaymentIntent
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { name, email } = req.body || {};

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 40000, // $400 MXN en centavos
      currency: "mxn",
      receipt_email: email || undefined,
      description: `Boleto - ${name || "Cliente"}`,
      automatic_payment_methods: { enabled: true },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).send({ error: err.message });
  }
});

// 🔹 Iniciar servidor
app.listen(PORT, () =>
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`)
);
