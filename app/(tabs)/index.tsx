import { useState, useEffect } from 'react';
// ... (imports)

export default function HomeScreen() {
  const { user } = useAuth();
  const { refreshHistory } = useHistory();
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('english');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState<number | null>(null);

  // ... (existing state)

  // Fetch User Attempts
  useEffect(() => {
    async function fetchAttempts() {
      if (user?.uid) {
        try {
          const baseUrl = getBaseUrl();
          const response = await fetch(`${baseUrl}/api/user?userId=${user.uid}&email=${user.email}`);
          const data = await response.json();
          if (data.attemptsLeft !== undefined) {
            setAttempts(data.attemptsLeft);
          }
        } catch (error) {
          console.error("Failed to fetch attempts", error);
        }
      }
    }
    fetchAttempts();
  }, [user]);

  // ... (pickImage, etc.)

  const handleSubmit = async () => {
    // ... (validation)

    setLoading(true);
    // ...

    try {
      const baseUrl = getBaseUrl();
      // ...

      const response = await fetch(apiUrl, {
        // ...
      });

      // ...

      if (!response.ok) {
        // Handle Quota Exceeded specifically to update UI if needed
        if (response.status === 403) {
          setAttempts(0);
        }
        throw new Error(data.error || 'Failed to get response');
      }

      setAnswer(data.answer);
      if (data.attemptsLeft !== undefined) {
        setAttempts(data.attemptsLeft); // Update attempts from response
      }
      // ...
    } catch (err: any) {
      // ...
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Ask Your Legal Question</Text>

        {/* Updated Limit Note */}
        <View style={styles.limitNote}>
          <Text style={styles.limitNoteText}>
            {attempts !== null
              ? `Attempts Left: ${attempts} / 3`
              : 'Loading usage info...'}
          </Text>
        </View>

        {/* Disable Input if attempts 0 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your Question</Text>
          <TextInput
            style={[styles.textInput, attempts === 0 && styles.disabledInput]}
            placeholder={attempts === 0 ? "You have used all your free attempts." : "e.g., How to register a shop? ..."}
            multiline
            numberOfLines={4}
            value={question}
            onChangeText={setQuestion}
            editable={!loading && attempts !== 0}
          />
        </View>

        {/* ... (File Preview) */}

        {/* ... (Action Buttons disabled logic) */}

        {/* ... (Language) */}

        <TouchableOpacity
          style={[styles.submitButton, (loading || attempts === 0) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading || attempts === 0}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Send size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.submitButtonText}>
                {attempts === 0 ? "Quota Exceeded" : "Get Legal Guidance"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* ... */}
      </View>
    </ScrollView>
  );
}

// Add disabledInput style
const styles = StyleSheet.create({
  // ...
  disabledInput: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af'
  },
  // ...
});

{
  error && (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  )
}

{
  answer && (
    <View style={styles.answerContainer}>
      <Text style={styles.answerTitle}>Legal Guidance:</Text>
      <Markdown style={markdownStyles}>{answer}</Markdown>
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️ This is AI-generated guidance. Always consult with a
          qualified lawyer for serious legal matters.
        </Text>
      </View>
    </View>
  )
}

<CreatorSignature />
      </View >
    </ScrollView >
  );
}

const markdownStyles = {
  body: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  heading1: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1f2937',
    marginBottom: 10,
  },
  heading2: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1f2937',
    marginBottom: 8,
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  fileName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    marginRight: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  languageContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  languageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  languageButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  answerContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  answerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  answerText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  disclaimer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
  },
  limitNote: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  limitNoteText: {
    color: '#856404',
    fontSize: 13,
    lineHeight: 20,
  },
});
