document.addEventListener("DOMContentLoaded", () => {

  // ================= MENU =================
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector("nav ul");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  // ================= STEP FORM =================
  let currentStep = 0;
  const steps = document.querySelectorAll(".step");

  function showStep(n) {
    steps.forEach((s, i) => s.classList.toggle("active", i === n));
  }

  window.nextStep = function () {
    let inputs = steps[currentStep].querySelectorAll("input, select");
    let valid = true;

    inputs.forEach(input => {
      if (!input.value) valid = false;
    });

    if (!valid) {
      alert("⚠️ Fill all fields");
      return;
    }

    calculatePrice(); // important

    currentStep++;
    showStep(currentStep);
  };

  window.prevStep = function () {
    currentStep--;
    showStep(currentStep);
  };

  // ================= PRICE (ONLY ONE FUNCTION) =================
  window.calculatePrice = function () {

    const vehicle = Number(document.getElementById("vehicle")?.value || 0);
    const days = Number(document.getElementById("days")?.value || 0);

    const total = vehicle * days;

    const priceBox = document.getElementById("finalPrice");

    if (priceBox) {
      priceBox.innerText = `Final Amount: ₹${total}`;
    }

    return total;
  };

  document.getElementById("vehicle")?.addEventListener("change", calculatePrice);
  document.getElementById("days")?.addEventListener("input", calculatePrice);

  // ================= OTP =================
  window.sendOTP = async function () {

    const email = document.getElementById("email")?.value;

    const res = await fetch("/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    alert(data.message || "OTP sent");
  };

  window.verifyOTP = async function () {

    const otp = document.getElementById("otp")?.value;

    const res = await fetch("/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ otp })
    });

    const data = await res.json();

    if (data.success) {
      alert("OTP Verified ✅");
      nextStep();
    } else {
      alert(data.message || "Wrong OTP ❌");
    }
  };

  // ================= BOOK NOW =================
  window.bookNow = async function () {

    const amount = calculatePrice();

    if (!amount || amount <= 0) {
      alert("Invalid amount ❌");
      return;
    }

    const bookingData = {
      firstName: document.getElementById("firstName")?.value || "",
      lastName: document.getElementById("lastName")?.value || "",
      phone: document.getElementById("phone")?.value || "",
      location: document.getElementById("destination")?.value || "",
      vehicle: document.getElementById("vehicle")?.value || "",
      days: document.getElementById("days")?.value || "",
      email: document.getElementById("email")?.value || "",
      paymentMode: document.getElementById("payment")?.value || "",
      amount: amount
    };

    if (!bookingData.firstName || !bookingData.lastName || !bookingData.email || !bookingData.phone) {
      alert("Please fill all required fields ❌");
      return;
    }

    // CASH
    if (bookingData.paymentMode === "cash") {
      const res = await fetch("/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });

      const data = await res.json();

      if (res.ok) {
        alert("Booking Confirmed ✅");
        location.reload();
      } else {
        alert(data.message || "Booking failed ❌");
      }
    }

    // UPI
    if (bookingData.paymentMode === "upi") {

      const options = {
        key: "rzp_live_SbhI7uVjasgo07",
        amount: amount * 100,
        currency: "INR",
        name: "Travel Booking",

        handler: async function (response) {

          await fetch("/book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...bookingData,
              paymentId: response.razorpay_payment_id
            })
          });

          alert("Payment Success 🎉");
          location.reload();
        }
      };

      new Razorpay(options).open();
    }
  };

});
if (typeof Swiper !== "undefined") { new Swiper(".heroSwiper", { loop: true, autoplay: { delay: 3000, disableOnInteraction: false } }); new Swiper(".aboutSwiper", { loop: true, autoplay: { delay: 3500, disableOnInteraction: false } }); new Swiper(".reviewSwiper", { loop: true, spaceBetween: 20, autoplay: { delay: 2000, disableOnInteraction: false } }); }