import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User,
  type Unsubscribe,
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '@/api/firebase'

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password)

export const registerWithEmail = async (name: string, email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)

  await setDoc(doc(db, 'users', userCredential.user.uid), {
    name,
    createdAt: new Date(),
  })

  return userCredential.user
}

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider)

export const subscribeToAuthState = (onChange: (user: User | null) => void): Unsubscribe =>
  onAuthStateChanged(auth, onChange)