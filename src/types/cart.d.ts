type CartProps = {
  cart_id: string;
  product_id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  totalPrice: number;
};

interface AddToCartPayload {
  product_id: number;
  quantity: number;
}
