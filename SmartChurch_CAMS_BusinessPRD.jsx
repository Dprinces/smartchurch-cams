import { useState } from "react";

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "The Problem" },
  { id: "solution", label: "The Solution" },
  { id: "features", label: "Features" },
  { id: "onboarding", label: "Onboarding" },
  { id: "pricing", label: "Pricing" },
  { id: "technical", label: "Technical Spec" },
  { id: "roadmap", label: "Roadmap" },
  { id: "faq", label: "FAQs" },
];

const TIERS = [
  {
    name: "Starter",
    price: "Free",
    sub: "Forever",
    desc: "For small congregations getting started",
    members: "Up to 150 members",
    color: "#0F6E56",
    bg: "#E1F5EE",
    features: [
      "Member registration database",
      "General Sunday QR code",
      "Basic attendance records",
      "Weekly PDF report (email)",
      "1 admin account",
      "Manual attendance override",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Growth",
    price: "₦15,000",
    sub: "/ month",
    desc: "For growing churches that need insights",
    members: "Up to 1,000 members",
    color: "#185FA5",
    bg: "#E6F1FB",
    features: [
      "Everything in Starter",
      "Automated Sunday query engine",
      "Attendance dashboard & trends",
      "Absentee flagging & alerts",
      "Department breakdowns",
      "WhatsApp report delivery",
      "5 admin accounts",
      "CSV + PDF export",
    ],
    cta: "Start 30-Day Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "₦45,000",
    sub: "/ month",
    desc: "For large churches and multi-campus ministries",
    members: "Unlimited members",
    color: "#533AB7",
    bg: "#EEEDFE",
    features: [
      "Everything in Growth",
      "Multi-campus / branch support",
      "Multi-session tracking (1st & 2nd service)",
      "Pastoral care task assignment",
      "SMS follow-up automation",
      "Custom branding",
      "Unlimited admin accounts",
      "Dedicated onboarding support",
      "SLA-backed uptime guarantee",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

const ONBOARDING_STEPS = [
  {
    week: "Week 1",
    title: "Account setup & branding",
    tasks: [
      "Church admin receives login credentials",
      "Upload church logo and configure profile",
      "Set timezone, service times, and department list",
      "Invite additional admin accounts",
    ],
    icon: "🏛️",
    color: "#E1F5EE",
    border: "#0F6E56",
  },
  {
    week: "Week 2",
    title: "Member data migration",
    tasks: [
      "Download and complete the member import template (CSV)",
      "SmartChurch team reviews and imports existing records",
      "Member IDs are auto-generated for all existing members",
      "Admin verifies data accuracy in dashboard",
    ],
    icon: "📋",
    color: "#E6F1FB",
    border: "#185FA5",
  },
  {
    week: "Week 3",
    title: "QR code rollout",
    tasks: [
      "Sunday entrance QR code generated and tested",
      "Ushers and gate team trained on scanning process",
      "Manual override walkthrough for admins",
      "Pilot Sunday: run alongside existing register",
    ],
    icon: "📱",
    color: "#EEEDFE",
    border: "#533AB7",
  },
  {
    week: "Week 4",
    title: "Go live & handover",
    tasks: [
      "Full cutover: discontinue paper register",
      "First automated Sunday report received by pastor",
      "Pastoral team trained on absentee dashboard",
      "Support handover + documentation delivered",
    ],
    icon: "🚀",
    color: "#FAEEDA",
    border: "#854F0B",
  },
];

const FEATURES = [
  {
    icon: "👤",
    title: "One-time member registration",
    desc: "Members fill a structured form once. Full name, phone, date of birth, department, and emergency contact captured. Unique Member ID assigned instantly.",
    tag: "Foundation",
    tagColor: "#0F6E56",
    tagBg: "#E1F5EE",
  },
  {
    icon: "📲",
    title: "Sunday entrance QR code",
    desc: "A single QR code is displayed at the church entrance every Sunday. Members scan it with their own phones on arrival — no dedicated hardware needed.",
    tag: "Core",
    tagColor: "#185FA5",
    tagBg: "#E6F1FB",
  },
  {
    icon: "⚡",
    title: "Entry-triggered attendance",
    desc: "The moment a member scans the QR code at the entrance, their attendance is recorded with a precise timestamp. The database updates instantly.",
    tag: "Core",
    tagColor: "#185FA5",
    tagBg: "#E6F1FB",
  },
  {
    icon: "🔒",
    title: "Sunday-only enforcement",
    desc: "The QR scan endpoint is locked to Sundays only. Any scan attempted on another day is rejected with a clear message, keeping your data clean.",
    tag: "Security",
    tagColor: "#854F0B",
    tagBg: "#FAEEDA",
  },
  {
    icon: "📊",
    title: "Automated Sunday reports",
    desc: "Four scheduled queries run every Sunday at 8AM, 11AM, 1:30PM, and 2PM — generating a full attendance report with breakdowns, delivered to your inbox.",
    tag: "Automation",
    tagColor: "#533AB7",
    tagBg: "#EEEDFE",
  },
  {
    icon: "🔔",
    title: "Absentee flagging",
    desc: "Members absent for 2 or more consecutive Sundays are automatically flagged and surfaced in a pastoral care list, so no one falls through the cracks.",
    tag: "Pastoral",
    tagColor: "#993C1D",
    tagBg: "#FAECE7",
  },
  {
    icon: "📈",
    title: "Attendance dashboard",
    desc: "Visual trend charts, department breakdowns, first-timer counts, and comparative week-on-week analytics — all in one live dashboard for leadership.",
    tag: "Insights",
    tagColor: "#185FA5",
    tagBg: "#E6F1FB",
  },
  {
    icon: "✏️",
    title: "Manual override",
    desc: "When a member forgets to scan, any admin can search by name and record attendance manually. Every override is logged with the admin's ID and timestamp.",
    tag: "Operations",
    tagColor: "#5F5E5A",
    tagBg: "#F1EFE8",
  },
];

const FAQS = [
  {
    q: "Do members need to download an app?",
    a: "No. SmartChurch is a Progressive Web App — members open a browser link on their phone and scan the entrance QR code. No App Store download required.",
  },
  {
    q: "What happens if a member doesn't have a smartphone?",
    a: "Ushers can use a shared admin tablet to manually mark attendance by searching the member's name. The manual override process takes under 10 seconds.",
  },
  {
    q: "Can we migrate our existing member register?",
    a: "Yes. We provide a CSV import template. Your existing member list is imported during onboarding (Week 2), and Member IDs are assigned automatically to all existing records.",
  },
  {
    q: "How does the system handle two services (1st and 2nd)?",
    a: "Multi-session support is available on the Growth and Enterprise plans. Each service generates a separate QR window, and attendance is tracked per session.",
  },
  {
    q: "Is member data stored securely in Nigeria?",
    a: "Yes. All data is stored on servers compliant with Nigeria's NDPR regulations. Member data is never shared with third parties. Backups run every 24 hours.",
  },
  {
    q: "What if the internet goes down on Sunday?",
    a: "The scanning interface caches check-ins locally on the device. Once connectivity is restored, all cached records sync automatically to the central database.",
  },
  {
    q: "Can we brand the platform with our church name and logo?",
    a: "Yes, on the Enterprise plan. The registration form, QR landing page, and member-facing screens can display your church branding.",
  },
];

const TECH_STACK = [
  { layer: "Frontend", tech: "React / Next.js + PWA", why: "Mobile-first; no app install; works offline for scanning" },
  { layer: "Backend", tech: "Node.js + Express", why: "REST API with scheduled job support for Sunday automation" },
  { layer: "Database", tech: "PostgreSQL", why: "Relational; strong reporting queries; audit trail support" },
  { layer: "QR Generation", tech: "qrcode.js + HMAC signing", why: "Sunday-scoped, tamper-proof session QR codes" },
  { layer: "QR Scanning", tech: "ZXing / jsQR", why: "Browser-native; no hardware scanner required" },
  { layer: "Scheduler", tech: "node-cron", why: "Four automated Sunday queries at preset times" },
  { layer: "Hosting", tech: "Render / Railway", why: "Nigeria-region servers; NDPR-compliant; scheduled job support" },
  { layer: "Auth", tech: "JWT + RBAC + 2FA", why: "Separate member and admin access; 2FA on all admin accounts" },
];

const DATA_TABLES = [
  { table: "members", fields: "member_id · full_name · phone · email · dob · gender · address · department · status · photo_url · created_at" },
  { table: "attendance_records", fields: "record_id · member_id (FK) · scan_date · entry_timestamp · service_session · created_at" },
  { table: "sunday_qr_sessions", fields: "session_id · session_date · qr_hash · activated_at · deactivated_at · created_by_admin" },
  { table: "sunday_reports", fields: "report_id · report_date · total_count · breakdown_json · absentee_list_json · generated_at" },
  { table: "manual_overrides", fields: "override_id · member_id · date · reason · added_by_admin · created_at" },
];

const ROADMAP = [
  { phase: "Phase 1", label: "Foundation", weeks: "Wks 1–3", items: ["Database schema & member registration form", "Admin portal & member ID generation", "Role-based access control"], color: "#E1F5EE", dot: "#0F6E56" },
  { phase: "Phase 2", label: "Scanning", weeks: "Wks 4–5", items: ["Sunday entrance QR generation", "Entry scan interface (mobile PWA)", "Sunday-only lock + manual override"], color: "#E6F1FB", dot: "#185FA5" },
  { phase: "Phase 3", label: "Automation", weeks: "Wk 6", items: ["Four scheduled Sunday cron jobs", "Report generation (PDF + CSV)", "Email / WhatsApp report delivery"], color: "#EEEDFE", dot: "#533AB7" },
  { phase: "Phase 4", label: "Insights", weeks: "Wks 7–8", items: ["Attendance dashboard & trend charts", "Absentee flagging & pastoral alerts", "Department and gender breakdowns"], color: "#FAEEDA", dot: "#854F0B" },
  { phase: "Phase 5", label: "Hardening", weeks: "Wks 9–10", items: ["Offline sync & retry logic", "Security audit + NDPR review", "User training & go-live"], color: "#FAECE7", dot: "#993C1D" },
];

function Section({ id, children, style = {} }) {
  return (
    <section id={id} style={{ padding: "72px 0 48px", borderBottom: "1px solid #E8E8E4", ...style }}>
      {children}
    </section>
  );
}

function SectionLabel({ children, color = "#185FA5" }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color, marginBottom: 12 }}>
      {children}
    </p>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontSize: 30, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.2, marginBottom: 16, marginTop: 0 }}>
      {children}
    </h2>
  );
}

function SectionSub({ children }) {
  return (
    <p style={{ fontSize: 16, color: "#555", lineHeight: 1.7, maxWidth: 640, marginBottom: 40, marginTop: 0 }}>
      {children}
    </p>
  );
}

function Tag({ children, color, bg }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color, background: bg, padding: "3px 10px", borderRadius: 20, display: "inline-block" }}>
      {children}
    </span>
  );
}

export default function App() {
  const [activeNav, setActiveNav] = useState("overview");
  const [openFaq, setOpenFaq] = useState(null);

  const scrollTo = (id) => {
    setActiveNav(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", background: "#fff", color: "#1a1a1a" }}>

      {/* Sticky Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid #E8E8E4", padding: "0 32px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", gap: 0, overflowX: "auto" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#185FA5", marginRight: 32, whiteSpace: "nowrap", padding: "16px 0" }}>SmartChurch</span>
          {NAV.map(n => (
            <button key={n.id} onClick={() => scrollTo(n.id)}
              style={{ background: "none", border: "none", padding: "16px 14px", fontSize: 13, fontWeight: activeNav === n.id ? 600 : 400, color: activeNav === n.id ? "#185FA5" : "#666", cursor: "pointer", whiteSpace: "nowrap", borderBottom: activeNav === n.id ? "2px solid #185FA5" : "2px solid transparent", transition: "all 0.15s" }}>
              {n.label}
            </button>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 32px" }}>

        {/* Hero */}
        <Section id="overview" style={{ paddingTop: 96, borderBottom: "none" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#E6F1FB", borderRadius: 20, padding: "6px 14px", marginBottom: 24 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#185FA5", display: "inline-block" }}></span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#185FA5", letterSpacing: "0.06em" }}>PRODUCT REQUIREMENTS DOCUMENT — v1.1</span>
              </div>
              <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.1, color: "#0a0a0a", margin: "0 0 20px" }}>
                Know your congregation.<br />
                <span style={{ color: "#185FA5" }}>Every Sunday.</span>
              </h1>
              <p style={{ fontSize: 17, color: "#444", lineHeight: 1.7, marginBottom: 32 }}>
                SmartChurch is a QR-based attendance platform purpose-built for churches — replacing paper registers with real-time digital check-ins, automated reports, and pastoral care alerts.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={() => scrollTo("onboarding")} style={{ background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  See onboarding plan →
                </button>
                <button onClick={() => scrollTo("pricing")} style={{ background: "#fff", color: "#185FA5", border: "1.5px solid #185FA5", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  View pricing
                </button>
              </div>
            </div>
            <div style={{ background: "linear-gradient(135deg, #E6F1FB 0%, #EEEDFE 100%)", borderRadius: 20, padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Check-in time per member", before: "45–90 sec", after: "< 5 sec", icon: "⏱" },
                { label: "Sunday report ready", before: "Monday morning", after: "2:00 PM same day", icon: "📊" },
                { label: "Absentee follow-up", before: "Never tracked", after: "Auto-flagged weekly", icon: "🔔" },
              ].map((stat, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 22 }}>{stat.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 11, color: "#888", margin: "0 0 4px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 13, color: "#aaa", textDecoration: "line-through" }}>{stat.before}</span>
                      <span style={{ fontSize: 13, color: "#888" }}>→</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#185FA5" }}>{stat.after}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Metrics bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "#E8E8E4", borderRadius: 12, overflow: "hidden", marginBottom: 72 }}>
          {[
            { value: "< 5 sec", label: "Scan to confirmation" },
            { value: "5,000+", label: "Members supported" },
            { value: "99.5%", label: "Uptime SLA" },
            { value: "4 queries", label: "Auto-run each Sunday" },
          ].map((m, i) => (
            <div key={i} style={{ background: "#fff", padding: "20px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 24, fontWeight: 800, color: "#185FA5", margin: "0 0 4px" }}>{m.value}</p>
              <p style={{ fontSize: 12, color: "#888", margin: 0, fontWeight: 500 }}>{m.label}</p>
            </div>
          ))}
        </div>

        {/* Problem */}
        <Section id="problem">
          <SectionLabel>The Problem</SectionLabel>
          <SectionTitle>Why churches lose track of their people</SectionTitle>
          <SectionSub>Manual registers fail silently. By the time leadership realises someone hasn't been seen in months, the window for pastoral care has often closed.</SectionSub>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {[
              { icon: "📝", title: "Paper registers get lost", desc: "Illegible handwriting, torn pages, and missing sheets mean Sunday attendance data is unreliable from the moment it's captured." },
              { icon: "👥", title: "No member database", desc: "Without a central record, it's impossible to identify who is attending regularly, who is drifting away, or how the congregation is growing." },
              { icon: "🚶", title: "Queues at the entrance", desc: "Manual sign-in creates bottlenecks. Members arrive early, queue to sign in, and the process disrupts the flow of worship before it even begins." },
              { icon: "📭", title: "Absentees go unnoticed", desc: "Without automated tracking, members can miss months of Sundays without a single pastoral check-in. Care teams rely on memory, not data." },
            ].map((p, i) => (
              <div key={i} style={{ background: "#FAFAF8", border: "1px solid #E8E8E4", borderRadius: 12, padding: "24px 24px" }}>
                <span style={{ fontSize: 28, display: "block", marginBottom: 12 }}>{p.icon}</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", margin: "0 0 8px" }}>{p.title}</h3>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Solution */}
        <Section id="solution">
          <SectionLabel color="#0F6E56">The Solution</SectionLabel>
          <SectionTitle>How SmartChurch works</SectionTitle>
          <SectionSub>Three steps. Every Sunday. Fully automated.</SectionSub>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 40 }}>
            {[
              { step: "01", title: "Members register once", desc: "A one-time digital form captures every member's details and assigns them a permanent Member ID. No repeated data entry — ever.", color: "#E1F5EE", border: "#0F6E56" },
              { step: "02", title: "Scan in at the door", desc: "Each Sunday, a QR code is displayed at the entrance. Members scan it with their phone as they walk in — attendance recorded in under 5 seconds.", color: "#E6F1FB", border: "#185FA5" },
              { step: "03", title: "Reports arrive automatically", desc: "By 2PM every Sunday, a full attendance report lands in the pastor's inbox — with breakdowns, trends, and a flagged list of members to follow up.", color: "#EEEDFE", border: "#533AB7" },
            ].map((s, i) => (
              <div key={i} style={{ borderRadius: 12, padding: 28, background: s.color, borderLeft: `4px solid ${s.border}` }}>
                <p style={{ fontSize: 32, fontWeight: 800, color: s.border, margin: "0 0 12px", opacity: 0.4 }}>{s.step}</p>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", margin: "0 0 10px" }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Flow diagram */}
          <div style={{ background: "#FAFAF8", border: "1px solid #E8E8E4", borderRadius: 16, padding: 32 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 24, marginTop: 0 }}>Sunday attendance flow</p>
            <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto" }}>
              {[
                { label: "8:00 AM", sub: "QR activates", bg: "#E1F5EE", color: "#0F6E56" },
                { label: "Entry scan", sub: "Member arrives", bg: "#E6F1FB", color: "#185FA5" },
                { label: "DB updates", sub: "Real-time sync", bg: "#EEEDFE", color: "#533AB7" },
                { label: "1:30 PM", sub: "QR closes", bg: "#FAEEDA", color: "#854F0B" },
                { label: "2:00 PM", sub: "Report sent", bg: "#FAECE7", color: "#993C1D" },
              ].map((node, i, arr) => (
                <div key={i} style={{ display: "flex", alignItems: "center", flex: "none" }}>
                  <div style={{ background: node.bg, borderRadius: 10, padding: "12px 18px", textAlign: "center", minWidth: 100 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: node.color, margin: "0 0 2px" }}>{node.label}</p>
                    <p style={{ fontSize: 11, color: "#777", margin: 0 }}>{node.sub}</p>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ width: 32, height: 1, background: "#D0D0C8", position: "relative", flex: "none" }}>
                      <span style={{ position: "absolute", right: -3, top: -5, color: "#999", fontSize: 12 }}>›</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Features */}
        <Section id="features">
          <SectionLabel>Features</SectionLabel>
          <SectionTitle>Everything your church needs</SectionTitle>
          <SectionSub>Built specifically for Nigerian churches — designed to work with the tools your congregation already has.</SectionSub>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ border: "1px solid #E8E8E4", borderRadius: 12, padding: "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>{f.icon}</span>
                  <Tag color={f.tagColor} bg={f.tagBg}>{f.tag}</Tag>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", margin: "0 0 8px" }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Onboarding */}
        <Section id="onboarding">
          <SectionLabel color="#533AB7">Onboarding</SectionLabel>
          <SectionTitle>From paper register to live system in 4 weeks</SectionTitle>
          <SectionSub>We guide your church through every step. No technical knowledge required from your team.</SectionSub>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, marginBottom: 40 }}>
            {ONBOARDING_STEPS.map((step, i) => (
              <div key={i} style={{ background: step.color, borderRadius: 14, padding: 28, position: "relative", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: step.border }}>{step.week}</span>
                  <span style={{ fontSize: 24 }}>{step.icon}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", margin: "0 0 16px" }}>{step.title}</h3>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {step.tasks.map((task, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                      <span style={{ width: 16, height: 16, borderRadius: "50%", background: step.border, display: "flex", alignItems: "center", justifyContent: "center", flex: "none", marginTop: 1 }}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                      <span style={{ fontSize: 13, color: "#444", lineHeight: 1.5 }}>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* What churches need to provide */}
          <div style={{ background: "#FAFAF8", border: "1px solid #E8E8E4", borderRadius: 12, padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>What your church provides</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[
                { icon: "📋", title: "Existing member list", desc: "Excel or paper register — we handle the import" },
                { icon: "📱", title: "An admin smartphone", desc: "For testing and manual override during rollout" },
                { icon: "🖨️", title: "A printer or screen", desc: "To display the Sunday entrance QR code at the door" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20, flex: "none" }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>{item.title}</p>
                    <p style={{ fontSize: 13, color: "#777", margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Pricing */}
        <Section id="pricing">
          <SectionLabel color="#0F6E56">Pricing</SectionLabel>
          <SectionTitle>Simple, church-sized pricing</SectionTitle>
          <SectionSub>No contracts. No per-member fees. Cancel anytime.</SectionSub>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {TIERS.map((tier, i) => (
              <div key={i} style={{ border: tier.highlight ? `2px solid ${tier.color}` : "1px solid #E8E8E4", borderRadius: 16, padding: 28, position: "relative", background: "#fff" }}>
                {tier.highlight && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: tier.color, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 14px", borderRadius: 20 }}>
                    Most Popular
                  </div>
                )}
                <p style={{ fontSize: 13, fontWeight: 700, color: tier.color, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{tier.name}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: "#1a1a1a" }}>{tier.price}</span>
                  <span style={{ fontSize: 14, color: "#888" }}>{tier.sub}</span>
                </div>
                <p style={{ fontSize: 12, color: tier.color, fontWeight: 600, background: tier.bg, display: "inline-block", padding: "3px 10px", borderRadius: 20, marginBottom: 8, marginTop: 0 }}>{tier.members}</p>
                <p style={{ fontSize: 13, color: "#666", marginBottom: 20, marginTop: 8, lineHeight: 1.5 }}>{tier.desc}</p>
                <div style={{ borderTop: "1px solid #F0F0EC", paddingTop: 20, marginBottom: 24 }}>
                  {tier.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ width: 16, height: 16, borderRadius: "50%", background: tier.bg, border: `1px solid ${tier.color}`, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2.5" stroke={tier.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                      <span style={{ fontSize: 13, color: "#444" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button style={{ width: "100%", background: tier.highlight ? tier.color : "#fff", color: tier.highlight ? "#fff" : tier.color, border: `1.5px solid ${tier.color}`, borderRadius: 8, padding: "11px 0", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "#999", textAlign: "center", marginTop: 24 }}>All prices in Nigerian Naira (₦). Annual billing available at 20% discount.</p>
        </Section>

        {/* Technical Spec */}
        <Section id="technical">
          <SectionLabel color="#533AB7">Technical Specification</SectionLabel>
          <SectionTitle>Built to scale with your church</SectionTitle>
          <SectionSub>A modern, maintainable stack — optimised for Nigerian network conditions and NDPR compliance.</SectionSub>

          <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Technology stack</h3>
            <div style={{ border: "1px solid #E8E8E4", borderRadius: 12, overflow: "hidden" }}>
              {TECH_STACK.map((row, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 200px 1fr", gap: 0, borderBottom: i < TECH_STACK.length - 1 ? "1px solid #F0F0EC" : "none", padding: "14px 20px", background: i % 2 === 0 ? "#fff" : "#FAFAF8", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>{row.layer}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{row.tech}</span>
                  <span style={{ fontSize: 13, color: "#666" }}>{row.why}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Data model</h3>
            <div style={{ border: "1px solid #E8E8E4", borderRadius: 12, overflow: "hidden" }}>
              {DATA_TABLES.map((row, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "200px 1fr", borderBottom: i < DATA_TABLES.length - 1 ? "1px solid #F0F0EC" : "none", padding: "14px 20px", background: i % 2 === 0 ? "#fff" : "#FAFAF8", alignItems: "start" }}>
                  <code style={{ fontSize: 12, fontWeight: 700, color: "#185FA5", fontFamily: "monospace" }}>{row.table}</code>
                  <code style={{ fontSize: 12, color: "#666", fontFamily: "monospace", lineHeight: 1.6 }}>{row.fields}</code>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { label: "Performance", value: "< 2 sec", detail: "Scan-to-confirmation on 4G" },
              { label: "Scalability", value: "5,000", detail: "Registered members supported" },
              { label: "Concurrent scans", value: "2,000", detail: "Simultaneous Sunday scans" },
            ].map((m, i) => (
              <div key={i} style={{ background: "#FAFAF8", borderRadius: 10, padding: "20px 22px", border: "1px solid #E8E8E4" }}>
                <p style={{ fontSize: 11, color: "#888", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.label}</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: "#185FA5", margin: "0 0 4px" }}>{m.value}</p>
                <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{m.detail}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Roadmap */}
        <Section id="roadmap">
          <SectionLabel>Delivery Roadmap</SectionLabel>
          <SectionTitle>10-week build plan</SectionTitle>
          <SectionSub>From signed agreement to live Sunday system in 10 weeks. Each phase is delivered and tested before the next begins.</SectionSub>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 20, top: 24, bottom: 24, width: 2, background: "#E8E8E4" }} />
            {ROADMAP.map((phase, i) => (
              <div key={i} style={{ display: "flex", gap: 24, marginBottom: 28, alignItems: "flex-start" }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: phase.color, border: `2px solid ${phase.dot}`, display: "flex", alignItems: "center", justifyContent: "center", flex: "none", zIndex: 1 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: phase.dot }}>{i + 1}</span>
                </div>
                <div style={{ flex: 1, background: "#FAFAF8", border: "1px solid #E8E8E4", borderRadius: 12, padding: "18px 22px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: phase.dot }}>{phase.phase}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>{phase.label}</span>
                    <span style={{ marginLeft: "auto", fontSize: 12, color: "#888", background: "#F0F0EC", padding: "3px 10px", borderRadius: 20, fontWeight: 500 }}>{phase.weeks}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {phase.items.map((item, j) => (
                      <span key={j} style={{ fontSize: 12, color: "#555", background: phase.color, padding: "4px 12px", borderRadius: 20, display: "inline-block" }}>{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* FAQs */}
        <Section id="faq">
          <SectionLabel>Frequently Asked Questions</SectionLabel>
          <SectionTitle>Common questions from church leaders</SectionTitle>
          <div style={{ maxWidth: 720 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderBottom: "1px solid #E8E8E4" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", background: "none", border: "none", padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", gap: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.4 }}>{faq.q}</span>
                  <span style={{ fontSize: 18, color: "#888", flex: "none", transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ paddingBottom: 20 }}>
                    <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* CTA Footer */}
        <section style={{ padding: "64px 0 80px", textAlign: "center" }}>
          <div style={{ background: "linear-gradient(135deg, #E6F1FB 0%, #EEEDFE 100%)", borderRadius: 20, padding: "56px 40px" }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0a0a0a", margin: "0 0 16px" }}>Ready to modernise your church register?</h2>
            <p style={{ fontSize: 16, color: "#555", margin: "0 0 32px", maxWidth: 480, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7 }}>
              Start free with up to 150 members. Upgrade as your congregation grows. No technical setup required.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button style={{ background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                Get started free →
              </button>
              <button style={{ background: "#fff", color: "#185FA5", border: "1.5px solid #185FA5", borderRadius: 8, padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                Book a demo
              </button>
            </div>
            <p style={{ fontSize: 12, color: "#888", marginTop: 20, marginBottom: 0 }}>SmartChurch Attendance Platform · v1.1 · NDPR Compliant · Built for Nigerian churches</p>
          </div>
        </section>

      </div>
    </div>
  );
}
