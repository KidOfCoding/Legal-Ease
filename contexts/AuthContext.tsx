import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { auth } from '../lib/firebaseConfig';
import {
    User,
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    signInWithCredential
} from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Configure Google Sign-In
        if (Platform.OS !== 'web') {
            GoogleSignin.configure({
                // The WEB CLIENT ID is required to get the idToken for Firebase
                webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
                offlineAccess: true,
            });
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        try {
            if (Platform.OS === 'web') {
                const provider = new GoogleAuthProvider();
                await signInWithPopup(auth, provider);
            } else {
                // Native: Google Play Services Flow
                await GoogleSignin.hasPlayServices();
                const userInfo = await GoogleSignin.signIn();

                // Get the ID token
                const { idToken } = await GoogleSignin.getTokens();

                if (!idToken) {
                    throw new Error('No ID token found');
                }

                // Create a Firebase credential with the token
                const googleCredential = GoogleAuthProvider.credential(idToken);

                // Sign-in the user with the credential
                await signInWithCredential(auth, googleCredential);
            }
        } catch (error: any) {
            console.error("Google Sign-In Error:", error);
            // Handle specific error codes if needed
            // if (error.code === statusCodes.SIGN_IN_CANCELLED) { ... }
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            if (Platform.OS !== 'web') {
                await GoogleSignin.signOut();
            }
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
