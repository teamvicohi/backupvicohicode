const firebaseConfig = {
  apiKey: "AIzaSyAh3lZEgfY_fEj-GQ4ZkcxANMhY2PbXwRM",
  authDomain: "vicohi-ccdd9.firebaseapp.com",
  projectId: "vicohi-ccdd9",
  storageBucket: "vicohi-ccdd9.appspot.com",
  messagingSenderId: "1053485657786",
  appId: "1:1053485657786:web:9719819791f17c6b735c83"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}