document.addEventListener("DOMContentLoaded", () => {

  // =======================
  // MOBILE MENU
  // =======================
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector("nav ul");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  // =======================
  // SWIPER
  // =======================
  if (typeof Swiper !== "undefined") {

    new Swiper(".heroSwiper", {
      loop: true,
      autoplay: { delay: 4000 },
      pagination: { el: ".swiper-pagination", clickable: true },
    });

    new Swiper(".aboutSwiper", {
      loop: true,
      autoplay: { delay: 4000 },
      pagination: { el: ".swiper-pagination", clickable: true },
    });

    new Swiper(".reviewSwiper", {
      loop: true,
      autoplay: { delay: 3000 },
      pagination: { el: ".reviewSwiper .swiper-pagination", clickable: true },
    });
  }

  // =======================
  // STEP FORM
  // =======================
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

    currentStep++;
    showStep(currentStep);
  };

  window.prevStep = function () {
    currentStep--;
    showStep(currentStep);
  };

  // =======================
  // PRICE CALC
  // =======================
  function calculatePrice() {
    const vehicle = parseInt(document.getElementById("vehicle")?.value) || 0;
    const days = parseInt(document.getElementById("days")?.value) || 0;

    const total = vehicle * days;

    document.getElementById("finalPrice").innerText = "Final: ₹" + total;

    return total;
  }

  ["vehicle", "days"].forEach(id => {
    document.getElementById(id)?.addEventListener("change", calculatePrice);
  });

  calculatePrice();

  // =======================
  // EMAIL VALIDATION
  // =======================
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // =======================
  // OTP SEND
  // =======================
  window.sendOTP = function () {
  const email = document.getElementById("email").value;

  if (!validateEmail(email)) {
    alert("Enter valid email");
    return;
  }

  fetch("https://rdrtravels-backend.onrender.com/send-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
    })
    .catch(error => {
      console.log("Error:", error);
      alert("Server not reachable or OTP failed");
    });
};
  // =======================
  // OTP VERIFY
  // =======================
  window.verifyOTP = function () {
    const otp = document.getElementById("otp").value;

    fetch("http://localhost:3000/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("OTP Verified ✅");
        nextStep();
      } else {
        alert("Wrong OTP ❌");
      }
    });
  };

  // =======================
  // BOOKING (CASH + UPI)
  // =======================
  window.bookNow = function () {

    const email = document.getElementById("email").value;
    const payment = document.getElementById("payment").value;
    const amount = calculatePrice();

    if (!validateEmail(email)) {
      alert("Invalid email");
      return;
    }

    if (!payment) {
      alert("Select payment method");
      return;
    }

    // ===== CASH =====
    if (payment === "cash") {

      fetch("http://localhost:3000/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      .then(res => res.json())
      .then(data => {
        alert("✅ Booking Confirmed (Cash)");
        location.reload();
      });

    }

    // ===== UPI (RAZORPAY) =====
    if (payment === "upi") {

      const options = {
        key: "rzp_live_SbhI7uVjasgo07", // 👉 apni key daalna
        amount: amount * 100,
        currency: "INR",
        name: "Travel Booking",
        description: "Payment",

        handler: function () {

          alert("🎉 Payment Successful");

          fetch("http://localhost:3000/book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
          })
          .then(res => res.json())
          .then(data => {
            alert("Booking Confirmed + Email Sent ✅");
            location.reload();
          });
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    }
  };

  showStep(currentStep);

});