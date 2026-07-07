"use client";

import { useState } from "react";
import Card from "@/components/Card";
import GlowText from "@/components/GlowText";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import LoadingBar from "@/components/LoadingBar";
import ElectricBorder from "@/components/ElectricBorder";

interface Offer {
  id: number;
  company: string;
  title: string;
  base: number;
  signingBonus: number;
  rsu: number;
  annualBonusPct: number;
  pto: number;
  remote: string;
  location: string;
  benefits: string;
  growthScore: number;
  cultureScore: number;
  notes: string;
}

const EMPTY_OFFER: Omit<Offer, "id"> = {
  company: "", title: "", base: 0, signingBonus: 0, rsu: 0, annualBonusPct: 0,
  pto: 0, remote: "Hybrid", location: "", benefits: "", growthScore: 5, cultureScore: 5, notes: "",
};

function calcTotal(o: Offer) {
  return o.base + o.signingBonus + o.rsu + (o.base * o.annualBonusPct / 100);
}

function calcScore(o: Offer) {
  const total = calcTotal(o);
  const totalNorm = Math.min(40, (total / 5000));
  return Math.round(totalNorm + o.growthScore * 2 + o.cultureScore * 2 + (o.pto / 5) + (o.remote === "Remote" ? 10 : o.remote === "Hybrid" ? 5 : 0));
}

export default function OfferComparisonPage() {
  const [offers, setOffers] = useState<Offer[]>([
    { ...EMPTY_OFFER, id: 1, company: "Company A", title: "Senior Engineer" },
    { ...EMPTY_OFFER, id: 2, company: "Company B", title: "Staff Engineer" },
  ]);

  function updateOffer(id: number, field: keyof Offer, value: any) {
    setOffers((prev) => prev.map((o) => o.id === id ? { ...o, [field]: value } : o));
  }

  function addOffer() {
    const id = Math.max(...offers.map((o) => o.id), 0) + 1;
    setOffers((prev) => [...prev, { ...EMPTY_OFFER, id, company: `Company ${String.fromCharCode(64 + id)}` }]);
  }

  function removeOffer(id: number) {
    if (offers.length <= 2) return;
    setOffers((prev) => prev.filter((o) => o.id !== id));
  }

  const sorted = [...offers].sort((a, b) => calcScore(b) - calcScore(a));

  return (
    <AnimatedContainer className="space-y-6">
      <div className="flex items-center justify-between">
        <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">OFFER COMPARISON</GlowText>
        <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
          <button onClick={addOffer}
            className="px-3 py-1.5 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-xs text-neon-cyan hover:bg-neon-cyan/30 transition-colors">+ ADD OFFER</button>
        </ElectricBorder>
      </div>

      {/* Scoring Summary */}
      <Card hover={false}>
        <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-3">RANKING</h3>
        <div className="space-y-2">
          {sorted.map((o, i) => (
            <div key={o.id} className="flex items-center gap-3">
              <span className={`text-lg font-mono font-bold w-6 ${i === 0 ? "text-neon-green" : i === 1 ? "text-neon-cyan" : "text-muted"}`}>
                {i === 0 ? "1st" : i === 1 ? "2nd" : `${i + 1}th`}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-foreground">{o.company || "Unnamed"}</span>
                  <span className="text-xs font-mono" style={{ color: i === 0 ? "#00FF88" : "#00F5FF" }}>{calcScore(o)} pts</span>
                </div>
                <LoadingBar progress={calcScore(o)} color={i === 0 ? "#00FF88" : "#00F5FF"} segments={15} height={3} animated={false} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Offer Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {offers.map((offer) => {
          const total = calcTotal(offer);
          const score = calcScore(offer);
          return (
            <AnimatedItem key={offer.id}>
              <Card hover={false} className="border-neon-cyan/10">
                <div className="flex items-center justify-between mb-3">
                  <input value={offer.company} onChange={(e) => updateOffer(offer.id, "company", e.target.value)}
                    placeholder="Company" className="bg-transparent text-sm font-mono font-bold text-foreground outline-none flex-1" />
                  {offers.length > 2 && (
                    <button onClick={() => removeOffer(offer.id)} className="text-muted hover:text-neon-red text-xs">✕</button>
                  )}
                </div>
                <input value={offer.title} onChange={(e) => updateOffer(offer.id, "title", e.target.value)}
                  placeholder="Job Title" className="w-full bg-transparent text-xs font-mono text-muted outline-none mb-4" />

                <div className="space-y-3">
                  {[
                    { label: "BASE SALARY", field: "base" as const, type: "number" },
                    { label: "SIGNING BONUS", field: "signingBonus" as const, type: "number" },
                    { label: "RSU/EQUITY (4yr)", field: "rsu" as const, type: "number" },
                    { label: "ANNUAL BONUS %", field: "annualBonusPct" as const, type: "number" },
                    { label: "PTO DAYS", field: "pto" as const, type: "number" },
                  ].map((f) => (
                    <div key={f.field}>
                      <label className="block text-[9px] font-mono text-muted mb-0.5">{f.label}</label>
                      <input type={f.type} value={offer[f.field]} onChange={(e) => updateOffer(offer.id, f.field, Number(e.target.value))}
                        className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.1)] rounded px-2 py-1.5 text-xs font-mono text-foreground" />
                    </div>
                  ))}

                  <div>
                    <label className="block text-[9px] font-mono text-muted mb-0.5">WORK ARRANGEMENT</label>
                    <div className="flex gap-1">
                      {["Remote", "Hybrid", "On-site"].map((r) => (
                        <button key={r} onClick={() => updateOffer(offer.id, "remote", r)}
                          className={`flex-1 px-2 py-1 rounded text-[9px] font-mono transition-all ${offer.remote === r ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted"}`}>{r}</button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-mono text-muted mb-0.5">GROWTH ({offer.growthScore}/10)</label>
                      <input type="range" min="1" max="10" value={offer.growthScore} onChange={(e) => updateOffer(offer.id, "growthScore", Number(e.target.value))}
                        className="w-full accent-neon-cyan" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-muted mb-0.5">CULTURE ({offer.cultureScore}/10)</label>
                      <input type="range" min="1" max="10" value={offer.cultureScore} onChange={(e) => updateOffer(offer.id, "cultureScore", Number(e.target.value))}
                        className="w-full accent-neon-purple" />
                    </div>
                  </div>

                  <textarea value={offer.notes} onChange={(e) => updateOffer(offer.id, "notes", e.target.value)} placeholder="Notes..."
                    className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.1)] rounded px-2 py-1.5 text-xs font-mono text-foreground resize-none h-16" />
                </div>

                <div className="mt-4 p-3 rounded-lg bg-neon-cyan/5 border border-neon-cyan/15">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-muted">TOTAL YEAR 1</span>
                    <span className="text-lg font-mono font-bold text-neon-cyan">${total.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] font-mono text-muted">SCORE</span>
                    <span className="text-sm font-mono font-bold" style={{ color: score > 70 ? "#00FF88" : score > 50 ? "#FFD700" : "#FF2D55" }}>{score} pts</span>
                  </div>
                </div>
              </Card>
            </AnimatedItem>
          );
        })}
      </div>
    </AnimatedContainer>
  );
}
