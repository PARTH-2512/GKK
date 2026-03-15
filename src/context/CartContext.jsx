import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext({})

const CART_KEY = 'gkk_cart'

const loadCart = () => {
  try {
    const saved = localStorage.getItem(CART_KEY)
    return saved ? JSON.parse(saved) : { items: [], kitchenId: null, kitchenName: '' }
  } catch {
    return { items: [], kitchenId: null, kitchenName: '' }
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  const addToCart = (food, kitchenId, kitchenName) => {
    setCart(prev => {
      // If different kitchen, replace
      if (prev.kitchenId && prev.kitchenId !== kitchenId) {
        return {
          items: [{ food, quantity: 1 }],
          kitchenId,
          kitchenName,
        }
      }
      const existing = prev.items.find(i => i.food.id === food.id)
      if (existing) {
        return {
          ...prev,
          items: prev.items.map(i =>
            i.food.id === food.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }
      }
      return {
        ...prev,
        kitchenId,
        kitchenName,
        items: [...prev.items, { food, quantity: 1 }],
      }
    })
  }

  const removeFromCart = (foodId) => {
    setCart(prev => {
      const items = prev.items.filter(i => i.food.id !== foodId)
      return {
        ...prev,
        items,
        kitchenId: items.length === 0 ? null : prev.kitchenId,
        kitchenName: items.length === 0 ? '' : prev.kitchenName,
      }
    })
  }

  const updateQuantity = (foodId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(foodId)
      return
    }
    setCart(prev => ({
      ...prev,
      items: prev.items.map(i =>
        i.food.id === foodId ? { ...i, quantity: newQty } : i
      ),
    }))
  }

  const clearCart = () => {
    setCart({ items: [], kitchenId: null, kitchenName: '' })
  }

  const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = cart.items.reduce((sum, i) => sum + i.food.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      ...cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
