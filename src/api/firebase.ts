import { GoogleAuthProvider, getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: 'AIzaSyDNoAhMAsRql51mPvqXVorAddJF9N4jaqQ',
  authDomain: 'task-manager-f99d9.firebaseapp.com',
  projectId: 'task-manager-f99d9',
  storageBucket: 'task-manager-f99d9.firebasestorage.app',
  messagingSenderId: '411945559544',
  appId: '1:411945559544:web:87be6dba5fd5fb5c3ce20d',
  measurementId: 'G-DSBKYLL88S',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const googleProvider = new GoogleAuthProvider()
export const auth = getAuth(app)
export const db = getFirestore(app)
// export const appVerifier = new RecaptchaVerifier(auth, 'sign-in-button', {
//   'size': 'invisible'

//   });
