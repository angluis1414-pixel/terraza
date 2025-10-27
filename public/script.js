// public/script.js
(async () => {
  // Si estamos en checkout.html, inicializamos el flujo
  if (!window.location.pathname.includes("checkout")) return;

  const buyerName = sessionStorage.getItem("buyer_name");
  const buyerEmail = sessionStorage.getItem("buyer_email");
  if (!buyerName || !buyerEmail) {
    // si no hay datos, volver a inicio
    window.location.href = "/";
    return;
  }

  document.getElementById("buyerInfo").innerText = `${buyerName} — ${buyerEmail}`;

  // crear PaymentIntent en el servidor
  const resp = await fetch("/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: buyerName, email: buyerEmail })
  });
  const json = await resp.json();
  if (json.error) {
    alert("Error creando PaymentIntent: " + json.error);
    console.error(json.error);
    throw new Error(json.error);
  }

  const clientSecret = json.clientSecret;
  // Inicializar Stripe con la clave pública (pon tu pk_test en .env -> render o local)
  // Aquí ponemos la clave pública directamente desde una variable que inyectaremos en el HTML.
  // Para local, crearemos .env con la pk_test y el servidor puede enviarla; pero para simplicidad
  // vamos a tomarla desde sessionStorage si la pusiste manualmente en sessionStorage (instrucciones abajo).
  // MÁS SENCILLO: reemplaza en este archivo la cadena 'pk_test_...' por tu pk_test real (solo en local).
  const STRIPE_PUBLISHABLE_KEY = (function(){
    // intenta leerla desde window._STRIPE_PUB si quieres inyectarla desde server (no lo hacemos aquí)
    return "pk_test_51SMhak1PQdQKgOrbqdvbWWvIU5KUYILK1jZmDPMbPUZ5m4Ba8OM1efjpcvsUSAI7uhmvvH9gxEWBTwLQgCVCqHCQ002q7dprsF"; // <<--- reemplaza esto localmente con pk_test_...
  })();

  const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
  const elements = stripe.elements({ clientSecret });
  const paymentElement = elements.create("payment");
  paymentElement.mount("#payment-element");

  const payBtn = document.getElementById("payBtn");
  payBtn.addEventListener("click", async () => {
    payBtn.disabled = true;
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/success.html"
      }
    });
    if (error) {
      alert(error.message || "Error al procesar el pago");
      payBtn.disabled = false;
    }
  });
})();
