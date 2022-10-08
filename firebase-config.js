import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAVHuoDUZWSNykKLpCfU6BdXUVaMtCwXgE",
    authDomain: "twitter-clone-99d08.firebaseapp.com",
    projectId: "twitter-clone-99d08",
    storageBucket: "twitter-clone-99d08.appspot.com",
    messagingSenderId: "462654045860",
    appId: "1:462654045860:web:45d626aac3af923919b031"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore();
const storage = getStorage();

export default app;
export { db, storage };