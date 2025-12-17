import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Clock, MessageSquare, FileText } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';

interface HistoryItem {
  id: string;
  question: string;
  answer: string;
  language: string;
  fileUrl?: string;
  fileType?: string;
  created_at: string;
}

import { getBaseUrl } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function HistoryScreen() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    if (!user) return; // Should be handled by layout, but safe check

    try {
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
        throw new Error(data.error || 'Failed to fetch history');
      }

      setHistory(data.history || []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins} min ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.content}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MessageSquare size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No questions yet</Text>
            <Text style={styles.emptyText}>
              Your question history will appear here
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.headerText}>
              Recent Questions ({history.length})
            </Text>
            {history.map((item, index) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.languageBadge}>
                    <Text style={styles.languageBadgeText}>
                      {item.language === 'hindi' ? 'हिंदी' : 'English'}
                    </Text>
                  </View>
                  <View style={styles.timeContainer}>
                    <Clock size={14} color="#6b7280" />
                    <Text style={styles.timeText}>
                      {formatDate(item.created_at)}
                    </Text>
                  </View>
                </View>

                <View style={styles.questionSection}>
                  <Text style={styles.sectionLabel}>Question:</Text>
                  <Text style={styles.questionText}>{item.question}</Text>
                  {item.fileUrl && (
                    <TouchableOpacity
                      style={styles.fileAttachment}
                      onPress={() => Linking.openURL(item.fileUrl!)}
                    >
                      {item.fileType === 'image' ? (
                        <Image source={{ uri: item.fileUrl }} style={styles.attachmentImage} />
                      ) : (
                        <View style={styles.documentAttachment}>
                          <FileText size={20} color="#4b5563" />
                          <Text style={styles.attachmentText}>View Attached Document</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.answerSection}>
                  <Text style={styles.sectionLabel}>Answer:</Text>
                  <Markdown style={markdownStyles}>
                    {item.answer}
                  </Markdown>
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const markdownStyles = {
  body: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
  heading1: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1f2937',
    marginBottom: 8,
  },
  heading2: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#1f2937',
    marginBottom: 6,
  },
  strong: {
    fontWeight: 'bold' as const,
    color: '#111827',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  languageBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  languageBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  questionSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    lineHeight: 22,
  },
  fileAttachment: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  attachmentImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  documentAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    gap: 8,
  },
  attachmentText: {
    fontSize: 14,
    color: '#4b5563',
  },
  answerSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
});
