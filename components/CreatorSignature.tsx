import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Linking, StyleSheet, Platform } from 'react-native';

// TODO: Paste your Google Drive Share Link here
// 1. Upload developer-profile.json to Google Drive
// 2. Right click -> Share -> Anyone with the link
// 3. Paste that link below
const PROFILE_JSON_URL = 'https://drive.google.com/file/d/13D2ZhES_TyuKtcYXM-3b8Hc0w64E7UH5/view?usp=sharing';

interface DeveloperProfile {
    name: string;
    linkedinUrl: string;
    imageUrl: string;
    shown?: boolean;
}

export const CreatorSignature = () => {
    const [profile, setProfile] = useState<DeveloperProfile>({
        name: 'Deba',
        linkedinUrl: 'http://www.linkedin.com/in/debasish-dash-276638310',
        imageUrl: '',
        shown: true,
    });

    // Helper to convert Google Drive share links to direct download links
    const getDirectUrl = (url: string) => {
        if (!url || url.includes('PASTE_YOUR')) return null;

        // Handle Google Drive links
        if (url.includes('drive.google.com')) {
            // Extract ID from: 
            // https://drive.google.com/file/d/1234567890abcdef/view?usp=sharing
            // or https://drive.google.com/open?id=1234567890abcdef
            const idMatch = url.match(/[-\w]{25,}/);
            if (idMatch) {
                return `https://drive.google.com/uc?export=download&id=${idMatch[0]}`;
            }
        }

        return url;
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const finalUrl = getDirectUrl(PROFILE_JSON_URL);

            // Google Drive direct links often fail CORS on Web
            if (Platform.OS === 'web' && finalUrl?.includes('drive.google.com')) {
                console.log('Skipping Google Drive fetch on Web due to CORS.');
                return;
            }

            console.log('Fetching profile from:', finalUrl);

            if (!finalUrl) {
                console.log('Profile URL not configured.');
                return;
            }

            try {
                // Add timestamp to bypass cache
                const urlWithTimestamp = `${finalUrl}&t=${Date.now()}`;
                const response = await fetch(urlWithTimestamp);

                console.log('Profile Fetch Status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('Profile Data Received:', data);

                    if (data) {
                        setProfile((prev) => ({
                            name: data.name || prev.name,
                            linkedinUrl: data.linkedinUrl || prev.linkedinUrl,
                            imageUrl: data.imageUrl || prev.imageUrl,
                            shown: data.shown !== undefined ? data.shown : prev.shown,
                        }));
                    }
                } else {
                    console.log('Profile Fetch Failed:', await response.text());
                }
            } catch (error: any) {
                console.log('Detailed Fetch Error:', error);
                if (error.message?.includes('Network request failed')) {
                    console.log('If you are on Web, this is likely a CORS issue (Google Drive blocks browsers). It should work on the Mobile App.');
                }
            }
        };

        fetchProfile();
    }, []);

    const openLinkedIn = () => {
        if (profile.linkedinUrl) {
            Linking.openURL(profile.linkedinUrl);
        }
    };

    if (!profile.shown) return null;

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={openLinkedIn} style={styles.content}>
                <Image
                    source={
                        profile.imageUrl
                            ? { uri: profile.imageUrl }
                            : require('../assets/images/profile.jpg')
                    }
                    style={styles.logo}
                />
                <View style={styles.textContainer}>
                    <Text style={styles.createdText}>Created by</Text>
                    <Text style={styles.nameText}>{profile.name}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        marginTop: 'auto',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 2,
        borderColor: '#2563eb',
    },
    textContainer: {
        flexDirection: 'column',
    },
    createdText: {
        fontSize: 10,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    nameText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
});
