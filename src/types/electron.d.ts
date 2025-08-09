declare global {
  interface Window {
    electronAPI: {
      database: {
        getInfo: () => Promise<{
          type: 'postgresql' | 'sqlite' | 'none';
          connected: boolean;
          currentTime?: string;
          error?: string;
        }>;
        query: (table: string, options?: any) => Promise<any[]>;
        create: (table: string, data: any) => Promise<any>;
        update: (table: string, id: string, data: any) => Promise<any>;
        delete: (table: string, id: string) => Promise<void>;
        transaction: (operations: any[]) => Promise<any[]>;
      };
      dialog: {
        showOpenDialog: (options: any) => Promise<{
          canceled: boolean;
          filePaths: string[];
        }>;
        showSaveDialog: (options: any) => Promise<{
          canceled: boolean;
          filePath?: string;
        }>;
      };
      app: {
        getVersion: () => string;
        getPlatform: () => string;
        isDev: () => boolean;
      };
    };
  }
}

export {};
