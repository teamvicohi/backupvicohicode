// ===============================
// 🔥 CONTACT FORM - SECURE VERSION
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("contactForm");

  if (!form) return;

  const submitBtn = form.querySelector("button");

  // ===============================
  // 👤 AUTO FILL EMAIL IF LOGGED IN
  // ===============================
  firebase.auth().onAuthStateChanged((user) => {

    const emailField = document.getElementById("email");

    if (user && emailField) {
      emailField.value = user.email;
      emailField.readOnly = true;
    }

  });

  // ===============================
  // 🚀 FORM SUBMIT
  // ===============================
  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    // ===============================
    // 🔐 LOGIN CHECK
    // ===============================
    const user = firebase.auth().currentUser;

    if (!user) {
      alert("Please login first to contact us.");
      return;
    }

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    // ===============================
    // ⚠️ VALIDATION
    // ===============================
    if (!name || !email || !subject || !message) {
      alert("Please fill all fields properly.");
      return;
    }

    try {

      // ===============================
      // 🔒 BUTTON LOCK (ANTI SPAM)
      // ===============================
      submitBtn.disabled = true;
      submitBtn.innerText = "Sending...";

      // ===============================
      // 🔥 SAVE TO FIRESTORE
      // ===============================
      await firebase.firestore().collection("contactMessages").add({

        uid: user.uid, // Required for Firestore security rules

        name: name,
        email: email,
        subject: subject,
        message: message,

        status: "new",

        createdAt: firebase.firestore.FieldValue.serverTimestamp()

      });

      // ===============================
      // ✅ SUCCESS
      // ===============================
      alert("Message sent successfully ✔️");

      form.reset();

      // Restore logged-in email
      document.getElementById("email").value = user.email;
      document.getElementById("email").readOnly = true;

    } catch (error) {

      console.error("Contact Form Error:", error);

      alert("Error: " + error.message);

    } finally {

      submitBtn.disabled = false;
      submitBtn.innerText = "Send Message";

    }

  });

});