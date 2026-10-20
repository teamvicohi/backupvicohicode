// ===============================
// 🔥 FEEDBACK FORM - SECURE VERSION
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("feedbackForm");

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
      alert("Please login first to submit feedback.");
      return;
    }

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    // ===============================
    // ⚠️ VALIDATION
    // ===============================
    if (!name || !email || !message) {
      alert("Please fill all fields properly.");
      return;
    }

    try {

      // ===============================
      // 🔒 BUTTON LOCK (ANTI SPAM)
      // ===============================
      submitBtn.disabled = true;
      submitBtn.innerText = "Submitting...";

      // ===============================
      // 🔥 SAVE TO FIRESTORE
      // ===============================
      await firebase.firestore().collection("feedbacks").add({

        uid: user.uid, // Required for Firestore security rules

        name: name,
        email: email,
        message: message,

        status: "new",

        createdAt: firebase.firestore.FieldValue.serverTimestamp()

      });

      // ===============================
      // ✅ SUCCESS
      // ===============================
      alert("Feedback submitted successfully ✔️");

      form.reset();

      // Restore logged-in email
      document.getElementById("email").value = user.email;
      document.getElementById("email").readOnly = true;

    } catch (error) {

      console.error("Feedback Error:", error);

      alert("Error: " + error.message);

    } finally {

      submitBtn.disabled = false;
      submitBtn.innerText = "Submit Feedback";

    }

  });

});