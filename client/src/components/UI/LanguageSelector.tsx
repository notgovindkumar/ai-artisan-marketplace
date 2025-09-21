import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';

const LanguageSelector: React.FC = () => {
  const { currentLanguage, setCurrentLanguage, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = supportedLanguages.find(lang => lang.code === currentLanguage) || supportedLanguages[0];

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <span className="text-sm font-medium">{currentLang?.nativeName || 'EN'}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {supportedLanguages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                language.code === currentLanguage ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
              }`}
            >
              <div>
                <div className="font-medium">{language.nativeName}</div>
                <div className="text-xs text-gray-500">{language.name}</div>
              </div>
              {language.code === currentLanguage && (
                <CheckIcon className="w-4 h-4 text-primary-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
