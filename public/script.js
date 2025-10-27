// public/script.js
(async () => {
  // Solo ejecuta si estamos en checkout.html
  if (!window.location.pathname.includes("checkout")) return;

  const buyerName = sessionStorage.getItem("buyer_name");
  const buyerEmail = sessionStorage.getItem("buyer_email");

  // Si faltan datos del comprador, redirige al inicio
  if (!buyerName || !buyerEmail) {
    window.location.href = "/";
    return;
  }

  // Mostrar info del comprador arriba del formulario
  document.getElementById("buyerInfo").innerText = `${buyerName} — ${buyerEmail}`;

  // Crear PaymentIntent desde tu backend
  const resp = await fetch("/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: buyerName, email: buyerEmail }),
  });

  const json = await resp.json();
  if (json.error) {
    alert("Error creando PaymentIntent: " + json.error);
    throw new Error(json.error);
  }

  const clientSecret = json.clientSecret;

  // Tu clave pública de Stripe (usa la real en producción)
  const STRIPE_PUBLISHABLE_KEY =
    "pk_test_51SMhak1PQdQKgOrbqdvbWWvIU5KUYILK1jZmDPMbPUZ5m4Ba8OM1efjpcvsUSAI7uhmvvH9gxEWBTwLQgCVCqHCQ002q7dprsF";

  const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

  // 🎨 Estilos personalizados (opcional)
  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#8b5cf6", // morado
      colorBackground: "#ffffff",
      borderRadius: "8px",
    },
    rules: {
      ".Input": {
        padding: "10px",
      },
    },
  };

  // ⚙️ Configurar los elementos de pago SIN pedir correo/teléfono
  const elements = stripe.elements({
    clientSecret,
    appearance,
  });

  const paymentElement = elements.create("payment", {
    layout: {
      type: "accordion", // o "tabs"
      defaultCollapsed: false,
    },
    // 🚫 Ocultar campos innecesarios
    fields: {
      billingDetails: {
        name: "never",
        email: "never",
        phone: "never",
      },
    },
    // 🚫 Desactivar Stripe Link completamente
    wallets: {
      applePay: "auto",
      googlePay: "auto",
      link: "never",
    },
  });

  // Montar en el contenedor correcto: aquí CAMBIAMOS a #card-element para que coincida con checkout.html
  paymentElement.mount("#card-element");

  const payBtn = document.getElementById("payBtn");
  payBtn.addEventListener("click", async (e) => {
    e.preventDefault(); // prevenir submit de formulario

    payBtn.disabled = true;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/success.html",
      },
      payment_method_data: {
        billing_details: {
          name: buyerName,
        },
      },
    });

    if (error) {
      alert(error.message || "Error al procesar el pago");
      payBtn.disabled = false;
    }
  });
})();
