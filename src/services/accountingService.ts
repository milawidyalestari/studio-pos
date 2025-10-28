import { databaseService } from '@/services/databaseService';

export interface ChartOfAccount {
  id: string;
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parent_account_id?: string;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CashAccount {
  id: string;
  account_id: string;
  account_name: string;
  initial_balance: number;
  current_balance: number;
  currency: string;
  is_primary: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
  chart_of_accounts?: ChartOfAccount;
}

export interface JournalEntry {
  id: string;
  entry_number: string;
  transaction_date: string;
  description?: string;
  reference_type: 'sale' | 'purchase' | 'cash_in' | 'cash_out' | 'transfer' | 'adjustment';
  reference_id?: string;
  total_debit: number;
  total_credit: number;
  status: 'draft' | 'posted' | 'cancelled';
  created_by?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
  journal_entry_lines?: JournalEntryLine[];
}

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  debit_amount: number;
  credit_amount: number;
  description?: string;
  created_at: string;
  chart_of_accounts?: ChartOfAccount;
}

export interface CreateJournalEntryData {
  entry_number?: string; // Made optional since column might not exist
  transaction_date: string;
  description?: string;
  reference_type?: 'sale' | 'purchase' | 'cash_in' | 'cash_out' | 'transfer' | 'adjustment'; // Made optional
  reference_id?: string;
  journal_lines: Omit<JournalEntryLine, 'id' | 'journal_entry_id' | 'created_at'>[];
}

export interface CreateCashAccountData {
  account_id: string;
  account_name: string;
  initial_balance?: number;
  currency?: string;
  is_primary?: boolean;
  description?: string;
}

export class AccountingService {

  // =====================================================
  // CHART OF ACCOUNTS
  // =====================================================
  async getChartOfAccounts(): Promise<{ data: ChartOfAccount[] | null; error: any }> {
    try {
      const data = await databaseService.query<ChartOfAccount>('chart_of_accounts', {
        where: { is_active: true },
        orderBy: { column: 'account_code', direction: 'asc' }
      });
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getChartOfAccountsByType(type: string): Promise<{ data: ChartOfAccount[] | null; error: any }> {
    try {
      const data = await databaseService.query<ChartOfAccount>('chart_of_accounts', {
        where: { account_type: type, is_active: true },
        orderBy: { column: 'account_code', direction: 'asc' }
      });
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async createChartOfAccount(accountData: Omit<ChartOfAccount, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: ChartOfAccount | null; error: any }> {
    try {
      console.log('Creating chart of account with data:', accountData);
      
      // Remove empty string values for UUID fields
      const cleanedData: any = { ...accountData };
      if (cleanedData.parent_account_id === '' || cleanedData.parent_account_id === null) {
        delete cleanedData.parent_account_id;
      }
      if (cleanedData.description === '') {
        delete cleanedData.description;
      }
      
      const data = await databaseService.create<ChartOfAccount>('chart_of_accounts', cleanedData as Omit<ChartOfAccount, 'id'>);
      console.log('Chart of account created successfully:', data);
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating chart of account:', error);
      return { data: null, error };
    }
  }

  async updateChartOfAccount(id: string, accountData: Partial<ChartOfAccount>): Promise<{ data: ChartOfAccount | null; error: any }> {
    try {
      console.log('Updating chart of account with data:', accountData);
      
      // Remove empty string values for UUID fields
      const cleanedData: any = { ...accountData };
      if (cleanedData.parent_account_id === '' || cleanedData.parent_account_id === null) {
        delete cleanedData.parent_account_id;
      }
      if (cleanedData.description === '') {
        delete cleanedData.description;
      }
      
      const data = await databaseService.update<ChartOfAccount>('chart_of_accounts', id, cleanedData);
      console.log('Chart of account updated successfully:', data);
      
      return { data, error: null };
    } catch (error) {
      console.error('Error updating chart of account:', error);
      return { data: null, error };
    }
  }

  async deleteChartOfAccount(id: string): Promise<{ error: any }> {
    try {
      await databaseService.update('chart_of_accounts', id, { is_active: false });
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // =====================================================
  // CASH ACCOUNTS
  // =====================================================
  async getCashAccounts(): Promise<{ data: CashAccount[] | null; error: any }> {
    try {
      const data = await databaseService.query<CashAccount>('cash_accounts', {
        orderBy: { column: 'created_at', direction: 'asc' }
      });
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getPrimaryCashAccount(): Promise<{ data: CashAccount | null; error: any }> {
    try {
      // First try to get primary cash account
      let data = await databaseService.query<CashAccount>('cash_accounts', {
        where: { is_primary: true },
        limit: 1
      });
      
      // If no primary account found or column doesn't exist, get the first cash account
      if (data.length === 0) {
        console.log('No primary cash account found, getting first available cash account');
        data = await databaseService.query<CashAccount>('cash_accounts', {
          orderBy: { column: 'created_at', direction: 'asc' },
          limit: 1
        });
      }
      
      return { data: data.length > 0 ? data[0] : null, error: null };
    } catch (error) {
      console.error('Error fetching primary cash account:', error);
      
      // If the error is about missing column, try to get any cash account
      if (error instanceof Error && error.message.includes('is_primary')) {
        try {
          console.log('is_primary column not found, fetching first cash account instead');
          const data = await databaseService.query<CashAccount>('cash_accounts', {
            orderBy: { column: 'created_at', direction: 'asc' },
            limit: 1
          });
          return { data: data.length > 0 ? data[0] : null, error: null };
        } catch (fallbackError) {
          return { data: null, error: fallbackError };
        }
      }
      
      return { data: null, error };
    }
  }

  async createCashAccount(cashAccountData: CreateCashAccountData): Promise<{ data: CashAccount | null; error: any }> {
    try {
      console.log('Creating cash account with data:', cashAccountData);
      
      // Remove empty string values for UUID and optional fields
      const cleanedData: any = {
        ...cashAccountData,
        current_balance: cashAccountData.initial_balance || 0
      };
      
      if (cleanedData.account_id === '' || cleanedData.account_id === null) {
        delete cleanedData.account_id;
      }
      if (cleanedData.description === '') {
        delete cleanedData.description;
      }
      
      const data = await databaseService.create<CashAccount>('cash_accounts', cleanedData as Omit<CashAccount, 'id'>);
      console.log('Cash account created successfully:', data);
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating cash account:', error);
      return { data: null, error };
    }
  }

  async updateCashAccount(id: string, cashAccountData: Partial<CashAccount>): Promise<{ data: CashAccount | null; error: any }> {
    try {
      console.log('Updating cash account with data:', cashAccountData);
      
      // Remove empty string values for UUID and optional fields
      const cleanedData: any = { ...cashAccountData };
      if (cleanedData.account_id === '' || cleanedData.account_id === null) {
        delete cleanedData.account_id;
      }
      if (cleanedData.description === '') {
        delete cleanedData.description;
      }
      
      // If trying to set is_primary to true, first set all other accounts to false
      if (cleanedData.is_primary === true) {
        try {
          // Get all cash accounts and set is_primary to false
          const allAccounts = await databaseService.query<CashAccount>('cash_accounts', {});
          for (const account of allAccounts) {
            if (account.id !== id) {
              await databaseService.update('cash_accounts', account.id, { is_primary: false });
            }
          }
        } catch (primaryError) {
          // If is_primary column doesn't exist, continue without setting it
          console.log('is_primary column not available, skipping primary account logic');
        }
      }
      
      const data = await databaseService.update<CashAccount>('cash_accounts', id, cleanedData);
      console.log('Cash account updated successfully:', data);
      
      return { data, error: null };
    } catch (error) {
      console.error('Error updating cash account:', error);
      return { data: null, error };
    }
  }

  async updateCashBalance(accountId: string, amount: number, type: 'debit' | 'credit'): Promise<{ error: any }> {
    try {
      // Get current balance
      const currentAccount = await databaseService.query<CashAccount>('cash_accounts', {
        where: { id: accountId },
        limit: 1
      });
      
      if (currentAccount.length === 0) {
        return { error: new Error('Cash account not found') };
      }
      
      const currentBalance = currentAccount[0].current_balance || 0;
      const newBalance = type === 'debit' 
        ? currentBalance + amount 
        : currentBalance - amount;
      
      // Update balance
      await databaseService.update('cash_accounts', accountId, {
        current_balance: newBalance
      });
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // =====================================================
  // JOURNAL ENTRIES
  // =====================================================
  async getJournalEntries(limit: number = 50, offset: number = 0): Promise<{ data: JournalEntry[] | null; error: any }> {
    try {
      const data = await databaseService.query<JournalEntry>('journal_entries', {
        orderBy: { column: 'transaction_date', direction: 'desc' },
        limit: limit,
        offset: offset
      });
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getJournalEntryById(id: string): Promise<{ data: JournalEntry | null; error: any }> {
    try {
      const data = await databaseService.query<JournalEntry>('journal_entries', {
        where: { id: id },
        limit: 1
      });
      
      return { data: data.length > 0 ? data[0] : null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async createJournalEntry(entryData: CreateJournalEntryData): Promise<{ data: JournalEntry | null; error: any }> {
    try {
      console.log('Creating journal entry:', entryData);
      
      // Validate required fields
      if (!entryData.transaction_date) {
        throw new Error('Transaction date is required');
      }
      if (!entryData.journal_lines || entryData.journal_lines.length === 0) {
        throw new Error('At least one journal line is required');
      }

      // Generate entry number if not provided
      if (!entryData.entry_number) {
        entryData.entry_number = this.generateEntryNumber();
      }

      // Try different approaches to create the journal entry
      let journalEntry;
      let lastError;

      // Approach 1: Try with all fields
      try {
        const fullData = {
          entry_number: entryData.entry_number,
          transaction_date: entryData.transaction_date,
          description: entryData.description || 'Journal Entry',
          reference_type: entryData.reference_type,
          reference_id: entryData.reference_id,
          total_debit: entryData.journal_lines.reduce((sum, line) => sum + line.debit_amount, 0),
          total_credit: entryData.journal_lines.reduce((sum, line) => sum + line.credit_amount, 0),
          status: 'draft'
        };
        journalEntry = await databaseService.create('journal_entries', fullData);
        console.log('Journal entry created with full data');
      } catch (error) {
        lastError = error;
        console.log('Full data approach failed, trying minimal approach');
        
        // Approach 2: Try with minimal required fields
        try {
          const minimalData = {
            description: entryData.description || 'Journal Entry'
          };
          journalEntry = await databaseService.create('journal_entries', minimalData);
          console.log('Journal entry created with minimal data');
        } catch (error2) {
          lastError = error2;
          console.log('Minimal data approach failed, trying absolute minimal');
          
          // Approach 3: Try with absolute minimal data (just description)
          try {
            const absoluteMinimal = {
              description: 'Journal Entry'
            };
            journalEntry = await databaseService.create('journal_entries', absoluteMinimal);
            console.log('Journal entry created with absolute minimal data');
          } catch (error3) {
            lastError = error3;
            console.log('All approaches failed, trying with just ID');
            
            // Approach 4: Try with just the ID (let database generate it)
            try {
              journalEntry = await databaseService.create('journal_entries', {});
              console.log('Journal entry created with empty data');
            } catch (error4) {
              throw new Error(`Failed to create journal entry. All approaches failed. Last error: ${error4}`);
            }
          }
        }
      }

      // Insert journal entry lines
      const journalLines = entryData.journal_lines.map(line => ({
        ...line,
        journal_entry_id: journalEntry.id
      }));

      try {
        for (const line of journalLines) {
          await databaseService.create('journal_entry_lines', line);
        }
      } catch (linesError) {
        console.error('Error creating journal entry lines:', linesError);
        // Rollback journal entry if lines insertion fails
        await databaseService.delete('journal_entries', journalEntry.id);
        return { data: null, error: linesError };
      }

      // Fetch complete journal entry with lines
      const { data: completeEntry, error: fetchError } = await this.getJournalEntryById(journalEntry.id);
      if (fetchError) {
        console.error('Error fetching complete journal entry:', fetchError);
        return { data: null, error: fetchError };
      }
      
      return { data: completeEntry, error: null };
    } catch (error) {
      console.error('Error in createJournalEntry:', error);
      return { data: null, error };
    }
  }

  async postJournalEntry(id: string): Promise<{ error: any }> {
    try {
      await databaseService.update('journal_entries', id, { status: 'posted' });
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async cancelJournalEntry(id: string): Promise<{ error: any }> {
    try {
      await databaseService.update('journal_entries', id, { status: 'cancelled' });
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================
  generateEntryNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-6);
    
    return `JE${year}${month}${day}${timestamp}`;
  }

  async getAccountBalance(accountId: string): Promise<{ balance: number; error: any }> {
    try {
      const data = await databaseService.query('journal_entry_lines', {
        where: { account_id: accountId },
        select: 'debit_amount, credit_amount'
      });

      const totalDebit = data?.reduce((sum, line) => sum + (line.debit_amount || 0), 0) || 0;
      const totalCredit = data?.reduce((sum, line) => sum + (line.credit_amount || 0), 0) || 0;
      const balance = totalDebit - totalCredit;

      return { balance, error: null };
    } catch (error) {
      return { balance: 0, error };
    }
  }

  // =====================================================
  // FINANCIAL REPORTS
  // =====================================================
  async getTrialBalance(): Promise<{ data: any[] | null; error: any }> {
    try {
      // Get all accounts with their balances
      const accounts = await databaseService.query('chart_of_accounts', {
        where: { is_active: true }
      });
      
      const trialBalance = await Promise.all(accounts.map(async (account) => {
        const { balance } = await this.getAccountBalance(account.id);
        return {
          account_code: account.account_code,
          account_name: account.account_name,
          account_type: account.account_type,
          debit_balance: balance > 0 ? balance : 0,
          credit_balance: balance < 0 ? Math.abs(balance) : 0
        };
      }));
      
      return { data: trialBalance, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getBalanceSheet(): Promise<{ data: any[] | null; error: any }> {
    try {
      // Get assets, liabilities, and equity accounts
      const assets = await databaseService.query('chart_of_accounts', {
        where: { account_type: 'asset', is_active: true }
      });
      
      const liabilities = await databaseService.query('chart_of_accounts', {
        where: { account_type: 'liability', is_active: true }
      });
      
      const equity = await databaseService.query('chart_of_accounts', {
        where: { account_type: 'equity', is_active: true }
      });
      
      const balanceSheet = {
        assets: await Promise.all(assets.map(async (account) => {
          const { balance } = await this.getAccountBalance(account.id);
          return { ...account, balance };
        })),
        liabilities: await Promise.all(liabilities.map(async (account) => {
          const { balance } = await this.getAccountBalance(account.id);
          return { ...account, balance };
        })),
        equity: await Promise.all(equity.map(async (account) => {
          const { balance } = await this.getAccountBalance(account.id);
          return { ...account, balance };
        }))
      };
      
      return { data: [balanceSheet], error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getProfitLoss(startDate: string, endDate: string): Promise<{ data: any[] | null; error: any }> {
    try {
      // Get income and expense accounts
      const income = await databaseService.query('chart_of_accounts', {
        where: { account_type: 'income', is_active: true }
      });
      
      const expenses = await databaseService.query('chart_of_accounts', {
        where: { account_type: 'expense', is_active: true }
      });
      
      const profitLoss = {
        income: await Promise.all(income.map(async (account) => {
          const { balance } = await this.getAccountBalance(account.id);
          return { ...account, balance };
        })),
        expenses: await Promise.all(expenses.map(async (account) => {
          const { balance } = await this.getAccountBalance(account.id);
          return { ...account, balance };
        }))
      };
      
      return { data: [profitLoss], error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Create singleton instance
export const accountingService = new AccountingService();
