import React, { useEffect, useState } from 'react';
import { Palette } from 'lucide-react';

const availableThemes = ["light", "dark", "cyber", "synthwave", "retro", "pastel"];

export default function ThemeToggle() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
                <Palette className="w-5 h-5" />
            </label>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-52 z-50">
                {availableThemes.map((t) => (
                    <li key={t}>
                        <button onClick={() => setTheme(t)} className="capitalize font-semibold">
                            {t}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}