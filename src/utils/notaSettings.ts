export interface NotaSettingsData {
  header: {
    enabled: boolean;
    text: string;
    fontSize: number;
    fontWeight: string;
  };
  logo: {
    enabled: boolean;
    url: string;
    width: number;
    height: number;
    altText: string;
  };
  businessInfo: {
    name: string;
    address: string;
    phone: string;
    website: string;
  };
  footer: {
    enabled: boolean;
    text: string;
    fontSize: number;
    fontWeight: string;
  };
  stamp: {
    enabled: boolean;
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
    opacity: number;
    size: number;
    useImage: boolean;
    lunasImageUrl: string;
  };
  preview: {
    enabled: boolean;
    showTestData: boolean;
  };
}

const defaultSettings: NotaSettingsData = {
  header: {
    enabled: true,
    text: 'STUDIO POS',
    fontSize: 18,
    fontWeight: 'bold'
  },
  logo: {
    enabled: true,
    url: '',
    width: 80,
    height: 80,
    altText: 'Studio POS Logo'
  },
  businessInfo: {
    name: 'STUDIO POS',
    address: 'Banda Aceh',
    phone: '085223202023',
    website: 'www.studiopos.com'
  },
  footer: {
    enabled: true,
    text: 'Thank you for your order!',
    fontSize: 11,
    fontWeight: 'normal'
  },
  stamp: {
    enabled: true,
    position: 'top-right',
    opacity: 0.7,
    size: 120,
    useImage: false,
    lunasImageUrl: ''
  },
  preview: {
    enabled: true,
    showTestData: true
  }
};

export const getNotaSettings = (): NotaSettingsData => {
  try {
    const savedSettings = localStorage.getItem('notaSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      // Ensure all required properties exist by merging with defaults
      return { ...defaultSettings, ...parsedSettings };
    }
  } catch (error) {
    console.error('Error loading nota settings:', error);
    // If there's an error, return default settings
  }
  // Always return default settings as fallback
  return defaultSettings;
};

export const saveNotaSettings = (settings: NotaSettingsData): void => {
  try {
    localStorage.setItem('notaSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving nota settings:', error);
  }
};
