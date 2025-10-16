import React, { useState } from "react";

function LoginForm({ onSubmit }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ username, password });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col">
            <label htmlFor="username" className="mb-2">
                Username
            </label>
            <input
                id="username"
                type="text"
                placeholder="Admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border border-black/20 text-black p-3 w-96 rounded-lg mb-8"
                required
            />

            <label htmlFor="password" className="mb-2">
                Password
            </label>
            <input
                id="password"
                type="password"
                placeholder="*********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-black/20 text-black p-3 w-96 rounded-lg"
                required
            />

            <button
                type="submit"
                className="w-96 mt-10 border-black/30 py-3 rounded-lg bg-green-400 text-lg font-semibold text-white hover:bg-green-500 active:bg-green-600 transition-all duration-500 active:text-white/50"
            >
                Login
            </button>
        </form>
    );
}

export default LoginForm;
