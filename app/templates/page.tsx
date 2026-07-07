"use client";

import { useState, useEffect } from "react";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import { AnimatedContainer, AnimatedItem } from "@/components/AnimatedList";
import GlowText from "@/components/GlowText";
import ElectricBorder from "@/components/ElectricBorder";

interface CustomTemplate {
  id: number; name: string; description: string; icon: string; color: string;
  certs: string[]; skills: string[]; projects: string[]; learning: string[];
}

const TEMPLATES = [
  {
    name: "Cloud Engineer",
    description: "AWS/Azure/GCP focused infrastructure and automation",
    icon: "☁",
    color: "#00F5FF",
    certs: ["AWS Solutions Architect", "AWS SysOps Administrator", "Azure Administrator", "Terraform Associate"],
    skills: ["AWS", "Azure", "Terraform", "Docker", "Kubernetes", "Linux", "Python", "CI/CD", "CloudFormation", "IAM"],
    projects: ["Deploy multi-tier app on AWS", "Build CI/CD pipeline with GitHub Actions", "Infrastructure as Code with Terraform"],
    learning: ["AWS Cloud Practitioner (Udemy)", "Kubernetes Deep Dive (Pluralsight)", "Terraform Up & Running (Book)"],
  },
  {
    name: "DevSecOps Engineer",
    description: "Security-focused DevOps with compliance and automation",
    icon: "🛡",
    color: "#FF2D55",
    certs: ["CompTIA Security+", "AWS Security Specialty", "CKS (Kubernetes Security)", "CISSP"],
    skills: ["Docker", "Kubernetes", "Jenkins", "GitLab CI", "SAST/DAST", "Vault", "OPA", "Python", "Bash", "SIEM"],
    projects: ["SAST pipeline integration", "Secrets management with Vault", "Container security scanning"],
    learning: ["DevSecOps Foundations (Coursera)", "Kubernetes Security (Linux Foundation)", "OWASP Top 10 (Web)"],
  },
  {
    name: "Data Center Engineer",
    description: "Physical and virtual infrastructure, networking, and operations",
    icon: "🏢",
    color: "#BF00FF",
    certs: ["CCNA", "CompTIA Network+", "VMware VCP", "CDCP"],
    skills: ["Networking", "VMware", "Linux", "Windows Server", "Storage (SAN/NAS)", "Monitoring", "Power/Cooling", "BGP/OSPF", "Firewalls", "Automation"],
    projects: ["Network monitoring dashboard", "Automated server provisioning", "VMware cluster setup"],
    learning: ["CCNA 200-301 (Udemy)", "VMware VCP-DCV (Pluralsight)", "Data Center Design (Book)"],
  },
  {
    name: "Machine Learning Infrastructure Engineer",
    description: "Build and maintain ML pipelines, training infra, and model serving platforms",
    icon: "🧠",
    color: "#FF6B00",
    certs: ["AWS Machine Learning Specialty", "Google Professional ML Engineer", "Kubernetes CKAD", "TensorFlow Developer"],
    skills: ["Python", "PyTorch", "TensorFlow", "Kubernetes", "Docker", "MLflow", "Kubeflow", "Ray", "CUDA", "Linux", "Terraform", "Bash"],
    projects: ["ML pipeline with Kubeflow", "Model serving with Triton Inference Server", "Distributed training on multi-GPU cluster", "Feature store with Redis"],
    learning: ["MLOps Specialization (Coursera)", "Designing ML Systems (Book)", "Full Stack Deep Learning (Web)"],
  },
  {
    name: "ML Systems Engineer",
    description: "Production ML systems, distributed computing, and model optimization",
    icon: "⚙",
    color: "#FF9500",
    certs: ["AWS Machine Learning Specialty", "Google Professional ML Engineer", "Databricks Certified Engineer", "Kubernetes CKAD"],
    skills: ["Python", "C++", "PyTorch", "TensorFlow", "ONNX", "TensorRT", "DeepSpeed", "FSDP", "NCCL", "CUDA", "Kubernetes", "gRPC"],
    projects: ["Model optimization pipeline (quantization/distillation)", "Distributed training framework setup", "A/B testing platform for ML models", "Low-latency inference service"],
    learning: ["Systems for ML (CMU 10-414)", "Efficient ML Systems (Stanford CS329S)", "Programming Massively Parallel Processors (Book)"],
  },
  {
    name: "AI Hardware Engineer (Software Focus)",
    description: "Software stack for AI accelerators, drivers, and compiler toolchains",
    icon: "🔧",
    color: "#FFD600",
    certs: ["NVIDIA DLI Deep Learning", "AMD ROCm Certification", "CompTIA A+", "FPGA Design (Intel)"],
    skills: ["C", "C++", "CUDA", "ROCm", "SYCL", "OpenCL", "LLVM", "Python", "Verilog basics", "Linux kernel", "Device drivers", "Assembly"],
    projects: ["Custom CUDA kernel for attention mechanism", "ROCm port of a PyTorch operator", "FPGA-based inference accelerator prototype", "Hardware benchmarking suite"],
    learning: ["GPU Programming (NVIDIA DLI)", "Heterogeneous Computing (Coursera)", "Computer Architecture (Hennessy & Patterson)"],
  },
  {
    name: "Performance Engineer (AI/ML)",
    description: "Profile, optimize, and benchmark AI workloads across hardware platforms",
    icon: "⚡",
    color: "#00FF88",
    certs: ["NVIDIA DLI Deep Learning", "AWS Machine Learning Specialty", "Linux Performance Analysis (Brendan Gregg)", "Kubernetes CKAD"],
    skills: ["Python", "C++", "CUDA", "TensorRT", "PyTorch Profiler", "NVIDIA Nsight", "perf", "eBPF", "Linux", "Grafana", "Prometheus", "Benchmarking"],
    projects: ["LLM inference latency optimization", "GPU utilization monitoring dashboard", "Training throughput bottleneck analysis", "Custom CUDA kernels for attention"],
    learning: ["Systems Performance (Brendan Gregg Book)", "GPU Performance Optimization (NVIDIA)", "Performance Engineering (Coursera)"],
  },
  {
    name: "Deep Learning Compiler Engineer",
    description: "Build compilers and runtimes for neural network execution on diverse hardware",
    icon: "🔬",
    color: "#C850FF",
    certs: ["LLVM Compiler Infrastructure", "NVIDIA DLI", "Google TensorFlow Certification", "Apache TVM Contributor"],
    skills: ["C++", "Python", "LLVM", "MLIR", "TVM", "XLA", "Triton", "ONNX", "CUDA", "Compiler design", "Graph optimization", "IR transforms"],
    projects: ["Custom TVM relay pass for model optimization", "MLIR dialect for custom hardware", "ONNX to TVM compilation pipeline", "Operator fusion pass for transformer models"],
    learning: ["Compilers (Stanford CS143)", "MLIR Tutorial (LLVM Project)", "Deep Learning Compilers (SOSP Tutorial)"],
  },
  {
    name: "Edge AI Engineer",
    description: "Deploy and optimize AI models on edge devices and embedded systems",
    icon: "📡",
    color: "#00D4FF",
    certs: ["NVIDIA Jetson Developer", "AWS IoT Specialty", "TensorFlow Lite Developer", "Embedded Linux (LFEL)"],
    skills: ["Python", "C++", "TensorFlow Lite", "ONNX Runtime", "TensorRT", "OpenVINO", "Jetson", "Raspberry Pi", "ARM", "Linux", "Model quantization", "Edge deployment"],
    projects: ["Object detection on Jetson Nano", "Voice assistant on Raspberry Pi", "Real-time anomaly detection on edge", "OTA model update pipeline"],
    learning: ["Edge AI (NVIDIA DLI)", "TinyML (HarvardX)", "Embedded Systems (Coursera)"],
  },
  {
    name: "GPU Compute Engineer",
    description: "GPU programming and optimization for NVIDIA, AMD, and Intel platforms",
    icon: "🎮",
    color: "#76B900",
    certs: ["NVIDIA CUDA Developer", "AMD ROCm Certification", "oneAPI Developer (Intel)", "OpenCL Developer"],
    skills: ["CUDA", "ROCm/HIP", "SYCL/oneAPI", "OpenCL", "C++", "Python", "Triton", "NCCL", "cuDNN", "cuBLAS", "MPI", "Profiling tools"],
    projects: ["Custom CUDA matrix multiplication kernel", "Multi-GPU communication benchmark", "Port CUDA code to ROCm and SYCL", "GPU-accelerated data processing pipeline"],
    learning: ["CUDA Programming (NVIDIA DLI)", "GPU Computing (Coursera)", "Programming Massively Parallel Processors (Book)"],
  },
  {
    name: "Research Engineer (AI Systems)",
    description: "Bridge research and engineering — implement, scale, and validate AI research",
    icon: "🧪",
    color: "#FF55AA",
    certs: ["AWS Machine Learning Specialty", "Google Professional ML Engineer", "NVIDIA DLI", "Deep Learning Specialization"],
    skills: ["Python", "PyTorch", "C++", "CUDA", "Distributed training", "Experiment tracking", "Paper implementation", "Linux", "Git", "LaTeX", "WandB", "Shell scripting"],
    projects: ["Implement a NeurIPS/ICML paper from scratch", "Distributed training framework comparison", "Reproducible experiment pipeline", "Custom attention mechanism implementation"],
    learning: ["Full Stack Deep Learning (Web)", "Stanford CS229 (Coursera)", "Research Engineering Best Practices (Weights & Biases)"],
  },
  {
    name: "Data Center Technician",
    description: "Hardware installation, maintenance, cabling, and physical infrastructure",
    icon: "🖥",
    color: "#8B8B8B",
    certs: ["CompTIA A+", "CompTIA Network+", "CDCP", "Fiber Optic Technician (CFOT)"],
    skills: ["Hardware installation", "Cabling (copper/fiber)", "Rack management", "Power distribution", "Cooling systems", "Linux basics", "Ticketing systems", "Asset management", "Troubleshooting", "Safety (OSHA)"],
    projects: ["Cable management documentation", "Asset tracking spreadsheet", "Preventive maintenance schedule", "DCIM tool implementation"],
    learning: ["CompTIA A+ (Udemy)", "Data Center Fundamentals (CBTNuggets)", "Fiber Optic Cabling (Book)"],
  },
  {
    name: "NOC Engineer",
    description: "Network Operations Center — monitoring, incident response, and escalation",
    icon: "📺",
    color: "#FF4444",
    certs: ["CompTIA Network+", "CCNA", "ITIL 4 Foundation", "CompTIA Security+"],
    skills: ["Network monitoring (Nagios/Zabbix/PRTG)", "SNMP", "Linux", "Windows Server", "Ticketing (ServiceNow)", "Incident management", "Log analysis", "Bash", "Python", "DNS/DHCP"],
    projects: ["Custom monitoring dashboard with Grafana", "Automated alert escalation script", "Network topology documentation", "Incident response runbook"],
    learning: ["Network Monitoring (CBTNuggets)", "ITIL 4 Foundation (Udemy)", "Incident Management (Pluralsight)"],
  },
  {
    name: "Network Engineer",
    description: "Design, implement, and manage network infrastructure",
    icon: "🌐",
    color: "#0088FF",
    certs: ["CCNA", "CCNP", "CompTIA Network+", "Juniper JNCIA", "Palo Alto PCNSA"],
    skills: ["Routing/Switching", "BGP/OSPF", "VLANs", "Firewalls", "VPN", "SD-WAN", "Wireshark", "Linux", "Ansible", "Python", "Load balancing", "DNS"],
    projects: ["Network automation with Ansible", "Site-to-site VPN setup", "Network monitoring with LibreNMS", "SD-WAN proof of concept"],
    learning: ["CCNA 200-301 (Udemy)", "Network Engineering (CBTNuggets)", "TCP/IP Illustrated (Book)"],
  },
  {
    name: "HPC Engineer",
    description: "High-performance computing clusters, parallel programming, and scientific computing",
    icon: "🏔",
    color: "#FF8800",
    certs: ["Linux Foundation HPC", "NVIDIA DLI", "AWS HPC Specialty", "CompTIA Linux+"],
    skills: ["Linux", "MPI", "OpenMP", "CUDA", "Slurm", "Python", "C/C++", "Fortran", "InfiniBand", "Parallel file systems", "Module systems", "Bash"],
    projects: ["Slurm cluster deployment", "MPI-based parallel application", "InfiniBand network benchmarking", "HPC job scheduler optimization"],
    learning: ["HPC Certification (Linux Foundation)", "Parallel Programming (Coursera)", "Introduction to HPC (NVIDIA DLI)"],
  },
  {
    name: "HPC Performance Engineer",
    description: "Optimize HPC workloads, profiling, and scaling parallel applications",
    icon: "📊",
    color: "#FF6600",
    certs: ["NVIDIA DLI", "Linux Foundation HPC", "Intel oneAPI Developer", "AWS HPC Specialty"],
    skills: ["C/C++", "Fortran", "MPI", "OpenMP", "CUDA", "Profiling (Intel VTune/perf)", "Linux", "InfiniBand", "NUMA optimization", "Compiler flags", "Python", "Benchmarking"],
    projects: ["HPC application profiling and optimization", "NUMA-aware memory allocation", "Multi-node scaling benchmark", "Custom MPI collective implementation"],
    learning: ["Performance Optimization (Intel)", "HPC Performance Engineering (NVIDIA)", "High Performance Computing (Book)"],
  },
  {
    name: "Operations Engineer",
    description: "IT operations, system administration, and infrastructure reliability",
    icon: "🔧",
    color: "#AAAAAA",
    certs: ["CompTIA Linux+", "CompTIA Server+", "Red Hat RHCSA", "ITIL 4 Foundation"],
    skills: ["Linux", "Windows Server", "Bash", "Python", "Docker", "Monitoring (Nagios/Prometheus)", "Ansible", "Active Directory", "Backup/Recovery", "Ticketing systems"],
    projects: ["Automated server provisioning with Ansible", "Centralized logging with ELK stack", "Backup automation and recovery testing", "Monitoring and alerting setup"],
    learning: ["Linux Administration (CBTNuggets)", "Ansible for DevOps (Udemy)", "The Practice of System Administration (Book)"],
  },
  {
    name: "HPC Networking Specialist",
    description: "High-speed interconnects, InfiniBand, and cluster networking for HPC",
    icon: "🔗",
    color: "#00CCFF",
    certs: ["CCNA", "Mellanox InfiniBand", "CompTIA Network+", "Linux Foundation HPC"],
    skills: ["InfiniBand", "RoCE/RDMA", "Ethernet", "BGP/OSPF", "Linux", "tcpdump/Wireshark", "Fabric management", "Ufm/Mellanox tools", "Python", "Bash", "Monitoring"],
    projects: ["InfiniBand fabric deployment", "RDMA performance benchmarking", "Network topology optimization", "Fabric monitoring dashboard"],
    learning: ["InfiniBand Essentials (Mellanox)", "RDMA Programming (Book)", "HPC Networking (Linux Foundation)"],
  },
  {
    name: "IT Support Technician",
    description: "Technical support, troubleshooting, and end-user assistance",
    icon: "💻",
    color: "#55AAFF",
    certs: ["CompTIA A+", "CompTIA Network+", "Microsoft 365 Certified", "Google IT Support"],
    skills: ["Windows", "macOS", "Linux basics", "Active Directory", "Office 365", "Hardware troubleshooting", "Networking basics", "Remote support tools", "Ticketing systems", "Customer service"],
    projects: ["IT knowledge base documentation", "Automated software deployment script", "Hardware inventory system", "User onboarding checklist automation"],
    learning: ["Google IT Support Certificate (Coursera)", "CompTIA A+ (Udemy)", "IT Support Fundamentals (LinkedIn Learning)"],
  },
  {
    name: "IT Help Desk",
    description: "Front-line IT support, ticket management, and user issue resolution",
    icon: "📞",
    color: "#44BBFF",
    certs: ["CompTIA A+", "HDI Support Center Analyst", "ITIL 4 Foundation", "Microsoft 365 Certified"],
    skills: ["Windows", "macOS", "Office 365", "Active Directory", "Ticketing (ServiceNow/Zendesk)", "Remote support", "Password resets", "VPN setup", "Printer support", "Communication skills"],
    projects: ["Help desk knowledge base", "Ticket categorization automation", "User satisfaction survey system", "SLA tracking dashboard"],
    learning: ["ITIL 4 Foundation (Udemy)", "HDI SCA Certification Prep", "Customer Service for IT (LinkedIn Learning)"],
  },
  {
    name: "Desktop Support",
    description: "Endpoint management, software deployment, and workstation administration",
    icon: "🖥",
    color: "#3399FF",
    certs: ["CompTIA A+", "Microsoft 365 Certified: Modern Desktop Administrator", "CompTIA Server+", "Jamf Certified"],
    skills: ["Windows 10/11", "macOS", "SCCM/Intune", "Group Policy", "Active Directory", "Office 365", "Endpoint security", "Hardware repair", "Scripting (PowerShell)", "Imaging"],
    projects: ["OS deployment automation with SCCM", "Endpoint security hardening script", "Software packaging and deployment", "Hardware lifecycle tracking"],
    learning: ["Microsoft Modern Desktop (LinkedIn Learning)", "SCCM Administration (Udemy)", "Endpoint Management (Pluralsight)"],
  },
  {
    name: "IT Specialist",
    description: "Generalist IT role covering systems, networks, security, and support",
    icon: "🖥",
    color: "#2288FF",
    certs: ["CompTIA A+", "CompTIA Network+", "CompTIA Security+", "Microsoft 365 Certified"],
    skills: ["Windows Server", "Linux", "Active Directory", "Networking", "Firewalls", "Office 365", "Docker", "PowerShell", "Bash", "Virtualization", "Backup/Recovery", "Security basics"],
    projects: ["Hybrid cloud setup with Azure AD", "Network security audit", "Automated user provisioning", "Disaster recovery plan and testing"],
    learning: ["CompTIA Trifecta (Udemy)", "Microsoft 365 Admin (LinkedIn Learning)", "System Administration (CBTNuggets)"],
  },
  {
    name: "IAM Engineer",
    description: "Identity and access management, SSO, MFA, and zero trust architecture",
    icon: "🔐",
    color: "#FF3366",
    certs: ["CompTIA Security+", "CISSP", "Okta Certified Professional", "Microsoft Identity & Access Administrator"],
    skills: ["Active Directory", "Azure AD/Entra ID", "Okta", "SAML/OIDC/OAuth", "LDAP", "MFA/2FA", "PAM", "Zero Trust", "RBAC/ABAC", "Python", "PowerShell", "SailPoint/CyberArk"],
    projects: ["SSO integration across enterprise apps", "MFA rollout and policy engine", "Privileged access management deployment", "IAM audit and compliance report automation"],
    learning: ["IAM Fundamentals (Pluralsight)", "Okta Professional Certification Prep", "Zero Trust Security (Coursera)"],
  },
];

export default function TemplatesPage() {
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | null>(null);
  const [hiddenBuiltins, setHiddenBuiltins] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ name: "", description: "", icon: "◆", color: "#00F5FF", certs: "", skills: "", projects: "", learning: "" });

  useEffect(() => {
    fetch("/api/custom-templates").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setCustomTemplates(data);
    });
    const hidden = localStorage.getItem("hireops_hidden_templates");
    if (hidden) setHiddenBuiltins(new Set(JSON.parse(hidden)));
  }, []);

  async function fetchCustomTemplates() {
    const res = await fetch("/api/custom-templates");
    const data = await res.json();
    if (Array.isArray(data)) setCustomTemplates(data);
  }

  function openAddModal() {
    setEditingTemplate(null);
    setForm({ name: "", description: "", icon: "◆", color: "#00F5FF", certs: "", skills: "", projects: "", learning: "" });
    setShowModal(true);
  }

  function openEditModal(template: typeof TEMPLATES[0] | CustomTemplate) {
    setEditingTemplate("id" in template ? template as CustomTemplate : null);
    setForm({
      name: template.name, description: template.description, icon: template.icon, color: template.color,
      certs: template.certs.join(", "), skills: template.skills.join(", "),
      projects: template.projects.join(", "), learning: template.learning.join(", "),
    });
    setShowModal(true);
  }

  async function handleSaveTemplate() {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name, description: form.description, icon: form.icon, color: form.color,
      certs: form.certs.split(",").map(s => s.trim()).filter(Boolean),
      skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
      projects: form.projects.split(",").map(s => s.trim()).filter(Boolean),
      learning: form.learning.split(",").map(s => s.trim()).filter(Boolean),
    };

    if (editingTemplate) {
      await fetch("/api/custom-templates", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingTemplate.id, ...payload }),
      });
    } else {
      await fetch("/api/custom-templates", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setShowModal(false);
    setEditingTemplate(null);
    setForm({ name: "", description: "", icon: "◆", color: "#00F5FF", certs: "", skills: "", projects: "", learning: "" });
    fetchCustomTemplates();
  }

  async function handleDeleteCustomTemplate(id: number) {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/custom-templates?id=${id}`, { method: "DELETE" });
    fetchCustomTemplates();
  }

  function hideBuiltin(name: string) {
    if (!confirm(`Hide "${name}" from the list?`)) return;
    const next = new Set([...hiddenBuiltins, name]);
    setHiddenBuiltins(next);
    localStorage.setItem("hireops_hidden_templates", JSON.stringify([...next]));
  }

  function restoreBuiltins() {
    setHiddenBuiltins(new Set());
    localStorage.removeItem("hireops_hidden_templates");
  }

  async function applyTemplate(template: typeof TEMPLATES[0] | CustomTemplate) {
    setApplying(template.name);

    try {
      // Add certs
      for (const cert of template.certs) {
        await fetch("/api/certifications", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: cert, category: template.name, status: "PLANNING", price: 0, expiration_date: "", exam_date: "" }),
        });
      }

      // Add skills
      for (const skill of template.skills) {
        await fetch("/api/techstack", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: skill, category: template.name, proficiency_goal: "TBD", image_url: "" }),
        });
      }

      // Add projects
      for (const project of template.projects) {
        await fetch("/api/projects", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: project, status: "TODO", technologies: template.skills.slice(0, 5).join(", "), category: template.name, deadline: "", description: "", goal: "" }),
        });
      }

      // Add learning paths
      for (const learning of template.learning) {
        await fetch("/api/learning", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: learning, url: "", resource_type: "COURSE", skill_category: template.name, status: "NOT STARTED", progress_pct: 0, notes: "", priority: 0 }),
        });
      }

      setApplied((prev) => new Set([...prev, template.name]));
    } catch (e) {
      alert("Error applying template");
    } finally {
      setApplying(null);
    }
  }

  // Template card renderer
  function TemplateCard({ template, isCustom }: { template: typeof TEMPLATES[0] | CustomTemplate; isCustom?: boolean }) {
    const isApplied = applied.has(template.name);
    const isApplying = applying === template.name;

    return (
      <Card hover={false} className="h-full flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{template.icon}</span>
          <div className="flex-1">
            <h3 className="text-sm font-mono font-semibold text-foreground">{template.name}</h3>
            <p className="text-[10px] font-mono text-muted">{template.description}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => openEditModal(template)}
              className="p-1.5 rounded text-muted hover:text-neon-cyan hover:bg-[rgba(0,245,255,0.1)] transition-colors" title="Edit template">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </button>
            <button onClick={() => isCustom ? handleDeleteCustomTemplate((template as CustomTemplate).id) : hideBuiltin(template.name)}
              className="p-1.5 rounded text-muted hover:text-neon-red hover:bg-[rgba(255,45,85,0.1)] transition-colors" title="Delete template">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" /></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <p className="text-[10px] font-mono text-muted uppercase mb-1">Certifications ({template.certs.length})</p>
            <div className="flex flex-wrap gap-1">{template.certs.map((c) => <span key={c} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[rgba(0,245,255,0.05)] border border-[rgba(0,245,255,0.1)] text-muted">{c}</span>)}</div>
          </div>
          <div>
            <p className="text-[10px] font-mono text-muted uppercase mb-1">Skills ({template.skills.length})</p>
            <div className="flex flex-wrap gap-1">{template.skills.map((s) => <span key={s} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[rgba(191,0,255,0.05)] border border-[rgba(191,0,255,0.1)] text-muted">{s}</span>)}</div>
          </div>
          <div>
            <p className="text-[10px] font-mono text-muted uppercase mb-1">Projects ({template.projects.length})</p>
            <ul className="space-y-0.5">{template.projects.map((p) => <li key={p} className="text-[10px] font-mono text-foreground/50">◇ {p}</li>)}</ul>
          </div>
          <div>
            <p className="text-[10px] font-mono text-muted uppercase mb-1">Learning ({template.learning.length})</p>
            <ul className="space-y-0.5">{template.learning.map((l) => <li key={l} className="text-[10px] font-mono text-foreground/50">📚 {l}</li>)}</ul>
          </div>
        </div>

        <button onClick={() => applyTemplate(template)} disabled={isApplying || isApplied}
          className={`mt-4 w-full px-4 py-2 rounded-lg font-mono text-sm transition-colors ${isApplied ? "bg-neon-green/10 border border-neon-green/20 text-neon-green" : "bg-[rgba(0,245,255,0.1)] border border-neon-cyan/30 text-neon-cyan hover:bg-[rgba(0,245,255,0.2)]"} disabled:opacity-50`}>
          {isApplied ? "✓ APPLIED" : isApplying ? "APPLYING..." : "APPLY TEMPLATE"}
        </button>
      </Card>
    );
  }

  const visibleBuiltins = TEMPLATES.filter(t => !hiddenBuiltins.has(t.name));

  return (
    <>
      <AnimatedContainer className="space-y-6">
        <div className="flex items-center justify-between">
          <GlowText as="h2" color="cyan" className="text-sm font-mono tracking-wider">CAREER TEMPLATES</GlowText>
          <div className="flex items-center gap-3">
            {hiddenBuiltins.size > 0 && (
              <button onClick={restoreBuiltins}
                className="px-3 py-1.5 border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-xs text-muted hover:text-foreground transition-colors">RESTORE HIDDEN ({hiddenBuiltins.size})</button>
            )}
            <ElectricBorder color="#BF00FF" speed={1} chaos={0.12} borderRadius={10}>
              <button onClick={openAddModal}
                className="px-3 py-1.5 bg-neon-purple/20 border border-neon-purple/30 rounded-lg font-mono text-xs text-neon-purple hover:bg-neon-purple/30 transition-colors">+ CUSTOM TEMPLATE</button>
            </ElectricBorder>
          </div>
        </div>

        {/* Custom Templates */}
        {customTemplates.length > 0 && (
          <div>
            <p className="text-[10px] font-mono text-muted uppercase tracking-wider mb-3">YOUR CUSTOM TEMPLATES ({customTemplates.length})</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {customTemplates.map((t) => (
                <AnimatedItem key={t.id}><TemplateCard template={t} isCustom /></AnimatedItem>
              ))}
            </div>
          </div>
        )}

        {/* Built-in Templates */}
        <div>
          {customTemplates.length > 0 && <p className="text-[10px] font-mono text-muted uppercase tracking-wider mb-3">BUILT-IN TEMPLATES ({visibleBuiltins.length})</p>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleBuiltins.map((template) => (
              <AnimatedItem key={template.name}><TemplateCard template={template} /></AnimatedItem>
            ))}
          </div>
        </div>
      </AnimatedContainer>

      {/* Add/Edit Template Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingTemplate(null); }} title={editingTemplate ? "EDIT TEMPLATE" : "ADD CUSTOM TEMPLATE"}>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-16">
              <label className="block text-xs font-mono text-muted mb-1">Icon</label>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} maxLength={2}
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-center text-lg font-mono text-foreground" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-mono text-muted mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Template name..."
                className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted" />
            </div>
            <div className="w-24">
              <label className="block text-xs font-mono text-muted mb-1">Color</label>
              <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full h-[38px] bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg cursor-pointer" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-muted mb-1">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description..."
              className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted" />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted mb-1">Certifications (comma-separated)</label>
            <input value={form.certs} onChange={(e) => setForm({ ...form, certs: e.target.value })} placeholder="AWS SA, CCNA, CompTIA A+..."
              className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted" />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted mb-1">Skills (comma-separated)</label>
            <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Python, Docker, Kubernetes..."
              className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted" />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted mb-1">Projects (comma-separated)</label>
            <input value={form.projects} onChange={(e) => setForm({ ...form, projects: e.target.value })} placeholder="Build a monitoring dashboard, Deploy K8s cluster..."
              className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted" />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted mb-1">Learning Resources (comma-separated)</label>
            <input value={form.learning} onChange={(e) => setForm({ ...form, learning: e.target.value })} placeholder="Course name, Book title..."
              className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSaveTemplate} disabled={!form.name.trim()}
              className="flex-1 px-4 py-2 bg-neon-purple/20 border border-neon-purple/30 rounded-lg font-mono text-sm text-neon-purple hover:bg-neon-purple/30 transition-colors disabled:opacity-50">{editingTemplate ? "UPDATE" : "CREATE"} TEMPLATE</button>
            <button onClick={() => { setShowModal(false); setEditingTemplate(null); }}
              className="px-4 py-2 border border-[rgba(0,245,255,0.1)] rounded-lg font-mono text-sm text-muted hover:text-foreground transition-colors">CANCEL</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
