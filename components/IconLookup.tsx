"use client";

import { useState, useRef, useEffect } from "react";

// SimpleIcons CDN — thousands of brand icons
const SI = "https://cdn.simpleicons.org";

// Comprehensive mapping of tech/cert names to icon slugs
const ICON_MAP: Record<string, { slug: string; cdn?: string; color?: string }> = {
  // Cloud Providers
  "aws": { slug: "amazonaws", color: "#FF9900" },
  "amazon web services": { slug: "amazonaws", color: "#FF9900" },
  "azure": { slug: "microsoftazure", color: "#0089D6" },
  "microsoft azure": { slug: "microsoftazure", color: "#0089D6" },
  "gcp": { slug: "googlecloud", color: "#4285F4" },
  "google cloud": { slug: "googlecloud", color: "#4285F4" },
  "google cloud platform": { slug: "googlecloud", color: "#4285F4" },

  // Certifications — AWS
  "aws solutions architect": { slug: "amazonaws", color: "#FF9900" },
  "aws solutions architect associate": { slug: "amazonaws", color: "#FF9900" },
  "aws solutions architect professional": { slug: "amazonaws", color: "#FF9900" },
  "aws developer": { slug: "amazonaws", color: "#FF9900" },
  "aws sysops": { slug: "amazonaws", color: "#FF9900" },
  "aws devops": { slug: "amazonaws", color: "#FF9900" },
  "aws cloud practitioner": { slug: "amazonaws", color: "#FF9900" },
  "aws security": { slug: "amazonaws", color: "#FF9900" },
  "aws machine learning": { slug: "amazonaws", color: "#FF9900" },
  "aws networking": { slug: "amazonaws", color: "#FF9900" },
  "aws database": { slug: "amazonaws", color: "#FF9900" },

  // Certifications — Azure
  "azure administrator": { slug: "microsoftazure", color: "#0089D6" },
  "azure developer": { slug: "microsoftazure", color: "#0089D6" },
  "azure solutions architect": { slug: "microsoftazure", color: "#0089D6" },
  "azure devops": { slug: "microsoftazure", color: "#0089D6" },
  "azure security": { slug: "microsoftazure", color: "#0089D6" },
  "azure fundamentals": { slug: "microsoftazure", color: "#0089D6" },
  "az-900": { slug: "microsoftazure", color: "#0089D6" },
  "az-104": { slug: "microsoftazure", color: "#0089D6" },
  "az-305": { slug: "microsoftazure", color: "#0089D6" },
  "az-400": { slug: "microsoftazure", color: "#0089D6" },

  // Certifications — Google
  "google professional cloud architect": { slug: "googlecloud", color: "#4285F4" },
  "google professional data engineer": { slug: "googlecloud", color: "#4285F4" },
  "google professional ml engineer": { slug: "googlecloud", color: "#4285F4" },
  "google professional network engineer": { slug: "googlecloud", color: "#4285F4" },
  "google professional security engineer": { slug: "googlecloud", color: "#4285F4" },
  "google associate cloud engineer": { slug: "googlecloud", color: "#4285F4" },

  // Certifications — CompTIA
  "comptia a+": { slug: "comptia", color: "#C80F2E" },
  "comptia network+": { slug: "comptia", color: "#C80F2E" },
  "comptia security+": { slug: "comptia", color: "#C80F2E" },
  "comptia linux+": { slug: "comptia", color: "#C80F2E" },
  "comptia server+": { slug: "comptia", color: "#C80F2E" },
  "comptia cloud+": { slug: "comptia", color: "#C80F2E" },
  "comptia cysa+": { slug: "comptia", color: "#C80F2E" },
  "comptia pentest+": { slug: "comptia", color: "#C80F2E" },
  "comptia casp+": { slug: "comptia", color: "#C80F2E" },

  // Certifications — Cisco
  "ccna": { slug: "cisco", color: "#049FD9" },
  "ccnp": { slug: "cisco", color: "#049FD9" },
  "ccie": { slug: "cisco", color: "#049FD9" },
  "cisco ccna": { slug: "cisco", color: "#049FD9" },
  "cisco ccnp": { slug: "cisco", color: "#049FD9" },
  "cisco ccie": { slug: "cisco", color: "#049FD9" },

  // Certifications — Other
  "cissp": { slug: "isc2", color: "#00A98F" },
  "terraform associate": { slug: "terraform", color: "#7B42BC" },
  "hashicorp terraform": { slug: "terraform", color: "#7B42BC" },
  "cka": { slug: "kubernetes", color: "#326CE5" },
  "ckad": { slug: "kubernetes", color: "#326CE5" },
  "cks": { slug: "kubernetes", color: "#326CE5" },
  "certified kubernetes administrator": { slug: "kubernetes", color: "#326CE5" },
  "rhcsa": { slug: "redhat", color: "#EE0000" },
  "rhce": { slug: "redhat", color: "#EE0000" },
  "red hat": { slug: "redhat", color: "#EE0000" },
  "itil": { slug: "itil", color: "#6C3FA0" },
  "itil 4": { slug: "itil", color: "#6C3FA0" },
  "pmp": { slug: "pmi", color: "#003366" },
  "scrum": { slug: "scrumalliance", color: "#009FDA" },
  "aws certified": { slug: "amazonaws", color: "#FF9900" },

  // Programming Languages
  "python": { slug: "python", color: "#3776AB" },
  "javascript": { slug: "javascript", color: "#F7DF1E" },
  "typescript": { slug: "typescript", color: "#3178C6" },
  "go": { slug: "go", color: "#00ADD8" },
  "golang": { slug: "go", color: "#00ADD8" },
  "rust": { slug: "rust", color: "#CE422B" },
  "java": { slug: "openjdk", color: "#ED8B00" },
  "c++": { slug: "cplusplus", color: "#00599C" },
  "c#": { slug: "csharp", color: "#239120" },
  "ruby": { slug: "ruby", color: "#CC342D" },
  "php": { slug: "php", color: "#777BB4" },
  "swift": { slug: "swift", color: "#F05138" },
  "kotlin": { slug: "kotlin", color: "#7F52FF" },
  "scala": { slug: "scala", color: "#DC322F" },
  "r": { slug: "r", color: "#276DC3" },
  "bash": { slug: "gnubash", color: "#4EAA25" },
  "shell": { slug: "gnubash", color: "#4EAA25" },
  "powershell": { slug: "powershell", color: "#5391FE" },
  "sql": { slug: "mysql", color: "#4479A1" },
  "html": { slug: "html5", color: "#E34F26" },
  "css": { slug: "css3", color: "#1572B6" },
  "lua": { slug: "lua", color: "#2C2D72" },
  "perl": { slug: "perl", color: "#39457E" },
  "dart": { slug: "dart", color: "#0175C2" },
  "elixir": { slug: "elixir", color: "#6E4A7E" },
  "haskell": { slug: "haskell", color: "#5D4F85" },
  "clojure": { slug: "clojure", color: "#5881D8" },
  "zig": { slug: "zig", color: "#F7A41D" },
  "nim": { slug: "nim", color: "#FFE953" },
  "solidity": { slug: "solidity", color: "#363636" },
  "assembly": { slug: "assemblyscript", color: "#007AAC" },
  "fortran": { slug: "fortran", color: "#734F96" },

  // Frameworks & Libraries
  "react": { slug: "react", color: "#61DAFB" },
  "react.js": { slug: "react", color: "#61DAFB" },
  "next.js": { slug: "nextdotjs", color: "#000000" },
  "nextjs": { slug: "nextdotjs", color: "#000000" },
  "vue": { slug: "vuedotjs", color: "#4FC08D" },
  "vue.js": { slug: "vuedotjs", color: "#4FC08D" },
  "angular": { slug: "angular", color: "#DD0031" },
  "svelte": { slug: "svelte", color: "#FF3E00" },
  "node.js": { slug: "nodedotjs", color: "#339933" },
  "nodejs": { slug: "nodedotjs", color: "#339933" },
  "express": { slug: "express", color: "#000000" },
  "django": { slug: "django", color: "#092E20" },
  "flask": { slug: "flask", color: "#000000" },
  "fastapi": { slug: "fastapi", color: "#009688" },
  "spring": { slug: "spring", color: "#6DB33F" },
  "rails": { slug: "rubyonrails", color: "#CC0000" },
  "laravel": { slug: "laravel", color: "#FF2D20" },
  "tailwind": { slug: "tailwindcss", color: "#06B6D4" },
  "tailwindcss": { slug: "tailwindcss", color: "#06B6D4" },
  "bootstrap": { slug: "bootstrap", color: "#7952B3" },
  "jquery": { slug: "jquery", color: "#0769AD" },
  "graphql": { slug: "graphql", color: "#E10098" },
  "rest": { slug: "fastapi", color: "#009688" },
  "grpc": { slug: "grpc", color: "#244C5A" },

  // DevOps & Infrastructure
  "docker": { slug: "docker", color: "#2496ED" },
  "kubernetes": { slug: "kubernetes", color: "#326CE5" },
  "k8s": { slug: "kubernetes", color: "#326CE5" },
  "terraform": { slug: "terraform", color: "#7B42BC" },
  "ansible": { slug: "ansible", color: "#EE0000" },
  "jenkins": { slug: "jenkins", color: "#D24939" },
  "gitlab": { slug: "gitlab", color: "#FC6D26" },
  "github": { slug: "github", color: "#181717" },
  "github actions": { slug: "githubactions", color: "#2088FF" },
  "circleci": { slug: "circleci", color: "#343434" },
  "travisci": { slug: "travisci", color: "#3EAAAF" },
  "argocd": { slug: "argo", color: "#EF7B4D" },
  "argo": { slug: "argo", color: "#EF7B4D" },
  "helm": { slug: "helm", color: "#0F1689" },
  "prometheus": { slug: "prometheus", color: "#E6522C" },
  "grafana": { slug: "grafana", color: "#F46800" },
  "datadog": { slug: "datadog", color: "#632CA6" },
  "new relic": { slug: "newrelic", color: "#008C99" },
  "pagerduty": { slug: "pagerduty", color: "#06AC38" },
  "vault": { slug: "hashicorp", color: "#000000" },
  "consul": { slug: "hashicorp", color: "#000000" },
  "nomad": { slug: "hashicorp", color: "#000000" },
  "packer": { slug: "hashicorp", color: "#000000" },
  "nginx": { slug: "nginx", color: "#009639" },
  "apache": { slug: "apache", color: "#D22128" },
  "cloudflare": { slug: "cloudflare", color: "#F38020" },
  "vercel": { slug: "vercel", color: "#000000" },
  "netlify": { slug: "netlify", color: "#00C7B7" },
  "aws lambda": { slug: "awslambda", color: "#FF9900" },
  "ec2": { slug: "amazonaws", color: "#FF9900" },
  "s3": { slug: "amazonaws", color: "#FF9900" },
  "rds": { slug: "amazonaws", color: "#FF9900" },
  "iam": { slug: "amazonaws", color: "#FF9900" },
  "vpc": { slug: "amazonaws", color: "#FF9900" },
  "cloudformation": { slug: "amazonaws", color: "#FF9900" },
  "cloudwatch": { slug: "amazonaws", color: "#FF9900" },
  "ecs": { slug: "amazoncontainerservice", color: "#FF9900" },
  "eks": { slug: "amazoncontainerservice", color: "#FF9900" },
  "fargate": { slug: "amazoncontainerservice", color: "#FF9900" },
  "route53": { slug: "amazonaws", color: "#FF9900" },
  "dynamodb": { slug: "amazondynamodb", color: "#4053D6" },
  "lambda": { slug: "awslambda", color: "#FF9900" },
  "sns": { slug: "amazonsqs", color: "#FF4F8B" },
  "sqs": { slug: "amazonsqs", color: "#FF4F8B" },

  // Databases
  "postgresql": { slug: "postgresql", color: "#4169E1" },
  "postgres": { slug: "postgresql", color: "#4169E1" },
  "mysql": { slug: "mysql", color: "#4479A1" },
  "mongodb": { slug: "mongodb", color: "#47A248" },
  "redis": { slug: "redis", color: "#DC382D" },
  "elasticsearch": { slug: "elasticsearch", color: "#005571" },
  "elastic": { slug: "elasticsearch", color: "#005571" },
  "sqlite": { slug: "sqlite", color: "#003B57" },
  "cassandra": { slug: "apachecassandra", color: "#1287B1" },
  "neo4j": { slug: "neo4j", color: "#008CC1" },
  "influxdb": { slug: "influxdb", color: "#22ADF6" },
  "clickhouse": { slug: "clickhouse", color: "#FFCC00" },
  "mariadb": { slug: "mariadb", color: "#003545" },
  "cockroachdb": { slug: "cockroachlabs", color: "#6933FF" },
  "firestore": { slug: "firebase", color: "#FFCA28" },
  "firebase": { slug: "firebase", color: "#FFCA28" },
  "supabase": { slug: "supabase", color: "#3FCF8E" },
  "prisma": { slug: "prisma", color: "#2D3748" },
  "drizzle": { slug: "drizzle", color: "#C5F74E" },

  // Containers & Orchestration
  "podman": { slug: "podman", color: "#892CA0" },
  "containerd": { slug: "containerd", color: "#5A7DB5" },
  "istio": { slug: "istio", color: "#466BB0" },
  "linkerd": { slug: "linkerd", color: "#2BEDA7" },
  "envoy": { slug: "envoyproxy", color: "#AC6199" },

  // Monitoring & Observability
  "splunk": { slug: "splunk", color: "#000000" },
  "elk": { slug: "elastic", color: "#005571" },
  "kibana": { slug: "kibana", color: "#005571" },
  "logstash": { slug: "logstash", color: "#005571" },
  "jaeger": { slug: "jaegertracing", color: "#60A5FA" },
  "opentelemetry": { slug: "opentelemetry", color: "#000000" },
  "otel": { slug: "opentelemetry", color: "#000000" },

  // Networking
  "tcp": { slug: "tcpip", color: "#00599C" },
  "udp": { slug: "tcpip", color: "#00599C" },
  "dns": { slug: "cloudflare", color: "#F38020" },
  "http": { slug: "httpie", color: "#73DC8C" },
  "https": { slug: "httpie", color: "#73DC8C" },
  "bgp": { slug: "cisco", color: "#049FD9" },
  "ospf": { slug: "cisco", color: "#049FD9" },
  "vpn": { slug: "wireguard", color: "#88171A" },
  "sd-wan": { slug: "cisco", color: "#049FD9" },
  "firewall": { slug: "pfsense", color: "#212121" },
  "palo alto": { slug: "paloaltonetworks", color: "#F04E23" },
  "fortinet": { slug: "fortinet", color: "#EE3124" },
  "f5": { slug: "f5", color: "#E4002B" },
  "load balancer": { slug: "nginx", color: "#009639" },
  "haproxy": { slug: "haproxy", color: "#108AAB" },

  // AI/ML
  "tensorflow": { slug: "tensorflow", color: "#FF6F00" },
  "pytorch": { slug: "pytorch", color: "#EE4C2C" },
  "keras": { slug: "keras", color: "#D00000" },
  "scikit-learn": { slug: "scikitlearn", color: "#F09437" },
  "pandas": { slug: "pandas", color: "#150458" },
  "numpy": { slug: "numpy", color: "#013243" },
  "jupyter": { slug: "jupyter", color: "#F37626" },
  "mlflow": { slug: "mlflow", color: "#0194E2" },
  "kubeflow": { slug: "kubeflow", color: "#326CE5" },
  "hugging face": { slug: "huggingface", color: "#FFD21E" },
  "openai": { slug: "openai", color: "#412991" },
  "langchain": { slug: "langchain", color: "#1C3C3C" },
  "cuda": { slug: "nvidia", color: "#76B900" },
  "nvidia": { slug: "nvidia", color: "#76B900" },
  "ray": { slug: "ray", color: "#028CF3" },
  "transformers": { slug: "huggingface", color: "#FFD21E" },

  // Linux & OS
  "linux": { slug: "linux", color: "#FCC624" },
  "ubuntu": { slug: "ubuntu", color: "#E95420" },
  "debian": { slug: "debian", color: "#A81D33" },
  "centos": { slug: "centos", color: "#262577" },
  "rhel": { slug: "redhat", color: "#EE0000" },
  "alpine": { slug: "alpinelinux", color: "#0D597F" },
  "amazon linux": { slug: "amazonaws", color: "#FF9900" },
  "windows": { slug: "windows", color: "#0078D4" },
  "macos": { slug: "apple", color: "#000000" },

  // Security
  "wireshark": { slug: "wireshark", color: "#1679A7" },
  "burp suite": { slug: "portswigger", color: "#FF6633" },
  "metasploit": { slug: "metasploit", color: "#2266BB" },
  "nessus": { slug: "tenable", color: "#00B3E3" },
  "qualys": { slug: "qualys", color: "#ED2B2F" },
  "crowdstrike": { slug: "crowdstrike", color: "#E01E28" },
  "sentinel": { slug: "microsoft", color: "#00A4EF" },
  "okta": { slug: "okta", color: "#007DC1" },
  "auth0": { slug: "auth0", color: "#EB5424" },
  "cyberark": { slug: "cyberark", color: "#FF0044" },
  "sailpoint": { slug: "sailpoint", color: "#00B3E3" },

  // Virtualization
  "vmware": { slug: "vmware", color: "#607078" },
  "vsphere": { slug: "vmware", color: "#607078" },
  "esxi": { slug: "vmware", color: "#607078" },
  "hyper-v": { slug: "microsoft", color: "#00A4EF" },
  "proxmox": { slug: "proxmox", color: "#E57000" },
  "virtualbox": { slug: "virtualbox", color: "#183A61" },
  "vagrant": { slug: "vagrant", color: "#1868F2" },

  // CI/CD & Tools
  "git": { slug: "git", color: "#F05032" },
  "bitbucket": { slug: "bitbucket", color: "#0052CC" },
  "sonarqube": { slug: "sonarqube", color: "#4E9BCD" },
  "jira": { slug: "jira", color: "#0052CC" },
  "confluence": { slug: "confluence", color: "#172B4D" },
  "servicenow": { slug: "servicenow", color: "#62D84E" },
  "slack": { slug: "slack", color: "#4A154B" },
  "teams": { slug: "microsoftteams", color: "#6264A7" },
  "notion": { slug: "notion", color: "#000000" },
  "figma": { slug: "figma", color: "#F24E1E" },
  "postman": { slug: "postman", color: "#FF6C37" },
  "vscode": { slug: "visualstudiocode", color: "#007ACC" },
  "vim": { slug: "vim", color: "#019733" },
  "neovim": { slug: "neovim", color: "#57A143" },

  // HashiCorp
  "hashicorp": { slug: "hashicorp", color: "#000000" },
  "boundary": { slug: "hashicorp", color: "#000000" },
  "waypoint": { slug: "hashicorp", color: "#000000" },

  // Data & Streaming
  "kafka": { slug: "apachekafka", color: "#231F20" },
  "rabbitmq": { slug: "rabbitmq", color: "#FF6600" },
  "spark": { slug: "apachespark", color: "#E25A1C" },
  "airflow": { slug: "apacheairflow", color: "#017CEE" },
  "dbt": { slug: "dbt", color: "#FF694B" },
  "snowflake": { slug: "snowflake", color: "#29B5E8" },
  "databricks": { slug: "databricks", color: "#FF3621" },
  "looker": { slug: "looker", color: "#4285F4" },
  "tableau": { slug: "tableau", color: "#E97627" },
  "powerbi": { slug: "powerbi", color: "#F2C811" },

  // Other Tools
  "caddy": { slug: "caddy", color: "#1F8DD6" },
  "traefik": { slug: "traefikproxy", color: "#3FA8E5" },
  "letsencrypt": { slug: "letsencrypt", color: "#003A70" },
  "certbot": { slug: "letsencrypt", color: "#003A70" },
};

// Get icon URL from name
export function getIconUrl(name: string): string | null {
  const key = name.toLowerCase().trim();
  const match = ICON_MAP[key];
  if (match) {
    const color = match.color?.replace("#", "") || "000000";
    return `${SI}/${match.slug}/${color}`;
  }

  // Try fuzzy match
  for (const [k, v] of Object.entries(ICON_MAP)) {
    if (key.includes(k) || k.includes(key)) {
      const color = v.color?.replace("#", "") || "000000";
      return `${SI}/${v.slug}/${color}`;
    }
  }

  return null;
}

// Reverse lookup: get display name from URL
export function getNameFromUrl(url: string): string | null {
  if (!url || !url.startsWith(SI)) return null;
  const parts = url.replace(SI + "/", "").split("/");
  const slug = parts[0];
  for (const [name, entry] of Object.entries(ICON_MAP)) {
    if (entry.slug === slug) return name;
  }
  return null;
}

// Get all searchable entries
export function getIconEntries() {
  return Object.keys(ICON_MAP).sort();
}

interface IconLookupProps {
  value: string;
  onChange: (url: string) => void;
  onNameChange?: (name: string) => void;
  placeholder?: string;
  showPreview?: boolean;
}

export default function IconLookup({ value, onChange, onNameChange, placeholder = "Type a name...", showPreview = true }: IconLookupProps) {
  const [query, setQuery] = useState(() => getNameFromUrl(value) || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      setPreviewUrl(value);
      // Sync query when value changes externally (e.g. editing existing item)
      const name = getNameFromUrl(value);
      if (name && !query) setQuery(name);
    }
  }, [value]);

  const entries = getIconEntries();
  const filtered = query.length > 0
    ? entries.filter((e) => e.includes(query.toLowerCase())).slice(0, 12)
    : [];

  function handleSelect(name: string) {
    setQuery(name);
    setShowSuggestions(false);
    const url = getIconUrl(name);
    if (url) {
      setPreviewUrl(url);
      onChange(url);
    }
    onNameChange?.(name);
  }

  function handleInputChange(val: string) {
    setQuery(val);
    setShowSuggestions(true);
    // Try auto-detect and persist the URL so form state stays in sync
    const url = getIconUrl(val);
    if (url) {
      setPreviewUrl(url);
      onChange(url);
    }
  }

  function handleCustomUrl(url: string) {
    onChange(url);
    setPreviewUrl(url);
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2">
        {showPreview && previewUrl && (
          <img src={previewUrl} alt="" className="w-6 h-6 rounded object-contain bg-white/10 p-0.5"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        )}
        <div className="flex-1 relative">
          <input
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted/30"
          />
          {showSuggestions && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#0a0a12] border border-[rgba(0,245,255,0.2)] rounded-lg shadow-2xl max-h-48 overflow-y-auto">
              {filtered.map((name) => {
                const url = getIconUrl(name);
                return (
                  <button key={name} type="button" onClick={() => handleSelect(name)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neon-cyan/5 transition-colors text-left">
                    {url && <img src={url} alt="" className="w-4 h-4 rounded object-contain bg-white/10 p-0.5" />}
                    <span className="text-xs font-mono text-foreground capitalize">{name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Custom URL override */}
      <div className="mt-1.5">
        <input
          value={value}
          onChange={(e) => handleCustomUrl(e.target.value)}
          placeholder="Or paste custom image URL..."
          className="w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.08)] rounded px-2 py-1 text-[10px] font-mono text-muted placeholder:text-muted/20"
        />
      </div>
    </div>
  );
}
