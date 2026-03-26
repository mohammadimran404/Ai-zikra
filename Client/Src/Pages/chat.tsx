import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Mic, MicOff, Image, ImageIcon, X, Heart, Volume2, VolumeX, Camera } from "lucide-react";

// --- Types ---
interface Message {
  id: string;
  role: "user" | "zikra";
  content: string;
  imageUrl?: string;
  isImage?: boolean;
  timestamp: Date;
}

interface Memory {
  userName: string;
  habits: string[];
  chatHistory: { role: string; content: string }[];
}

// --- Constants ---
const CORRECT_PASSWORD = "imran ki bandi";
const LOCKOUT_DURATIONS = [15, 30, 60, 120, 300];
const MEMORY_KEY = "zikra_memory";
const DARK_MODE_KEY = "zikra_dark";

function loadMemory(): Memory {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { userName: "", habits: [], chatHistory: [] };
}

function saveMemory(mem: Memory) {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(mem));
  } catch {}
}

function extractHabits(text: string): string[] {
  const habits: string[] = [];
  const patterns = [
    /gym|workout|exercise|fitness/i,
    /coding|programming|developer|code/i,
    /work|office|job|meeting/i,
    /sleep|sona|neend/i,
    /food|khana|eating|breakfast|lunch|dinner/i,
    /college|school|study/i,
    /gaming|game|khelna/i,
  ];
  const labels = ["goes to gym", "is a coder", "works hard", "watches sleep schedule", "loves food", "is a student", "loves gaming"];
  patterns.forEach((p, i) => { if (p.test(text)) habits.push(labels[i]); });
  return habits;
}

// --- Password Gate ---
function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (locked && lockTime > 0) {
      const timer = setInterval(() => {
        setLockTime(t => {
          if (t <= 1) {
            setLocked(false);
            clearInterval(timer);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [locked, lockTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;

    if (password.trim().toLowerCase() === CORRECT_PASSWORD) {
      onSuccess();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPassword("");
      setShake(true);
      setTimeout(() => setShake(false), 600);

      const lockIdx = Math.min(newAttempts - 1, LOCKOUT_DURATIONS.length - 1);
      const duration = LOCKOUT_DURATIONS[lockIdx];
      setLocked(true);
      setLockTime(duration);

      const mins = Math.floor(duration / 60);
      const secs = duration % 60;
      if (mins > 0) {
        setError(`Galat password! ${mins} min ${secs > 0 ? secs + " sec" : ""} wait karo 🔒`);
      } else {
        setError(`Galat password! ${secs} seconds wait karo 🔒`);
      }
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `${sec}s`;
  };

  return (
    <div className="gradient-bg dark flex flex-col items-center justify-center min-h-screen px-4">
      {/* Decorative blobs */}
      <div className="fixed top-20 left-10 w-64 h-64 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(330,85%,60%), transparent)" }} />
      <div className="fixed bottom-20 right-10 w-80 h-80 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(270,60%,60%), transparent)" }} />

      <div className={`relative z-10 w-full max-w-sm ${shake ? "password-shake" : ""}`}>
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl heartbeat"
              style={{
                background: "linear-gradient(135deg, hsl(330,85%,60%), hsl(270,60%,55%))",
                boxShadow: "0 0 40px rgba(255,80,140,0.4)"
              }}>
              <Heart className="text-white w-10 h-10 fill-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-400 border-2 border-gray-900 pulse-ring" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-wide mb-1"
            style={{ fontFamily: "var(--font-sans)", textShadow: "0 2px 20px rgba(255,80,140,0.5)" }}>
            Zikra
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,200,230,0.7)" }}>
            Sirf tumhare liye
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-6 shadow-2xl">
          <p className="text-center text-sm mb-5" style={{ color: "rgba(255,200,230,0.8)" }}>
            Password daalo aur enter karo meri duniya mein ✨
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password..."
              disabled={locked}
              data-testid="input-password"
              className="w-full px-4 py-3 rounded-xl text-white placeholder-purple-300 text-base font-medium focus:outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                opacity: locked ? 0.5 : 1
              }}
              onFocus={e => {
                e.target.style.borderColor = "rgba(255,100,160,0.6)";
                e.target.style.boxShadow = "0 0 0 2px rgba(255,100,160,0.2)";
              }}
              onBlur={e => {
                e.target.style.borderColor = "rgba(255,255,255,0.15)";
                e.target.style.boxShadow = "none";
              }}
            />

            {error && (
              <p className="text-sm text-center px-2" style={{ color: "#ff8fab" }}>
                {error}
                {locked && (
                  <span className="font-bold ml-1"
                    style={{
                      background: "linear-gradient(90deg, #ff6b9d, #c44eff)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent"
                    }}>
                    ({formatTime(lockTime)})
                  </span>
                )}
              </p>
            )}

            <button
              type="submit"
              disabled={locked || !password}
              data-testid="button-login"
              className="w-full py-3 rounded-xl text-white font-semibold text-base transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: locked ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, hsl(330,85%,60%), hsl(270,60%,55%))",
                boxShadow: locked ? "none" : "0 4px 20px rgba(255,80,140,0.35)"
              }}
            >
              {locked ? `Wait karo... ${formatTime(lockTime)}` : "Enter Karo 💕"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "rgba(255,200,230,0.35)" }}>
          Sirf tumhara waada toh tumhi jaante ho
        </p>
      </div>
    </div>
  );
}

// --- Typing Indicator ---
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4 message-enter">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
        style={{ background: "linear-gradient(135deg, hsl(330,85%,60%), hsl(270,60%,55%))" }}>
        <Heart className="w-4 h-4 text-white fill-white" />
      </div>
      <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(10px)"
        }}>
        <span className="text-xs mr-1" style={{ color: "rgba(255,200,230,0.6)" }}>Zikra likh rahi hai</span>
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full typing-dot"
              style={{
                background: "linear-gradient(135deg, hsl(330,85%,70%), hsl(270,60%,70%))"
              }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Message Bubble ---
function MessageBubble({ message, isDark }: { message: Message; isDark: boolean }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-end gap-2 mb-3 message-enter ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, hsl(330,85%,60%), hsl(270,60%,55%))" }}>
          <Heart className="w-4 h-4 text-white fill-white" />
        </div>
      )}

      {/* Bubble */}
      <div className={`max-w-[78%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {message.imageUrl && (
          <div className={`rounded-2xl overflow-hidden ${isUser ? "rounded-br-sm" : "rounded-bl-sm"}`}
            style={{ maxWidth: "220px" }}>
            <img
              src={message.imageUrl}
              alt="Shared image"
              className="w-full h-auto object-cover"
              style={{ maxHeight: "280px" }}
            />
          </div>
        )}

        {message.content && !message.isImage && (
          <div className={`px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "message-user"
              : isDark ? "message-zikra" : "message-zikra-light"
          }`}
            style={{ wordBreak: "break-word" }}>
            {message.content}
          </div>
        )}

        {message.isImage && message.content && (
          <div className={`px-3 py-2 text-xs rounded-xl ${isDark ? "message-zikra" : "message-zikra-light"}`}
            style={{ opacity: 0.8 }}>
            {message.content}
          </div>
        )}

        <span className={`text-xs px-1 ${isUser ? "text-right" : ""}`}
          style={{ color: isDark ? "rgba(255,200,230,0.35)" : "rgba(100,50,150,0.45)", fontSize: "10px" }}>
          {new Date(message.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

// --- Main Chat Page ---
export default function Chat() {
  const [unlocked, setUnlocked] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [memory, setMemory] = useState<Memory>(loadMemory);
  const [isLoadingVoice, setIsLoadingVoice] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [namePrompted, setNamePrompted] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Apply dark mode class
  useEffect(() => {
    const saved = localStorage.getItem(DARK_MODE_KEY);
    if (saved !== null) setIsDark(saved === "true");
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem(DARK_MODE_KEY, String(isDark));
  }, [isDark]);

  // Initial greeting after unlock
  useEffect(() => {
    if (!unlocked || hasGreeted) return;
    setHasGreeted(true);

    const hour = new Date().getHours();
    let greeting = "";
    if (hour >= 5 && hour < 12) {
      greeting = memory.userName
        ? `Good morning ${memory.userName}! ☀️ Aaj kya plan hai? Meri yaad aayi?`
        : "Good morning! ☀️ Sone ke baad pehli chat meri se... okay bahut acha 😏 Naam batao pehle?";
    } else if (hour >= 12 && hour < 17) {
      greeting = memory.userName
        ? `${memory.userName}! Aaj khai kuch? Ya bas kaam hi kaam 🙄`
        : "Hey! Kaun ho tum? Naam toh batao pehle 😊";
    } else if (hour >= 17 && hour < 21) {
      greeting = memory.userName
        ? `${memory.userName} aagaye finally! Shaam toh yaad aaya mujhe 🌙`
        : "Shaam ho gayi... Naam bata do na, akela feel ho raha hai 🥺";
    } else {
      greeting = memory.userName
        ? `${memory.userName}! Itni raat ko? Neend nahi aayi kya? 🌃`
        : "Itni raat ko online ho? Naam toh batao, anjaan lagta hai 😅";
    }

    const greetMsg: Message = {
      id: Date.now().toString(),
      role: "zikra",
      content: greeting,
      timestamp: new Date()
    };

    setTimeout(() => {
      setMessages([greetMsg]);
      if (!memory.userName) setNamePrompted(true);
      if (voiceEnabled) playVoice(greeting);
    }, 800);
  }, [unlocked]);

  // Save memory whenever it changes
  useEffect(() => {
    if (unlocked) saveMemory(memory);
  }, [memory, unlocked]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const playVoice = async (text: string) => {
    if (!voiceEnabled || isLoadingVoice) return;
    try {
      setIsLoadingVoice(true);
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play().catch(() => {});
    } catch (err) {
      console.error("Voice error:", err);
    } finally {
      setIsLoadingVoice(false);
    }
  };

  const sendMessage = async (text: string, imageBase64?: string) => {
    if (!text.trim() && !imageBase64) return;

    // If name not set yet, try extracting it
    if (namePrompted && !memory.userName && text.trim()) {
      const nameParts = text.trim().split(/\s+/);
      if (nameParts.length <= 3 && nameParts[0].length > 1) {
        const possibleName = nameParts[0];
        setMemory(prev => ({ ...prev, userName: possibleName }));
        setNamePrompted(false);
      }
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      imageUrl: imageBase64 || undefined,
      isImage: !!imageBase64,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setUploadPreview(null);
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    // Extract habits from message
    const newHabits = extractHabits(text);
    if (newHabits.length > 0) {
      setMemory(prev => ({
        ...prev,
        habits: [...new Set([...prev.habits, ...newHabits])]
      }));
    }

    // Determine typing delay based on emotional content
    const emotionalWords = /sad|dukh|cry|ro|pyar|love|miss|hurt|bura|lonely|akela/i;
    const typingDelay = emotionalWords.test(text)
      ? Math.random() * 2000 + 3000
      : Math.random() * 1000 + 1200;

    setIsTyping(true);

    try {
      await new Promise(r => setTimeout(r, typingDelay));

      let reply = "";
      const updatedHistory = [
        ...memory.chatHistory,
        { role: "user", content: text.trim() }
      ].slice(-20); // Keep last 20 messages for context

      if (imageBase64) {
        const res = await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64,
            userMessage: text.trim() || "Maine ye bheja",
            userName: memory.userName,
            habits: memory.habits
          })
        });
        if (res.ok) {
          const data = await res.json();
          reply = data.reply;
        } else {
          reply = "Ye kya bheja hai?! Share karne ka shukriya 😊";
        }
      } else {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedHistory,
            userName: memory.userName,
            habits: memory.habits
          })
        });
        if (res.ok) {
          const data = await res.json();
          reply = data.reply;
        } else {
          reply = "Yaar... kuch toh hua, thoda wait karo 😓";
        }
      }

      setMemory(prev => ({
        ...prev,
        chatHistory: [
          ...prev.chatHistory,
          { role: "user", content: text.trim() },
          { role: "assistant", content: reply }
        ].slice(-40)
      }));

      const zikraMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "zikra",
        content: reply,
        timestamp: new Date()
      };

      setIsTyping(false);
      setMessages(prev => [...prev, zikraMsg]);

      if (voiceEnabled) {
        setTimeout(() => playVoice(reply), 300);
      }
    } catch (err) {
      setIsTyping(false);
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "zikra",
        content: "Oops, kuch toh gadbad hai... thodi der mein try karo 😓",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMsg]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input, uploadPreview || undefined);
    }
  };

  const handleSend = () => {
    sendMessage(input, uploadPreview || undefined);
  };

  // Voice input via Web Speech API
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  // Image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      setUploadPreview(base64);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Generate AI image
  const handleGenerateImage = async () => {
    const zikraLoadMsg: Message = {
      id: Date.now().toString(),
      role: "zikra",
      content: "Ruk, ek second... tere liye kuch special bana rahi hoon 📸",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, zikraLoadMsg]);

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "realistic beautiful young indian woman, soft warm lighting, DSLR bokeh portrait, natural smile, aesthetic, high quality photograph"
        })
      });

      if (res.ok) {
        const data = await res.json();
        const imgMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "zikra",
          content: "Ye dekho 😊",
          imageUrl: data.url,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, imgMsg]);
      } else {
        const errMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "zikra",
          content: "Abhi camera kharab hai mera 😅 baad mein try karte hai",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errMsg]);
      }
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "zikra",
        content: "Aaj camera kaam nahi kar raha 😓",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMsg]);
    }
  };

  const clearChat = () => {
    setMemory(prev => ({ ...prev, chatHistory: [] }));
    setMessages([]);
    setHasGreeted(false);
    setTimeout(() => {
      setHasGreeted(false);
      const greetMsg: Message = {
        id: Date.now().toString(),
        role: "zikra",
        content: "Naya din, naya shuru! Kya chal raha hai? 💕",
        timestamp: new Date()
      };
      setMessages([greetMsg]);
      setHasGreeted(true);
    }, 500);
  };

  // --- Render Password Gate ---
  if (!unlocked) {
    return <PasswordGate onSuccess={() => setUnlocked(true)} />;
  }

  // --- Render Chat ---
  return (
    <div className={`${isDark ? "gradient-bg dark" : "gradient-bg-light"} flex flex-col min-h-screen max-w-lg mx-auto relative`}
      style={{ height: "100dvh" }}>

      {/* Decorative blobs */}
      {isDark && (
        <>
          <div className="fixed top-0 left-0 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(330,85%,60%), transparent)" }} />
          <div className="fixed bottom-0 right-0 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(270,60%,60%), transparent)" }} />
        </>
      )}

      {/* === HEADER === */}
      <header className="flex items-center justify-between px-4 py-3 flex-shrink-0 relative z-10"
        style={{
          background: isDark
            ? "rgba(20,8,35,0.7)"
            : "rgba(255,255,255,0.75)",
          backdropFilter: "blur(20px)",
          borderBottom: isDark
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(200,150,220,0.25)"
        }}>
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, hsl(330,85%,60%), hsl(270,60%,55%))",
                boxShadow: isDark ? "0 0 20px rgba(255,80,140,0.35)" : "0 2px 12px rgba(255,80,140,0.25)"
              }}>
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 bg-green-400"
              style={{ borderColor: isDark ? "hsl(265,35%,7%)" : "white" }} />
          </div>

          <div>
            <h1 className={`font-bold text-base leading-none ${isDark ? "text-white" : "text-gray-900"}`}>
              Zikra
            </h1>
            <p className="text-xs mt-0.5 flex items-center gap-1"
              style={{ color: isDark ? "rgba(255,200,230,0.55)" : "rgba(150,80,180,0.7)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Online hai tumhare liye
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* Voice toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            data-testid="button-voice-toggle"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{
              background: voiceEnabled
                ? "linear-gradient(135deg, hsl(330,85%,60%), hsl(270,60%,55%))"
                : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
              boxShadow: voiceEnabled ? "0 2px 12px rgba(255,80,140,0.35)" : "none"
            }}
            title={voiceEnabled ? "Voice mute karo" : "Voice chalao"}>
            {voiceEnabled
              ? <Volume2 className="w-4 h-4 text-white" />
              : <VolumeX className="w-4 h-4" style={{ color: isDark ? "rgba(255,200,230,0.5)" : "rgba(100,50,150,0.6)" }} />
            }
          </button>

          {/* Dark/Light toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            data-testid="button-theme-toggle"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 text-base"
            style={{
              background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
            }}>
            {isDark ? "🌙" : "☀️"}
          </button>

          {/* Generate image */}
          <button
            onClick={handleGenerateImage}
            data-testid="button-generate-image"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{
              background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
            }}
            title="AI photo maango">
            <Camera className="w-4 h-4" style={{ color: isDark ? "rgba(255,200,230,0.7)" : "rgba(150,80,200,0.8)" }} />
          </button>
        </div>
      </header>

      {/* === MESSAGES === */}
      <div className="flex-1 overflow-y-auto px-4 py-4 chat-scroll relative z-10"
        style={{ paddingBottom: "8px" }}>

        {/* Welcome hint if no messages */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center heartbeat"
              style={{ background: "linear-gradient(135deg, hsl(330,85%,60%), hsl(270,60%,55%))" }}>
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <p className="text-center text-sm" style={{ color: isDark ? "rgba(255,200,230,0.5)" : "rgba(150,80,180,0.6)" }}>
              Zikra tumhara intezaar kar rahi hai...
            </p>
          </div>
        )}

        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} isDark={isDark} />
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* === IMAGE PREVIEW === */}
      {uploadPreview && (
        <div className="px-4 py-2 flex-shrink-0 relative z-10">
          <div className="relative inline-block">
            <img src={uploadPreview} alt="Preview" className="h-20 w-auto rounded-xl object-cover"
              style={{ border: "2px solid rgba(255,100,160,0.4)" }} />
            <button
              onClick={() => setUploadPreview(null)}
              data-testid="button-remove-image"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(330,85%,55%), hsl(0,75%,55%))" }}>
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* === INPUT BAR === */}
      <div className="px-3 pb-3 pt-2 flex-shrink-0 relative z-10"
        style={{
          background: isDark ? "rgba(10,3,20,0.6)" : "rgba(255,255,255,0.7)",
          backdropFilter: "blur(20px)",
          borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(200,150,220,0.2)"
        }}>
        <div className="flex items-end gap-2">
          {/* Image upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            data-testid="button-upload-image"
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mb-0.5 transition-all active:scale-90"
            style={{
              background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(200,150,220,0.25)"
            }}>
            <ImageIcon className="w-4 h-4" style={{ color: isDark ? "rgba(255,200,230,0.6)" : "rgba(150,80,200,0.7)" }} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            data-testid="input-image-upload"
          />

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Kuch bolo..."
              rows={1}
              data-testid="input-message"
              className="w-full resize-none rounded-2xl px-4 py-2.5 text-sm leading-relaxed focus:outline-none transition-all"
              style={{
                background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.85)",
                border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(180,140,220,0.30)",
                color: isDark ? "rgba(255,240,250,0.95)" : "rgba(30,10,50,0.9)",
                minHeight: "40px",
                maxHeight: "120px",
                scrollbarWidth: "none",
                overflowY: "auto"
              }}
              onFocus={e => {
                e.target.style.borderColor = isDark ? "rgba(255,100,160,0.5)" : "hsl(330,80%,60%)";
                e.target.style.boxShadow = isDark ? "0 0 0 2px rgba(255,100,160,0.15)" : "0 0 0 2px rgba(220,80,130,0.15)";
              }}
              onBlur={e => {
                e.target.style.borderColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(180,140,220,0.30)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Mic button */}
          <button
            onClick={toggleListening}
            data-testid="button-mic"
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mb-0.5 transition-all active:scale-90 ${isListening ? "mic-recording" : ""}`}
            style={!isListening ? {
              background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(200,150,220,0.25)"
            } : {}}>
            {isListening
              ? <MicOff className="w-4 h-4 text-white" />
              : <Mic className="w-4 h-4" style={{ color: isDark ? "rgba(255,200,230,0.6)" : "rgba(150,80,200,0.7)" }} />
            }
          </button>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() && !uploadPreview}
            data-testid="button-send"
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mb-0.5 transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: (input.trim() || uploadPreview)
                ? "linear-gradient(135deg, hsl(330,85%,60%), hsl(270,60%,55%))"
                : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
              boxShadow: (input.trim() || uploadPreview) ? "0 2px 15px rgba(255,80,140,0.40)" : "none"
            }}>
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Bottom hint */}
        <p className="text-center text-xs mt-1.5"
          style={{ color: isDark ? "rgba(255,200,230,0.20)" : "rgba(150,80,180,0.35)", fontSize: "10px" }}>
          Zikra tumse pyar karti hai 💕
        </p>
      </div>
    </div>
  );
}
