document.addEventListener("DOMContentLoaded", () => {

  // =======================
  // BASE URL (SAFE FIX)
  // =======================
  const BASE_URL = window.location.origin;

  // =======================
  // MOBILE MENU (Wahi Purana Logic)
  // =======================
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector("nav ul");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  // =======================
  // STEP FORM (Wahi Purana Logic)
  // =======================
  let currentStep = 0;
  const steps = document.querySelectorAll(".step");

  function showStep(n) {
    if (!steps.length) return;
    steps.forEach((s, i) => s.classList.toggle("active", i === n));
  }

  window.nextStep = function () {
    if (!steps.length) return;
    let inputs = steps[currentStep].querySelectorAll("input, select");
    let valid = true;
    inputs.forEach(input => { if (!input.value) valid = false; });

    if (!valid) {
      alert("⚠️ Fill all fields");
      return;
    }
    currentStep++;
    showStep(currentStep);
  };

  window.prevStep = function () {
    if (!steps.length) return;
    currentStep--;
    showStep(currentStep);
  };

  // =======================
  // PRICE CALCULATION (Wahi Purana Logic)
  // =======================
  function calculatePrice() {
    const vehicleEl = document.getElementById("vehicle");
    const daysEl = document.getElementById("days");
    if (!vehicleEl || !daysEl) return 0;

    const vehicle = parseInt(vehicleEl.value) || 0;
    const days = parseInt(daysEl.value) || 0;
    const total = vehicle * days;

    const priceBox = document.getElementById("finalPrice");
    if (priceBox) { priceBox.innerText = "Final: ₹" + total; }
    return total;
  }

  const vehicleInput = document.getElementById("vehicle");
  const daysInput = document.getElementById("days");
  if (vehicleInput && daysInput) {
    vehicleInput.addEventListener("change", calculatePrice);
    daysInput.addEventListener("input", calculatePrice);
    calculatePrice();
  }

  // =======================
  // EMAIL VALIDATION
  // =======================
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // =======================
  // SEND OTP (Sirf Fix kiya hai, Delete nahi)
  // =======================
  window.sendOTP = async function () {
    try {
      const emailEl = document.getElementById("email");
      if (!emailEl) return;
      const email = emailEl.value.trim();

      if (!validateEmail(email)) {
        alert("Enter valid email");
        return;
      }

      const res = await fetch(`${BASE_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || data.message || "OTP failed ❌");
        return;
      }
      alert(data.message || "OTP sent ✅");

    } catch (err) {
      console.log("OTP Error:", err);
      alert("Server error ❌");
    }
  };

  // =======================
  // VERIFY OTP (Wahi Logic)
  // =======================
  window.verifyOTP = async function () {
    try {
      const otpEl = document.getElementById("otp");
      if (!otpEl) return;
      const otp = otpEl.value.trim();

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
        alert(data.message || "Wrong OTP ❌");
      }
    } catch (err) {
      alert("Verification failed ❌");
    }
  };

  // =======================
  // BOOKING & RAZORPAY (Same as yours)
  // =======================
   window.bookNow = async function () {
  try {
    const emailEl = document.getElementById("email");
    const paymentEl = document.getElementById("payment");

    if (!emailEl || !paymentEl) return;

    // ✅ collect all data
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const phone = document.getElementById("phone").value;
    const location = document.getElementById("location").value;
    const vehicle = document.getElementById("vehicle").value;

    const email = emailEl.value.trim();
    const payment = paymentEl.value;
    const amount = calculatePrice();

    // ✅ common object
    const bookingData = {
      firstName,
      lastName,
      phone,
      location,
      vehicle,
      email,
      paymentMode: payment
    };

    // =======================
    // CASH PAYMENT
    // =======================
    if (payment === "cash") {
      const res = await fetch(`${BASE_URL}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bookingData)
      });

      if (res.ok) {
        alert("✅ Booking Confirmed");
        location.reload();
      }
    }

    // =======================
    // UPI PAYMENT (RAZORPAY)
    // =======================
    if (payment === "upi") {
      const options = {
        key: "rzp_live_SbhI7uVjasgo07",
        amount: amount * 100,
        currency: "INR",
        name: "Travel Booking",

        handler: async function (response) {
          const res = await fetch(`${BASE_URL}/book`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              ...bookingData,
              paymentId: response.razorpay_payment_id
            })
          });

          if (res.ok) {
            alert("🎉 Payment Success");
            location.reload();
          }
        }
      };

      new Razorpay(options).open();
    }

  } catch (err) {
    console.log(err);
    alert("Something went wrong ❌");
  }
};

showStep(currentStep);

  // =======================
  // SWIPERS (Wahi Purane)
  // =======================
  if (typeof Swiper !== 'undefined') {
      new Swiper(".heroSwiper", { loop: true, autoplay: { delay: 3000 } });
      new Swiper(".aboutSwiper", { loop: true, autoplay: { delay: 3500 } });
      const reviewEl = document.querySelector(".reviewSwiper");
      if (reviewEl) {
          const rs = new Swiper(".reviewSwiper", { loop: true, spaceBetween: 20, autoplay: { delay: 2000 } });
          rs.autoplay.start();
      }
  }
});