"use client";

import { useState } from "react";
import Card from "@/components/Card";
import GlowText from "@/components/GlowText";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import LoadingBar from "@/components/LoadingBar";
import HudCorners from "@/components/HudCorners";

export default function SalaryCalculatorPage() {
  const [base, setBase] = useState(120000);
  const [signingBonus, setSigningBonus] = useState(15000);
  const [rsu, setRsu] = useState(50000);
  const [annualBonus, setAnnualBonus] = useState(10);
  const [counterOffer, setCounterOffer] = useState(0);
  const [showCounter, setShowCounter] = useState(false);

  const totalComp = base + signingBonus + rsu + (base * annualBonus / 100);
  const counterTotal = counterOffer ? counterOffer + signingBonus + rsu + (counterOffer * annualBonus / 100) : 0;
  const diff = counterTotal - totalComp;

  const negotiationTips = [
    "Always let them make the first offer",
    "Research market rates on Levels.fyi, Glassdoor, Blind",
    "Negotiate total compensation, not just base salary",
    "Use competing offers as leverage (even if you won't accept them)",
    "Ask for more RSUs if base is capped",
    "Negotiate signing bonus as a one-time sweetener",
    "Consider remote work flexibility as a benefit",
    "Get all offers in writing before deciding",
    "Don't accept immediately — ask for 48-72 hours",
    "Be enthusiastic but firm: 'I'm excited about this role, but the numbers need to work'",
  ];

  const counterScenarios = [
    { label: "10% Higher", multiplier: 1.1 },
    { label: "15% Higher", multiplier: 1.15 },
    { label: "20% Higher", multiplier: 1.2 },
    { label: "25% Higher", multiplier: 1.25 },
  ];

  return (
    <AnimatedContainer className="space-y-6">
      <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">SALARY NEGOTIATION CALCULATOR</GlowText>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card hover={false}>
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-4">OFFER DETAILS</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-muted mb-1">BASE SALARY</label>
              <div className="flex items-center gap-3">
                <span className="text-neon-cyan font-mono text-sm">$</span>
                <input type="number" value={base} onChange={(e) => setBase(Number(e.target.value))}
                  className="flex-1 bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-muted mb-1">SIGNING BONUS</label>
              <div className="flex items-center gap-3">
                <span className="text-neon-cyan font-mono text-sm">$</span>
                <input type="number" value={signingBonus} onChange={(e) => setSigningBonus(Number(e.target.value))}
                  className="flex-1 bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-muted mb-1">RSU / EQUITY (4yr total)</label>
              <div className="flex items-center gap-3">
                <span className="text-neon-cyan font-mono text-sm">$</span>
                <input type="number" value={rsu} onChange={(e) => setRsu(Number(e.target.value))}
                  className="flex-1 bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-muted mb-1">ANNUAL BONUS (%)</label>
              <input type="number" value={annualBonus} onChange={(e) => setAnnualBonus(Number(e.target.value))}
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground" />
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-neon-cyan/5 border border-neon-cyan/20">
            <p className="text-[10px] font-mono text-muted uppercase">TOTAL COMPENSATION (YEAR 1)</p>
            <p className="text-3xl font-mono font-bold text-neon-cyan mt-1">${totalComp.toLocaleString()}</p>
            <LoadingBar progress={Math.min(100, totalComp / 5000)} color="#00F5FF" className="mt-3" />
          </div>
        </Card>

        {/* Counter Offer Section */}
        <Card hover={false}>
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-4">COUNTER OFFER</h3>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {counterScenarios.map((s) => (
              <button key={s.label} onClick={() => { setCounterOffer(Math.round(base * s.multiplier)); setShowCounter(true); }}
                className="px-3 py-2 rounded-lg border border-neon-purple/20 text-xs font-mono text-neon-purple hover:bg-neon-purple/10 transition-colors">
                {s.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[10px] font-mono text-muted mb-1">CUSTOM COUNTER BASE</label>
            <div className="flex items-center gap-3">
              <span className="text-neon-purple font-mono text-sm">$</span>
              <input type="number" value={counterOffer} onChange={(e) => { setCounterOffer(Number(e.target.value)); setShowCounter(true); }}
                className="flex-1 bg-[#0a0a12] border border-[rgba(191,0,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground" />
            </div>
          </div>

          {showCounter && counterOffer > 0 && (
            <div className="mt-6 p-4 rounded-lg bg-neon-purple/5 border border-neon-purple/20 space-y-2">
              <p className="text-[10px] font-mono text-muted uppercase">COUNTER TOTAL (YEAR 1)</p>
              <p className="text-3xl font-mono font-bold text-neon-purple">${counterTotal.toLocaleString()}</p>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-mono font-bold ${diff >= 0 ? "text-neon-green" : "text-neon-red"}`}>
                  {diff >= 0 ? "+" : ""}${diff.toLocaleString()}
                </span>
                <span className="text-[10px] font-mono text-muted">({diff >= 0 ? "+" : ""}{((diff / totalComp) * 100).toFixed(1)}%)</span>
              </div>
              <LoadingBar progress={Math.min(100, counterTotal / 5000)} color="#BF00FF" className="mt-2" />
            </div>
          )}
        </Card>
      </div>

      {/* Negotiation Tips */}
      <Card hover={false}>
        <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-4">NEGOTIATION PLAYBOOK</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {negotiationTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-[rgba(0,245,255,0.03)] transition-colors">
              <span className="text-neon-cyan font-mono text-[10px] mt-0.5">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-xs font-mono text-foreground/70">{tip}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Breakdown Comparison */}
      {showCounter && counterOffer > 0 && (
        <Card hover={false}>
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-4">SIDE-BY-SIDE COMPARISON</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="text-[10px] font-mono text-muted uppercase">COMPONENT</div>
            <div className="text-[10px] font-mono text-neon-cyan uppercase">ORIGINAL</div>
            <div className="text-[10px] font-mono text-neon-purple uppercase">COUNTER</div>

            <div className="text-xs font-mono text-foreground">Base</div>
            <div className="text-xs font-mono text-foreground">${base.toLocaleString()}</div>
            <div className="text-xs font-mono text-neon-purple">${counterOffer.toLocaleString()}</div>

            <div className="text-xs font-mono text-foreground">Signing Bonus</div>
            <div className="text-xs font-mono text-foreground">${signingBonus.toLocaleString()}</div>
            <div className="text-xs font-mono text-foreground">${signingBonus.toLocaleString()}</div>

            <div className="text-xs font-mono text-foreground">RSU/Equity</div>
            <div className="text-xs font-mono text-foreground">${rsu.toLocaleString()}</div>
            <div className="text-xs font-mono text-foreground">${rsu.toLocaleString()}</div>

            <div className="text-xs font-mono text-foreground">Annual Bonus</div>
            <div className="text-xs font-mono text-foreground">${(base * annualBonus / 100).toLocaleString()}</div>
            <div className="text-xs font-mono text-foreground">${(counterOffer * annualBonus / 100).toLocaleString()}</div>

            <div className="text-xs font-mono font-bold text-foreground border-t border-[rgba(0,245,255,0.1)] pt-2">TOTAL YEAR 1</div>
            <div className="text-sm font-mono font-bold text-neon-cyan border-t border-[rgba(0,245,255,0.1)] pt-2">${totalComp.toLocaleString()}</div>
            <div className="text-sm font-mono font-bold text-neon-purple border-t border-[rgba(191,0,255,0.1)] pt-2">${counterTotal.toLocaleString()}</div>
          </div>
        </Card>
      )}
    </AnimatedContainer>
  );
}
