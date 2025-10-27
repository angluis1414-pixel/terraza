// public/script.js
(async () => {
  // Solo ejecutar en checkout.html
  if (!window.location.pathname.includes("checkout")) return;

  const buyerName = sessionStorage.getItem("buyer_name");
  const buyerEmail = sessionStorage.getItem("buyer_email");

  if (!buyerName || !buyerEmail) {
    window.location.href = "/";
    return;
  }

  document.getElementById("buyerInfo").innerText = `${buyerName} — ${buyerEmail}`;

  // Crear PaymentIntent
  const resp = await fetch("/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: buyerName, email: buyerEmail })
  });

  const json = await resp.json();
  if (json.error) {
    alert("Error creando PaymentIntent: " + json.error);
    throw new Error(json.error);
  }

  const clientSecret = json.clientSecret;

  // Clave pública (usa tu pk_test o pk_live)
  const STRIPE_PUBLISHABLE_KEY =
    "pk_test_51SMhak1PQdQKgOrbqdvbWWvIU5KUYILK1jZmDPMbPUZ5m4Ba8OM1efjpcvsUSAI7uhmvvH9gxEWBTwLQgCVCqHCQ002q7dprsF";

  const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

  // Apariencia personalizada (sin campos extra)
  const appearance = {
    theme: "flat",
    variables: { colorPrimary: "#00b386", borderRadius: "8px" },
  };

  const elements = stripe.elements({ clientSecret, appearance });

  // ✅ Aquí quitamos los campos extra (correo, teléfono, nombre)
  const paymentElement = elements.create("payment", {
    layout: "tabs",
  });

  paymentElement.mount("#payment-element");

  // Confirmar pago
  const payBtn = document.getElementById("payBtn");
  payBtn.addEventListener("click", async () => {
    payBtn.disabled = true;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/success.html",
      },
    });

    if (error) {
      alert(error.message || "Error al procesar el pago");
      payBtn.disabled = false;
    }
  });
})();
