import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import fs from 'fs';

const firebaseConfig = {
    apiKey: "AIzaSyCH5xIUaKH9oRKfElDkF540Wyyu2i_RlVI",
    authDomain: "cripsys-introducao.firebaseapp.com",
    projectId: "cripsys-introducao",
    storageBucket: "cripsys-introducao.firebasestorage.app",
    messagingSenderId: "131631434786",
    appId: "1:131631434786:web:1b3d22415df8f321d58e7b"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function uploadVideo() {
    try {
        const filePath = "C:\\Users\\Fabricio\\Downloads\\aula1.mp4";
        const fileBuffer = fs.readFileSync(filePath);
        const storageRef = ref(storage, 'videos/aula1.mp4');

        console.log("Starting upload...");
        const snapshot = await uploadBytes(storageRef, fileBuffer);
        console.log("Uploaded a blob or file!");

        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log("File available at", downloadURL);
    } catch (error) {
        console.error("Upload failed:", error);
    }
}

uploadVideo();
