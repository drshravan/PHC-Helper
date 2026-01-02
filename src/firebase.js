import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDib4etT8OoH7f2YuXeykS7Fjd_nJhTdQM",
    authDomain: "phc-helper.firebaseapp.com",
    projectId: "phc-helper",
    storageBucket: "phc-helper.firebasestorage.app",
    messagingSenderId: "851879769132",
    appId: "1:851879769132:web:be93eb268aae485b3e0d89",
    measurementId: "G-5P78WWJDL8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db, analytics };
