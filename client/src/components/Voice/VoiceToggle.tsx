import React from 'react';
import { useVoice } from '../../contexts/VoiceContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { MicrophoneIcon, MicrophoneSlashIcon } from '@heroicons/react/24/outline';
import { Button } from '../UI/Button';

const VoiceToggle: React.FC = () => {
  const { isVoiceEnabled, toggleVoiceEnabled } = useVoice();
  const { t } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleVoiceEnabled}
      className="flex items-center space-x-2"
      title={isVoiceEnabled ? t('voice.disableVoice') : t('voice.enableVoice')}
    >
      {isVoiceEnabled ? (
        <MicrophoneIcon className="w-4 h-4 text-green-500" />
      ) : (
        <MicrophoneSlashIcon className="w-4 h-4 text-gray-400" />
      )}
      <span className="hidden sm:block">
        {isVoiceEnabled ? 'Voice On' : 'Voice Off'}
      </span>
    </Button>
  );
};

export default VoiceToggle;
