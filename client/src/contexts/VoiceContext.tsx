import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSpeechRecognition, useSpeechSynthesis } from 'react-speech-kit';
import { voiceAPI } from '../services/api';
import toast from 'react-hot-toast';

interface VoiceContextType {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  processVoiceCommand: (command: string) => Promise<void>;
  supportedLanguages: Language[];
  currentLanguage: string;
  setCurrentLanguage: (language: string) => void;
  isVoiceEnabled: boolean;
  toggleVoiceEnabled: () => void;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};

interface VoiceProviderProps {
  children: ReactNode;
}

export const VoiceProvider: React.FC<VoiceProviderProps> = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState<Language[]>([]);

  const { listen, listening, stop: stopListening } = useSpeechRecognition({
    onResult: (result: string) => {
      setTranscript(result);
    },
    onEnd: () => {
      setIsListening(false);
    }
  });

  const { speak: speakText, speaking, cancel: stopSpeaking } = useSpeechSynthesis({
    onEnd: () => {
      setIsSpeaking(false);
    }
  });

  useEffect(() => {
    setIsListening(listening);
  }, [listening]);

  useEffect(() => {
    setIsSpeaking(speaking);
  }, [speaking]);

  useEffect(() => {
    // Load supported languages
    loadSupportedLanguages();
    
    // Check if voice is enabled in localStorage
    const voiceEnabled = localStorage.getItem('voiceEnabled') === 'true';
    setIsVoiceEnabled(voiceEnabled);
  }, []);

  const loadSupportedLanguages = async () => {
    try {
      const response = await voiceAPI.getLanguages();
      if (response.success) {
        setSupportedLanguages(response.data.languages);
      }
    } catch (error) {
      console.error('Failed to load supported languages:', error);
    }
  };

  const startListening = () => {
    if (!isVoiceEnabled) {
      toast.error('Voice features are disabled');
      return;
    }

    try {
      listen({ lang: currentLanguage });
      toast.success('Listening...');
    } catch (error) {
      console.error('Failed to start listening:', error);
      toast.error('Failed to start voice recognition');
    }
  };

  const stopListeningHandler = () => {
    stopListening();
    setIsListening(false);
  };

  const speak = (text: string) => {
    if (!isVoiceEnabled) {
      toast.error('Voice features are disabled');
      return;
    }

    try {
      speakText({
        text,
        voice: getVoiceForLanguage(currentLanguage),
        rate: 0.9,
        pitch: 1.0
      });
    } catch (error) {
      console.error('Failed to speak:', error);
      toast.error('Failed to speak text');
    }
  };

  const stopSpeakingHandler = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  const processVoiceCommand = async (command: string) => {
    try {
      const response = await voiceAPI.processCommand(command, currentLanguage);
      if (response.success && response.data.actions) {
        // Handle voice actions
        handleVoiceActions(response.data.actions);
      }
    } catch (error) {
      console.error('Failed to process voice command:', error);
      toast.error('Failed to process voice command');
    }
  };

  const handleVoiceActions = (actions: any[]) => {
    actions.forEach(action => {
      switch (action.type) {
        case 'navigate':
          // Handle navigation
          if (action.parameters.path) {
            window.location.href = action.parameters.path;
          }
          break;
        case 'create_listing':
          // Navigate to product creation
          window.location.href = '/artisan/products/create';
          break;
        case 'search':
          // Handle search
          if (action.parameters.query) {
            window.location.href = `/catalog?search=${encodeURIComponent(action.parameters.query)}`;
          }
          break;
        case 'help':
          // Show help
          speak('I can help you navigate the platform, create product listings, search for products, and manage your orders. What would you like to do?');
          break;
        default:
          console.log('Unknown action type:', action.type);
      }
    });
  };

  const getVoiceForLanguage = (languageCode: string) => {
    const voiceMap: Record<string, string> = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'te': 'te-IN',
      'mr': 'mr-IN',
      'ta': 'ta-IN',
      'ur': 'ur-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'or': 'or-IN',
      'pa': 'pa-IN',
      'as': 'as-IN',
      'ml': 'ml-IN'
    };
    return voiceMap[languageCode] || 'en-US';
  };

  const toggleVoiceEnabled = () => {
    const newValue = !isVoiceEnabled;
    setIsVoiceEnabled(newValue);
    localStorage.setItem('voiceEnabled', newValue.toString());
    
    if (newValue) {
      toast.success('Voice features enabled');
    } else {
      toast.success('Voice features disabled');
      if (isListening) {
        stopListeningHandler();
      }
      if (isSpeaking) {
        stopSpeakingHandler();
      }
    }
  };

  const value: VoiceContextType = {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening: stopListeningHandler,
    speak,
    stopSpeaking: stopSpeakingHandler,
    processVoiceCommand,
    supportedLanguages,
    currentLanguage,
    setCurrentLanguage,
    isVoiceEnabled,
    toggleVoiceEnabled
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
};
