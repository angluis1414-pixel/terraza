// public/script.js
document.addEventListener("DOMContentLoaded", async () => {
  // Solo ejecuta si estamos en checkout.html
  if (!window.location.pathname.includes("checkout")) return;

  const buyerName = sessionStorage.getItem("buyer_name");
  const buyerEmail = sessionStorage.getItem("buyer_email");

  // Redirige al inicio si faltan datos
  if (!buyerName || !buyerEmail) {
    window.location.href = "/";
    return;
  }

  // Mostrar info del comprador
  document.getElementById("buyerInfo").innerText = `${buyerName} — ${buyerEmail}`;

  // Crear PaymentIntent en el backend
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

  // Clave pública de Stripe
  const stripe = Stripe("pk_test_51SMhak1PQdQKgOrbqdvbWWvIU5KUYILK1jZmDPMbPUZ5m4Ba8OM1efjpcvsUSAI7uhmvvH9gxEWBTwLQgCVCqHCQ002q7dprsF");

  // Configuración de apariencia (opcional)
  const appearance = {
    theme: "stripe",
    variables: { colorPrimary: "#8b5cf6", colorBackground: "#fff", borderRadius: "8px" },
    rules: { ".Input": { padding: "10px" } },
  };

  const elements = stripe.elements({ clientSecret, appearance });

  const paymentElement = elements.create("payment", {
    layout: { type: "accordion", defaultCollapsed: false },
    fields: { billingDetails: { name: "never", email: "never", phone: "never" } },
    wallets: { applePay: "auto", googlePay: "auto", link: "never" },
  });

  paymentElement.mount("#card-element");

  // Botón de pago
  const payBtn = document.getElementById("payBtn");
  payBtn.addEventListener("click", async (e) => {
    e.preventDefault(); // evita que recargue

    payBtn.disabled = true;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/success.html",
        payment_method_data: { billing_details: { name: buyerName } }, // ⚡ necesario
      },
    });

    if (error) {
      alert(error.message || "Error al procesar el pago");
      payBtn.disabled = false;
    }
  });
});
