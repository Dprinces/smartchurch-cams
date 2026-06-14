import { useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import { MemberPortal } from "./MemberPortal";
import {
  churchFeatureOptions,
  communicationChannelOptions,
  membershipSizeOptions,
} from "./church-options";
import { uploadChurchLogo } from "./logo-upload";

type NavId =
  | "overview"
  | "problem"
  | "solution"
  | "features"
  | "onboarding"
  | "pricing"
  | "roadmap"
  | "faq";

type NavItem = {
  id: NavId;
  label: string;
};

type Tier = {
  name: string;
  price: string;
  sub: string;
  desc: string;
  members: string;
  color: string;
  bg: string;
  features: string[];
  cta: string;
  highlight: boolean;
};

type OnboardingStep = {
  week: string;
  title: string;
  tasks: string[];
  icon: string;
  color: string;
  border: string;
};

type Feature = {
  icon: string;
  title: string;
  desc: string;
  tag: string;
  tagColor: string;
  tagBg: string;
};

type Faq = {
  q: string;
  a: string;
};

type ChurchIntakeFormState = {
  churchName: string;
  logoUrl: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  city: string;
  denomination: string;
  membershipSize: string;
  branchCount: string;
  serviceDays: string;
  serviceTimes: string;
  preferredFeatures: string[];
  preferredChannels: string[];
  requirementsNotes: string;
};

type RoadmapPhase = {
  phase: string;
  label: string;
  weeks: string;
  items: string[];
  color: string;
  dot: string;
};

type ViewMode = "public" | "member-portal";

const pageStyles = {
  shell: {
    fontFamily:
      "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    background: "#fff",
    color: "#1a1a1a",
  } satisfies CSSProperties,
  pageContainer: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "0 24px",
  } satisfies CSSProperties,
  section: {
    padding: "72px 0 48px",
    borderBottom: "1px solid #E8E8E4",
  } satisfies CSSProperties,
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    margin: "0 0 12px",
  } satisfies CSSProperties,
  sectionTitle: {
    fontSize: "clamp(2rem, 3vw, 2.4rem)",
    fontWeight: 800,
    color: "#111",
    lineHeight: 1.15,
    margin: "0 0 16px",
  } satisfies CSSProperties,
  sectionSub: {
    fontSize: 16,
    color: "#555",
    lineHeight: 1.7,
    maxWidth: 700,
    margin: "0 0 40px",
  } satisfies CSSProperties,
  card: {
    border: "1px solid #E8E8E4",
    borderRadius: 16,
    background: "#fff",
  } satisfies CSSProperties,
} as const;

const NAV: NavItem[] = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "The Problem" },
  { id: "solution", label: "The Solution" },
  { id: "features", label: "Features" },
  { id: "onboarding", label: "Onboarding" },
  { id: "pricing", label: "Pricing" },
  { id: "roadmap", label: "Roadmap" },
  { id: "faq", label: "FAQs" },
];

const TIERS: Tier[] = [
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

const ONBOARDING_STEPS: OnboardingStep[] = [
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

const FEATURES: Feature[] = [
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
    desc: "A single QR code is displayed at the church entrance every Sunday. Members scan it with their own phones on arrival, with no dedicated hardware needed.",
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
    desc: "Four scheduled queries run every Sunday at 8AM, 11AM, 1:30PM, and 2PM, generating a full attendance report with breakdowns delivered to your inbox.",
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
    desc: "Visual trend charts, department breakdowns, first-timer counts, and comparative week-on-week analytics in one live dashboard for leadership.",
    tag: "Insights",
    tagColor: "#185FA5",
    tagBg: "#E6F1FB",
  },
  {
    icon: "✏️",
    title: "Manual override",
    desc: "When a member forgets to scan, any admin can search by name and record attendance manually. Every override is logged with the admin ID and timestamp.",
    tag: "Operations",
    tagColor: "#5F5E5A",
    tagBg: "#F1EFE8",
  },
];

const FAQS: Faq[] = [
  {
    q: "Do members need to download an app?",
    a: "No. SmartChurch is a Progressive Web App, so members open a browser link on their phone and scan the entrance QR code without an App Store download.",
  },
  {
    q: "What happens if a member does not have a smartphone?",
    a: "Ushers can use a shared admin tablet to manually mark attendance by searching the member name. The manual override process takes under 10 seconds.",
  },
  {
    q: "Can we migrate our existing member register?",
    a: "Yes. We provide a CSV import template. Your existing member list is imported during onboarding, and Member IDs are assigned automatically.",
  },
  {
    q: "How does the system handle two services (1st and 2nd)?",
    a: "Multi-session support is available on the Growth and Enterprise plans. Each service generates a separate QR window, and attendance is tracked per session.",
  },
  {
    q: "Is member data stored securely in Nigeria?",
    a: "Yes. All data is stored on servers compliant with Nigeria's NDPR regulations. Member data is never shared with third parties, and backups run every 24 hours.",
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

const ROADMAP: RoadmapPhase[] = [
  {
    phase: "Phase 1",
    label: "Foundation",
    weeks: "Wks 1-3",
    items: [
      "Database schema & member registration form",
      "Admin portal & member ID generation",
      "Role-based access control",
    ],
    color: "#E1F5EE",
    dot: "#0F6E56",
  },
  {
    phase: "Phase 2",
    label: "Scanning",
    weeks: "Wks 4-5",
    items: [
      "Sunday entrance QR generation",
      "Entry scan interface (mobile PWA)",
      "Sunday-only lock + manual override",
    ],
    color: "#E6F1FB",
    dot: "#185FA5",
  },
  {
    phase: "Phase 3",
    label: "Automation",
    weeks: "Wk 6",
    items: [
      "Four scheduled Sunday cron jobs",
      "Report generation (PDF + CSV)",
      "Email / WhatsApp report delivery",
    ],
    color: "#EEEDFE",
    dot: "#533AB7",
  },
  {
    phase: "Phase 4",
    label: "Insights",
    weeks: "Wks 7-8",
    items: [
      "Attendance dashboard & trend charts",
      "Absentee flagging & pastoral alerts",
      "Department and gender breakdowns",
    ],
    color: "#FAEEDA",
    dot: "#854F0B",
  },
  {
    phase: "Phase 5",
    label: "Hardening",
    weeks: "Wks 9-10",
    items: [
      "Offline sync & retry logic",
      "Security audit + NDPR review",
      "User training & go-live",
    ],
    color: "#FAECE7",
    dot: "#993C1D",
  },
];

const heroStats = [
  {
    label: "Check-in time per member",
    before: "45-90 sec",
    after: "< 5 sec",
    icon: "⏱",
  },
  {
    label: "Sunday report ready",
    before: "Monday morning",
    after: "2:00 PM same day",
    icon: "📊",
  },
  {
    label: "Absentee follow-up",
    before: "Never tracked",
    after: "Auto-flagged weekly",
    icon: "🔔",
  },
];

const metrics = [
  { value: "< 5 sec", label: "Scan to confirmation" },
  { value: "5,000+", label: "Members supported" },
  { value: "99.5%", label: "Uptime SLA" },
  { value: "4 queries", label: "Auto-run each Sunday" },
];

const problemCards = [
  {
    icon: "📝",
    title: "Paper registers get lost",
    desc: "Illegible handwriting, torn pages, and missing sheets mean Sunday attendance data is unreliable from the moment it is captured.",
  },
  {
    icon: "👥",
    title: "No member database",
    desc: "Without a central record, it is impossible to identify who is attending regularly, who is drifting away, or how the congregation is growing.",
  },
  {
    icon: "🚶",
    title: "Queues at the entrance",
    desc: "Manual sign-in creates bottlenecks. Members arrive early, queue to sign in, and the process disrupts the flow of worship before it begins.",
  },
  {
    icon: "📭",
    title: "Absentees go unnoticed",
    desc: "Without automated tracking, members can miss months of Sundays without a single pastoral check-in. Care teams rely on memory, not data.",
  },
];

const solutionSteps = [
  {
    step: "01",
    title: "Members register once",
    desc: "A one-time digital form captures every member's details and assigns them a permanent Member ID. No repeated data entry.",
    color: "#E1F5EE",
    border: "#0F6E56",
  },
  {
    step: "02",
    title: "Scan in at the door",
    desc: "Each Sunday, a QR code is displayed at the entrance. Members scan it with their phone as they walk in, and attendance is recorded in under 5 seconds.",
    color: "#E6F1FB",
    border: "#185FA5",
  },
  {
    step: "03",
    title: "Reports arrive automatically",
    desc: "By 2PM every Sunday, a full attendance report lands in the pastor inbox with breakdowns, trends, and a flagged follow-up list.",
    color: "#EEEDFE",
    border: "#533AB7",
  },
];

const flowNodes = [
  { label: "8:00 AM", sub: "QR activates", bg: "#E1F5EE", color: "#0F6E56" },
  {
    label: "Entry scan",
    sub: "Member arrives",
    bg: "#E6F1FB",
    color: "#185FA5",
  },
  {
    label: "DB updates",
    sub: "Real-time sync",
    bg: "#EEEDFE",
    color: "#533AB7",
  },
  { label: "1:30 PM", sub: "QR closes", bg: "#FAEEDA", color: "#854F0B" },
  { label: "2:00 PM", sub: "Report sent", bg: "#FAECE7", color: "#993C1D" },
];

const churchNeeds = [
  {
    icon: "📋",
    title: "Existing member list",
    desc: "Excel or paper register. We handle the import.",
  },
  {
    icon: "📱",
    title: "An admin smartphone",
    desc: "For testing and manual override during rollout.",
  },
  {
    icon: "🖨️",
    title: "A printer or screen",
    desc: "To display the Sunday entrance QR code at the door.",
  },
];

const initialChurchIntakeForm: ChurchIntakeFormState = {
  churchName: "",
  logoUrl: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  address: "",
  city: "",
  denomination: "",
  membershipSize: membershipSizeOptions[0],
  branchCount: "1",
  serviceDays: "",
  serviceTimes: "",
  preferredFeatures: ["Attendance dashboard", "QR check-in"],
  preferredChannels: ["Email"],
  requirementsNotes: "",
};

function Section({
  id,
  children,
  style,
}: {
  id: NavId;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <section id={id} style={{ ...pageStyles.section, ...style }}>
      {children}
    </section>
  );
}

function SectionLabel({
  children,
  color = "#185FA5",
}: {
  children: ReactNode;
  color?: string;
}) {
  return <p style={{ ...pageStyles.sectionLabel, color }}>{children}</p>;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 style={pageStyles.sectionTitle}>{children}</h2>;
}

function SectionSub({ children }: { children: ReactNode }) {
  return <p style={pageStyles.sectionSub}>{children}</p>;
}

function Tag({
  children,
  color,
  bg,
}: {
  children: ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color,
        background: bg,
        padding: "4px 10px",
        borderRadius: 999,
        display: "inline-block",
      }}
    >
      {children}
    </span>
  );
}

function SmartChurchCamsBusinessPrd() {
  const [viewMode, setViewMode] = useState<ViewMode>("public");
  const [activeNav, setActiveNav] = useState<NavId>("overview");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [churchIntakeForm, setChurchIntakeForm] =
    useState<ChurchIntakeFormState>(initialChurchIntakeForm);
  const [churchIntakeState, setChurchIntakeState] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });
  const [logoUploadState, setLogoUploadState] = useState("");
  const apiBaseUrl =
    (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
    "https://smartchurch-cams.onrender.com/api";

  const resetChurchIntakeFeedback = () => {
    setChurchIntakeState({ type: "idle", message: "" });
  };

  const handleChurchLogoUpload = async (file: File) => {
    setLogoUploadState("Uploading logo...");
    resetChurchIntakeFeedback();

    try {
      const logoUrl = await uploadChurchLogo(apiBaseUrl, file);
      setChurchIntakeForm((current) => ({
        ...current,
        logoUrl,
      }));
      setLogoUploadState("Logo uploaded and ready for intake.");
    } catch (error) {
      setLogoUploadState(
        error instanceof Error ? error.message : "Logo upload failed.",
      );
    }
  };

  const scrollToSection = (id: NavId) => {
    setActiveNav(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToRegistrationForm = () => {
    const element = document.getElementById("get-started-form");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const updateChurchIntakeField = (
    field: keyof ChurchIntakeFormState,
    value: string,
  ) => {
    setChurchIntakeForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleArrayValue = (
    field: "preferredFeatures" | "preferredChannels",
    value: string,
  ) => {
    setChurchIntakeForm((current) => {
      const currentValues = current[field];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((entry) => entry !== value)
        : [...currentValues, value];

      return {
        ...current,
        [field]: nextValues,
      };
    });
  };

  const handleChurchIntakeSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setChurchIntakeState({
      type: "loading",
      message: "Submitting your church requirements...",
    });

    try {
      const response = await fetch(`${apiBaseUrl}/church-intake`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          churchName: churchIntakeForm.churchName,
          logoUrl: churchIntakeForm.logoUrl || undefined,
          contactName: churchIntakeForm.contactName,
          contactPhone: churchIntakeForm.contactPhone,
          contactEmail: churchIntakeForm.contactEmail || undefined,
          address: churchIntakeForm.address,
          city: churchIntakeForm.city,
          denomination: churchIntakeForm.denomination || undefined,
          membershipSize: churchIntakeForm.membershipSize,
          branchCount: Number(churchIntakeForm.branchCount),
          serviceDays: churchIntakeForm.serviceDays,
          serviceTimes: churchIntakeForm.serviceTimes,
          preferredFeatures: churchIntakeForm.preferredFeatures,
          preferredChannels: churchIntakeForm.preferredChannels,
          requirementsNotes: churchIntakeForm.requirementsNotes || undefined,
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
        lead?: { churchName?: string; status?: string };
      };

      if (!response.ok) {
        throw new Error(
          payload.message ?? "Church intake failed. Please try again.",
        );
      }

      setChurchIntakeForm(initialChurchIntakeForm);
      setLogoUploadState("");
      setChurchIntakeState({
        type: "success",
        message: payload.lead?.churchName
          ? `${payload.lead.churchName} has been registered. We can now tailor the software to your preferences.`
          : "Church intake complete. Your onboarding request has been captured.",
      });
    } catch (error) {
      setChurchIntakeState({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while connecting to the server.",
      });
    }
  };

  if (viewMode === "member-portal") {
    return (
      <div style={pageStyles.shell}>
        <MemberPortal
          apiBaseUrl={apiBaseUrl}
          onBack={() => setViewMode("public")}
        />
      </div>
    );
  }

  return (
    <div style={pageStyles.shell}>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #E8E8E4",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            overflowX: "auto",
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: "#185FA5",
              marginRight: 28,
              whiteSpace: "nowrap",
              padding: "16px 0",
            }}
          >
            SmartChurch
          </span>

          <button
            onClick={() => { window.location.href = '/admin' }}
            style={{
              background: "#185FA5",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              marginRight: 8,
              whiteSpace: "nowrap",
            }}
          >
            Internal Admin
          </button>

          <button
            onClick={() => setViewMode("member-portal")}
            style={{
              background: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              marginRight: 12,
              whiteSpace: "nowrap",
            }}
          >
            Member Portal
          </button>

          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              style={{
                background: "none",
                border: "none",
                padding: "16px 14px",
                fontSize: 13,
                fontWeight: activeNav === item.id ? 700 : 500,
                color: activeNav === item.id ? "#185FA5" : "#666",
                cursor: "pointer",
                whiteSpace: "nowrap",
                borderBottom:
                  activeNav === item.id
                    ? "2px solid #185FA5"
                    : "2px solid transparent",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <div style={pageStyles.pageContainer}>
        <Section id="overview" style={{ paddingTop: 96, borderBottom: "none" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 40,
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#E6F1FB",
                  borderRadius: 999,
                  padding: "6px 14px",
                  marginBottom: 24,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#185FA5",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#185FA5",
                    letterSpacing: "0.06em",
                  }}
                >
                  PRODUCT REQUIREMENTS DOCUMENT - v1.1
                </span>
              </div>

              <h1
                style={{
                  fontSize: "clamp(2.6rem, 6vw, 4.3rem)",
                  fontWeight: 900,
                  lineHeight: 1.05,
                  color: "#0a0a0a",
                  margin: "0 0 20px",
                }}
              >
                Know your congregation.
                <br />
                <span style={{ color: "#185FA5" }}>Every Sunday.</span>
              </h1>

              <p
                style={{
                  fontSize: 17,
                  color: "#444",
                  lineHeight: 1.7,
                  margin: "0 0 32px",
                  maxWidth: 620,
                }}
              >
                SmartChurch is a QR-based attendance platform purpose-built for
                churches, replacing paper registers with real-time digital
                check-ins, automated reports, and pastoral care alerts.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={() => scrollToSection("onboarding")}
                  style={{
                    background: "#185FA5",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "12px 24px",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  See onboarding plan
                </button>
                <button
                  onClick={() => scrollToSection("pricing")}
                  style={{
                    background: "#fff",
                    color: "#185FA5",
                    border: "1.5px solid #185FA5",
                    borderRadius: 10,
                    padding: "12px 24px",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  View pricing
                </button>
              </div>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #E6F1FB 0%, #EEEDFE 100%)",
                borderRadius: 24,
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    padding: "16px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    boxShadow: "0 10px 30px rgba(24, 95, 165, 0.06)",
                  }}
                >
                  <span style={{ fontSize: 22 }}>{stat.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#888",
                        margin: "0 0 4px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {stat.label}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          color: "#aaa",
                          textDecoration: "line-through",
                        }}
                      >
                        {stat.before}
                      </span>
                      <span style={{ fontSize: 13, color: "#888" }}>&gt;</span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: "#185FA5",
                        }}
                      >
                        {stat.after}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 1,
            background: "#E8E8E4",
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 72,
          }}
        >
          {metrics.map((metric) => (
            <div
              key={metric.label}
              style={{
                background: "#fff",
                padding: "20px 24px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: "#185FA5",
                  margin: "0 0 4px",
                }}
              >
                {metric.value}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "#888",
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                {metric.label}
              </p>
            </div>
          ))}
        </div>

        <Section id="problem">
          <SectionLabel>The Problem</SectionLabel>
          <SectionTitle>Why churches lose track of their people</SectionTitle>
          <SectionSub>
            Manual registers fail silently. By the time leadership realises
            someone has not been seen in months, the window for pastoral care
            has often closed.
          </SectionSub>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {problemCards.map((card) => (
              <div
                key={card.title}
                style={{
                  background: "#FAFAF8",
                  border: "1px solid #E8E8E4",
                  borderRadius: 16,
                  padding: "24px",
                }}
              >
                <span
                  style={{ fontSize: 28, display: "block", marginBottom: 12 }}
                >
                  {card.icon}
                </span>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#1a1a1a",
                    margin: "0 0 8px",
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "#666",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="solution">
          <SectionLabel color="#0F6E56">The Solution</SectionLabel>
          <SectionTitle>How SmartChurch works</SectionTitle>
          <SectionSub>Three steps. Every Sunday. Fully automated.</SectionSub>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 24,
              marginBottom: 40,
            }}
          >
            {solutionSteps.map((step) => (
              <div
                key={step.step}
                style={{
                  borderRadius: 16,
                  padding: 28,
                  background: step.color,
                  borderLeft: `4px solid ${step.border}`,
                }}
              >
                <p
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: step.border,
                    margin: "0 0 12px",
                    opacity: 0.45,
                  }}
                >
                  {step.step}
                </p>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#1a1a1a",
                    margin: "0 0 10px",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "#555",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "#FAFAF8",
              border: "1px solid #E8E8E4",
              borderRadius: 18,
              padding: 32,
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#888",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                margin: "0 0 24px",
              }}
            >
              Sunday attendance flow
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 0,
                overflowX: "auto",
                paddingBottom: 4,
              }}
            >
              {flowNodes.map((node, index) => (
                <div
                  key={node.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flex: "none",
                  }}
                >
                  <div
                    style={{
                      background: node.bg,
                      borderRadius: 10,
                      padding: "12px 18px",
                      textAlign: "center",
                      minWidth: 110,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: node.color,
                        margin: "0 0 2px",
                      }}
                    >
                      {node.label}
                    </p>
                    <p style={{ fontSize: 11, color: "#777", margin: 0 }}>
                      {node.sub}
                    </p>
                  </div>

                  {index < flowNodes.length - 1 ? (
                    <div
                      style={{
                        width: 32,
                        height: 1,
                        background: "#D0D0C8",
                        position: "relative",
                        flex: "none",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          right: -3,
                          top: -5,
                          color: "#999",
                          fontSize: 12,
                        }}
                      >
                        ›
                      </span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section id="features">
          <SectionLabel>Features</SectionLabel>
          <SectionTitle>Everything your church needs</SectionTitle>
          <SectionSub>
            Built specifically for Nigerian churches and designed to work with
            the tools your congregation already has.
          </SectionSub>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                style={{ ...pageStyles.card, padding: "22px 24px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 12,
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 24 }}>{feature.icon}</span>
                  <Tag color={feature.tagColor} bg={feature.tagBg}>
                    {feature.tag}
                  </Tag>
                </div>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#1a1a1a",
                    margin: "0 0 8px",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "#666",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="onboarding">
          <SectionLabel color="#533AB7">Onboarding</SectionLabel>
          <SectionTitle>
            From paper register to live system in 4 weeks
          </SectionTitle>
          <SectionSub>
            We guide your church through every step. No technical knowledge is
            required from your team.
          </SectionSub>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
              marginBottom: 40,
            }}
          >
            {ONBOARDING_STEPS.map((step) => (
              <div
                key={step.week}
                style={{
                  background: step.color,
                  borderRadius: 16,
                  padding: 28,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: step.border,
                    }}
                  >
                    {step.week}
                  </span>
                  <span style={{ fontSize: 24 }}>{step.icon}</span>
                </div>

                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#1a1a1a",
                    margin: "0 0 16px",
                  }}
                >
                  {step.title}
                </h3>

                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {step.tasks.map((task) => (
                    <li
                      key={task}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          background: step.border,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flex: "none",
                          marginTop: 1,
                        }}
                      >
                        <svg
                          width="8"
                          height="8"
                          viewBox="0 0 8 8"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M1.5 4L3 5.5L6.5 2.5"
                            stroke="white"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span
                        style={{ fontSize: 13, color: "#444", lineHeight: 1.5 }}
                      >
                        {task}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "#FAFAF8",
              border: "1px solid #E8E8E4",
              borderRadius: 16,
              padding: 28,
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 16px" }}>
              What your church provides
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              {churchNeeds.map((item) => (
                <div
                  key={item.title}
                  style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                >
                  <span style={{ fontSize: 20, flex: "none" }}>
                    {item.icon}
                  </span>
                  <div>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        margin: "0 0 4px",
                      }}
                    >
                      {item.title}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#777",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section id="pricing">
          <SectionLabel color="#0F6E56">Pricing</SectionLabel>
          <SectionTitle>Simple, church-sized pricing</SectionTitle>
          <SectionSub>
            No contracts. No per-member fees. Cancel anytime.
          </SectionSub>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
              gap: 20,
            }}
          >
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                style={{
                  border: tier.highlight
                    ? `2px solid ${tier.color}`
                    : "1px solid #E8E8E4",
                  borderRadius: 18,
                  padding: 28,
                  position: "relative",
                  background: "#fff",
                  boxShadow: tier.highlight
                    ? "0 18px 40px rgba(24, 95, 165, 0.08)"
                    : "none",
                }}
              >
                {tier.highlight ? (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: tier.color,
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "4px 14px",
                      borderRadius: 999,
                    }}
                  >
                    Most Popular
                  </div>
                ) : null}

                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: tier.color,
                    margin: "0 0 4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {tier.name}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 4,
                    marginBottom: 4,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{ fontSize: 32, fontWeight: 900, color: "#1a1a1a" }}
                  >
                    {tier.price}
                  </span>
                  <span style={{ fontSize: 14, color: "#888" }}>
                    {tier.sub}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 12,
                    color: tier.color,
                    fontWeight: 700,
                    background: tier.bg,
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: 999,
                    margin: "0 0 8px",
                  }}
                >
                  {tier.members}
                </p>

                <p
                  style={{
                    fontSize: 13,
                    color: "#666",
                    margin: "8px 0 20px",
                    lineHeight: 1.5,
                  }}
                >
                  {tier.desc}
                </p>

                <div
                  style={{
                    borderTop: "1px solid #F0F0EC",
                    paddingTop: 20,
                    marginBottom: 24,
                  }}
                >
                  {tier.features.map((feature) => (
                    <div
                      key={feature}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 10,
                      }}
                    >
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          background: tier.bg,
                          border: `1px solid ${tier.color}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flex: "none",
                        }}
                      >
                        <svg
                          width="8"
                          height="8"
                          viewBox="0 0 8 8"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M1.5 4L3 5.5L6.5 2.5"
                            stroke={tier.color}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span style={{ fontSize: 13, color: "#444" }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  style={{
                    width: "100%",
                    background: tier.highlight ? tier.color : "#fff",
                    color: tier.highlight ? "#fff" : tier.color,
                    border: `1.5px solid ${tier.color}`,
                    borderRadius: 10,
                    padding: "11px 0",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>

          <p
            style={{
              fontSize: 13,
              color: "#999",
              textAlign: "center",
              marginTop: 24,
            }}
          >
            All prices in Nigerian Naira (₦). Annual billing available at 20%
            discount.
          </p>
        </Section>

        <Section id="roadmap">
          <SectionLabel>Delivery Roadmap</SectionLabel>
          <SectionTitle>10-week build plan</SectionTitle>
          <SectionSub>
            From signed agreement to live Sunday system in 10 weeks. Each phase
            is delivered and tested before the next begins.
          </SectionSub>

          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: 20,
                top: 24,
                bottom: 24,
                width: 2,
                background: "#E8E8E4",
              }}
            />

            {ROADMAP.map((phase, index) => (
              <div
                key={phase.phase}
                style={{
                  display: "flex",
                  gap: 24,
                  marginBottom: 28,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: phase.color,
                    border: `2px solid ${phase.dot}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "none",
                    zIndex: 1,
                  }}
                >
                  <span
                    style={{ fontSize: 12, fontWeight: 900, color: phase.dot }}
                  >
                    {index + 1}
                  </span>
                </div>

                <div
                  style={{
                    flex: 1,
                    background: "#FAFAF8",
                    border: "1px solid #E8E8E4",
                    borderRadius: 16,
                    padding: "18px 22px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: phase.dot,
                      }}
                    >
                      {phase.phase}
                    </span>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "#1a1a1a",
                      }}
                    >
                      {phase.label}
                    </span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 12,
                        color: "#888",
                        background: "#F0F0EC",
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontWeight: 600,
                      }}
                    >
                      {phase.weeks}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {phase.items.map((item) => (
                      <span
                        key={item}
                        style={{
                          fontSize: 12,
                          color: "#555",
                          background: phase.color,
                          padding: "4px 12px",
                          borderRadius: 999,
                          display: "inline-block",
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="faq">
          <SectionLabel>Frequently Asked Questions</SectionLabel>
          <SectionTitle>Common questions from church leaders</SectionTitle>

          <div style={{ maxWidth: 780 }}>
            {FAQS.map((faq, index) => (
              <div key={faq.q} style={{ borderBottom: "1px solid #E8E8E4" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: "20px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    textAlign: "left",
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#1a1a1a",
                      lineHeight: 1.4,
                    }}
                  >
                    {faq.q}
                  </span>
                  <span
                    style={{
                      fontSize: 18,
                      color: "#888",
                      flex: "none",
                      transform: openFaq === index ? "rotate(45deg)" : "none",
                      transition: "transform 0.2s",
                    }}
                  >
                    +
                  </span>
                </button>

                {openFaq === index ? (
                  <div style={{ paddingBottom: 20 }}>
                    <p
                      style={{
                        fontSize: 14,
                        color: "#555",
                        lineHeight: 1.7,
                        margin: 0,
                      }}
                    >
                      {faq.a}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Section>

        <section style={{ padding: "64px 0 80px", textAlign: "center" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #E6F1FB 0%, #EEEDFE 100%)",
              borderRadius: 24,
              padding: "56px 32px",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 900,
                color: "#0a0a0a",
                margin: "0 0 16px",
              }}
            >
              Ready to onboard your church?
            </h2>

            <p
              style={{
                fontSize: 16,
                color: "#555",
                margin: "0 auto 32px",
                maxWidth: 520,
                lineHeight: 1.7,
              }}
            >
              Register your church, tell us the features you need, and we will
              tailor the software around your ministry workflow.
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={scrollToRegistrationForm}
                style={{
                  background: "#185FA5",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "14px 28px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Register your church
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                style={{
                  background: "#fff",
                  color: "#185FA5",
                  border: "1.5px solid #185FA5",
                  borderRadius: 10,
                  padding: "14px 28px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Book a demo
              </button>
            </div>

            <p style={{ fontSize: 12, color: "#888", margin: "20px 0 0" }}>
              SmartChurch church onboarding intake · NDPR aware · Built for
              Nigerian churches by DPRINCEDEVELOPER
            </p>

            <div
              id="get-started-form"
              style={{
                marginTop: 32,
                background: "#fff",
                borderRadius: 20,
                padding: "28px 24px",
                textAlign: "left",
                maxWidth: 860,
                marginLeft: "auto",
                marginRight: "auto",
                boxShadow: "0 16px 40px rgba(24, 95, 165, 0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  marginBottom: 20,
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "#185FA5",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      margin: "0 0 8px",
                    }}
                  >
                    Church Intake
                  </p>
                  <h3
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      margin: "0 0 8px",
                      color: "#111",
                    }}
                  >
                    Register your church and project needs
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#666",
                      lineHeight: 1.6,
                      margin: 0,
                      maxWidth: 560,
                    }}
                  >
                    This form captures your church profile, operating context,
                    and required features so the product can be configured to
                    your preference before rollout.
                  </p>
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#888",
                    background: "#F6F8FC",
                    borderRadius: 999,
                    padding: "8px 12px",
                    fontWeight: 700,
                  }}
                >
                  POST {apiBaseUrl}/church-intake
                </div>
              </div>

              <form onSubmit={handleChurchIntakeSubmit}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  {[
                    {
                      label: "Church Name",
                      field: "churchName" as const,
                      placeholder: "Living Faith Assembly",
                      type: "text",
                    },
                    {
                      label: "Contact Person",
                      field: "contactName" as const,
                      placeholder: "Pastor Segun Awolumate",
                      type: "text",
                    },
                    {
                      label: "Contact Phone",
                      field: "contactPhone" as const,
                      placeholder: "08012345678",
                      type: "tel",
                    },
                    {
                      label: "Contact Email",
                      field: "contactEmail" as const,
                      placeholder: "admin@church.org",
                      type: "email",
                    },
                    {
                      label: "Denomination",
                      field: "denomination" as const,
                      placeholder: "Pentecostal",
                      type: "text",
                    },
                    {
                      label: "Address",
                      field: "address" as const,
                      placeholder: "12 Church Avenue, Ikeja",
                      type: "text",
                    },
                    {
                      label: "City",
                      field: "city" as const,
                      placeholder: "Lagos",
                      type: "text",
                    },
                    {
                      label: "Service Days",
                      field: "serviceDays" as const,
                      placeholder: "Sunday, Wednesday",
                      type: "text",
                    },
                    {
                      label: "Service Times",
                      field: "serviceTimes" as const,
                      placeholder: "7:30 AM, 9:30 AM, 5:00 PM",
                      type: "text",
                    },
                  ].map((input) => (
                    <label
                      key={input.field}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#333",
                      }}
                    >
                      {input.label}
                      <input
                        type={input.type}
                        value={churchIntakeForm[input.field]}
                        onChange={(event) =>
                          updateChurchIntakeField(
                            input.field,
                            event.target.value,
                          )
                        }
                        placeholder={input.placeholder}
                        required={
                          input.field !== "contactEmail" &&
                          input.field !== "denomination"
                        }
                        style={{
                          border: "1px solid #D8DFEA",
                          borderRadius: 12,
                          padding: "12px 14px",
                          background: "#fff",
                          color: "#111",
                        }}
                      />
                    </label>
                  ))}

                  <label
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#333",
                    }}
                  >
                    Church Logo
                    <div
                      style={{
                        border: "1px solid #D8DFEA",
                        borderRadius: 16,
                        padding: 14,
                        display: "flex",
                        gap: 14,
                        alignItems: "center",
                        flexWrap: "wrap",
                        background: "#FCFCFD",
                      }}
                    >
                      <img
                        src={
                          churchIntakeForm.logoUrl ||
                          "https://placehold.co/96x96/png?text=Logo"
                        }
                        alt={
                          churchIntakeForm.churchName || "Church logo preview"
                        }
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: 16,
                          objectFit: "cover",
                          border: "1px solid #E4E7EC",
                          background: "#fff",
                        }}
                      />
                      <div style={{ display: "grid", gap: 8 }}>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              void handleChurchLogoUpload(file);
                            }
                          }}
                        />
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            color: logoUploadState ? "#185FA5" : "#667085",
                            fontWeight: logoUploadState ? 700 : 500,
                          }}
                        >
                          {logoUploadState ||
                            "Optional. Upload your church logo now so the onboarding team can brand your workspace from day one."}
                        </p>
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#333",
                    }}
                  >
                    Estimated Membership Size
                    <select
                      value={churchIntakeForm.membershipSize}
                      onChange={(event) =>
                        updateChurchIntakeField(
                          "membershipSize",
                          event.target.value,
                        )
                      }
                      style={{
                        border: "1px solid #D8DFEA",
                        borderRadius: 12,
                        padding: "12px 14px",
                        background: "#fff",
                        color: "#111",
                      }}
                    >
                      {membershipSizeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#333",
                    }}
                  >
                    Number of Branches
                    <input
                      type="number"
                      min="1"
                      value={churchIntakeForm.branchCount}
                      onChange={(event) =>
                        updateChurchIntakeField(
                          "branchCount",
                          event.target.value,
                        )
                      }
                      required
                      style={{
                        border: "1px solid #D8DFEA",
                        borderRadius: 12,
                        padding: "12px 14px",
                        background: "#fff",
                        color: "#111",
                      }}
                    />
                  </label>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      border: "1px solid #D8DFEA",
                      borderRadius: 16,
                      padding: 16,
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 12px",
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#333",
                      }}
                    >
                      Features Needed
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      {churchFeatureOptions.map((option) => {
                        const active =
                          churchIntakeForm.preferredFeatures.includes(option);

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              toggleArrayValue("preferredFeatures", option)
                            }
                            style={{
                              border: active
                                ? "1px solid #185FA5"
                                : "1px solid #D8DFEA",
                              background: active ? "#EAF3FF" : "#fff",
                              color: active ? "#185FA5" : "#444",
                              borderRadius: 999,
                              padding: "10px 14px",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div
                    style={{
                      border: "1px solid #D8DFEA",
                      borderRadius: 16,
                      padding: 16,
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 12px",
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#333",
                      }}
                    >
                      Preferred Communication
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      {communicationChannelOptions.map((option) => {
                        const active =
                          churchIntakeForm.preferredChannels.includes(option);

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              toggleArrayValue("preferredChannels", option)
                            }
                            style={{
                              border: active
                                ? "1px solid #185FA5"
                                : "1px solid #D8DFEA",
                              background: active ? "#EAF3FF" : "#fff",
                              color: active ? "#185FA5" : "#444",
                              borderRadius: 999,
                              padding: "10px 14px",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#333",
                    marginBottom: 20,
                  }}
                >
                  Requirements Notes
                  <textarea
                    value={churchIntakeForm.requirementsNotes}
                    onChange={(event) =>
                      updateChurchIntakeField(
                        "requirementsNotes",
                        event.target.value,
                      )
                    }
                    rows={5}
                    placeholder="Tell us about your workflow, branding, service structure, reporting needs, or any special customization."
                    style={{
                      border: "1px solid #D8DFEA",
                      borderRadius: 12,
                      padding: "12px 14px",
                      background: "#fff",
                      color: "#111",
                      resize: "vertical",
                    }}
                  />
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="submit"
                    disabled={churchIntakeState.type === "loading"}
                    style={{
                      background: "#185FA5",
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      padding: "14px 24px",
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: "pointer",
                      opacity: churchIntakeState.type === "loading" ? 0.7 : 1,
                    }}
                  >
                    {churchIntakeState.type === "loading"
                      ? "Submitting..."
                      : "Register church"}
                  </button>

                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color:
                        churchIntakeState.type === "error"
                          ? "#B42318"
                          : churchIntakeState.type === "success"
                            ? "#067647"
                            : "#667085",
                      fontWeight: churchIntakeState.type === "idle" ? 500 : 700,
                    }}
                  >
                    {churchIntakeState.message ||
                      "Use this form to register your church and tell us how you want the software customized."}
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SmartChurchCamsBusinessPrd;
