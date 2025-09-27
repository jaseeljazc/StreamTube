
// Login Modal - Using your existing LoginForm component

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { LoginModalProps } from "@/lib/types";
import LoginForm from './LoginForm';
const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin }) => {
  const handleLoginSuccess = (token: string): void => {
    onLogin(token);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>
        <LoginForm onLogin={handleLoginSuccess} />
      </div>
    </div>
  );
};
 
export default LoginModal