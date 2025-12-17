import React from 'react';
import { TouchableOpacity, Image, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { User } from 'lucide-react-native';

export const HeaderProfileButton = () => {
    const { user } = useAuth();
    const router = useRouter();

    const handlePress = () => {
        router.push('/profile');
    };

    return (
        <TouchableOpacity onPress={handlePress} style={styles.container}>
            {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
                <View style={styles.placeholder}>
                    <User size={20} color="#1e40af" />
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginRight: 16,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#93c5fd', // Light blue border
    },
    placeholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
