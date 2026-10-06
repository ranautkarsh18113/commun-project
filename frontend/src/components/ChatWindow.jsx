import React, { useState, useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Smile, Film, Send, Hash, Radio, Music } from 'lucide-react';

export default function ChatWindow({ socket, currentConversationId, currentUser }) {
    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [gifs, setGifs] = useState([]);
    const [showGifs, setShowGifs] = useState(false);
    const [gifSearch, setGifSearch] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!socket) return;
        setMessages([]); 
        socket.emit('join_conversation', currentConversationId);

        const handleLoadHistory = (history) => {
            setMessages(history);
        };

        const handleReceiveMessage = (data) => {
            if (data.sender === currentUser.id) return;
            setMessages((prev) => [...prev, data]);
        };

        socket.on('load_history', handleLoadHistory);
        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('load_history', handleLoadHistory);
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [socket, currentConversationId, currentUser.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleEmojiClick = (emojiData) => {
        setMessageText((prev) => prev + emojiData.emoji);
    };

    const fetchGifs = async (query = "") => {
        const API_KEY = "q4lGX5lFi5UP7O5QryMm7FNjdrTGnPU3"; 
        const endpoint = query.trim() === "" 
            ? `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=12`
            : `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${query}&limit=12`;
        try {
            const res = await fetch(endpoint);
            const data = await res.json();
            setGifs(data.data);
            setShowGifs(true);
            setShowEmojiPicker(false);
        } catch (error) {
            console.error("Giphy error:", error);
        }
    };

    const sendMessage = (gifUrl = null) => {
        if (!messageText.trim() && !gifUrl) return;
        
        const payload = {
            conversationId: currentConversationId,
            sender: currentUser.id,
            text: messageText,
            gifUrl: gifUrl,
            createdAt: new Date().toISOString()
        };
        
        // Optimistic rendering
        setMessages((prev) => [...prev, payload]);
        socket.emit('send_message', payload);
        
        setMessageText("");
        setShowGifs(false);
        setShowEmojiPicker(false);
    };

    const getEmbedData = (text) => {
        if (!text) return null;
        const ytMatch = text.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (ytMatch) return { type: 'youtube', url: `https://www.youtube.com/embed/${ytMatch[1]}` };
        
        const spotMatch = text.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/);
        if (spotMatch) return { type: 'spotify', url: `https://open.spotify.com/embed/track/${spotMatch[1]}?utm_source=generator&theme=0` };
        
        return null;
    };

    return (
        <div className="flex flex-col h-full bg-[#050505] text-white font-mono crt-flicker relative z-10">
            {/* Header */}
            <div className="px-6 py-4 bg-[#111] border-b-2 border-[#9d4edd] flex items-center justify-between shadow-[0_4px_10px_rgba(157,78,221,0.2)]">
                <div className="flex items-center gap-3">
                    <div className="text-[#ffd700] animate-pulse">
                        <Radio className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-black text-sm tracking-[0.2em] uppercase text-[#9d4edd] vhs-glow-purple">Active_Node</h3>
                        <p className="text-[10px] text-[#ffd700] tracking-widest uppercase">ID: {currentConversationId.slice(-6)}</p>
                    </div>
                </div>
            </div>

            {/* Messages Viewport */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                        <Hash className="w-12 h-12 mb-4 text-[#ffd700]" />
                        <p className="font-bold text-lg tracking-widest text-[#9d4edd] uppercase">Connection Established</p>
                        <p className="text-xs font-mono uppercase mt-2">Awaiting transmission...</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender === currentUser.id;
                        const embed = getEmbedData(msg.text);

                        return (
                            <div key={idx} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 border-2 flex items-center justify-center font-black text-xs ${isMe ? 'border-[#9d4edd] text-[#9d4edd] bg-[#111]' : 'border-[#ffd700] text-[#ffd700] bg-[#111]'}`}>
                                        {isMe ? 'ME' : 'EXT'}
                                    </div>
                                </div>
                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-lg w-full`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isMe ? 'text-[#9d4edd]' : 'text-[#ffd700]'}`}>
                                            {isMe ? currentUser.username : 'User_' + msg.sender.slice(-4)}
                                        </span>
                                        <span className="text-[10px] opacity-40">{new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className={`p-4 border text-sm w-full ${isMe ? 'border-[#9d4edd] bg-[#9d4edd]/10 shadow-[0_0_10px_#9d4edd]' : 'border-[#ffd700] bg-[#ffd700]/10 shadow-[0_0_10px_#ffd700]'}`}>
                                        {msg.text && <p className="leading-relaxed tracking-wide break-words">{msg.text}</p>}
                                        
                                        {embed && embed.type === 'youtube' && (
                                            <div className="mt-3 border border-[#ffd700]/50 p-1 bg-black">
                                                <div className="text-[10px] text-[#ffd700] uppercase tracking-widest mb-1 flex items-center gap-1"><Film className="w-3 h-3"/> Video_Stream</div>
                                                <iframe className="w-full aspect-video" src={embed.url} title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                            </div>
                                        )}
                                        {embed && embed.type === 'spotify' && (
                                            <div className="mt-3 border border-[#9d4edd]/50 p-1 bg-black">
                                                <div className="text-[10px] text-[#9d4edd] uppercase tracking-widest mb-1 flex items-center gap-1"><Music className="w-3 h-3"/> Audio_Stream</div>
                                                <iframe className="w-full h-[152px]" src={embed.url} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                                            </div>
                                        )}

                                        {msg.gifUrl && <img src={msg.gifUrl} alt="GIF" className="mt-2 border border-white/20 max-w-xs object-cover" />}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-[#111] border-t-2 border-[#9d4edd] relative">
                {showEmojiPicker && (
                    <div className="absolute bottom-20 left-4 z-50 shadow-[0_0_20px_#9d4edd] border-2 border-[#9d4edd]">
                        <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
                    </div>
                )}
                
                {showGifs && (
                    <div className="absolute bottom-20 left-16 z-50 bg-[#111] p-4 shadow-[0_0_20px_#ffd700] border-2 border-[#ffd700] w-80">
                        <input 
                            type="text" 
                            className="w-full bg-black border border-[#ffd700]/50 text-[#ffd700] text-xs p-2 mb-3 focus:outline-none focus:border-[#ffd700] uppercase tracking-widest" 
                            placeholder="SEARCH_DB..." 
                            value={gifSearch}
                            onChange={(e) => {
                                setGifSearch(e.target.value);
                                fetchGifs(e.target.value);
                            }}
                        />
                        <div className="max-h-60 overflow-y-auto grid grid-cols-2 gap-2">
                            {gifs.map(gif => (
                                <img 
                                    key={gif.id} 
                                    src={gif.images.fixed_height_small.url} 
                                    alt="GIF" 
                                    className="cursor-pointer border border-[#ffd700]/30 hover:border-[#ffd700] transition-colors w-full h-24 object-cover"
                                    onClick={() => sendMessage(gif.images.fixed_height.url)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3 bg-black border-2 border-[#9d4edd] p-2 focus-within:shadow-[0_0_15px_#9d4edd] transition-shadow">
                    <button className="text-[#9d4edd] hover:text-[#ffd700] transition-colors" onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifs(false); }}>
                        <Smile className="w-6 h-6" />
                    </button>
                    <button className="text-[#9d4edd] hover:text-[#ffd700] transition-colors" onClick={() => { fetchGifs(); setShowEmojiPicker(false); }}>
                        <Film className="w-6 h-6" />
                    </button>
                    
                    <input 
                        type="text" 
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 text-white placeholder-gray-600" 
                        placeholder="INPUT DATA OR MEDIA URL..." 
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    
                    <button className="bg-[#9d4edd] hover:bg-[#ffd700] text-black p-2 transition-colors" onClick={() => sendMessage()}>
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}