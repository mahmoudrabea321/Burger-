import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="relative h-48 w-full bg-gray-200">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';
          }}
        />
        <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-xs font-bold text-orange-600 shadow-sm">
          {product.category}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{product.name}</h3>
          <span className="text-lg font-extrabold text-orange-600">${product.price.toFixed(2)}</span>
        </div>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
          {product.description || 'Delicious freshly prepared meal.'}
        </p>
        <button 
          onClick={handleAddToCart}
          className={`w-full mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-colors ${
            added 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gray-900 hover:bg-gray-800 text-white'
          }`}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" /> Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" /> Add to Order
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
