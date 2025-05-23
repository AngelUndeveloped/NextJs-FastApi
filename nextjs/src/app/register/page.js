"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        // Validation
        if (!username.trim()) {
            setError("Username is required");
            return;
        }
        
        if (username.length < 3) {
            setError("Username must be at least 3 characters long");
            return;
        }
        
        if (!password) {
            setError("Password is required");
            return;
        }
        
        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }
        
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            await axios.post("http://localhost:8000/auth/register", {
                username: username.trim(),
                password: password
            });
            
            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 2000);
            
        } catch (error) {
            console.error("Registration failed:", error);
            if (error.response?.data?.detail) {
                setError(error.response.data.detail);
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
                <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 w-full max-w-md border border-white/20">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Registration Successful!</h1>
                        <p className="text-gray-600 mb-6">
                            Welcome aboard! You'll be redirected to the login page in a moment.
                        </p>
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600 mx-auto"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 w-full max-w-md border border-white/20">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <span className="text-white text-2xl">🚀</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Join FitTracker</h1>
                    <p className="text-gray-600">Create your account to start your fitness journey</p>
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

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Username *
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/70"
                            placeholder="Choose a username"
                            required
                            minLength={3}
                        />
                        <p className="text-xs text-gray-500 mt-1">Must be at least 3 characters long</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password *
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/70"
                            placeholder="Create a secure password"
                            required
                            minLength={6}
                        />
                        <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirm Password *
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/70"
                            placeholder="Confirm your password"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                Creating Account...
                            </div>
                        ) : (
                            "✨ Create Account"
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-8 text-center">
                    <p className="text-gray-600">
                        Already have an account?{" "}
                        <Link 
                            href="/login" 
                            className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                        >
                            Sign in here
                        </Link>
                    </p>
                </div>

                {/* Features Preview */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-center text-sm text-gray-500 mb-4 font-medium">What you'll get:</p>
                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                        <div className="flex items-center">
                            <span className="mr-2">💪</span>
                            <span>Custom Workouts</span>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-2">📋</span>
                            <span>Training Routines</span>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-2">📊</span>
                            <span>Progress Tracking</span>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-2">🎯</span>
                            <span>Goal Setting</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register; 