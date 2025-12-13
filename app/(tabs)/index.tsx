import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Send, Image as ImageIcon, FileText, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import Markdown from 'react-native-markdown-display';

import { getBaseUrl } from '../../lib/api';
import { CreatorSignature } from '../../components/CreatorSignature';

export default function HomeScreen() {
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('english');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    type: 'image' | 'document';
    name: string;
    mimeType: string;
    base64?: string;
  } | null>(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // Fixed deprecated option
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          type: 'image',
          name: 'Selected Image',
          mimeType: asset.mimeType || 'image/jpeg',
          base64: asset.base64 || '',
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        const base64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: 'base64',
        });

        setSelectedFile({
          uri: file.uri,
          type: 'document',
          name: file.name,
          mimeType: 'application/pdf',
          base64: base64,
        });
      }
    } catch (err: any) {
      console.error('Document Picker Error:', err);
      Alert.alert('Error', `Failed to pick document: ${err.message}`);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    if (!question.trim() && !selectedFile) {
      setError('Please enter a question or upload a file');
      return;
    }

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const baseUrl = getBaseUrl();
      const apiUrl = `${baseUrl}/api/ask-legal`;
      console.log('Sending request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          language,
          file: selectedFile ? {
            base64: selectedFile.base64,
            mimeType: selectedFile.mimeType,
          } : undefined
        }),
      });

      const text = await response.text();
      console.log('Raw response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setAnswer(data.answer);
      setQuestion('');
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Ask Your Legal Question</Text>
        <Text style={styles.subtitle}>
          Get step-by-step legal guidance based on Indian law. Upload images or documents for analysis.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your Question</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., How to register a shop? or Describe this document."
            multiline
            numberOfLines={4}
            value={question}
            onChangeText={setQuestion}
            editable={!loading}
          />
        </View>

        {selectedFile && (
          <View style={styles.filePreview}>
            <View style={styles.fileInfo}>
              {selectedFile.type === 'image' ? (
                <Image source={{ uri: selectedFile.uri }} style={styles.thumbnail} />
              ) : (
                <FileText size={24} color="#4b5563" />
              )}
              <Text style={styles.fileName} numberOfLines={1}>
                {selectedFile.name}
              </Text>
            </View>
            <TouchableOpacity onPress={removeFile} disabled={loading}>
              <X size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={pickImage}
            disabled={loading}
          >
            <ImageIcon size={20} color="#4b5563" />
            <Text style={styles.actionButtonText}>Add Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={pickDocument}
            disabled={loading}
          >
            <FileText size={20} color="#4b5563" />
            <Text style={styles.actionButtonText}>Add PDF</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Select Language</Text>
          <View style={styles.languageContainer}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === 'english' && styles.languageButtonActive,
              ]}
              onPress={() => setLanguage('english')}
              disabled={loading}>
              <Text
                style={[
                  styles.languageButtonText,
                  language === 'english' && styles.languageButtonTextActive,
                ]}>
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === 'hindi' && styles.languageButtonActive,
              ]}
              onPress={() => setLanguage('hindi')}
              disabled={loading}>
              <Text
                style={[
                  styles.languageButtonText,
                  language === 'hindi' && styles.languageButtonTextActive,
                ]}>
                हिंदी
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Send size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.submitButtonText}>Get Legal Guidance</Text>
            </>
          )}
        </TouchableOpacity>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {answer && (
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
        )}

        <CreatorSignature />
      </View>
    </ScrollView>
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
});
