


// import React, { useState, useEffect, useRef } from 'react';
// import { Play, Clock, Star, User, Search, Menu, X, } from 'lucide-react';
// import { LoginFormProps } from '@/lib/types';
// const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
//   const [email, setEmail] = useState<string>('user@example.com');
//   const [password, setPassword] = useState<string>('password123');
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>('');

//   const handleSubmit = async (): Promise<void> => {
//     setLoading(true);
//     setError('');

//     try {
//       const response = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         localStorage.setItem('authToken', data.token);
//         onLogin(data.token);
//       } else {
//         setError(data.error || 'Login failed');
//       }
//     } catch (err) {
//       setError('Network error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white rounded-lg">
//       <h2 className="text-2xl font-bold mb-4 text-gray-800">Login</h2>
      
//       <div className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Email
//           </label>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Password
//           </label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
        
//         {error && (
//           <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
//             {error}
//           </div>
//         )}
        
//         <button
//           onClick={handleSubmit}
//           disabled={loading}
//           className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
//         >
//           {loading ? 'Logging in...' : 'Login'}
//         </button>
//       </div>
      
//       <p className="mt-4 text-sm text-gray-600 text-center">
//         Test credentials: user@example.com / password123
//       </p>
//     </div>
//   );
// };
// export default LoginForm

import React, { useState, useEffect, useRef } from 'react';
import { Play, Clock, Star, User, Search, Menu, X, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { LoginFormProps } from '@/lib/types';

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState<string>('user@example.com');
  const [password, setPassword] = useState<string>('password123');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = async (): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        onLogin(data.token);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center p-4">
      
      <div className="relative w-full max-w-md">
        {/* Main login card */}
        <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-8 relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
          
          {/* Header */}
          <div className="relative text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-sm">Sign in to your account to continue</p>
          </div>
          
          <div className="relative space-y-6">
            {/* Email field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            {/* Password field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  className="w-full pl-12 pr-12 py-3 bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}
            
            {/* Login button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <span className="relative flex items-center justify-center space-x-2">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                  </>
                )}
              </span>
            </button>
         
          </div>
          
          {/* Test credentials notice */}
          <div className="relative mt-8 p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
              </div>
              <div>
                <p className="text-sm text-gray-300 font-medium mb-1">Demo Credentials</p>
                <div className="text-xs text-gray-400 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Email:</span>
                    <code className="bg-gray-600/50 px-2 py-0.5 rounded text-gray-300">user@example.com</code>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Password:</span>
                    <code className="bg-gray-600/50 px-2 py-0.5 rounded text-gray-300">password123</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        
      </div>
      
    </div>
  );
};

export default LoginForm;