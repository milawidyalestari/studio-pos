import { supabase } from '../integrations/supabase/client';

export interface NotaPrintResult {
  success: boolean;
  message: string;
  orderNumber?: string;
  receiptPrinted?: boolean;
}

export class NotaPrintService {
  private static instance: NotaPrintService;

  static getInstance(): NotaPrintService {
    if (!NotaPrintService.instance) {
      NotaPrintService.instance = new NotaPrintService();
    }
    return NotaPrintService.instance;
  }

  /**
   * Update receipt_printed status to true after successful nota print
   * @param orderNumber - Order number to update
   * @returns Promise<NotaPrintResult>
   */
  async markNotaAsPrinted(orderNumber: string): Promise<NotaPrintResult> {
    try {
      console.log('Marking nota as printed for order:', orderNumber);
      
      // First check if order exists
      const { data: existingOrder, error: fetchError } = await supabase
        .from('orders')
        .select('id, order_number, receipt_printed')
        .eq('order_number', orderNumber)
        .single();

      if (fetchError) {
        console.error('Error fetching order:', fetchError);
        return {
          success: false,
          message: `Order dengan nomor ${orderNumber} tidak ditemukan`,
          orderNumber
        };
      }

      if (!existingOrder) {
        return {
          success: false,
          message: `Order dengan nomor ${orderNumber} tidak ditemukan`,
          orderNumber
        };
      }

      // Check if already printed
      if (existingOrder.receipt_printed) {
        return {
          success: true,
          message: `Nota untuk order ${orderNumber} sudah pernah di-print sebelumnya`,
          orderNumber,
          receiptPrinted: true
        };
      }

      // Update receipt_printed status
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({ 
          receipt_printed: true,
          updated_at: new Date().toISOString()
        })
        .eq('order_number', orderNumber)
        .select('id, order_number, receipt_printed, updated_at')
        .single();

      if (updateError) {
        console.error('Error updating receipt_printed status:', updateError);
        return {
          success: false,
          message: `Gagal mengupdate status nota: ${updateError.message}`,
          orderNumber
        };
      }

      console.log('Successfully marked nota as printed:', updatedOrder);
      return {
        success: true,
        message: `Status nota berhasil diupdate untuk order ${orderNumber}`,
        orderNumber,
        receiptPrinted: true
      };

    } catch (error) {
      console.error('Error in markNotaAsPrinted:', error);
      return {
        success: false,
        message: `Terjadi kesalahan: ${error instanceof Error ? error.message : 'Unknown error'}`,
        orderNumber
      };
    }
  }

  /**
   * Get receipt_printed status for an order
   * @param orderNumber - Order number to check
   * @returns Promise<boolean | null>
   */
  async getNotaPrintStatus(orderNumber: string): Promise<boolean | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('receipt_printed')
        .eq('order_number', orderNumber)
        .single();

      if (error) {
        console.error('Error fetching nota print status:', error);
        return null;
      }

      return data?.receipt_printed || false;
    } catch (error) {
      console.error('Error in getNotaPrintStatus:', error);
      return null;
    }
  }

  /**
   * Reset receipt_printed status to false (for re-printing)
   * @param orderNumber - Order number to reset
   * @returns Promise<NotaPrintResult>
   */
  async resetNotaPrintStatus(orderNumber: string): Promise<NotaPrintResult> {
    try {
      console.log('Resetting nota print status for order:', orderNumber);
      
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({ 
          receipt_printed: false,
          updated_at: new Date().toISOString()
        })
        .eq('order_number', orderNumber)
        .select('id, order_number, receipt_printed, updated_at')
        .single();

      if (updateError) {
        console.error('Error resetting receipt_printed status:', updateError);
        return {
          success: false,
          message: `Gagal mereset status nota: ${updateError.message}`,
          orderNumber
        };
      }

      console.log('Successfully reset nota print status:', updatedOrder);
      return {
        success: true,
        message: `Status nota berhasil direset untuk order ${orderNumber}`,
        orderNumber,
        receiptPrinted: false
      };

    } catch (error) {
      console.error('Error in resetNotaPrintStatus:', error);
      return {
        success: false,
        message: `Terjadi kesalahan: ${error instanceof Error ? error.message : 'Unknown error'}`,
        orderNumber
      };
    }
  }

  /**
   * Get all orders with their receipt_printed status
   * @returns Promise<Array<{order_number: string, receipt_printed: boolean}>>
   */
  async getAllNotaPrintStatuses(): Promise<Array<{order_number: string, receipt_printed: boolean}>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('order_number, receipt_printed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all nota print statuses:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllNotaPrintStatuses:', error);
      return [];
    }
  }
}

// Export singleton instance
export const notaPrintService = NotaPrintService.getInstance();
