import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCc8qXPZPm27RTM7xgsSRLNeeltNzU5qfg",
    authDomain: "my-phc-helper-shravan.firebaseapp.com",
    projectId: "my-phc-helper-shravan",
    storageBucket: "my-phc-helper-shravan.firebasestorage.app",
    messagingSenderId: "120748976198",
    appId: "1:120748976198:web:989332a7f7aa58c0764247",
    measurementId: "G-9FSPZS7G5K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db, analytics };
