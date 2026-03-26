import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [isCheckout, setIsCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: ''
  });

  if (!isOpen) return null;

  const handleClose = () => {
    setIsCheckout(false);
    onClose();
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderData = {
        ...formData,
        totalAmount: cartTotal,
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        alert('Order placed successfully! We will contact you soon.');
        clearCart();
        setFormData({ customerName: '', customerPhone: '', customerAddress: '' });
        handleClose();
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      <div className="fixed inset-y-0 right-0 max-w-md w-full flex shadow-2xl transform transition-transform">
        <div className="h-full w-full bg-white flex flex-col">
          <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
            {isCheckout ? (
              <button onClick={() => setIsCheckout(false)} className="flex items-center text-gray-600 hover:text-orange-600 font-medium">
                <ArrowLeft className="h-5 w-5 mr-1" /> Back to Cart
              </button>
            ) : (
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-orange-600" /> Your Order
              </h2>
            )}
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {isCheckout ? (
              <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Delivery Details</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.customerAddress}
                    onChange={(e) => setFormData({...formData, customerAddress: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                    placeholder="123 Main St, Apt 4B, City, Zip"
                  />
                </div>
              </form>
            ) : cart.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center">
                <div className="bg-orange-50 p-4 rounded-full mb-4">
                  <ShoppingBag className="h-12 w-12 text-orange-300" />
                </div>
                <p className="text-gray-500 text-lg font-medium">Your cart is empty.</p>
                <button 
                  onClick={handleClose}
                  className="mt-6 text-orange-600 font-medium hover:text-orange-700"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <li key={item._id} className="py-6 flex">
                    <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                      <img src={item.image} alt={item.name} className="w-full h-full object-center object-cover" />
                    </div>
                    <div className="ml-4 flex-1 flex flex-col">
                      <div>
                        <div className="flex justify-between text-base font-bold text-gray-900">
                          <h3 className="line-clamp-2">{item.name}</h3>
                          <p className="ml-4 text-orange-600">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                      </div>
                      <div className="flex-1 flex items-end justify-between text-sm mt-4">
                        <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity - 1)} 
                            className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-3 py-1.5 font-bold min-w-[2.5rem] text-center border-x border-gray-200">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity + 1)} 
                            className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeFromCart(item._id)} 
                          className="font-medium text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                        >
                          <X className="h-4 w-4" /> Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-6 sm:px-6 bg-gray-50">
              <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                <p>Total</p>
                <p className="text-orange-600">${cartTotal.toFixed(2)}</p>
              </div>
              {isCheckout ? (
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-70"
                >
                  {isSubmitting ? <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Processing...</> : 'Confirm Order'}
                </button>
              ) : (
                <button
                  onClick={() => setIsCheckout(true)}
                  className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all hover:shadow-md active:scale-[0.98]"
                >
                  Proceed to Checkout
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
