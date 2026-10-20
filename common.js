// ==========================
// COMMON.JS - VICHOHI PROJECT
// NAVBAR + FOOTER + AUTH HANDLING
// ==========================

document.addEventListener("DOMContentLoaded", async () => {

  console.log("common.js loaded ✔");

  await loadNavbar();
  await loadFooter();
  setupAuthButton();

});


// ==========================
// LOAD NAVBAR
// ==========================
async function loadNavbar() {

  try {

    const res = await fetch("components/navbar.html");

    if (!res.ok) {
      throw new Error("Navbar file not found");
    }

    const html = await res.text();

    const navbarContainer = document.getElementById("navbar");

    if (!navbarContainer) {
      console.error("Navbar div missing in HTML");
      return;
    }

    navbarContainer.innerHTML = html;

    console.log("Navbar loaded ✔");

  } catch (error) {
    console.error("Navbar load error:", error);
  }

}


// ==========================
// LOAD FOOTER
// ==========================
async function loadFooter() {

  try {

    const res = await fetch("components/footer.html");

    if (!res.ok) {
      throw new Error("Footer file not found");
    }

    const data = await res.text();

    const footerContainer = document.getElementById("footer");

    if (!footerContainer) {
      console.error("Footer div missing in HTML");
      return;
    }

    footerContainer.innerHTML = data;

    console.log("Footer loaded ✔");

  } catch (error) {
    console.error("Footer load error:", error);
  }

}


// ==========================
// AUTH BUTTON HANDLER
// ==========================
function setupAuthButton() {

  const authBtn = document.getElementById("authBtn");

  if (!authBtn) {
    console.warn("Auth button not found (navbar may not be loaded yet)");
    return;
  }

  if (!window.firebase || !firebase.auth) {
    console.warn("Firebase not initialized");
    return;
  }

  firebase.auth().onAuthStateChanged((user) => {

    if (user) {

      authBtn.textContent = "Logout";
      authBtn.href = "#";

      authBtn.onclick = async (e) => {
        e.preventDefault();

        try {
          await firebase.auth().signOut();
          alert("Logged out successfully");
          window.location.href = "login.html";
        } catch (error) {
          console.error("Logout Error:", error);
          alert("Logout failed");
        }

      };

    } else {

      authBtn.textContent = "Login";
      authBtn.href = "login.html";
      authBtn.onclick = null;

    }

  });

}