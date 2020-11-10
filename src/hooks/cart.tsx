import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storedProducts = await AsyncStorage.getItem(
        '@goMarketplace:products',
      );

      console.log(storedProducts);

      if (storedProducts) {
        setProducts([...JSON.parse(storedProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const prodExists = products.find(p => p.id == product.id);

      if (prodExists) {
        setProducts(
          products.map(p =>
            p.id == product.id ? { ...product, quantity: p.quantity + 1 } : p,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      // setProducts([]);
      await AsyncStorage.setItem(
        '@goMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProduct = products.map(p =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p,
      );
      setProducts(newProduct);

      await AsyncStorage.setItem(
        '@goMarketplace:products',
        JSON.stringify(newProduct),
      );

      console.log('Incremento');
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const prodExists = products.find(p => p.id == id);

      if (prodExists) {
        const prodList = products.map(p =>
          p.id === id ? { ...p, quantity: p.quantity - 1 } : p,
        );

        const newProduct = prodList.filter(prod => prod.quantity > 0);

        setProducts(newProduct);

        await AsyncStorage.setItem(
          '@goMarketplace:products',
          JSON.stringify(newProduct),
        );
      }

      console.log('Decremento');
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
