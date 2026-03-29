"use client";

import { useEffect, useState, useRef } from "react";
import { TERMINAL_LINES } from "@/lib/data";

function TypewriterLine({
  text,
  renderText,
  type,
  showCursor
}: {
  text: string;
  renderText: string;
  type: string;
  showCursor: boolean;
}) {
  let colorClass = "text-text-primary";
  if (type === "cmd") colorClass = "text-text-primary";
  else if (type === "aegis") colorClass = "text-accent-cyan";
  else if (type === "tech-debt") colorClass = "text-accent-amber";
  else if (type === "migration") colorClass = "text-text-primary";
  else if (type === "architect") colorClass = "text-purple-400";
  else if (type === "security") colorClass = "text-[#FF6B6B]";
  else if (type === "audit") colorClass = "text-accent-green";
  else if (type === "error") colorClass = "text-danger";

  // Checkmark coloring
  const parts = renderText.split("✓");
  const hasCheck = text.includes("✓") && renderText.includes("✓");

  return (
    <div className={`font-mono text-[13px] sm:text-sm leading-relaxed ${colorClass}`}>
      {parts.length > 1 && hasCheck ? (
        <>
          {parts[0]} <span className="text-accent-green">✓</span> {parts[1]}
        </>
      ) : (
        renderText
      )}
      {showCursor && <span className="animate-blink inline-block ml-1 bg-accent-cyan text-transparent w-[8px]">█</span>}
    </div>
  );
}

export function TerminalAnimation() {
  const [lines, setLines] = useState<{ id: number; text: string; renderText: string; type: string; fullLength: number }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentLineIndex = 0;
    let currentCharIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const resetSequence = () => {
      setLines([]);
      currentLineIndex = 0;
      currentCharIndex = 0;
      typeNextCharacter();
    };

    const typeNextCharacter = () => {
      if (currentLineIndex >= TERMINAL_LINES.length) {
        timeoutId = setTimeout(resetSequence, 3000); // 3 seconds wait then loop
        return;
      }

      const lineData = TERMINAL_LINES[currentLineIndex];

      if (currentCharIndex === 0) {
        setLines(prev => [
          ...prev,
          { id: currentLineIndex, text: lineData.text, renderText: "", type: lineData.type, fullLength: lineData.text.length }
        ]);
      }

      setLines(prev => {
        const newLines = [...prev];
        const activeLine = newLines[newLines.length - 1];
        if (activeLine) {
          activeLine.renderText = lineData.text.substring(0, currentCharIndex + 1);
        }
        return newLines;
      });

      currentCharIndex++;

      if (currentCharIndex >= lineData.text.length) {
        currentLineIndex++;
        currentCharIndex = 0;
        timeoutId = setTimeout(typeNextCharacter, 400); // 400ms pause between lines
      } else {
        timeoutId = setTimeout(typeNextCharacter, 20); // sped up slightly to not take 10 minutes
      }
    };

    typeNextCharacter();

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="w-full h-full max-h-[500px] flex flex-col rounded-lg border border-borderline bg-black shadow-2xl overflow-hidden relative group">
      {/* Terminal Chrome Bar */}
      <div className="flex items-center px-4 py-3 bg-[#131b2c] border-b border-borderline z-10 sticky top-0">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
        </div>
        <div className="w-full text-center text-xs font-mono text-text-muted select-none">aegis-factory — zsh</div>
      </div>

      {/* Terminal Body */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 md:p-6 overflow-y-auto scroll-smooth custom-scrollbar"
      >
        {lines.map((l, i) => {
          const isLatestLine = i === lines.length - 1;
          const isTypingFinished = l.renderText.length === l.fullLength;
          let showCursor = false;
          if (isLatestLine && !isTypingFinished) {
             showCursor = true;
          } else if (isLatestLine && isTypingFinished && i === TERMINAL_LINES.length - 1) {
             showCursor = true; // blinking cursor wait state at end
          }

          return (
            <TypewriterLine 
              key={l.id} 
              text={l.text} 
              renderText={l.renderText} 
              type={l.type} 
              showCursor={showCursor} 
            />
          );
        })}
        {lines.length > 0 && lines[lines.length - 1].renderText.length === lines[lines.length - 1].fullLength && lines.length < TERMINAL_LINES.length && (
           <div className="font-mono text-[13px] sm:text-sm animate-blink text-accent-cyan mt-1">█</div>
        )}
      </div>

      {/* Cyberpunk Scanline Overlays on Terminal */}
      <div className="absolute inset-0 pointer-events-none bg-scanline opacity-[0.15] z-0 mix-blend-overlay"></div>
    </div>
  );
}
