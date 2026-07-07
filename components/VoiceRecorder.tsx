"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function VoiceRecorder({
  onTranscript,
}: {
  onTranscript: (text: string) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  function startRecording() {
    // Try browser SpeechRecognition first (no server needed)
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      let finalTranscript = "";

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          }
        }
      };

      recognition.onend = () => {
        setRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (finalTranscript.trim()) {
          onTranscript(finalTranscript.trim());
        }
      };

      recognition.onerror = () => {
        setRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
      return;
    }

    // Fallback to MediaRecorder
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          setTranscribing(true);
          try {
            const blob = new Blob(chunksRef.current, { type: "audio/webm" });
            const reader = new FileReader();
            reader.onloadend = async () => {
              const base64 = (reader.result as string).split(",")[1];
              try {
                const res = await fetch("/api/chat", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "transcribe_audio",
                    payload: { audioBase64: base64 },
                  }),
                });
                const data = await res.json();
                if (data.text) onTranscript(data.text);
              } catch {
                // Transcription failed
              } finally {
                setTranscribing(false);
              }
            };
            reader.readAsDataURL(blob);
          } catch {
            setTranscribing(false);
          }
        };

        mediaRecorder.start();
        setRecording(true);
        setElapsed(0);
        timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
      })
      .catch(() => {
        // Microphone access denied
      });
  }

  function stopRecording() {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={recording ? stopRecording : startRecording}
        disabled={transcribing}
        className={`relative p-2 rounded-lg border transition-colors ${
          recording
            ? "bg-neon-red/20 border-neon-red/30 text-neon-red"
            : "bg-[rgba(0,245,255,0.05)] border-[rgba(0,245,255,0.1)] text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)]"
        } disabled:opacity-50`}
        title={recording ? "Stop recording" : "Start voice recording"}
      >
        {recording ? (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </motion.div>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}
        {recording && (
          <motion.div
            className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-red rounded-full"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        )}
      </button>
      <AnimatePresence>
        {recording && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="text-[11px] font-mono text-neon-red overflow-hidden whitespace-nowrap"
          >
            {formatTime(elapsed)}
          </motion.span>
        )}
        {transcribing && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] font-mono text-muted"
          >
            Transcribing...
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
