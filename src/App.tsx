import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Utensils, LayoutDashboard, Home as HomeIcon, ShoppingCart } from 'lucide-react';
import Home from './pages/Home';
import Menu from './pages/Menu';
import AdminDashboard from './pages/AdminDashboard';
import { CartProvider, useCart } from './context/CartContext';
import Cart from './components/Cart';

function Navbar() {
  const { cartCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold text-orange-600">
                <Utensils className="h-6 w-6" />
                <span>Bite&Delight</span>
              </Link>
            </div>
            <div className="flex items-center space-x-6 sm:space-x-8">
              <Link to="/" className="text-gray-700 hover:text-orange-600 flex items-center gap-1 font-medium">
                <HomeIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <Link to="/menu" className="text-gray-700 hover:text-orange-600 flex items-center gap-1 font-medium">
                <Utensils className="h-4 w-4" />
                <span className="hidden sm:inline">Menu</span>
              </Link>
              <Link to="/admin" className="text-gray-700 hover:text-orange-600 flex items-center gap-1 font-medium">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
              
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              
              <button 
                onClick={() => setIsCartOpen(true)}
                className="text-gray-700 hover:text-orange-600 flex items-center gap-1 font-medium relative p-2"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-orange-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CartProvider>
  );
}
