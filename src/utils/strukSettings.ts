export interface StrukSettingsData {
  spk: {
    showHeader: boolean;
    headerText: string;
  };
  struk: {
    logo: {
      url: string;
      file: File | null;
    };
    showHeader: boolean;
    headerText: string;
    showBusinessInfo: boolean;
    businessInfo: {
      name: string;
      address: string;
      phone: string;
      website: string;
    };
    showFooter: boolean;
    footerText: string;
    showLunasLogo: boolean;
    lunasLogo: {
      url: string;
      file: File | null;
    };
  };
}

const defaultSettings: StrukSettingsData = {
  spk: {
    showHeader: true,
    headerText: 'REQUEST ORDER'
  },
  struk: {
    logo: {
      url: '',
      file: null
    },
    showHeader: true,
    headerText: 'Studio POS',
    showBusinessInfo: true,
    businessInfo: {
      name: 'STUDIO POS',
      address: 'Banda Aceh',
      phone: '085223202023',
      website: 'www.studiopos.com'
    },
    showFooter: true,
    footerText: 'Terima kasih atas kepercayaan Anda',
    showLunasLogo: true,
    lunasLogo: {
      url: '',
      file: null
    }
  }
};

export const getStrukSettings = (): StrukSettingsData => {
  try {
    const savedSettings = localStorage.getItem('strukSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // Deep merge to ensure all nested properties exist
      return {
        ...defaultSettings,
        ...parsed,
        struk: {
          ...defaultSettings.struk,
          ...parsed.struk,
          businessInfo: {
            ...defaultSettings.struk.businessInfo,
            ...parsed.struk?.businessInfo
          }
        }
      };
    }
  } catch (error) {
    console.error('Error loading struk settings:', error);
  }
  return defaultSettings;
};

export const saveStrukSettings = (settings: StrukSettingsData): void => {
  try {
    localStorage.setItem('strukSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving struk settings:', error);
  }
};

export const resetStrukSettings = (): StrukSettingsData => {
  try {
    localStorage.removeItem('strukSettings');
  } catch (error) {
    console.error('Error resetting struk settings:', error);
  }
  return defaultSettings;
};

// Sync functions for integrating with Nota settings
export const syncBusinessInfoToNota = (strukSettings: StrukSettingsData): boolean => {
  try {
    const notaSettings = JSON.parse(localStorage.getItem('notaSettings') || '{}');
    
    // Always sync if business info is enabled
    if (strukSettings.struk.showBusinessInfo) {
      const updatedNotaSettings = {
        ...notaSettings,
        businessInfo: {
          ...strukSettings.struk.businessInfo
        },
        header: {
          ...notaSettings.header,
          text: strukSettings.struk.businessInfo.name
        }
      };
      
      localStorage.setItem('notaSettings', JSON.stringify(updatedNotaSettings));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error syncing to nota settings:', error);
    return false;
  }
};

