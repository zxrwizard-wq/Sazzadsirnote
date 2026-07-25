// Shared Firebase setup — imported by both index.html and admin.html
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyB-l8u3DEixviI2fOOsys2YVb5G9B1NYn4",
  authDomain: "shazzadsir.firebaseapp.com",
  projectId: "shazzadsir",
  storageBucket: "shazzadsir.firebasestorage.app",
  messagingSenderId: "598429759697",
  appId: "1:598429759697:web:529db8c7f367f288c76df0",
  measurementId: "G-7FQCMNW03V"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

export {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
};
