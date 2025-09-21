import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

interface LanguageContextType {
  currentLanguage: string;
  setCurrentLanguage: (language: string) => void;
  supportedLanguages: Language[];
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

// Translation keys
const translations: Record<string, Record<string, string>> = {
  en: {
    // Common
    'app.name': 'Artisan Marketplace',
    'app.tagline': 'Bridging Cultures Through Craft',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.price': 'Price',
    'common.quantity': 'Quantity',
    'common.total': 'Total',
    'common.subtotal': 'Subtotal',
    'common.tax': 'Tax',
    'common.shipping': 'Shipping',
    'common.discount': 'Discount',
    
    // Navigation
    'nav.home': 'Home',
    'nav.catalog': 'Catalog',
    'nav.artisan': 'Artisan',
    'nav.buyer': 'Buyer',
    'nav.dashboard': 'Dashboard',
    'nav.products': 'Products',
    'nav.orders': 'Orders',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.help': 'Help',
    'nav.logout': 'Logout',
    
    // Authentication
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.name': 'Name',
    'auth.phone': 'Phone',
    'auth.role': 'Role',
    'auth.artisan': 'Artisan',
    'auth.buyer': 'Buyer',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.rememberMe': 'Remember Me',
    'auth.loginSuccess': 'Login successful!',
    'auth.registerSuccess': 'Registration successful!',
    'auth.logoutSuccess': 'Logged out successfully',
    
    // Products
    'product.title': 'Product Title',
    'product.description': 'Description',
    'product.price': 'Price',
    'product.category': 'Category',
    'product.materials': 'Materials',
    'product.techniques': 'Techniques',
    'product.availability': 'Availability',
    'product.inStock': 'In Stock',
    'product.outOfStock': 'Out of Stock',
    'product.madeToOrder': 'Made to Order',
    'product.addToCart': 'Add to Cart',
    'product.buyNow': 'Buy Now',
    'product.viewDetails': 'View Details',
    'product.artisan': 'Artisan',
    'product.culturalSignificance': 'Cultural Significance',
    'product.dimensions': 'Dimensions',
    'product.weight': 'Weight',
    'product.colors': 'Colors',
    'product.tags': 'Tags',
    
    // AI Features
    'ai.generateListing': 'Generate AI Listing',
    'ai.analyzeImages': 'Analyze Images',
    'ai.generateStory': 'Generate Cultural Story',
    'ai.voiceDescription': 'Voice Description',
    'ai.uploadImages': 'Upload Images',
    'ai.dragDropImages': 'Drag and drop images here, or click to select',
    'ai.maxImages': 'Maximum 5 images allowed',
    'ai.supportedFormats': 'Supported formats: JPG, PNG, WebP',
    'ai.generating': 'Generating...',
    'ai.generationComplete': 'Generation complete!',
    'ai.qualityScore': 'Quality Score',
    'ai.authenticityScore': 'Authenticity Score',
    'ai.suggestedPrice': 'Suggested Price',
    'ai.seoKeywords': 'SEO Keywords',
    
    // Voice Assistant
    'voice.assistant': 'Voice Assistant',
    'voice.listening': 'Listening...',
    'voice.speaking': 'Speaking...',
    'voice.startListening': 'Start Listening',
    'voice.stopListening': 'Stop Listening',
    'voice.speak': 'Speak',
    'voice.stopSpeaking': 'Stop Speaking',
    'voice.enableVoice': 'Enable Voice Features',
    'voice.disableVoice': 'Disable Voice Features',
    'voice.voiceCommands': 'Voice Commands',
    'voice.help': 'Help',
    'voice.navigate': 'Navigate',
    'voice.createListing': 'Create Listing',
    'voice.search': 'Search',
    'voice.manageOrders': 'Manage Orders',
    
    // Market Intelligence
    'market.intelligence': 'Market Intelligence',
    'market.demandTrend': 'Demand Trend',
    'market.averagePrice': 'Average Price',
    'market.priceRange': 'Price Range',
    'market.topKeywords': 'Top Keywords',
    'market.seasonalTrends': 'Seasonal Trends',
    'market.competitorAnalysis': 'Competitor Analysis',
    'market.recommendations': 'Recommendations',
    'market.increasing': 'Increasing',
    'market.stable': 'Stable',
    'market.decreasing': 'Decreasing',
    
    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.overview': 'Overview',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.statistics': 'Statistics',
    'dashboard.totalProducts': 'Total Products',
    'dashboard.totalOrders': 'Total Orders',
    'dashboard.totalSales': 'Total Sales',
    'dashboard.rating': 'Rating',
    'dashboard.views': 'Views',
    'dashboard.favorites': 'Favorites',
    
    // Errors
    'error.network': 'Network error. Please check your connection.',
    'error.server': 'Server error. Please try again later.',
    'error.unauthorized': 'You are not authorized to perform this action.',
    'error.notFound': 'The requested resource was not found.',
    'error.validation': 'Please check your input and try again.',
    'error.upload': 'Failed to upload file. Please try again.',
    'error.payment': 'Payment failed. Please try again.',
    'error.order': 'Order processing failed. Please try again.',
  },
  hi: {
    // Common
    'app.name': 'कारीगर बाज़ार',
    'app.tagline': 'शिल्प के माध्यम से संस्कृतियों को जोड़ना',
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'एक त्रुटि हुई',
    'common.success': 'सफलता',
    'common.cancel': 'रद्द करें',
    'common.save': 'सहेजें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.view': 'देखें',
    'common.search': 'खोजें',
    'common.filter': 'फिल्टर',
    'common.sort': 'क्रमबद्ध करें',
    'common.price': 'कीमत',
    'common.quantity': 'मात्रा',
    'common.total': 'कुल',
    'common.subtotal': 'उप-योग',
    'common.tax': 'कर',
    'common.shipping': 'शिपिंग',
    'common.discount': 'छूट',
    
    // Navigation
    'nav.home': 'होम',
    'nav.catalog': 'कैटलॉग',
    'nav.artisan': 'कारीगर',
    'nav.buyer': 'खरीदार',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.products': 'उत्पाद',
    'nav.orders': 'ऑर्डर',
    'nav.profile': 'प्रोफाइल',
    'nav.settings': 'सेटिंग्स',
    'nav.help': 'मदद',
    'nav.logout': 'लॉगआउट',
    
    // Authentication
    'auth.login': 'लॉगिन',
    'auth.register': 'रजिस्टर',
    'auth.logout': 'लॉगआउट',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.confirmPassword': 'पासवर्ड की पुष्टि करें',
    'auth.name': 'नाम',
    'auth.phone': 'फोन',
    'auth.role': 'भूमिका',
    'auth.artisan': 'कारीगर',
    'auth.buyer': 'खरीदार',
    'auth.forgotPassword': 'पासवर्ड भूल गए?',
    'auth.rememberMe': 'मुझे याद रखें',
    'auth.loginSuccess': 'लॉगिन सफल!',
    'auth.registerSuccess': 'रजिस्ट्रेशन सफल!',
    'auth.logoutSuccess': 'सफलतापूर्वक लॉगआउट',
    
    // Products
    'product.title': 'उत्पाद शीर्षक',
    'product.description': 'विवरण',
    'product.price': 'कीमत',
    'product.category': 'श्रेणी',
    'product.materials': 'सामग्री',
    'product.techniques': 'तकनीक',
    'product.availability': 'उपलब्धता',
    'product.inStock': 'स्टॉक में',
    'product.outOfStock': 'स्टॉक खत्म',
    'product.madeToOrder': 'ऑर्डर पर बनाएं',
    'product.addToCart': 'कार्ट में जोड़ें',
    'product.buyNow': 'अभी खरीदें',
    'product.viewDetails': 'विवरण देखें',
    'product.artisan': 'कारीगर',
    'product.culturalSignificance': 'सांस्कृतिक महत्व',
    'product.dimensions': 'आयाम',
    'product.weight': 'वजन',
    'product.colors': 'रंग',
    'product.tags': 'टैग',
    
    // AI Features
    'ai.generateListing': 'AI सूची उत्पन्न करें',
    'ai.analyzeImages': 'छवियों का विश्लेषण करें',
    'ai.generateStory': 'सांस्कृतिक कहानी उत्पन्न करें',
    'ai.voiceDescription': 'आवाज विवरण',
    'ai.uploadImages': 'छवियां अपलोड करें',
    'ai.dragDropImages': 'छवियों को यहां खींचें या चुनने के लिए क्लिक करें',
    'ai.maxImages': 'अधिकतम 5 छवियां अनुमतित',
    'ai.supportedFormats': 'समर्थित प्रारूप: JPG, PNG, WebP',
    'ai.generating': 'उत्पन्न हो रहा है...',
    'ai.generationComplete': 'उत्पादन पूरा!',
    'ai.qualityScore': 'गुणवत्ता स्कोर',
    'ai.authenticityScore': 'प्रामाणिकता स्कोर',
    'ai.suggestedPrice': 'सुझाई गई कीमत',
    'ai.seoKeywords': 'SEO कीवर्ड',
    
    // Voice Assistant
    'voice.assistant': 'आवाज सहायक',
    'voice.listening': 'सुन रहा है...',
    'voice.speaking': 'बोल रहा है...',
    'voice.startListening': 'सुनना शुरू करें',
    'voice.stopListening': 'सुनना बंद करें',
    'voice.speak': 'बोलें',
    'voice.stopSpeaking': 'बोलना बंद करें',
    'voice.enableVoice': 'आवाज सुविधाएं सक्षम करें',
    'voice.disableVoice': 'आवाज सुविधाएं अक्षम करें',
    'voice.voiceCommands': 'आवाज कमांड',
    'voice.help': 'मदद',
    'voice.navigate': 'नेविगेट करें',
    'voice.createListing': 'सूची बनाएं',
    'voice.search': 'खोजें',
    'voice.manageOrders': 'ऑर्डर प्रबंधित करें',
    
    // Market Intelligence
    'market.intelligence': 'बाजार बुद्धिमत्ता',
    'market.demandTrend': 'मांग प्रवृत्ति',
    'market.averagePrice': 'औसत कीमत',
    'market.priceRange': 'कीमत सीमा',
    'market.topKeywords': 'शीर्ष कीवर्ड',
    'market.seasonalTrends': 'मौसमी प्रवृत्तियां',
    'market.competitorAnalysis': 'प्रतिस्पर्धी विश्लेषण',
    'market.recommendations': 'सिफारिशें',
    'market.increasing': 'बढ़ रहा',
    'market.stable': 'स्थिर',
    'market.decreasing': 'घट रहा',
    
    // Dashboard
    'dashboard.welcome': 'स्वागत है',
    'dashboard.overview': 'अवलोकन',
    'dashboard.recentActivity': 'हाल की गतिविधि',
    'dashboard.quickActions': 'त्वरित कार्य',
    'dashboard.statistics': 'आंकड़े',
    'dashboard.totalProducts': 'कुल उत्पाद',
    'dashboard.totalOrders': 'कुल ऑर्डर',
    'dashboard.totalSales': 'कुल बिक्री',
    'dashboard.rating': 'रेटिंग',
    'dashboard.views': 'व्यू',
    'dashboard.favorites': 'पसंदीदा',
    
    // Errors
    'error.network': 'नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।',
    'error.server': 'सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें।',
    'error.unauthorized': 'आपको इस कार्य को करने की अनुमति नहीं है।',
    'error.notFound': 'अनुरोधित संसाधन नहीं मिला।',
    'error.validation': 'कृपया अपना इनपुट जांचें और पुनः प्रयास करें।',
    'error.upload': 'फ़ाइल अपलोड करने में विफल। कृपया पुनः प्रयास करें।',
    'error.payment': 'भुगतान विफल। कृपया पुनः प्रयास करें।',
    'error.order': 'ऑर्डर प्रोसेसिंग विफल। कृपया पुनः प्रयास करें।',
  }
};

const supportedLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' }
];

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Load language from localStorage or detect from browser
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && supportedLanguages.find(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0];
      const supportedLang = supportedLanguages.find(lang => lang.code === browserLang);
      if (supportedLang) {
        setCurrentLanguage(browserLang);
      }
    }
  }, []);

  const handleSetCurrentLanguage = (language: string) => {
    setCurrentLanguage(language);
    localStorage.setItem('language', language);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[currentLanguage]?.[key] || translations['en'][key] || key;
    
    // Replace parameters in translation
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(`{${paramKey}}`, String(value));
      });
    }
    
    return translation;
  };

  const value: LanguageContextType = {
    currentLanguage,
    setCurrentLanguage: handleSetCurrentLanguage,
    supportedLanguages,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
