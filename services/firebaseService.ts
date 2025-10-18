
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    deleteUser,
    type User as FirebaseUser
} from "firebase/auth";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc,
    updateDoc,
    collection,
    addDoc,
    serverTimestamp,
    increment
} from "firebase/firestore";
import type { ProductInfo, AnalysisResult, AdminUserView } from '../types';


// --- Firebase Configuration ---
// The configuration has been automatically populated from your screenshot.
const firebaseConfig = {
  apiKey: "AIzaSyAd81isjLmwPkzkjHyg3SkqDJE5sGFJVVs",
  authDomain: "flypigaige.firebaseapp.com",
  projectId: "flypigaige",
  storageBucket: "flypigaige.firebasestorage.app",
  messagingSenderId: "971248428798",
  appId: "1:971248428798:web:a255c6d0415f93cbe167af",
  measurementId: "G-J4CSE3RKVM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Centralized API Caller ---

/**
 * A centralized function to call our secure backend API, including authentication.
 * @param action The specific backend action to perform.
 * @param payload The data to send to the backend.
 * @returns The JSON response from the backend.
 */
export const callApi = async (action: string, payload: any) => {
    const user = auth.currentUser;
    let idToken: string | null = null;
    if (user) {
        idToken = await user.getIdToken();
    }

    const response = await fetch('/api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(idToken && { 'Authorization': `Bearer ${idToken}` }),
        },
        body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `An unknown server error occurred (HTTP ${response.status}).` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
};


// --- User Document Management in Firestore ---

/**
 * Creates a new user document in the 'users' collection in Firestore.
 * This is typically called right after a user signs up.
 * @param userAuth The authenticated user object from Firebase Auth.
 */
export const createUserDocumentFromAuth = async (userAuth: FirebaseUser) => {
    const userDocRef = doc(db, 'users', userAuth.uid);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
        const { email } = userAuth;
        const createdAt = new Date();

        try {
            await setDoc(userDocRef, {
                email,
                createdAt,
                analysisCount: 0, // Initialize analysis count to 0
                isPaid: false, // Initialize payment status
            });
        } catch (error) {
            console.error("Error creating user document in Firestore:", error);
            throw error;
        }
    }
    return userDocRef;
};

/**
 * Retrieves a user's data document from Firestore.
 * @param uid The user's unique ID from Firebase Auth.
 * @returns The user data object if found, otherwise null.
 */
export const getUserData = async (uid: string) => {
    const userDocRef = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userDocRef);
    if (userSnapshot.exists()) {
        return userSnapshot.data();
    }
    return null;
};

/**
 * Increments the analysis count for a user in Firestore by 1.
 * @param uid The user's unique ID.
 */
export const incrementUserAnalysisCount = async (uid: string) => {
    const userDocRef = doc(db, 'users', uid);
    try {
        await updateDoc(userDocRef, {
            analysisCount: increment(1)
        });
    } catch (error) {
        console.error("Error incrementing user analysis count:", error);
        throw error;
    }
};

/**
 * Logs a completed analysis record to the 'analysis_logs' collection.
 * @param userId The ID of the user who performed the analysis.
 * @param userEmail The email of the user.
 * @param productInfo The input data for the analysis.
 * @param analysisResult The output data from the analysis.
 */
export const logAnalysis = async (userId: string, userEmail: string | null, productInfo: ProductInfo, analysisResult: AnalysisResult) => {
    try {
        const logCollectionRef = collection(db, 'analysis_logs');
        await addDoc(logCollectionRef, {
            userId,
            userEmail,
            productInfo,
            analysisResult,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error logging analysis:", error);
        // In a production app, you might want to report this error to a monitoring service.
    }
};


// --- Authentication Functions ---

/**
 * A listener for real-time authentication state changes.
 * @param callback The function to call when the auth state changes.
 * @returns An unsubscribe function to clean up the listener.
 */
export const onAuthStateChangedListener = (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * Signs up a new user with email and password.
 * This function is now more robust, deleting the user if Firestore doc creation fails.
 * @param email The user's email.
 * @param password The user's password.
 * @returns The signed-up user's credential object.
 */
export const signUpWithEmail = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
        try {
            await createUserDocumentFromAuth(userCredential.user);
        } catch (error) {
            // If Firestore document creation fails, delete the newly created Auth user to avoid orphaned accounts.
            console.error("Firestore document creation failed, attempting to delete Auth user to roll back...", error);
            try {
                await deleteUser(userCredential.user);
                console.log("Orphaned Auth user successfully deleted.");
            } catch (deleteError) {
                console.error("CRITICAL: Failed to delete orphaned Auth user. Manual cleanup required for UID:", userCredential.user.uid, deleteError);
            }
            // Re-throw the original error to be handled by the UI and show a specific message.
            throw error;
        }
    }
    return userCredential;
};

/**
 * Signs in an existing user with email and password.
 * @param email The user's email.
 * @param password The user's password.
 * @returns The signed-in user's credential object.
 */
export const signInWithEmail = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Signs out the currently logged-in user.
 */
export const signOutUser = () => signOut(auth);

// --- Admin Functions ---

/**
 * Calls the backend to get a list of all users. (Admin only)
 * @returns A promise that resolves to an array of user data.
 */
export const getUsers = async (): Promise<AdminUserView[]> => {
    return callApi('getUsers', {});
};

/**
 * Calls the backend to get all user data as a CSV string. (Admin only)
 * @returns A promise that resolves to an object containing the CSV data.
 */
export const downloadUsersCsv = async (): Promise<{ csvData: string }> => {
    return callApi('downloadUsersCsv', {});
};
