interface OrderItemProps {
  id: number;
  name: string;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  user_id: number;
}

interface OrderProps {
  id: number;
  user_id: number;
  status: string;
  total_price: number;
  payment_method?: string;
  payment_status?: string;
  payment_reference?: string;
  paid_at?: string | null;
  shipping_address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItemProps[];
}
