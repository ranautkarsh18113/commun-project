import React, { useState } from 'react';
import { Hash, Plus, Terminal, Trash2, Cpu } from 'lucide-react';

const generateRoomId = () => [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

export default function Sidebar({ onSelectConversation, currentUser }) {
    const [rooms, setRooms] = useState([
        { id: '65f0a0e5b7b1c9a1d2e3f4a5', name: 'general' },
        { id: '65f0a0e5b7b1c9a1d2e3f4a6', name: 'synthwave' }
    ]);
    const [showNewRoom, setShowNewRoom] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [activeRoomId, setActiveRoomId] = useState(null);

    const handleCreateRoom = (e) => {
        e.preventDefault();
        if (!newRoomName.trim()) return;
        const newRoom = { id: generateRoomId(), name: newRoomName.toLowerCase().replace(/\s+/g, '-') };
        setRooms([...rooms, newRoom]);
        setNewRoomName("");
        setShowNewRoom(false);
        selectRoom(newRoom.id);
    };

    const handleDeleteRoom = (e, roomId) => {
        e.stopPropagation();
        const updatedRooms = rooms.filter(r => r.id !== roomId);
        setRooms(updatedRooms);
        selectRoom(updatedRooms[0]?.id || null);
    };

    const selectRoom = (id) => {
        setActiveRoomId(id);
        onSelectConversation(id);
    };

    return (
        <div className="flex flex-col h-full bg-[#050505] border-r border-[#9d4edd]/30 text-white font-mono relative z-10 ambient-container overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-[#9d4edd]/30 flex items-center justify-between bg-[#0a0a0a] relative">
                <div className="font-black text-2xl tracking-[0.2em] text-[#ffd700] flex items-center gap-3 hover:scale-105 transition-transform duration-500 ease-out cursor-pointer z-10">
                    <Terminal className="w-6 h-6 text-[#9d4edd] transition-transform duration-500 hover:-rotate-12" />
                    COMMUN!
                </div>
            </div>

            {/* Channel List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex items-center justify-between mb-4 border-b border-[#9d4edd]/20 pb-2">
                    <div className="text-[10px] font-bold uppercase text-[#9d4edd] tracking-widest flex items-center gap-2 opacity-80">
                        <Cpu className="w-4 h-4" /> Network_Nodes
                    </div>
                    <button 
                        onClick={() => setShowNewRoom(!showNewRoom)} 
                        className="text-[#ffd700] hover:text-white hover:rotate-90 transition-all duration-500 opacity-80 hover:opacity-100"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                {showNewRoom && (
                    <form onSubmit={handleCreateRoom} className="mb-4 animate-fade-in">
                        <input 
                            autoFocus
                            type="text"
                            placeholder="NODE_NAME..."
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-[#ffd700]/50 text-[#ffd700] text-xs p-3 focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_15px_rgba(255,215,0,0.2)] transition-all duration-300 uppercase tracking-widest rounded-sm"
                        />
                    </form>
                )}

                <div className="space-y-1">
                    {rooms.map((room, i) => {
                        const isActive = activeRoomId === room.id;
                        return (
                            <div key={room.id} className="relative group flex items-center w-full overflow-hidden animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                                {/* Elegant Subtle Background Highlight */}
                                <div className={`absolute inset-0 bg-[#9d4edd]/10 rounded-md transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}></div>
                                
                                <button 
                                    onClick={() => selectRoom(room.id)}
                                    className="w-full flex items-center gap-3 px-3 py-3 border border-transparent transition-all duration-500 ease-out font-medium text-sm pr-10 z-10 group-hover:translate-x-1.5"
                                >
                                    <span className={`transition-colors duration-500 ${isActive ? 'text-[#ffd700] vhs-glow-gold' : 'text-[#9d4edd] group-hover:text-[#ffd700]'}`}>
                                        <Hash className="w-4 h-4" />
                                    </span>
                                    <span className={`font-bold tracking-widest uppercase text-xs truncate transition-all duration-500 ${isActive ? 'text-white vhs-glow-purple' : 'text-gray-400 group-hover:text-white'}`}>
                                        {room.name}
                                    </span>
                                </button>
                                
                                {room.name !== 'general' && (
                                    <button
                                        onClick={(e) => handleDeleteRoom(e, room.id)}
                                        className="absolute right-3 text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-500 hover:scale-110 z-10"
                                        title="Delete Node"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer Profile Box */}
            <div className="p-5 bg-[#0a0a0a] border-t border-[#9d4edd]/30 flex items-center gap-4 relative overflow-hidden group cursor-pointer transition-colors duration-500 hover:bg-[#111]">
                <div className="w-10 h-10 border border-[#ffd700]/50 bg-[#050505] text-[#ffd700] flex items-center justify-center font-black text-lg group-hover:border-[#ffd700] group-hover:shadow-[0_0_15px_rgba(255,215,0,0.2)] transition-all duration-500 z-10 rounded-sm">
                    {currentUser?.username.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 overflow-hidden z-10">
                    <div className="font-bold text-xs uppercase tracking-[0.2em] truncate text-gray-300 group-hover:text-white transition-colors duration-300">{currentUser?.username || 'GUEST'}</div>
                    <div className="text-[10px] text-[#9d4edd] flex items-center gap-2 mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="relative w-1.5 h-1.5">
                            <span className="absolute inset-0 bg-[#ffd700] rounded-full animate-ping opacity-50"></span>
                            <span className="relative block w-1.5 h-1.5 bg-[#ffd700] rounded-full shadow-[0_0_5px_#ffd700]"></span>
                        </div>
                        <span className="tracking-widest">ONLINE</span>
                    </div>
                </div>
            </div>
        </div>
    );
}