import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Scale } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const { signInWithGoogle, loading } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Login Error:", error);
            // Alert handled in context or here
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Scale size={64} color="#2563eb" />
                </View>
                <Text style={styles.title}>LegalEase</Text>
                <Text style={styles.subtitle}>Your AI Legal Assistant</Text>
                <Text style={styles.description}>
                    Sign in to get personalized legal guidance based on Indian law.
                </Text>

                <TouchableOpacity
                    onPress={handleLogin}
                    style={styles.button}
                    disabled={loading}
                >
                    <Image
                        source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
                        style={styles.googleIcon}
                    />
                    <Text style={styles.buttonText}>
                        {loading ? 'Signing in...' : 'Sign in with Google'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 24,
        padding: 20,
        backgroundColor: '#eff6ff',
        borderRadius: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#4b5563',
        marginBottom: 24,
        fontWeight: '500',
    },
    description: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 20,
        maxWidth: 280,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        width: '100%',
        maxWidth: 300,
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    googleIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    }
});
