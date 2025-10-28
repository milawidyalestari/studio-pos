/**
 * Payment Method Account Service
 * 
 * Service untuk mengelola mapping tipe pembayaran ke akun akuntansi
 */

import { databaseService } from '@/services/databaseService';

export interface PaymentMethodAccount {
  id: string;
  payment_method: string;
  account_id: string;
  account_code: string;
  account_name: string;
  is_active: boolean;
  description?: string;
  account_type?: string;
  parent_account_id?: string;
  
  // Debit account details
  debit_account_id?: string;
  debit_account_code?: string;
  debit_account_name?: string;
  debit_account_type?: string;
  
  // Credit account details
  credit_account_id?: string;
  credit_account_code?: string;
  credit_account_name?: string;
  credit_account_type?: string;
  
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentMethodAccountData {
  payment_method: string;
  debit_account_code: string;
  credit_account_code: string;
  description?: string;
}

export interface UpdatePaymentMethodAccountData {
  debit_account_code: string;
  credit_account_code: string;
  description?: string;
}

export class PaymentMethodAccountService {
  
  /**
   * Get all payment method accounts
   */
  async getPaymentMethodAccounts(): Promise<{ data: PaymentMethodAccount[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('v_payment_method_accounts')
        .select('*')
        .order('payment_method');

      if (error) {
        console.error('Error fetching payment method accounts:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getPaymentMethodAccounts:', error);
      return { data: null, error };
    }
  }

  /**
   * Get payment method account by payment method
   */
  async getPaymentMethodAccount(paymentMethod: string): Promise<{ data: PaymentMethodAccount | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('v_payment_method_accounts')
        .select('*')
        .eq('payment_method', paymentMethod)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching payment method account:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getPaymentMethodAccount:', error);
      return { data: null, error };
    }
  }

  /**
   * Create new payment method account mapping
   */
  async createPaymentMethodAccount(data: CreatePaymentMethodAccountData): Promise<{ data: PaymentMethodAccount | null; error: any }> {
    try {
      const { data: result, error } = await supabase.rpc('update_payment_method_account', {
        p_payment_method: data.payment_method,
        p_debit_account_code: data.debit_account_code,
        p_credit_account_code: data.credit_account_code,
        p_description: data.description || null
      });

      if (error) {
        console.error('Error creating payment method account:', error);
        return { data: null, error };
      }

      // Fetch the created record
      const { data: created, error: fetchError } = await this.getPaymentMethodAccount(data.payment_method);
      return { data: created, error: fetchError };
    } catch (error) {
      console.error('Error in createPaymentMethodAccount:', error);
      return { data: null, error };
    }
  }

  /**
   * Update payment method account mapping
   */
  async updatePaymentMethodAccount(paymentMethod: string, data: UpdatePaymentMethodAccountData): Promise<{ data: PaymentMethodAccount | null; error: any }> {
    try {
      const { data: result, error } = await supabase.rpc('update_payment_method_account', {
        p_payment_method: paymentMethod,
        p_debit_account_code: data.debit_account_code,
        p_credit_account_code: data.credit_account_code,
        p_description: data.description || null
      });

      if (error) {
        console.error('Error updating payment method account:', error);
        return { data: null, error };
      }

      // Fetch the updated record
      const { data: updated, error: fetchError } = await this.getPaymentMethodAccount(paymentMethod);
      return { data: updated, error: fetchError };
    } catch (error) {
      console.error('Error in updatePaymentMethodAccount:', error);
      return { data: null, error };
    }
  }

  /**
   * Toggle active status of payment method account
   */
  async togglePaymentMethodAccountStatus(paymentMethod: string): Promise<{ data: PaymentMethodAccount | null; error: any }> {
    try {
      // First get current status
      const { data: current, error: fetchError } = await this.getPaymentMethodAccount(paymentMethod);
      if (fetchError || !current) {
        return { data: null, error: fetchError || new Error('Payment method not found') };
      }

      // Toggle status
      const { data, error } = await supabase
        .from('payment_method_accounts')
        .update({ 
          is_active: !current.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('payment_method', paymentMethod)
        .select()
        .single();

      if (error) {
        console.error('Error toggling payment method account status:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in togglePaymentMethodAccountStatus:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete payment method account mapping
   */
  async deletePaymentMethodAccount(paymentMethod: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('payment_method_accounts')
        .delete()
        .eq('payment_method', paymentMethod);

      if (error) {
        console.error('Error deleting payment method account:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in deletePaymentMethodAccount:', error);
      return { error };
    }
  }

  /**
   * Get available payment methods (not yet mapped)
   */
  async getAvailablePaymentMethods(): Promise<{ data: string[] | null; error: any }> {
    try {
      // Get all possible payment methods from orders
      const { data: orderMethods, error: orderError } = await supabase
        .from('orders')
        .select('payment_type')
        .not('payment_type', 'is', null);

      if (orderError) {
        console.error('Error fetching order payment methods:', orderError);
        return { data: null, error: orderError };
      }

      // Get already mapped payment methods
      const { data: mappedMethods, error: mappedError } = await supabase
        .from('payment_method_accounts')
        .select('payment_method');

      if (mappedError) {
        console.error('Error fetching mapped payment methods:', mappedError);
        return { data: null, error: mappedError };
      }

      // Extract unique payment methods from orders
      const allMethods = new Set(orderMethods?.map(o => o.payment_type).filter(Boolean) || []);
      
      // Remove already mapped methods
      const mappedSet = new Set(mappedMethods?.map(m => m.payment_method) || []);
      const availableMethods = Array.from(allMethods).filter(method => !mappedSet.has(method));

      return { data: availableMethods, error: null };
    } catch (error) {
      console.error('Error in getAvailablePaymentMethods:', error);
      return { data: null, error };
    }
  }

  /**
   * Get debit/credit accounts for specific payment method
   */
  async getDebitCreditAccountsForPaymentMethod(paymentMethod: string): Promise<{ data: { 
    debit_account_id: string; 
    debit_account_code: string; 
    debit_account_name: string;
    credit_account_id: string;
    credit_account_code: string;
    credit_account_name: string;
  } | null; error: any }> {
    try {
      const { data, error } = await supabase.rpc('get_debit_credit_accounts_for_payment_method', {
        p_payment_method: paymentMethod
      });

      if (error) {
        console.error('Error getting debit/credit accounts for payment method:', error);
        return { data: null, error };
      }

      return { data: data?.[0] || null, error: null };
    } catch (error) {
      console.error('Error in getDebitCreditAccountsForPaymentMethod:', error);
      return { data: null, error };
    }
  }

  /**
   * Get account for specific payment method (legacy - for backward compatibility)
   */
  async getAccountForPaymentMethod(paymentMethod: string): Promise<{ data: { account_id: string; account_code: string; account_name: string } | null; error: any }> {
    try {
      const { data, error } = await this.getDebitCreditAccountsForPaymentMethod(paymentMethod);
      
      if (error || !data) {
        return { data: null, error };
      }

      // Return debit account for backward compatibility
      return { 
        data: {
          account_id: data.debit_account_id,
          account_code: data.debit_account_code,
          account_name: data.debit_account_name
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error in getAccountForPaymentMethod:', error);
      return { data: null, error };
    }
  }
}

// Export singleton instance
export const paymentMethodAccountService = new PaymentMethodAccountService();
