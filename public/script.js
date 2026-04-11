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
      autoplay: { delay: 4000, disableOnInteraction: false },
      speed: 1000,
      pagination: { el: ".swiper-pagination", clickable: true },
    });

    new Swiper(".aboutSwiper", {
      loop: true,
      autoplay: { delay: 4000, disableOnInteraction: false },
      pagination: { el: ".swiper-pagination", clickable: true },
    });

    new Swiper(".reviewSwiper", {
      loop: true,
      autoplay: { delay: 3000, disableOnInteraction: false },
      speed: 800,
      spaceBetween: 20,
      pagination: { el: ".reviewSwiper .swiper-pagination", clickable: true },
    });
  }

  // =======================
  // SMOOTH SCROLL
  // =======================
  document.querySelectorAll("nav a").forEach(a => {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  // =======================
  // EMAILJS INIT
  // =======================
  if (typeof emailjs !== "undefined") {
    emailjs.init("EBwAazD16Vf8N6gvL");
  } else {
    console.error("EmailJS not loaded");
  }

  const bookingForm = document.getElementById("bookingForm");

  let currentStep = 0;
  const steps = document.querySelectorAll(".step");

  function showStep(n) {
    steps.forEach((s, i) => s.classList.toggle("active", i === n));
  }

  window.nextStep = function () {
    if (currentStep < steps.length - 1) {
      currentStep++;
      showStep(currentStep);
    }
  };

  window.prevStep = function () {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  };

  // =======================
  // PRICE CALC
  // =======================
  function calculatePrice() {
    const vehicle = parseInt(document.getElementById("vehicle")?.value) || 0;
    const days = parseInt(document.getElementById("days")?.value) || 0;
    const km = parseInt(document.getElementById("km")?.value) || 0;

    const limit = 250 * days;
    const extra = km > limit ? km - limit : 0;

    const total = (vehicle * days) + (extra * 22);

    if (document.getElementById("totalPrice")) {
      document.getElementById("totalPrice").innerText = "Total: ₹" + total;
    }

    if (document.getElementById("finalPrice")) {
      document.getElementById("finalPrice").innerText = "Final: ₹" + total;
    }

    return total;
  }

  ["vehicle", "days", "km"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", calculatePrice);
  });

  // =======================
  // EMAIL VALIDATION
  // =======================
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // =======================
  // EMAIL SEND (FIXED)
  // =======================
  function sendEmail(status, paymentId = "") {

    const data = {
      name: (document.getElementById("fname")?.value || "") + " " + (document.getElementById("lname")?.value || ""),
      email: document.getElementById("email")?.value,
      phone: document.getElementById("phone")?.value,
      tour: document.getElementById("tour")?.value,
      amount: calculatePrice(),
      status: status,
      payment_id: paymentId || "N/A"
    };

    if (typeof emailjs === "undefined") return;

    // CUSTOMER EMAIL
    emailjs.send("service_9yewgrk", "template_xom4y32", {
      ...data,
      to_email: data.email
    }).catch(err => console.error("Customer email error:", err));

    // OWNER EMAIL (SAFE FIX)
    emailjs.send("service_9yewgrk", "template_xom4y32", {
      ...data,
      to_email: "yourmail@gmail.com"
    }).catch(err => console.error("Owner email error:", err));
  }

  // =======================
  // RAZORPAY
  // =======================
  function openRazorpay(amount) {

    const options = {
      key: "rzp_live_SbhI7uVjasgo07",
      amount: amount * 100,
      currency: "INR",
      name: "Travel Booking",
      description: "Tour Payment",

      handler: function (response) {
        alert("🎉 Payment Successful");

        sendEmail("Paid", response.razorpay_payment_id);

        if (bookingForm) bookingForm.reset();

        currentStep = 0;
        showStep(currentStep);
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }

  // =======================
  // FORM SUBMIT
  // =======================
  if (bookingForm) {

    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const payment = document.getElementById("payment")?.value;
      const total = calculatePrice();

      if (!validateEmail(email)) {
        alert("Invalid Email");
        return;
      }

      if (!payment) {
        alert("Select payment method");
        return;
      }

      if (payment === "cash") {
        alert("Booking Confirmed (Cash)");
        sendEmail("Cash");

        bookingForm.reset();
        currentStep = 0;
        showStep(currentStep);
        return;
      }

      if (payment === "upi") {
        openRazorpay(total);
      }
    });
  }

  showStep(currentStep);
});