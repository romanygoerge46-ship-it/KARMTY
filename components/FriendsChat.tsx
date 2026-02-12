
import React, { useState, useEffect, useRef } from 'react';
import { Person, Message, MessageType, Role } from '../types';
import { addMessage, getMessagesByCode } from '../services/db';
import { Send, Image as ImageIcon, Mic, X, MessageCircle, AlertTriangle, ShieldCheck, Play, Pause, Trash2 } from 'lucide-react';

interface FriendsChatProps {
  currentUser: Person;
}

export const FriendsChat: React.FC<FriendsChatProps> = ({ currentUser }) => {
  // Automatically use the churchId as the group code
  const groupCode = currentUser.churchId;
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Chat State
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Audio Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Polling for new messages (Simulating real-time)
  useEffect(() => {
    let interval: number;
    if (groupCode) {
      // Initial load
      setMessages(getMessagesByCode(groupCode));
      
      // Poll every 2 seconds
      interval = window.setInterval(() => {
        setMessages(getMessagesByCode(groupCode));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [groupCode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (type: MessageType, content: string) => {
    if (!content) return;

    const msg: Message = {
      id: Date.now().toString() + Math.random().toString(),
      groupCode: groupCode,
      senderId: currentUser.id,
      senderName: currentUser.name,
      type: type,
      content: content,
      timestamp: new Date().toISOString()
    };

    addMessage(msg);
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  // --- Image Upload ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Compress/Resize logic could go here, for now using FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        handleSendMessage('image', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Audio Recording ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          handleSendMessage('audio', base64);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("لا يمكن الوصول للميكروفون");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // --- RENDER: CHAT SCREEN (Directly, no join screen) ---
  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
       {/* Chat Header */}
       <div className="bg-white p-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {groupCode.charAt(0).toUpperCase()}
             </div>
             <div>
                <h3 className="font-bold text-slate-900 text-sm">مجموعة: <span className="font-mono text-purple-700">{groupCode}</span></h3>
                <p className="text-[10px] text-slate-500 font-semibold">
                    {currentUser.role === Role.Developer ? 'مطور النظام' : `دردشة ${currentUser.stage}`}
                </p>
             </div>
          </div>
          {/* Developer Note: Could add member count here later */}
       </div>

       {/* Messages Area */}
       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.length === 0 && (
              <div className="text-center py-10 opacity-50">
                  <MessageCircle size={40} className="mx-auto mb-2 text-slate-400" />
                  <p className="text-xs text-slate-500 font-bold">ابدأ المحادثة مع مجموعتك ({groupCode})...</p>
              </div>
          )}

          {messages.map((msg) => {
             const isMe = msg.senderId === currentUser.id;
             return (
               <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${isMe ? 'bg-purple-600' : 'bg-slate-400'}`}>
                          {msg.senderName.charAt(0)}
                      </div>
                      
                      {/* Bubble */}
                      <div className={`p-3 rounded-2xl shadow-sm text-sm ${
                          isMe 
                          ? 'bg-purple-600 text-white rounded-br-none' 
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                      }`}>
                          {!isMe && <p className="text-[9px] font-bold text-slate-400 mb-1">{msg.senderName}</p>}
                          
                          {/* Content based on type */}
                          {msg.type === 'text' && <p>{msg.content}</p>}
                          
                          {msg.type === 'image' && (
                              <img src={msg.content} alt="shared" className="rounded-lg max-h-48 object-cover border border-white/20" />
                          )}
                          
                          {msg.type === 'audio' && (
                              <audio controls src={msg.content} className="max-w-[200px] h-8 mt-1" />
                          )}

                          <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-purple-200' : 'text-slate-400'}`}>
                             {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                      </div>
                  </div>
               </div>
             );
          })}
          <div ref={messagesEndRef} />
       </div>

       {/* Input Area */}
       <div className="bg-white p-3 border-t border-slate-200">
           <div className="flex items-center gap-2">
               {/* Image Upload */}
               <label className="p-2.5 bg-slate-100 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors text-slate-600">
                   <ImageIcon size={20} />
                   <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
               </label>
               
               {/* Voice Record */}
               <button 
                 onMouseDown={startRecording}
                 onMouseUp={stopRecording}
                 onTouchStart={startRecording}
                 onTouchEnd={stopRecording}
                 className={`p-2.5 rounded-xl transition-all duration-200 ${isRecording ? 'bg-red-500 text-white scale-110 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
               >
                   <Mic size={20} />
               </button>

               {/* Text Input */}
               <div className="flex-1 relative">
                   <input
                     type="text"
                     className="w-full bg-slate-100 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-purple-200 text-slate-800 placeholder:text-slate-400 font-medium"
                     placeholder={isRecording ? 'جاري التسجيل...' : 'اكتب رسالة...'}
                     value={newMessage}
                     onChange={e => setNewMessage(e.target.value)}
                     onKeyPress={e => e.key === 'Enter' && handleSendMessage('text', newMessage)}
                     disabled={isRecording}
                   />
               </div>

               {/* Send Button */}
               <button 
                 onClick={() => handleSendMessage('text', newMessage)}
                 disabled={!newMessage.trim() && !isRecording}
                 className="p-3 bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-800 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
               >
                   <Send size={20} className={currentUser.role === Role.Student ? "ml-0.5" : ""} /> 
               </button>
           </div>
       </div>
    </div>
  );
};
