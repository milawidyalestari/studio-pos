/**
 * POS-Accounting Integration Service
 * 
 * Service untuk integrasi antara sistem POS dengan sistem akuntansi.
 * Menangani pencatatan transaksi penjualan, pelunasan piutang, dan pengeluaran.
 */

import { databaseService } from '@/services/databaseService';

export interface PaymentReceiptData {
  order_id: string;
  amount: number;
  payment_method: 'cash' | 'transfer' | 'credit';
  notes?: string;
  received_by?: string;
}

export interface ExpenseData {
  expense_account_code: string;
  amount: number;
  description: string;
  payment_method?: 'cash' | 'transfer';
  created_by?: string;
}

export class POSAccountingService {
  
  /**
   * Record payment receipt for outstanding receivables
   * Mencatat penerimaan pembayaran untuk piutang
   */
  async recordPaymentReceipt(data: PaymentReceiptData): Promise<{ data: string | null; error: any }> {
    try {
      const { data: result, error } = await supabase.rpc('record_payment_receipt', {
        p_order_id: data.order_id,
        p_amount: data.amount,
        p_payment_method: data.payment_method,
        p_notes: data.notes || null,
        p_received_by: data.received_by || null
      });

      if (error) {
        console.error('Error recording payment receipt:', error);
        return { data: null, error };
      }

      return { data: result, error: null };
    } catch (error) {
      console.error('Error in recordPaymentReceipt:', error);
      return { data: null, error };
    }
  }

  /**
   * Record expense transaction
   * Mencatat transaksi pengeluaran
   */
  async recordExpense(data: ExpenseData): Promise<{ data: string | null; error: any }> {
    try {
      const { data: result, error } = await supabase.rpc('record_expense', {
        p_expense_account_code: data.expense_account_code,
        p_amount: data.amount,
        p_description: data.description,
        p_payment_method: data.payment_method || 'cash',
        p_created_by: data.created_by || null
      });

      if (error) {
        console.error('Error recording expense:', error);
        return { data: null, error };
      }

      return { data: result, error: null };
    } catch (error) {
      console.error('Error in recordExpense:', error);
      return { data: null, error };
    }
  }

  /**
   * Get order journal entries
   * Mendapatkan journal entries yang terkait dengan order
   */
  async getOrderJournalEntries(orderId?: string): Promise<{ data: any[] | null; error: any }> {
    try {
      let query = supabase
        .from('v_order_journal_entries')
        .select('*')
        .order('order_date', { ascending: false });

      if (orderId) {
        query = query.eq('order_id', orderId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching order journal entries:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getOrderJournalEntries:', error);
      return { data: null, error };
    }
  }

  /**
   * Get sales summary
   * Mendapatkan ringkasan penjualan per periode
   */
  async getSalesSummary(startDate?: string, endDate?: string): Promise<{ data: any[] | null; error: any }> {
    try {
      let query = supabase
        .from('v_sales_summary')
        .select('*')
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }

      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching sales summary:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getSalesSummary:', error);
      return { data: null, error };
    }
  }

  /**
   * Get outstanding receivables
   * Mendapatkan daftar piutang yang belum dilunasi
   */
  async getOutstandingReceivables(): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('v_outstanding_receivables')
        .select('*')
        .order('days_outstanding', { ascending: false });

      if (error) {
        console.error('Error fetching outstanding receivables:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getOutstandingReceivables:', error);
      return { data: null, error };
    }
  }

  /**
   * Get cash flow by date range
   * Mendapatkan arus kas berdasarkan periode
   */
  async getCashFlow(startDate: string, endDate: string): Promise<{ data: any; error: any }> {
    try {
      // Get all journal entries for cash account within date range
      const { data: cashJournals, error: cashError } = await supabase
        .from('journal_entry_lines')
        .select(`
          *,
          journal_entries!inner(
            transaction_date,
            description,
            reference_type,
            status
          ),
          chart_of_accounts!inner(account_code, account_name)
        `)
        .eq('chart_of_accounts.account_code', '1110')
        .eq('journal_entries.status', 'posted')
        .gte('journal_entries.transaction_date', startDate)
        .lte('journal_entries.transaction_date', endDate);

      if (cashError) {
        console.error('Error fetching cash flow:', cashError);
        return { data: null, error: cashError };
      }

      // Calculate totals
      const cashIn = cashJournals
        ?.filter(j => j.debit_amount > 0)
        .reduce((sum, j) => sum + parseFloat(j.debit_amount), 0) || 0;

      const cashOut = cashJournals
        ?.filter(j => j.credit_amount > 0)
        .reduce((sum, j) => sum + parseFloat(j.credit_amount), 0) || 0;

      const netCashFlow = cashIn - cashOut;

      return {
        data: {
          cash_in: cashIn,
          cash_out: cashOut,
          net_cash_flow: netCashFlow,
          transactions: cashJournals
        },
        error: null
      };
    } catch (error) {
      console.error('Error in getCashFlow:', error);
      return { data: null, error };
    }
  }

  /**
   * Get account balance
   * Mendapatkan saldo akun tertentu
   */
  async getAccountBalance(accountCode: string): Promise<{ data: number | null; error: any }> {
    try {
      const { data: account, error: accountError } = await supabase
        .from('chart_of_accounts')
        .select('id, account_type')
        .eq('account_code', accountCode)
        .eq('is_active', true)
        .single();

      if (accountError || !account) {
        return { data: null, error: accountError || new Error('Account not found') };
      }

      // Get all posted journal entry lines for this account
      const { data: lines, error: linesError } = await supabase
        .from('journal_entry_lines')
        .select(`
          debit_amount,
          credit_amount,
          journal_entries!inner(status)
        `)
        .eq('account_id', account.id)
        .eq('journal_entries.status', 'posted');

      if (linesError) {
        return { data: null, error: linesError };
      }

      // Calculate balance based on account type
      const totalDebit = lines?.reduce((sum, line) => sum + parseFloat(line.debit_amount || '0'), 0) || 0;
      const totalCredit = lines?.reduce((sum, line) => sum + parseFloat(line.credit_amount || '0'), 0) || 0;

      let balance = 0;
      if (['asset', 'expense'].includes(account.account_type)) {
        balance = totalDebit - totalCredit;
      } else {
        balance = totalCredit - totalDebit;
      }

      return { data: balance, error: null };
    } catch (error) {
      console.error('Error in getAccountBalance:', error);
      return { data: null, error };
    }
  }

  /**
   * Verify journal entry balance
   * Memverifikasi keseimbangan jurnal entry
   */
  async verifyJournalBalance(journalEntryId: string): Promise<{ data: boolean | null; error: any }> {
    try {
      const { data, error } = await supabase.rpc('validate_journal_entry', {
        p_journal_entry_id: journalEntryId
      });

      if (error) {
        console.error('Error verifying journal balance:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in verifyJournalBalance:', error);
      return { data: null, error };
    }
  }
}

// Export singleton instance
export const posAccountingService = new POSAccountingService();

