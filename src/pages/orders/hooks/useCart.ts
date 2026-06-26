import { useState } from 'react';
import type { Product, ProductVariant } from '@/types/product.types';

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [variantSelectorProduct, setVariantSelectorProduct] = useState<Product | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.variant.salePrice * item.quantity, 0);
  const tax = Math.round(subtotal * 0.08); // 8% VAT
  const rawTotal = subtotal + tax;

  const handleAddToCart = (product: Product, variant: ProductVariant) => {
    if (variant.quantity <= 0) return; // Hết hàng

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(item => item.variant.id === variant.id);
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        const newQty = newCart[existingIndex].quantity + 1;
        if (newQty <= variant.quantity) {
          newCart[existingIndex].quantity = newQty;
        }
        return newCart;
      }
      return [...prevCart, { product, variant, quantity: 1 }];
    });
    setVariantSelectorProduct(null);
  };

  const handleProductClick = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return;

    if (product.variants.length === 1) {
      handleAddToCart(product, product.variants[0]);
    } else {
      setVariantSelectorProduct(product);
    }
  };

  const handleUpdateQuantity = (variantId: number, amount: number) => {
    setCart((prevCart) => {
      return prevCart.map(item => {
        if (item.variant.id === variantId) {
          const newQty = item.quantity + amount;
          if (newQty <= 0) return null;
          if (newQty > (item.variant.quantity || 0)) return item; // limit to stock
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (variantId: number) => {
    setCart(prev => prev.filter(item => item.variant.id !== variantId));
  };

  const clearCart = () => {
    setCart([]);
    setVariantSelectorProduct(null);
  };

  return {
    cart,
    setCart,
    variantSelectorProduct,
    setVariantSelectorProduct,
    subtotal,
    tax,
    rawTotal,
    handleAddToCart,
    handleProductClick,
    handleUpdateQuantity,
    handleRemoveFromCart,
    clearCart
  };
}
