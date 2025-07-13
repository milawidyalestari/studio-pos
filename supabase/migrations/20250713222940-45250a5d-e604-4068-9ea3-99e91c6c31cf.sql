-- Enable realtime for orders table
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.orders;

-- Enable realtime for order_items table  
ALTER TABLE public.order_items REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.order_items;