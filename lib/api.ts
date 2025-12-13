import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Gets the base URL for the API.
 * On development (Expo Go), it uses the host URI (your computer's IP).
 * On production, it should use the production URL.
 */
export const getBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
    }

    // In Expo Go, hostUri contains the IP and port of the Metro server
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
        return `http://${hostUri.split(':')[0]}:8081`;
    }

    // Fallback for Android Emulator
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:8081';
    }

    // Fallback for iOS Simulator or others
    return 'http://localhost:8081';
};
