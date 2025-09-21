import React, { useState, useEffect } from 'react';
import { useVoice } from '../../contexts/VoiceContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  MicrophoneIcon, 
  SpeakerWaveIcon, 
  XMarkIcon,
  CommandLineIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { Button } from '../UI/Button';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceAssistant: React.FC = () => {
  const {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    processVoiceCommand,
    isVoiceEnabled
  } = useVoice();
  
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<Array<{
    type: 'user' | 'assistant';
    message: string;
    timestamp: Date;
  }>>([]);

  useEffect(() => {
    if (transcript && isListening) {
      // Add user message to conversation
      const userMessage = {
        type: 'user' as const,
        message: transcript,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, userMessage]);
      
      // Process the voice command
      handleVoiceCommand(transcript);
    }
  }, [transcript, isListening]);

  const handleVoiceCommand = async (command: string) => {
    if (!command.trim()) return;
    
    setIsProcessing(true);
    try {
      await processVoiceCommand(command);
      
      // Add assistant response to conversation
      const assistantMessage = {
        type: 'assistant' as const,
        message: 'I understand. Let me help you with that.',
        timestamp: new Date()
      };
      setConversation(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing voice command:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleListen = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak('Hello! How can I help you today?');
    }
  };

  const clearConversation = () => {
    setConversation([]);
  };

  if (!isVoiceEnabled) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40"
      >
        <MicrophoneIcon className="w-6 h-6" />
      </motion.button>

      {/* Voice Assistant Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <MicrophoneIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t('voice.assistant')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {isListening ? t('voice.listening') : 'Ready to help'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Conversation */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-96">
                {conversation.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Start a conversation with me!</p>
                    <p className="text-sm">Try saying "Help me create a product listing"</p>
                  </div>
                ) : (
                  conversation.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                        <span className="text-sm">Processing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant={isListening ? 'danger' : 'primary'}
                    onClick={handleListen}
                    disabled={isSpeaking}
                    className="flex items-center space-x-2"
                  >
                    <MicrophoneIcon className="w-4 h-4" />
                    <span>
                      {isListening ? t('voice.stopListening') : t('voice.startListening')}
                    </span>
                  </Button>

                  <Button
                    variant={isSpeaking ? 'danger' : 'outline'}
                    onClick={handleSpeak}
                    disabled={isListening}
                    className="flex items-center space-x-2"
                  >
                    <SpeakerWaveIcon className="w-4 h-4" />
                    <span>
                      {isSpeaking ? t('voice.stopSpeaking') : t('voice.speak')}
                    </span>
                  </Button>
                </div>

                <div className="mt-4 flex items-center justify-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearConversation}
                    className="text-gray-500"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speak('I can help you navigate the platform, create product listings, search for products, and manage your orders. What would you like to do?')}
                    className="text-gray-500"
                  >
                    Help
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceAssistant;
