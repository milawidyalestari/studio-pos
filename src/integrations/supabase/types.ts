export type Database = {
  public: {
    Tables: {
      orders: {
        Row: any;
        Insert: any;
        Update: any;
      };
      order_items: {
        Row: any;
        Insert: any;
        Update: any;
      };
    };
    Enums: {
      customer_level: 'Regular' | 'Premium' | 'VIP';
    };
  };
};
