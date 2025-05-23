"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import AuthContext from "../context/AuthContext";

const Login = () => {
    const { login } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        login(username, password);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">Login</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    className="border rounded px-3 py-2"
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="border rounded px-3 py-2"
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Login
                </button>
            </form>
            {error && <p className="text-red-500">{error}</p>}
        </div>
    )
}

export default Login; 