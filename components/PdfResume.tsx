import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Cyberpunk-styled PDF resume
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: "Helvetica", backgroundColor: "#fff" },
  header: { marginBottom: 20, paddingBottom: 15, borderBottomWidth: 2, borderBottomColor: "#00F5FF" },
  name: { fontSize: 24, fontWeight: "bold", color: "#0a0a12", marginBottom: 4 },
  subtitle: { fontSize: 11, color: "#4A6274", marginBottom: 8 },
  contactRow: { flexDirection: "row", gap: 15 },
  contactItem: { fontSize: 9, color: "#4A6274" },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", color: "#00F5FF", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 150, fontWeight: "bold", color: "#0a0a12", fontSize: 10 },
  value: { flex: 1, color: "#333", fontSize: 10 },
  skillGroup: { marginBottom: 10 },
  skillGroupTitle: { fontSize: 10, fontWeight: "bold", color: "#4A6274", marginBottom: 4 },
  skillItem: { fontSize: 9, color: "#333", marginBottom: 2 },
  certItem: { marginBottom: 6 },
  certName: { fontSize: 10, fontWeight: "bold", color: "#0a0a12" },
  certDetail: { fontSize: 9, color: "#4A6274" },
  projectItem: { marginBottom: 8 },
  projectTitle: { fontSize: 10, fontWeight: "bold", color: "#0a0a12" },
  projectTech: { fontSize: 9, color: "#00F5FF", marginBottom: 2 },
  projectDesc: { fontSize: 9, color: "#333" },
  jobItem: { marginBottom: 6 },
  jobTitle: { fontSize: 10, fontWeight: "bold", color: "#0a0a12" },
  jobDetail: { fontSize: 9, color: "#4A6274" },
  jobSalary: { fontSize: 9, color: "#00FF88" },
  tagContainer: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  tag: { fontSize: 8, backgroundColor: "#f0f0f0", padding: "2 6", borderRadius: 3, color: "#333" },
  footer: { position: "absolute", bottom: 20, left: 30, right: 30, textAlign: "center", fontSize: 8, color: "#999", borderTopWidth: 1, borderTopColor: "#e0e0e0", paddingTop: 8 },
});

interface PdfData {
  background: any;
  jobTitles: any[];
  certifications: any[];
  projects: any[];
  techStack: any[];
  applications: any[];
  sections: string[];
}

export default function PdfResume({ data }: { data: PdfData }) {
  const { background, jobTitles, certifications, projects, techStack, applications, sections } = data;

  // Group tech stack by category
  const techByCategory: Record<string, string[]> = {};
  for (const t of techStack) {
    const cat = t.category || "Other";
    if (!techByCategory[cat]) techByCategory[cat] = [];
    techByCategory[cat].push(t.name);
  }

  // Group certs by category
  const certsByCategory: Record<string, any[]> = {};
  for (const c of certifications) {
    const cat = c.category || "Other";
    if (!certsByCategory[cat]) certsByCategory[cat] = [];
    certsByCategory[cat].push(c);
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{background?.full_name || "CAREER CMD OPERATOR"}</Text>
          <Text style={styles.subtitle}>{background?.current_role || "Infrastructure / DevOps / Cloud / Cybersecurity"}</Text>
          <View style={styles.contactRow}>
            {background?.location && <Text style={styles.contactItem}>{background.location}</Text>}
            {background?.email && <Text style={styles.contactItem}>{background.email}</Text>}
            {background?.linkedin_url && <Text style={styles.contactItem}>LinkedIn</Text>}
            {background?.github_url && <Text style={styles.contactItem}>GitHub</Text>}
          </View>
        </View>

        {/* Technical Skills */}
        {sections.includes("skills") && Object.keys(techByCategory).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            {Object.entries(techByCategory).map(([cat, skills]) => (
              <View key={cat} style={styles.skillGroup}>
                <Text style={styles.skillGroupTitle}>{cat}</Text>
                <View style={styles.tagContainer}>
                  {skills.map((s) => <Text key={s} style={styles.tag}>{s}</Text>)}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {sections.includes("certifications") && certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {certifications.map((c: any) => (
              <View key={c.id} style={styles.certItem}>
                <Text style={styles.certName}>{c.name}</Text>
                <Text style={styles.certDetail}>{c.category}{c.expiration_date ? ` — Expires: ${c.expiration_date}` : ""}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {sections.includes("projects") && projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.filter((p: any) => p.status !== "DONE").slice(0, 8).map((p: any) => (
              <View key={p.id} style={styles.projectItem}>
                <Text style={styles.projectTitle}>{p.name}</Text>
                {p.technologies && <Text style={styles.projectTech}>{p.technologies}</Text>}
                {p.description && <Text style={styles.projectDesc}>{p.description.substring(0, 200)}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Target Roles */}
        {sections.includes("targets") && jobTitles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Target Roles</Text>
            {jobTitles.slice(0, 6).map((j: any) => (
              <View key={j.id} style={styles.jobItem}>
                <Text style={styles.jobTitle}>{j.title}{j.company ? ` — ${j.company}` : ""}</Text>
                <Text style={styles.jobDetail}>{j.location || ""}{j.category ? ` [${j.category}]` : ""}</Text>
                {(j.salary_min || j.salary_max) && (
                  <Text style={styles.jobSalary}>${j.salary_min?.toLocaleString()} — ${j.salary_max?.toLocaleString()}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Application History */}
        {sections.includes("applications") && applications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Application History</Text>
            {applications.slice(0, 10).map((a: any) => (
              <View key={a.id} style={styles.jobItem}>
                <Text style={styles.jobTitle}>{a.position} — {a.company}</Text>
                <Text style={styles.jobDetail}>[{a.status}] {a.date_applied || ""}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>Generated by CAREER CMD — {new Date().toLocaleDateString()}</Text>
      </Page>
    </Document>
  );
}
