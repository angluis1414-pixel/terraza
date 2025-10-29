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

  // Crear PaymentIntent en tu backend
  const resp = await fetch("/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: buyerName, email: buyerEmail }),
  });

  const data = await resp.json();

  if (!data.clientSecret) {
    alert("Error al crear el PaymentIntent.");
    console.error("❌ Backend respondió:", data);
    return;
  }

  const clientSecret = data.clientSecret;

  // Stripe public key (usa la tuya)
  const stripe = Stripe("pk_live_51SA8N30We2bNrLYcGOUUDOl2eVwh0kq7ALxzrqOianBGggKRidNDujPQ0RZROgIL92htk3q97yOJuWFT3HEflE9A00eNTNWPf6");

  // Apariencia personalizada
  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#8b5cf6",
      colorBackground: "#ffffff",
      borderRadius: "8px"
    }
  };

  // ⚙️ Crear el elemento de pago sin pedir datos extra
  const elements = stripe.elements({ clientSecret, appearance });
  const paymentElement = elements.create("payment", {
    layout: "tabs",
    fields: {
      billingDetails: {
        name: "never",
        email: "never",
        phone: "never"
      }
    },
    wallets: {
      applePay: "never",
      googlePay: "never",
      link: "never"
    }
  });

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
