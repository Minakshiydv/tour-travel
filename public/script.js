document.addEventListener("DOMContentLoaded", () => {

  // =======================
  // BASE URL (FINAL)
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
  // STEP FORM
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
    if (!steps.length) return;
    currentStep--;
    showStep(currentStep);
  };

  // =======================
  // PRICE CALCULATION
  // =======================
  function calculatePrice() {
    const vehicleEl = document.getElementById("vehicle");
    const daysEl = document.getElementById("days");

    if (!vehicleEl || !daysEl) return 0;

    const vehicle = parseInt(vehicleEl.value) || 0;
    const days = parseInt(daysEl.value) || 0;

    const total = vehicle * days;

    const priceBox = document.getElementById("finalPrice");
    if (priceBox) {
      priceBox.innerText = "Final: ₹" + total;
    }

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

      const data = await res.json();

      if (!res.ok) throw new Error();

      alert(data.message);

    } catch (err) {
      console.log(err);
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

      const data = await res.json();

      if (data.success) {
        alert("OTP Verified ✅");
        nextStep();
      } else {
        alert("Wrong OTP ❌");
      }

    } catch (err) {
      console.log(err);
      alert("Verification failed ❌");
    }
  };

  // =======================
  // BOOKING
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

      // ===== CASH =====
      if (payment === "cash") {

        const res = await fetch(`${BASE_URL}/book`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({ email })
        });

        if (!res.ok) throw new Error();

        alert("✅ Booking Confirmed");
        location.reload();
      }

      // ===== UPI =====
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
              alert("Booking failed ❌");
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

});