document.addEventListener("DOMContentLoaded", () => {

  // ================= BASE URL =================
  const BASE_URL = window.location.origin;

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
    inputs.forEach(input => { if (!input.value) valid = false; });

    if (!valid) return alert("⚠️ Fill all fields");

    currentStep++;
    showStep(currentStep);
  };

  window.prevStep = function () {
    currentStep--;
    showStep(currentStep);
  };

  // ================= PRICE =================
  function calculatePrice() {
    const vehicle = parseInt(document.getElementById("vehicle")?.value || 0);
    const days = parseInt(document.getElementById("days")?.value || 0);

    const total = vehicle * days;

    if (document.getElementById("finalPrice")) {
      document.getElementById("finalPrice").innerText = "Final: ₹" + total;
    }

    return total;
  }

  window.calculatePrice = calculatePrice;

  // ================= OTP =================
  window.sendOTP = async function () {
    const email = document.getElementById("email").value;

    const res = await fetch(`${BASE_URL}/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (!res.ok) return alert(data.message || "OTP failed");
    alert("OTP sent ✅");
  };

  window.verifyOTP = async function () {
    const otp = document.getElementById("otp").value;

    const res = await fetch(`${BASE_URL}/verify-otp`, {
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
      alert(data.message);
    }
  };

  // ================= BOOKING =================
  window.bookNow = async function () {
  try {

    const amount = calculatePrice(); // 🔥 ALWAYS calculate first

    const bookingData = {
      firstName: document.getElementById("firstName")?.value || "",
      lastName: document.getElementById("lastName")?.value || "",
      phone: document.getElementById("phone")?.value || "",
      location: document.getElementById("destination")?.value || "",
      vehicle: document.getElementById("vehicle")?.value || "",
      days: document.getElementById("days")?.value || "",
      email: document.getElementById("email")?.value || "",
      paymentMode: document.getElementById("payment")?.value || "",
      amount: amount   // 🔥 IMPORTANT
    };

    const payment = bookingData.paymentMode;

    // ================= VALIDATION =================
    if (!bookingData.firstName || !bookingData.lastName || !bookingData.email || !bookingData.phone) {
      alert("Please fill all fields ❌");
      return;
    }

    // ================= CASH =================
    if (payment === "cash") {
      const res = await fetch(`${BASE_URL}/book`, {
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

    // ================= UPI =================
    if (payment === "upi") {

      const options = {
        key: "rzp_live_SbhI7uVjasgo07",
        amount: amount * 100,
        currency: "INR",
        name: "Travel Booking",

        handler: async function (response) {

          await fetch(`${BASE_URL}/book`, {
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

  } catch (err) {
    console.log(err);
    alert("Something went wrong ❌");
  }
};
});
document.addEventListener("DOMContentLoaded", function () {

  if (typeof Swiper !== "undefined") {

    new Swiper(".heroSwiper", {
      loop: true,
      autoplay: { delay: 3000, disableOnInteraction: false }
    });

    new Swiper(".aboutSwiper", {
      loop: true,
      autoplay: { delay: 3500, disableOnInteraction: false }
    });

    const reviewEl = document.querySelector(".reviewSwiper");

    if (reviewEl) {
      new Swiper(".reviewSwiper", {
        loop: true,
        spaceBetween: 20,
        autoplay: { delay: 2000, disableOnInteraction: false }
      });
    }
  }

});