"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import CategorySelector from "@/components/CategorySelector";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import ElectricBorder from "@/components/ElectricBorder";
import { fetchArray } from "@/lib/fetch-helpers";

interface Referral {
  id: number;
  contact_name: string;
  contact_email: string;
  company: string;
  position: string;
  status: string;
  date_referred: string;
  notes: string;
  referral_url: string;
}

const REFERRAL_STATUSES = [
  { value: "PENDING", label: "PENDING", color: "text-neon-yellow/70", bg: "bg-neon-yellow/10", border: "border-neon-yellow/20" },
  { value: "FOLLOWED UP", label: "FOLLOWED UP", color: "text-neon-purple/70", bg: "bg-neon-purple/10", border: "border-neon-purple/20" },
  { value: "REFERRED", label: "REFERRED", color: "text-neon-green/70", bg: "bg-neon-green/10", border: "border-neon-green/20" },
  { value: "NO RESPONSE", label: "NO RESPONSE", color: "text-neon-red/70", bg: "bg-neon-red/10", border: "border-neon-red/20" },
];

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRef, setEditingRef] = useState<Referral | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [form, setForm] = useState({
    contact_name: "",
    contact_email: "",
    company: "",
    position: "",
    status: "PENDING",
    date_referred: "",
    referral_url: "",
    notes: "",
  });

  useEffect(() => {
    fetchReferrals();
    fetchCategories();
  }, []);

  async function fetchReferrals() {
    const data = await fetchArray("/api/referrals");
    setReferrals(data as Referral[]);
  }

  async function fetchCategories() {
    const data = await fetchArray("/api/categories?scope=referrals");
    setCategories(data);
  }

  function getStatusStyle(status: string) {
    return REFERRAL_STATUSES.find((s) => s.value === status) || REFERRAL_STATUSES[0];
  }

  function getCategoryColor(name: string): string {
    const cat = categories.find((c: any) => c.name === name);
    return cat?.color || "#00F5FF";
  }

  function handleOpenModal(ref?: Referral) {
    if (ref) {
      setEditingRef(ref);
      setForm({
        contact_name: ref.contact_name,
        contact_email: ref.contact_email,
        company: ref.company,
        position: ref.position,
        status: ref.status,
        date_referred: ref.date_referred,
        referral_url: ref.referral_url,
        notes: ref.notes,
      });
    } else {
      setEditingRef(null);
      setForm({ contact_name: "", contact_email: "", company: "", position: "", status: "PENDING", date_referred: "", referral_url: "", notes: "" });
    }
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!form.contact_name.trim()) return;
    if (editingRef) {
      await fetch("/api/referrals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingRef.id, ...form }),
      });
    } else {
      await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setIsModalOpen(false);
    fetchReferrals();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this referral?")) return;
    await fetch(`/api/referrals?id=${id}`, { method: "DELETE" });
    fetchReferrals();
  }

  const filtered = filterStatus ? referrals.filter((r) => r.status === filterStatus) : referrals;
  const statusCounts = REFERRAL_STATUSES.map((s) => ({
    ...s,
    count: referrals.filter((r) => r.status === s.value).length,
  }));

  return (
    <>
      <AnimatedContainer>
        <div className="flex items-center justify-between mb-6">
          <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">
            {referrals.length} REFERRAL{referrals.length !== 1 ? "S" : ""}
          </GlowText>
          <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors"
            >
              + ADD REFERRAL
            </button>
          </ElectricBorder>
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterStatus("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              !filterStatus ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"
            }`}
          >
            ALL ({referrals.length})
          </button>
          {statusCounts.filter((s) => s.count > 0).map((s) => (
            <button
              key={s.value}
              onClick={() => setFilterStatus(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                filterStatus === s.value ? `${s.bg} ${s.color} border ${s.border}` : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"
              }`}
            >
              {s.label} ({s.count})
            </button>
          ))}
        </div>

        {/* Referrals grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((ref) => {
            const st = getStatusStyle(ref.status);
            return (
              <AnimatedItem key={ref.id}>
                <Card>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-mono font-semibold text-foreground">{ref.contact_name}</h4>
                        <p className="text-xs font-mono text-muted mt-0.5">{ref.company}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${st.color} ${st.bg} border ${st.border}`}>
                        {st.label}
                      </span>
                    </div>
                    {ref.position && (
                      <p className="text-xs font-mono text-foreground/80">{ref.position}</p>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-muted">
                      {ref.date_referred && <p>📅 {ref.date_referred}</p>}
                      {ref.contact_email && (
                        <a href={`mailto:${ref.contact_email}`} className="text-neon-cyan/50 hover:text-neon-cyan truncate">
                          ✉ {ref.contact_email}
                        </a>
                      )}
                    </div>
                    {ref.notes && <p className="text-xs font-mono text-foreground/60 line-clamp-2">{ref.notes}</p>}
                    {ref.referral_url && (
                      <a href={ref.referral_url} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-neon-cyan/50 hover:text-neon-cyan truncate block">
                        {ref.referral_url}
                      </a>
                    )}
                    <div className="flex gap-2 pt-2 border-t border-[rgba(0,245,255,0.08)]">
                      <button onClick={() => handleOpenModal(ref)} className="px-3 py-1 bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] rounded text-xs font-mono text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)] transition-colors">
                        EDIT
                      </button>
                      <button onClick={() => handleDelete(ref.id)} className="px-3 py-1 bg-[rgba(255,45,85,0.05)] border border-[rgba(255,45,85,0.1)] rounded text-xs font-mono text-muted hover:text-neon-red hover:border-[rgba(255,45,85,0.2)] transition-colors">
                        DEL
                      </button>
                    </div>
                  </div>
                </Card>
              </AnimatedItem>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <Card hover={false}>
            <p className="text-sm font-mono text-muted text-center">
              {filterStatus ? `No ${filterStatus} referrals` : "No referrals yet. Add one to start tracking!"}
            </p>
          </Card>
        )}
      </AnimatedContainer>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRef ? "EDIT REFERRAL" : "ADD REFERRAL"}>
        <div className="space-y-4">
          <FormField label="Contact Name" name="contact_name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} required />
          <FormField label="Contact Email" name="contact_email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} placeholder="name@example.com" />
          <FormField label="Company" name="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <FormField label="Position" name="position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
          <CategorySelector scope="referrals" value="" onChange={() => {}} />
          <div>
            <label className="block text-xs font-mono text-muted mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {REFERRAL_STATUSES.map((st) => (
                <button key={st.value} type="button" onClick={() => setForm({ ...form, status: st.value })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${form.status === st.value ? `${st.bg} ${st.color} border ${st.border}` : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"}`}>
                  {st.label}
                </button>
              ))}
            </div>
          </div>
          <FormField label="Date Referred" name="date_referred" type="date" value={form.date_referred} onChange={(e) => setForm({ ...form, date_referred: e.target.value })} />
          <FormField label="Referral URL" name="referral_url" value={form.referral_url} onChange={(e) => setForm({ ...form, referral_url: e.target.value })} placeholder="https://..." />
          <FormField label="Notes" name="notes" type="textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="flex-1 px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors">
              {editingRef ? "UPDATE" : "CREATE"}
            </button>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-sm text-muted hover:text-foreground transition-colors">
              CANCEL
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
