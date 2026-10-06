import React, { useState } from 'react';
import { Terminal } from 'lucide-react';

export default function Register({ onRegisterSuccess, switchToLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setIsAuthenticating(true);
        try {
            const res = await fetch('https://commun-project.onrender.com/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'REGISTRATION FAILED');
            
            setTimeout(() => {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({ id: data._id, username: data.username }));
                onRegisterSuccess({ id: data._id, username: data.username }, data.token);
            }, 800);
        } catch (err) {
            setError(err.message);
            setIsAuthenticating(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-[#050505] relative overflow-hidden font-mono text-white">
            <div className="relative z-10 w-96 bg-[#050505] border-2 border-[#ffd700] shadow-[0_0_20px_#ffd700] p-8">
                <div className="flex flex-col items-center justify-center gap-3 mb-8">
                    <Terminal className="w-12 h-12 text-[#9d4edd] animate-pulse" />
                    <h2 className="text-2xl font-black tracking-[0.2em] vhs-glow-gold uppercase text-center">New Node Init</h2>
                </div>
                
                {error && <div className="bg-red-900/30 border border-red-500 text-red-500 p-2 mb-4 text-xs animate-bounce uppercase tracking-widest text-center">{error}</div>}
                
                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="block text-[10px] text-[#9d4edd] uppercase tracking-widest mb-2">New_User_ID</label>
                        <input 
                            type="text" 
                            className="w-full bg-[#111] border border-[#ffd700]/50 text-white p-3 focus:outline-none focus:border-[#9d4edd] focus:shadow-[0_0_10px_#9d4edd] transition-all" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] text-[#9d4edd] uppercase tracking-widest mb-2">Create_Passcode</label>
                        <input 
                            type="password" 
                            className="w-full bg-[#111] border border-[#ffd700]/50 text-white p-3 focus:outline-none focus:border-[#9d4edd] focus:shadow-[0_0_10px_#9d4edd] transition-all" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isAuthenticating}
                        className="w-full bg-[#ffd700] hover:bg-[#9d4edd] text-black font-black uppercase tracking-[0.2em] py-4 transition-colors duration-300 shadow-[0_0_10px_#ffd700] hover:shadow-[0_0_20px_#9d4edd]"
                    >
                        {isAuthenticating ? "Processing..." : "Establish Node"}
                    </button>
                </form>
                <div className="text-center mt-6 text-[10px] text-[#ffd700] tracking-widest uppercase">
                    ALREADY REGISTERED? <button onClick={switchToLogin} className="text-[#9d4edd] hover:text-white transition-colors underline ml-2">System Login</button>
                </div>
            </div>
        </div>
    );
}