
// ===============================
// 🔥 FIREBASE CONFIG
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyAh3lZEgfY_fEj-GQ4ZkcxANMhY2PbXwRM",
  authDomain: "vicohi-ccdd9.firebaseapp.com",
  projectId: "vicohi-ccdd9",
  storageBucket: "vicohi-ccdd9.appspot.com",
  messagingSenderId: "1053485657786",
  appId: "1:1053485657786:web:9719819791f17c6b735c83"
};

// INIT FIREBASE
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();


// ===============================
// 🔐 LOGIN FUNCTION
// ===============================
function loginUser() {

  const email = document.querySelector("input[type='email']").value;
  const password = document.querySelector("input[type='password']").value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      alert("Login Successful ✔️");

      // Redirect to dashboard (index page)
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
}


// ===============================
// 🔥 GOOGLE LOGIN
// ===============================
function googleLogin(){
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then((result) => {
      alert("Google Login Success ✔️");
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert(error.message);
    });
}


// // ===============================
// // 🔥 FACEBOOK LOGIN
// // ===============================
// function facebookLogin(){
//   const provider = new firebase.auth.FacebookAuthProvider();

//   auth.signInWithPopup(provider)
//     .then((result) => {
//       alert("Facebook Login Success ✔️");
//       window.location.href = "index.html";
//     })
//     .catch((error) => {
//       alert(error.message);
//     });
// }

function forgotPassword(){
  const email = document.querySelector("input[type='email']").value;

  if(!email){
    alert("Please enter email and password");
    return;
  }

  auth.sendPasswordResetEmail(email)
  .then(() => {
    alert("Password reset link sent to your email ✔️");
  })
  .catch(error => alert(error.message));
}


function signupUser(){

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if(!email){
    alert("Enter email");
    return;
  }

  if(!password){
    alert("Enter password");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("Account created successfully ✔️");
    })
    .catch(error => {
      alert(error.message);
    });
}