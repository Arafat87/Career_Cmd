"use client";

const ASCII_LOGO = `
 ██████╗ █████╗ ██████╗ ███████╗███████╗██████╗      ██████╗███╗   ███╗██████╗
██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗    ██╔════╝████╗ ████║██╔══██╗
██║     ███████║██████╔╝█████╗  █████╗  ██████╔╝    ██║     ██╔████╔██║██║  ██║
██║     ██╔══██║██╔══██╗██╔══╝  ██╔══╝  ██╔══██╗    ██║     ██║╚██╔╝██║██║  ██║
╚██████╗██║  ██║██║  ██║███████╗███████╗██║  ██║    ╚██████╗██║ ╚═╝ ██║██████╔╝
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝     ╚═════╝╚═╝     ╚═╝╚═════╝`;

export default function AsciiArt({ color = "#00F5FF", className = "" }: { color?: string; className?: string }) {
  return (
    <pre className={`font-mono text-[7px] leading-tight select-none whitespace-pre ${className}`} style={{ color, textShadow: `0 0 8px ${color}40` }}>
      {ASCII_LOGO}
    </pre>
  );
}
