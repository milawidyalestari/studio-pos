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
  footer: {
    enabled: boolean;
    text: string;
    fontSize: number;
    fontWeight: string;
  };
  businessInfo: {
    name: string;
    address: string;
    phone: string;
    website: string;
  };
}

const defaultSettings: NotaSettingsData = {
  header: {
    enabled: true,
    text: 'STUDIO POS',
    fontSize: 16,
    fontWeight: 'bold'
  },
  logo: {
    enabled: true,
    url: '',
    width: 80,
    height: 80,
    altText: 'Studio POS Logo'
  },
  footer: {
    enabled: true,
    text: 'Thank you for your order!',
    fontSize: 11,
    fontWeight: 'normal'
  },
  businessInfo: {
    name: 'STUDIO POS',
    address: 'Banda Aceh',
    phone: '085223202023',
    website: 'www.studiopos.com'
  }
};

export const getNotaSettings = (): NotaSettingsData => {
  try {
    const savedSettings = localStorage.getItem('notaSettings');
    if (savedSettings) {
      return { ...defaultSettings, ...JSON.parse(savedSettings) };
    }
  } catch (error) {
    console.error('Error loading nota settings:', error);
  }
  return defaultSettings;
};

export const saveNotaSettings = (settings: NotaSettingsData): void => {
  try {
    localStorage.setItem('notaSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving nota settings:', error);
  }
};
