// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCH5xIUaKH9oRKfElDkF540Wyyu2i_RlVI",
    authDomain: "cripsys-introducao.firebaseapp.com",
    projectId: "cripsys-introducao",
    storageBucket: "cripsys-introducao.firebasestorage.app",
    messagingSenderId: "131631434786",
    appId: "1:131631434786:web:1b3d22415df8f321d58e7b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
