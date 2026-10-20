// ===============================
// 🔥 REQUEST TOOL FORM (SECURE FINAL VERSION)
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("requestForm");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // ===============================
    // 🔐 CHECK LOGIN USER
    // ===============================
    const user = firebase.auth().currentUser;

    if (!user) {
      alert("Please login first to submit request");
      return;
    }

    // ===============================
    // 🧾 GET FORM DATA
    // ===============================
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    // ===============================
    // ⚠️ VALIDATION
    // ===============================
    if (!name || !email || !message) {
      alert("All fields are required");
      return;
    }

    try {

      // ===============================
      // 🔥 FIRESTORE SAVE (SECURE)
      // ===============================
      await firebase.firestore().collection("toolRequests").add({

        uid: user.uid,   // 🔐 IMPORTANT (matches security rules)
        name: name,
        email: email,
        message: message,

        status: "pending",   // for future admin panel
        createdAt: firebase.firestore.FieldValue.serverTimestamp()

      });

      alert("Request sent successfully ✔️");

      form.reset();

    } catch (error) {

      console.error("Firestore Error:", error);
      alert("Error: " + error.message);

    }

  });

});