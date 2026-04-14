document.addEventListener("DOMContentLoaded", () => {

  // =======================
  // BASE URL
  // =======================
  const BASE_URL = "https://tour-travel1.onrender.com";

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
  // PRICE CALCULATION
  // =======================
  function calculatePrice() {
    const vehicle = parseInt(document.getElementById("vehicle")?.value) || 0;
    const days = parseInt(document.getElementById("days")?.value) || 0;

    const total = vehicle * days;

    const priceBox = document.getElementById("finalPrice");
    if (priceBox) {
      priceBox.innerText = "Final: ₹" + total;
    }

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
  // SEND OTP
  // =======================
  window.sendOTP = async function () {
    try {
      const email = document.getElementById("email").value;

      if (!validateEmail(email)) {
        alert("Enter valid email");
        return;
      }

      const res = await fetch(`${BASE_URL}/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email })
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      alert(data.message);

    } catch (err) {
      console.log("OTP Error:", err);
      alert("OTP failed ❌");
    }
  };

  // =======================
  // VERIFY OTP
  // =======================
  window.verifyOTP = async function () {
    try {
      const otp = document.getElementById("otp").value;

      if (!otp) {
        alert("Enter OTP");
        return;
      }

      const res = await fetch(`${BASE_URL}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ otp })
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();

      if (data.success) {
        alert("OTP Verified ✅");
        nextStep();
      } else {
        alert("Wrong OTP ❌");
      }

    } catch (err) {
      console.log("Verify Error:", err);
      alert("Verification failed ❌");
    }
  };

  // =======================
  // BOOKING FUNCTION
  // =======================
  window.bookNow = async function () {
    try {
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

      // CASH
      if (payment === "cash") {

        const res = await fetch(`${BASE_URL}/book`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({ email })
        });

        if (!res.ok) throw new Error("Booking failed");

        alert("✅ Booking Confirmed");
        location.reload();
      }

      // UPI
      if (payment === "upi") {

        const options = {
          key: "rzp_live_SbhI7uVjasgo07",
          amount: amount * 100,
          currency: "INR",
          name: "Travel Booking",
          description: "Payment",

          handler: async function () {
            try {
              const res = await fetch(`${BASE_URL}/book`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ email })
              });

              if (!res.ok) throw new Error();

              alert("🎉 Payment + Booking Success");
              location.reload();

            } catch {
              alert("Booking failed after payment ❌");
            }
          }
        };

        new Razorpay(options).open();
      }

    } catch (err) {
      console.log("Booking Error:", err);
      alert("Something went wrong ❌");
    }
  };

  showStep(currentStep);

});