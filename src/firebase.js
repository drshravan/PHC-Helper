// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "REPLACE_WITH_YOUR_API_KEY",
    authDomain: "my-phc-helper-shravan.firebaseapp.com",
    projectId: "my-phc-helper-shravan",
    storageBucket: "my-phc-helper-shravan.firebasestorage.app",
    messagingSenderId: "120748976198",
    appId: "REPLACE_WITH_YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
