"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import ElectricBorder from "@/components/ElectricBorder";
import { fetchArray } from "@/lib/fetch-helpers";

interface Contact {
  id: number;
  name: string;
  email: string;
  company: string;
  role: string;
  linkedin_url: string;
  category: string;
  last_contact_date: string;
  next_follow_up: string;
  notes: string;
  status: string;
}

const CONTACT_CATEGORIES = [
  { value: "RECRUITER", label: "RECRUITER", color: "text-neon-cyan/70", bg: "bg-neon-cyan/10", border: "border-neon-cyan/20" },
  { value: "HIRING MANAGER", label: "HIRING MANAGER", color: "text-neon-purple/70", bg: "bg-neon-purple/10", border: "border-neon-purple/20" },
  { value: "CONNECTION", label: "CONNECTION", color: "text-neon-green/70", bg: "bg-neon-green/10", border: "border-neon-green/20" },
  { value: "MENTOR", label: "MENTOR", color: "text-neon-yellow/70", bg: "bg-neon-yellow/10", border: "border-neon-yellow/20" },
];

const CONTACT_STATUSES = [
  { value: "ACTIVE", label: "ACTIVE", color: "text-neon-green/70", bg: "bg-neon-green/10", border: "border-neon-green/20" },
  { value: "COLD", label: "COLD", color: "text-neon-red/70", bg: "bg-neon-red/10", border: "border-neon-red/20" },
  { value: "WARM", label: "WARM", color: "text-neon-yellow/70", bg: "bg-neon-yellow/10", border: "border-neon-yellow/20" },
];

function isOverdue(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const followUp = new Date(dateStr);
  return followUp < today;
}

export default function NetworkingPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    linkedin_url: "",
    category: "",
    last_contact_date: "",
    next_follow_up: "",
    notes: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    const data = await fetchArray("/api/networking");
    setContacts(data as Contact[]);
  }

  function getCategoryStyle(category: string) {
    return CONTACT_CATEGORIES.find((c) => c.value === category) || CONTACT_CATEGORIES[0];
  }

  function getStatusStyle(status: string) {
    return CONTACT_STATUSES.find((s) => s.value === status) || CONTACT_STATUSES[0];
  }

  function handleOpenModal(contact?: Contact) {
    if (contact) {
      setEditingContact(contact);
      setForm({
        name: contact.name,
        email: contact.email,
        company: contact.company,
        role: contact.role,
        linkedin_url: contact.linkedin_url,
        category: contact.category,
        last_contact_date: contact.last_contact_date,
        next_follow_up: contact.next_follow_up,
        notes: contact.notes,
        status: contact.status,
      });
    } else {
      setEditingContact(null);
      setForm({ name: "", email: "", company: "", role: "", linkedin_url: "", category: "", last_contact_date: "", next_follow_up: "", notes: "", status: "ACTIVE" });
    }
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    if (editingContact) {
      await fetch("/api/networking", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingContact.id, ...form }),
      });
    } else {
      await fetch("/api/networking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setIsModalOpen(false);
    fetchContacts();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this contact?")) return;
    await fetch(`/api/networking?id=${id}`, { method: "DELETE" });
    fetchContacts();
  }

  const filtered = filterCategory ? contacts.filter((c) => c.category === filterCategory) : contacts;
  const categoryCounts = CONTACT_CATEGORIES.map((cat) => ({
    ...cat,
    count: contacts.filter((c) => c.category === cat.value).length,
  }));

  return (
    <>
      <AnimatedContainer>
        <div className="flex items-center justify-between mb-6">
          <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">
            {contacts.length} CONTACT{contacts.length !== 1 ? "S" : ""}
          </GlowText>
          <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors"
            >
              + ADD CONTACT
            </button>
          </ElectricBorder>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterCategory("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              !filterCategory ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30" : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"
            }`}
          >
            ALL ({contacts.length})
          </button>
          {categoryCounts.filter((c) => c.count > 0).map((c) => (
            <button
              key={c.value}
              onClick={() => setFilterCategory(c.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                filterCategory === c.value ? `${c.bg} ${c.color} border ${c.border}` : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"
              }`}
            >
              {c.label} ({c.count})
            </button>
          ))}
        </div>

        {/* Contacts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((contact) => {
            const cat = getCategoryStyle(contact.category);
            const st = getStatusStyle(contact.status);
            return (
              <AnimatedItem key={contact.id}>
                <Card>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-mono font-semibold text-foreground">{contact.name}</h4>
                        <p className="text-xs font-mono text-muted mt-0.5">{contact.company}{contact.company && contact.role ? " · " : ""}{contact.role}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${st.color} ${st.bg} border ${st.border}`}>
                        {st.label}
                      </span>
                    </div>
                    {contact.category && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${cat.color} ${cat.bg} border ${cat.border}`}>
                        {cat.label}
                      </span>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-muted">
                      {contact.last_contact_date && <p>Last Contact: {contact.last_contact_date}</p>}
                      {contact.next_follow_up && (
                        <p className={isOverdue(contact.next_follow_up) ? "text-neon-red" : ""}>
                          Follow Up: {contact.next_follow_up}{isOverdue(contact.next_follow_up) ? " (OVERDUE)" : ""}
                        </p>
                      )}
                    </div>
                    {contact.notes && <p className="text-xs font-mono text-foreground/60 line-clamp-2">{contact.notes}</p>}
                    <div className="flex gap-3 text-xs font-mono">
                      {contact.email && (
                        <a href={`mailto:${contact.email}`} className="text-neon-cyan/50 hover:text-neon-cyan truncate">
                          {contact.email}
                        </a>
                      )}
                      {contact.linkedin_url && (
                        <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-neon-cyan/50 hover:text-neon-cyan truncate">
                          LinkedIn
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-[rgba(0,245,255,0.08)]">
                      <button onClick={() => handleOpenModal(contact)} className="px-3 py-1 bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] rounded text-xs font-mono text-muted hover:text-foreground hover:border-[rgba(0,245,255,0.2)] transition-colors">
                        EDIT
                      </button>
                      <button onClick={() => handleDelete(contact.id)} className="px-3 py-1 bg-[rgba(255,45,85,0.05)] border border-[rgba(255,45,85,0.1)] rounded text-xs font-mono text-muted hover:text-neon-red hover:border-[rgba(255,45,85,0.2)] transition-colors">
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
              {filterCategory ? `No ${filterCategory} contacts` : "No contacts yet. Add one to start tracking!"}
            </p>
          </Card>
        )}
      </AnimatedContainer>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingContact ? "EDIT CONTACT" : "ADD CONTACT"}>
        <div className="space-y-4">
          <FormField label="Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <FormField label="Email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" />
          <FormField label="Company" name="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <FormField label="Role" name="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <FormField label="LinkedIn URL" name="linkedin_url" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." />
          <div>
            <label className="block text-xs font-mono text-muted mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {CONTACT_CATEGORIES.map((cat) => (
                <button key={cat.value} type="button" onClick={() => setForm({ ...form, category: cat.value })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${form.category === cat.value ? `${cat.bg} ${cat.color} border ${cat.border}` : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"}`}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-muted mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {CONTACT_STATUSES.map((st) => (
                <button key={st.value} type="button" onClick={() => setForm({ ...form, status: st.value })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${form.status === st.value ? `${st.bg} ${st.color} border ${st.border}` : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"}`}>
                  {st.label}
                </button>
              ))}
            </div>
          </div>
          <FormField label="Last Contact Date" name="last_contact_date" type="date" value={form.last_contact_date} onChange={(e) => setForm({ ...form, last_contact_date: e.target.value })} />
          <FormField label="Next Follow Up" name="next_follow_up" type="date" value={form.next_follow_up} onChange={(e) => setForm({ ...form, next_follow_up: e.target.value })} />
          <FormField label="Notes" name="notes" type="textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="flex-1 px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors">
              {editingContact ? "UPDATE" : "CREATE"}
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
