import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

// Vérifie si l'app Firebase est déjà initialisée
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export du storage
export const storage = getStorage(app);

export { app };