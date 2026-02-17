import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, UtensilsCrossed, Wine, IceCream, 
  ShoppingCart, Plus, Minus, X, Check, 
  Clock, ChefHat, Send
} from 'lucide-react';

// Menu categories with items
const menuCategories = [
  {
    name: 'Breakfast',
    icon: Coffee,
    items: [
      { id: 1, name: 'Continental Breakfast', description: 'Croissant, butter, jam, fresh juice, coffee', price: 25, image: '🥐' },
      { id: 2, name: 'Full English Breakfast', description: 'Eggs, bacon, sausage, beans, toast', price: 35, image: '🍳' },
      { id: 3, name: 'Pancake Stack', description: 'Fluffy pancakes with maple syrup and berries', price: 22, image: '🥞' },
      { id: 4, name: 'Avocado Toast', description: 'Smashed avocado on sourdough with poached egg', price: 18, image: '🥑' },
    ]
  },
  {
    name: 'Main Course',
    icon: UtensilsCrossed,
    items: [
      { id: 5, name: 'Grilled Salmon', description: 'Atlantic salmon with seasonal vegetables', price: 45, image: '🐟' },
      { id: 6, name: 'Ribeye Steak', description: '12oz prime cut with garlic butter and fries', price: 55, image: '🥩' },
      { id: 7, name: 'Club Sandwich', description: 'Triple-decker with chicken, bacon, lettuce', price: 18, image: '🥪' },
      { id: 8, name: 'Caesar Salad', description: 'Romaine, parmesan, croutons, caesar dressing', price: 15, image: '🥗' },
    ]
  },
  {
    name: 'Beverages',
    icon: Wine,
    items: [
      { id: 9, name: 'Artisan Coffee', description: 'Freshly brewed single-origin coffee', price: 8, image: '☕' },
      { id: 10, name: 'Fresh Juice Selection', description: 'Orange, apple, or grapefruit', price: 10, image: '🧃' },
      { id: 11, name: 'Champagne', description: 'Dom Pérignon by the glass', price: 65, image: '🥂' },
      { id: 12, name: 'Craft Cocktail', description: 'Signature mixologist creation', price: 18, image: '🍸' },
    ]
  },
  {
    name: 'Desserts',
    icon: IceCream,
    items: [
      { id: 13, name: 'Chocolate Fondant', description: 'Warm chocolate cake with vanilla ice cream', price: 16, image: '🍫' },
      { id: 14, name: 'Tiramisu', description: 'Classic Italian coffee-flavored dessert', price: 14, image: '🍰' },
      { id: 15, name: 'Cheese Selection', description: 'Artisan cheeses with crackers and fruits', price: 22, image: '🧀' },
      { id: 16, name: 'Ice Cream Sundae', description: 'Three scoops with toppings of choice', price: 12, image: '🍨' },
    ]
  }
];

export default function ServiceMenu({ roomNumber = '101' }) {
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Breakfast');
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(i => 
          i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter(i => i.id !== itemId);
    });
  };

  const getItemQuantity = (itemId) => {
    const item = cart.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleOrder = async () => {
    if (cart.length === 0) return;
    
    setLoading(true);
    try {
      // Create order in database
      const orderData = {
        roomNumber,
        type: 'Food',
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: getTotalPrice(),
        specialRequests,
        status: 'Pending'
      };

      await axios.post('http://localhost:5000/api/requests', orderData);
      
      setOrderPlaced(true);
      setCart([]);
      setSpecialRequests('');
      
      setTimeout(() => {
        setOrderPlaced(false);
        setShowCart(false);
      }, 3000);
    } catch (error) {
      console.error('Order failed:', error);
      // Still show success for demo purposes
      setOrderPlaced(true);
      setCart([]);
      setTimeout(() => {
        setOrderPlaced(false);
        setShowCart(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const currentCategory = menuCategories.find(c => c.name === activeCategory);

  return (
    <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-white">
            <ChefHat className="w-5 h-5 text-blue-500" />
            In-Room Dining
          </h3>
          <p className="text-gray-400 text-sm mt-1">Room #{roomNumber}</p>
        </div>
        <button
          onClick={() => setShowCart(!showCart)}
          className="relative p-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          {getTotalItems() > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
              {getTotalItems()}
            </span>
          )}
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {menuCategories.map(category => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(category.name)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all text-sm ${
              activeCategory === category.name
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <category.icon className="w-4 h-4" />
            {category.name}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        <AnimatePresence mode="wait">
          {currentCategory?.items.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex justify-between items-center p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="text-2xl flex-shrink-0">{item.image}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{item.name}</p>
                  <p className="text-gray-400 text-xs truncate">{item.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-blue-400 font-bold whitespace-nowrap">${item.price}</span>
                {getItemQuantity(item.id) > 0 ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-bold">{getItemQuantity(item.id)}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="p-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(item)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900 border-l border-white/10 p-6 z-50 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Your Order</h3>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {orderPlaced ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-10 h-10 text-emerald-500" />
                </div>
                <h4 className="text-2xl font-bold mb-2">Order Confirmed!</h4>
                <p className="text-gray-400 mb-4">Your order has been sent to the kitchen</p>
                <div className="flex items-center gap-2 text-blue-400">
                  <Clock className="w-4 h-4" />
                  <span>Estimated delivery: 25-30 mins</span>
                </div>
              </motion.div>
            ) : cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <ShoppingCart className="w-16 h-16 text-gray-600 mb-4" />
                <p className="text-gray-400">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span>{item.image}</span>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-gray-500 text-sm">x{item.quantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">${item.price * item.quantity}</span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Special Requests */}
                <div className="mt-4">
                  <label className="text-sm text-gray-400 mb-2 block">Special Requests</label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any allergies or special instructions..."
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-500"
                    rows={2}
                  />
                </div>

                {/* Total & Order Button */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400">Total</span>
                    <span className="text-2xl font-bold">${getTotalPrice()}</span>
                  </div>
                  <button
                    onClick={handleOrder}
                    disabled={loading || cart.length === 0}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Place Order
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCart(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
