// IMPORTANTE: Reemplaza el objeto de abajo con tu propia configuración de Firebase
// Puedes obtenerla en la consola de Firebase: Project Settings -> General -> Your apps -> SDK setup and configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBcRwVIwacQKYfqDxxCTu3OSMPi2-A0820",
    authDomain: "impostor-1a04f.firebaseapp.com",
    projectId: "impostor-1a04f",
    storageBucket: "impostor-1a04f.firebasestorage.app",
    messagingSenderId: "902516818208",
    appId: "1:902516818208:web:457d543fb3dfbd885e9745",
    measurementId: "G-XG13J4VEX9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

console.log("Firebase initialized");
