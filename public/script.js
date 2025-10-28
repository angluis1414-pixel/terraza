// public/script.js
document.addEventListener("DOMContentLoaded", async () => {
  if (!window.location.pathname.includes("checkout")) return;

  const buyerName = sessionStorage.getItem("buyer_name");
  const buyerEmail = sessionStorage.getItem("buyer_email");
  const buyerPhone = sessionStorage.getItem("buyer_phone");

  if (!buyerName || !buyerEmail || !buyerPhone) {
    alert("Faltan datos del comprador. Regresando al inicio...");
    window.location.href = "/";
    return;
  }

  document.getElementById("buyerInfo").textContent =
    `${buyerName} — ${buyerEmail} — ${buyerPhone}`;

  // 🧾 Crear PaymentIntent en el backend
  const resp = await fetch("/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: buyerName, email: buyerEmail, phone: buyerPhone }),
  });

  const data = await resp.json();
  console.log("🔑 Backend responde:", data);

  if (!data.clientSecret) {
    alert("Error al crear el intento de pago: " + (data.error || "Sin clientSecret"));
    return;
  }

  const stripe = Stripe("TU_PUBLISHABLE_KEY"); // ⚠️ Usa tu clave pública real
  const elements = stripe.elements({ clientSecret: data.clientSecret });

  const paymentElement = elements.create("payment", {
    layout: "tabs",
  });

  paymentElement.mount("#card-element");

  const form = document.getElementById("payment-form");
  const errorMessage = document.getElementById("error-message");
  const payBtn = document.getElementById("payBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    payBtn.disabled = true;
    errorMessage.textContent = "";

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/success.html",
        payment_method_data: {
          billing_details: {
            name: buyerName,
            email: buyerEmail,
            phone: buyerPhone,
          },
        },
      },
    });

    if (error) {
      errorMessage.textContent = error.message || "Error al procesar el pago.";
      payBtn.disabled = false;
    }
  });
});
