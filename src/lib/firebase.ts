import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { addDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA_QvRNDGJV4uaHL1SFTaMwkTyDyooia5w",
  authDomain: "servitec-web-d2287.firebaseapp.com",
  projectId: "servitec-web-d2287",
  storageBucket: "servitec-web-d2287.firebasestorage.app",
  messagingSenderId: "1056168605600",
  appId: "1:1056168605600:web:750fc5f5c70de0bb25d6c5",
  measurementId: "G-XZ4HL5532N"
};

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
export { addDoc }
export const storage = getStorage(app);