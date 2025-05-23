"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import AuthContext from "../context/AuthContext";
import Link from "next/link";

const Login = () => {
    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        try {
            await login(username, password);
        } catch (error) {
            setError("Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 w-full max-w-md border border-white/20">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <span className="text-white text-2xl">🏋️</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">Sign in to continue your fitness journey</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-lg mb-6">
                        <div className="flex items-center">
                            <span className="text-red-400 mr-3">⚠️</span>
                            {error}
                        </div>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Username
                        </label>
                        <input 
                            type="text" 
                            placeholder="Enter your username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/70"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <input 
                            type="password" 
                            placeholder="Enter your password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/70"
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                Signing In...
                            </div>
                        ) : (
                            "🚀 Sign In"
                        )}
                    </button>
                </form>

                {/* Register Link */}
                <div className="mt-8 text-center">
                    <p className="text-gray-600">
                        Don't have an account?{" "}
                        <Link 
                            href="/register" 
                            className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                        >
                            Create one here
                        </Link>
                    </p>
                </div>

                {/* Quick Demo */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-center text-sm text-gray-500 mb-4 font-medium">Quick Demo Access:</p>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-600 mb-2">Demo credentials:</p>
                        <p className="text-sm font-mono text-gray-700">
                            Username: <span className="font-semibold">demo</span><br/>
                            Password: <span className="font-semibold">demo123</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login; 