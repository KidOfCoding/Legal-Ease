import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getBaseUrl } from '../lib/api';

interface HistoryItem {
    id: string;
    question: string;
    answer: string;
    language: string;
    fileUrl?: string;
    fileType?: string;
    created_at: string;
}

interface HistoryContextType {
    history: HistoryItem[];
    loading: boolean;
    error: string;
    refreshHistory: () => Promise<void>;
}

const HistoryContext = createContext<HistoryContextType>({
    history: [],
    loading: false,
    error: '',
    refreshHistory: async () => { },
});

export const useHistory = () => useContext(HistoryContext);

export const HistoryProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchHistory = async () => {
        if (!user) {
            setHistory([]);
            return;
        }

        try {
            setLoading(true);
            setError('');
            const baseUrl = getBaseUrl();
            const apiUrl = `${baseUrl}/api/history?userId=${user.uid}`;

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.error || 'Failed to fetch history';
                console.error('Failed to fetch history:', errorMsg);
                setError(errorMsg);
                return;
            }

            setHistory(data.history || []);
        } catch (err: any) {
            console.error('History fetch error:', err);
            setError(err.message || 'Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [user]);

    return (
        <HistoryContext.Provider value={{ history, loading, error, refreshHistory: fetchHistory }}>
            {children}
        </HistoryContext.Provider>
    );
};
