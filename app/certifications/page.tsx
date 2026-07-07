"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import CategoryGroup from "@/components/CategoryGroup";
import CategorySelector from "@/components/CategorySelector";
import Modal from "@/components/Modal";
import FormField from "@/components/FormField";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import IconLookup from "@/components/IconLookup";
import ElectricBorder from "@/components/ElectricBorder";
import { fetchArray } from "@/lib/fetch-helpers";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Certification {
  id: number;
  name: string;
  category: string;
  image_url: string;
  price: number;
  expiration_date: string;
  exam_date: string;
  status: string;
}

const CERT_STATUSES = [
  { value: "PLANNING", label: "PLANNING", color: "text-neon-cyan/70", bg: "bg-neon-cyan/10", border: "border-neon-cyan/20" },
  { value: "STUDYING", label: "STUDYING", color: "text-neon-purple/70", bg: "bg-neon-purple/10", border: "border-neon-purple/20" },
  { value: "SCHEDULED", label: "SCHEDULED", color: "text-neon-yellow/70", bg: "bg-neon-yellow/10", border: "border-neon-yellow/20" },
  { value: "PASSED", label: "PASSED", color: "text-neon-green/70", bg: "bg-neon-green/10", border: "border-neon-green/20" },
  { value: "EXPIRED", label: "EXPIRED", color: "text-neon-red/70", bg: "bg-neon-red/10", border: "border-neon-red/20" },
];

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    image_url: "",
    price: 0,
    expiration_date: "",
    exam_date: "",
    status: "PLANNING",
  });

  useEffect(() => {
    fetchCertifications();
    fetchCategories();
  }, []);

  async function fetchCertifications() {
    const data = await fetchArray("/api/certifications");
    setCertifications(data as Certification[]);
  }

  async function fetchCategories() {
    const data = await fetchArray("/api/categories?scope=certifications");
    setCategories(data);
  }

  function getCategoryColor(name: string): string {
    const cat = categories.find((c: any) => c.name === name);
    return cat?.color || "#00F5FF";
  }

  function getStatusStyle(status: string) {
    return CERT_STATUSES.find((s) => s.value === status) || CERT_STATUSES[0];
  }

  function handleOpenModal(cert?: Certification) {
    if (cert) {
      setEditingCert(cert);
      setForm({
        name: cert.name,
        category: cert.category,
        image_url: cert.image_url,
        price: cert.price,
        expiration_date: cert.expiration_date,
        exam_date: cert.exam_date || "",
        status: cert.status || "PLANNING",
      });
    } else {
      setEditingCert(null);
      setForm({ name: "", category: "", image_url: "", price: 0, expiration_date: "", exam_date: "", status: "PLANNING" });
    }
    setIsModalOpen(true);
  }

  async function handleSave() {
    const method = editingCert ? "PUT" : "POST";
    const body = editingCert ? { ...form, id: editingCert.id } : form;

    await fetch("/api/certifications", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setIsModalOpen(false);
    fetchCertifications();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/certifications?id=${id}`, { method: "DELETE" });
    fetchCertifications();
    setDeleteTarget(null);
  }

  function getDateStatus(date: string, label: string) {
    if (!date) return null;
    const now = new Date();
    const d = new Date(date);
    const daysLeft = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { color: "text-neon-red/70", text: `${label}: PASSED` };
    if (daysLeft <= 7) return { color: "text-neon-red/70", text: `${label}: ${daysLeft}d` };
    if (daysLeft <= 30) return { color: "text-neon-orange/70", text: `${label}: ${daysLeft}d` };
    if (daysLeft <= 90) return { color: "text-neon-yellow/70", text: `${label}: ${daysLeft}d` };
    return { color: "text-neon-green/60", text: `${label}: ${daysLeft}d` };
  }

  // Group by category
  const grouped = certifications.reduce((acc, cert) => {
    const cat = cert.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(cert);
    return acc;
  }, {} as Record<string, Certification[]>);

  return (
    <>
      <AnimatedContainer className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-mono text-neon-cyan/70">
            {certifications.length} CERTIFICATIONS TRACKED
          </h2>
          <ElectricBorder color="#00F5FF" speed={1} chaos={0.12} borderRadius={10}>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-[rgba(0,245,255,0.1)] border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-[rgba(0,245,255,0.2)] transition-colors"
            >
              + ADD CERTIFICATION
            </button>
          </ElectricBorder>
        </div>

        {Object.entries(grouped).map(([category, certs]) => {
          const catColor = getCategoryColor(category);
          return (
            <AnimatedItem key={category}>
              <CategoryGroup category={category} count={certs.length}>
                {certs.map((cert) => {
                  const expStatus = getDateStatus(cert.expiration_date, "EXP");
                  const examStatus = getDateStatus(cert.exam_date, "EXAM");
                  return (
                    <Card key={cert.id}>
                      <div className="space-y-3">
                        {cert.image_url && (
                          <div className="w-full h-24 rounded-lg overflow-hidden bg-[rgba(0,245,255,0.05)] flex items-center justify-center">
                            <img
                              src={cert.image_url}
                              alt={cert.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        )}
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-mono font-semibold text-foreground">
                              {cert.name}
                            </h4>
                            <p className="text-xs font-mono text-muted mt-1">
                              ${cert.price.toFixed(2)}
                            </p>
                          </div>
                          {(() => {
                            const st = getStatusStyle(cert.status || "PLANNING");
                            return (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${st.color} ${st.bg} border ${st.border}`}>
                                {st.label}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="space-y-1">
                          {expStatus && (
                            <p className={`text-xs font-mono ${expStatus.color}`}>
                              {expStatus.text}
                            </p>
                          )}
                          {examStatus && (
                            <p className={`text-xs font-mono ${examStatus.color}`}>
                              {examStatus.text}
                            </p>
                          )}
                          {!expStatus && !examStatus && (
                            <p className="text-xs font-mono text-muted">NO DATES SET</p>
                          )}
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleOpenModal(cert)}
                            className="text-xs font-mono text-muted hover:text-neon-cyan transition-colors"
                          >
                            EDIT
                          </button>
                          <button
                            onClick={() => setDeleteTarget(cert.id)}
                            className="text-xs font-mono text-muted hover:text-neon-red transition-colors"
                          >
                            DEL
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </CategoryGroup>
            </AnimatedItem>
          );
        })}

        {certifications.length === 0 && (
          <AnimatedItem>
            <Card hover={false}>
              <p className="text-center font-mono text-muted py-8">
                No certifications tracked yet. Click &quot;+ ADD CERTIFICATION&quot; to start.
              </p>
            </Card>
          </AnimatedItem>
        )}
      </AnimatedContainer>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCert ? "EDIT CERTIFICATION" : "ADD CERTIFICATION"}
      >
        <div className="space-y-4">
          <FormField
            label="Name"
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="AWS Solutions Architect"
            required
          />
          <CategorySelector
            scope="certifications"
            value={form.category}
            onChange={(cat) => setForm({ ...form, category: cat })}
          />
          <div>
            <label className="block text-xs font-mono text-muted mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {CERT_STATUSES.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => setForm({ ...form, status: st.value })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                    form.status === st.value
                      ? `${st.bg} ${st.color} border ${st.border}`
                      : "border border-[rgba(0,245,255,0.08)] text-muted hover:border-[rgba(0,245,255,0.15)]"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-muted mb-2">IMAGE / ICON</label>
            <IconLookup
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              onNameChange={(name) => setForm({ ...form, name: form.name || name })}
              placeholder="Type certification name (e.g. AWS Solutions Architect)..."
            />
          </div>
          <FormField
            label="Price"
            name="price"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            min={0}
            step={0.01}
          />
          <FormField
            label="Expiration Date"
            name="expiration_date"
            type="date"
            value={form.expiration_date}
            onChange={(e) => setForm({ ...form, expiration_date: e.target.value })}
          />
          <FormField
            label="Exam Date"
            name="exam_date"
            type="date"
            value={form.exam_date}
            onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/30 rounded-lg font-mono text-sm text-neon-cyan hover:bg-neon-cyan/30 transition-colors"
            >
              {editingCert ? "UPDATE" : "CREATE"}
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-sm text-muted hover:text-foreground transition-colors"
            >
              CANCEL
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="DELETE CERTIFICATION"
        message="This action cannot be undone. The certification record will be permanently removed."
        confirmLabel="DELETE"
      />
    </>
  );
}
