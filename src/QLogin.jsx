import React, { useState } from 'react';
import { login } from './api/auth';
import { User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const QLogin = ({ onLoginSuccess }) => {
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!user || !pass) return;

        setLoading(true);
        setError('');

        try {
            const response = await login(user, pass);
            const token = response.data.token;

            if (token && !token.includes('baduser') && !token.includes('init')) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', user);
                onLoginSuccess();
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            console.error('Login failed', err);
            setError('System connection error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="login-page flex items-center justify-center min-h-screen bg-canvas font-sans">
            <style>
                {`
                    .enterprise-input {
                        background: #FFFFFF !important;
                        border: 1px solid #E2E7EE !important;
                        color: #1A2231 !important;
                        font-size: 0.875rem !important;
                        height: 44px !important;
                        padding-left: 40px !important;
                        padding-right: 40px !important;
                        border-radius: 6px !important;
                        transition: border-color 0.15s, box-shadow 0.15s !important;
                        width: 100% !important;
                        outline: none !important;
                    }
                    .enterprise-input:focus {
                        border-color: #495BE2 !important;
                        box-shadow: 0 0 0 3px rgba(73, 91, 226, 0.12) !important;
                    }
                    .enterprise-input:-webkit-autofill {
                        -webkit-box-shadow: 0 0 0px 1000px white inset !important;
                        -webkit-text-fill-color: #1A2231 !important;
                    }
                    .login-card {
                        background: #FFFFFF;
                        border-radius: 12px;
                        box-shadow: 0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px 0 rgba(0,0,0,0.04);
                        border: 1px solid #E2E7EE;
                        width: 100%;
                        max-width: 400px;
                    }
                `}
            </style>

            {loading && (
                <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                    <img
                        src="dist/img/Quickstor icon.png"
                        alt="Loading"
                        className="w-16 h-16 mb-4 animate-pulse"
                    />
                    <span className="text-gray-500 font-medium text-sm tracking-wide">Authenticating...</span>
                </div>
            )}

            <div className="w-full flex flex-col items-center px-4">
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <img src="dist/img/Quickstor icon.png" alt="Logo" className="w-8 h-8" />
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">QuickStor</h1>
                    </div>
                </div>

                <div className="login-card p-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Sign in to your account</h2>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-600 transition-colors">
                                    <User size={18} strokeWidth={2} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter username"
                                    value={user}
                                    onChange={(e) => setUser(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="enterprise-input"
                                    disabled={loading}
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-600 transition-colors">
                                    <Lock size={18} strokeWidth={2} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={pass}
                                    onChange={(e) => setPass(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="enterprise-input"
                                    disabled={loading}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || !user || !pass}
                                className="w-full flex justify-center items-center h-11 px-4 rounded-md text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 rounded-md border border-danger-100 bg-danger-50 p-3 text-sm text-danger-600 mt-4">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}
                    </form>
                </div>

                <p className="mt-8 text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} QuickStor Systems Inc. All rights reserved.
                </p>
            </div>
        </div>
    );
};



export default QLogin;
