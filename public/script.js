document.addEventListener("DOMContentLoaded", async () => {
  if (!window.location.pathname.includes("checkout")) return;

  const buyerName = sessionStorage.getItem("buyer_name");
  const buyerEmail = sessionStorage.getItem("buyer_email");
  const buyerPhone = sessionStorage.getItem("buyer_phone");

  if (!buyerName || !buyerEmail || !buyerPhone) {
    window.location.href = "/";
    return;
  }

  document.getElementById("buyerInfo").innerText =
    `${buyerName} — ${buyerEmail} — ${buyerPhone}`;

  console.log("🔹 Creando PaymentIntent...");

  const resp = await fetch("/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: buyerName, email: buyerEmail }),
  });

  const data = await resp.json();

  if (!data.clientSecret) {
    alert("Error al crear el PaymentIntent.");
    console.error("Backend respondió:", data);
    return;
  }

  const clientSecret = data.clientSecret;

  // Clave pública real de Stripe
  const stripe = Stripe("pk_test_51SMhak1PQdQKgOrbqdvbWWvIU5KUYILK1jZmDPMbPUZ5m4Ba8OM1efjpcvsUSAI7uhmvvH9gxEWBTwLQgCVCqHCQ002q7dprsF");

  const appearance = {
    theme: "stripe",
    variables: { colorPrimary: "#8b5cf6", colorBackground: "#fff", borderRadius: "8px" }
  };

  const elements = stripe.elements({ clientSecret, appearance });
  const paymentElement = elements.create("payment");
  paymentElement.mount("#card-element");

  const form = document.getElementById("payment-form");
  const payBtn = document.getElementById("payBtn");
  const errorMsg = document.getElementById("error-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    payBtn.disabled = true;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/success.html",
        payment_method_data: {
          billing_details: {
            name: buyerName,
            email: buyerEmail,
            phone: buyerPhone
          }
        }
      }
    });

    if (error) {
      errorMsg.textContent = error.message;
      payBtn.disabled = false;
    }
  });
});
