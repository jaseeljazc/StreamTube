// Navigation Component


import React, { useState, useEffect, useRef } from 'react';
import { Play, Clock, Star, User, Search, Menu, X } from 'lucide-react';
import { NavigationProps } from "@/lib/types";
const Navigation: React.FC<NavigationProps> = ({ isAuthenticated, onLogin, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <nav className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-purple-500">StreamTube</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <a href="#" className="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</a>
                <a href="#" className="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">Movies</a>
                <a href="#" className="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">TV Shows</a>
                <a href="#" className="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">My List</a>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <User className="h-5 w-5" />
                  <button
                    onClick={onLogout}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={onLogin}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-slate-700 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-slate-700">
              <a href="#" className="hover:bg-slate-700 block px-3 py-2 rounded-md text-base font-medium">Home</a>
              <a href="#" className="hover:bg-slate-700 block px-3 py-2 rounded-md text-base font-medium">Movies</a>
              <a href="#" className="hover:bg-slate-700 block px-3 py-2 rounded-md text-base font-medium">TV Shows</a>
              <a href="#" className="hover:bg-slate-700 block px-3 py-2 rounded-md text-base font-medium">My List</a>
              {isAuthenticated ? (
                <button
                  onClick={onLogout}
                  className="w-full text-left bg-red-600 hover:bg-red-700 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={onLogin}
                  className="w-full text-left bg-red-600 hover:bg-red-700 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation