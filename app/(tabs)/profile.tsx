import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { User as UserIcon, LogOut, Mail, Calendar } from 'lucide-react-native';

export default function ProfileScreen() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Unknown';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    {user?.photoURL ? (
                        <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                    ) : (
                        <View style={styles.placeholderAvatar}>
                            <UserIcon size={40} color="#fff" />
                        </View>
                    )}
                </View>
                <Text style={styles.name}>{user?.displayName || 'User'}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.infoSection}>
                <View style={styles.infoItem}>
                    <Mail size={20} color="#6b7280" />
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user?.email}</Text>
                    </View>
                </View>

                <View style={styles.infoItem}>
                    <Calendar size={20} color="#6b7280" />
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Joined</Text>
                        <Text style={styles.infoValue}>
                            {formatDate(user?.metadata.creationTime)}
                        </Text>
                    </View>
                </View>
                <View style={styles.infoItem}>
                    <Calendar size={20} color="#6b7280" />
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Last Signed In</Text>
                        <Text style={styles.infoValue}>
                            {formatDate(user?.metadata.lastSignInTime)}
                        </Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LogOut size={20} color="#fff" />
                <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.versionText}>LegalEase v1.0.0</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    avatarContainer: {
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#fff',
    },
    placeholderAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#cbd5e1',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#fff',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: '#6b7280',
    },
    infoSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    infoTextContainer: {
        marginLeft: 16,
    },
    infoLabel: {
        fontSize: 12,
        color: '#9ca3af',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ef4444',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    footer: {
        marginTop: 'auto',
        alignItems: 'center',
        paddingBottom: 20,
    },
    versionText: {
        fontSize: 12,
        color: '#9ca3af',
    }
});
