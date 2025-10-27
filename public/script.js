// Coloca tu Publishable Key de Stripe aquí
const stripe = Stripe("TU_PUBLISHABLE_KEY");

const elements = stripe.elements();
const paymentElement = elements.create("payment");
paymentElement.mount("#card-element");

const form = document.getElementById("payment-form");
const errorMessage = document.getElementById("error-message");

// Mostrar datos del comprador en checkout
window.addEventListener("DOMContentLoaded", () => {
  const buyerInfo = document.getElementById("buyerInfo");
  const name = sessionStorage.getItem("buyer_name") || "";
  const email = sessionStorage.getItem("buyer_email") || "";
  const phone = sessionStorage.getItem("buyer_phone") || "";

  buyerInfo.textContent = `Nombre: ${name} | Correo: ${email} | Teléfono: ${phone}`;
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const buyerName = sessionStorage.getItem("buyer_name") || "";
  const buyerEmail = sessionStorage.getItem("buyer_email") || "";
  const buyerPhone = sessionStorage.getItem("buyer_phone") || "";

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
    errorMessage.textContent = error.message;
  }
});
