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
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

// Complete the auth session if coming back from a browser redirect
WebBrowser.maybeCompleteAuthSession();

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

    // Setup native Google Sign-In request
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Handle Native Sign-In Response
    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            signInWithCredential(auth, credential).catch((error) => {
                console.error("Native Sign-In Error:", error);
            });
        } else if (response?.type === 'error') {
            console.error("Native Sign-In Request Error:", response.error);
        }
    }, [response]);

    const signInWithGoogle = async () => {
        if (Platform.OS === 'web') {
            // Web: Use Popup (Original Method)
            const provider = new GoogleAuthProvider();
            try {
                await signInWithPopup(auth, provider);
            } catch (error) {
                console.error("Web Login failed", error);
                throw error;
            }
        } else {
            // Native: Use Expo Auth Session
            try {
                await promptAsync();
            } catch (error) {
                console.error("Native Login initiation failed", error);
                throw error;
            }
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
