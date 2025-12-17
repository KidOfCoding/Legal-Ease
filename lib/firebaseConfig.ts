import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCD3cUABCgpOd7_bMHcq_xeXntRzbOsbKU",
    authDomain: "drivesync-757cf.firebaseapp.com",
    projectId: "drivesync-757cf",
    storageBucket: "drivesync-757cf.firebasestorage.app",
    messagingSenderId: "147479660562",
    appId: "1:147479660562:web:1b5f020ded700e8022f0cb",
    measurementId: "G-EH37RTPS1R"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
