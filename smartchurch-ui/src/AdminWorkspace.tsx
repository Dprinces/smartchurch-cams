import { useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import {
  churchFeatureOptions,
  communicationChannelOptions,
  membershipSizeOptions,
} from "./church-options";
import { uploadChurchLogo } from "./logo-upload";

type LeadStatus = "NEW" | "REVIEWING" | "QUALIFIED" | "CONVERTED" | "ARCHIVED";
type ChurchStatus = "DISCOVERY" | "CONFIGURING" | "SAMPLE_READY" | "LIVE";

type ChurchLead = {
  id: string;
  churchName: string;
  logoUrl?: string | null;
  contactName: string;
  contactEmail?: string | null;
  contactPhone: string;
  address: string;
  city: string;
  denomination?: string | null;
  membershipSize: string;
  branchCount: number;
  serviceDays: string;
  serviceTimes: string;
  preferredFeaturesJson: string[];
  preferredChannelsJson: string[];
  requirementsNotes?: string | null;
  status: LeadStatus;
  createdAt: string;
};

type ChurchSampleWorkspace = {
  id: string;
  projectName: string;
  subdomain: string;
  adminEmail?: string | null;
  modulesJson: string[];
  onboardingChecklistJson: string[];
};

type Church = {
  id: string;
  leadId: string;
  churchName: string;
  logoUrl?: string | null;
  slug: string;
  primaryContactName: string;
  primaryContactEmail?: string | null;
  primaryContactPhone: string;
  address: string;
  city: string;
  denomination?: string | null;
  membershipSize: string;
  branchCount: number;
  serviceDays: string;
  serviceTimes: string;
  selectedFeaturesJson: string[];
  communicationJson: string[];
  requirementsNotes?: string | null;
  status: ChurchStatus;
  sampleWorkspace?: ChurchSampleWorkspace | null;
};

type ChurchModulesResponse = {
  unlocked: boolean;
  status: ChurchStatus;
  modules: string[];
  message: string;
};

type ConfigurationForm = {
  churchName: string;
  logoUrl: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  address: string;
  city: string;
  denomination: string;
  membershipSize: string;
  branchCount: string;
  serviceDays: string;
  serviceTimes: string;
  selectedFeatures: string[];
  communicationChannels: string[];
  requirementsNotes: string;
  status: ChurchStatus;
  workspaceModules: string[];
  onboardingChecklist: string[];
};

function buildInitialConfigForm(church?: Church): ConfigurationForm {
  return {
    churchName: church?.churchName ?? "",
    logoUrl: church?.logoUrl ?? "",
    primaryContactName: church?.primaryContactName ?? "",
    primaryContactEmail: church?.primaryContactEmail ?? "",
    primaryContactPhone: church?.primaryContactPhone ?? "",
    address: church?.address ?? "",
    city: church?.city ?? "",
    denomination: church?.denomination ?? "",
    membershipSize: church?.membershipSize ?? membershipSizeOptions[0],
    branchCount: String(church?.branchCount ?? 1),
    serviceDays: church?.serviceDays ?? "",
    serviceTimes: church?.serviceTimes ?? "",
    selectedFeatures: church?.selectedFeaturesJson.length
      ? church.selectedFeaturesJson
      : ["Attendance dashboard", "QR check-in"],
    communicationChannels: church?.communicationJson.length
      ? church.communicationJson
      : ["Email"],
    requirementsNotes: church?.requirementsNotes ?? "",
    status: church?.status ?? "DISCOVERY",
    workspaceModules: church?.sampleWorkspace?.modulesJson.length
      ? church.sampleWorkspace.modulesJson
      : ["Church profile", "Branch setup", "Attendance dashboard"],
    onboardingChecklist: church?.sampleWorkspace?.onboardingChecklistJson.length
      ? church.sampleWorkspace.onboardingChecklistJson
      : [
          "Confirm branding assets",
          "Review service structure",
          "Approve member onboarding workflow",
        ],
  };
}

function statusStyles(status: LeadStatus | ChurchStatus): CSSProperties {
  const variants: Record<string, CSSProperties> = {
    NEW: { background: "#E6F1FB", color: "#185FA5" },
    REVIEWING: { background: "#FAEEDA", color: "#854F0B" },
    QUALIFIED: { background: "#E1F5EE", color: "#0F6E56" },
    CONVERTED: { background: "#EEEDFE", color: "#533AB7" },
    ARCHIVED: { background: "#F2F4F7", color: "#475467" },
    DISCOVERY: { background: "#F2F4F7", color: "#475467" },
    CONFIGURING: { background: "#E6F1FB", color: "#185FA5" },
    SAMPLE_READY: { background: "#E1F5EE", color: "#0F6E56" },
    LIVE: { background: "#EEEDFE", color: "#533AB7" },
  };

  return {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    ...(variants[status] ?? variants.NEW),
  };
}

async function readJson<T>(response: Response) {
  return (await response.json()) as T;
}

export function AdminWorkspace({
  apiBaseUrl,
  onBack,
}: {
  apiBaseUrl: string;
  onBack: () => void;
}) {
  const [email, setEmail] = useState("admin@smartchurch.local");
  const [password, setPassword] = useState("SmartChurch123!");
  const [token, setToken] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<ChurchLead[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurchId, setSelectedChurchId] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [configForm, setConfigForm] = useState<ConfigurationForm>(
    buildInitialConfigForm(),
  );
  const [modulesState, setModulesState] =
    useState<ChurchModulesResponse | null>(null);
  const [logoUploadState, setLogoUploadState] = useState("");

  const selectedChurch = useMemo(
    () => churches.find((church) => church.id === selectedChurchId),
    [churches, selectedChurchId],
  );

  async function authorizedFetch<T>(
    path: string,
    init?: RequestInit,
    authToken = token,
  ) {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        ...(init?.headers ?? {}),
      },
    });
    const payload = await readJson<T & { message?: string }>(response);

    if (!response.ok) {
      throw new Error(payload.message ?? "Request failed.");
    }

    return payload as T;
  }

  async function loadDashboard(authToken = token) {
    setLoading(true);
    setAuthError("");

    try {
      const [leadPayload, churchPayload] = await Promise.all([
        authorizedFetch<{ leads: ChurchLead[] }>(
          "/church-intake",
          undefined,
          authToken,
        ),
        authorizedFetch<{ churches: Church[] }>(
          "/churches",
          undefined,
          authToken,
        ),
      ]);

      setLeads(leadPayload.leads);
      setChurches(churchPayload.churches);
      const nextSelectedChurch =
        churchPayload.churches.find(
          (church) => church.id === selectedChurchId,
        ) ?? churchPayload.churches[0];

      if (nextSelectedChurch) {
        setSelectedChurchId(nextSelectedChurch.id);
        setConfigForm(buildInitialConfigForm(nextSelectedChurch));
        void loadChurchModules(nextSelectedChurch.id);
      } else {
        setSelectedChurchId("");
        setConfigForm(buildInitialConfigForm());
        setModulesState(null);
      }
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Failed to load the admin dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }

  function selectChurch(church: Church) {
    setSelectedChurchId(church.id);
    setConfigForm(buildInitialConfigForm(church));
    setModulesState(null);
    void loadChurchModules(church.id);
  }

  async function loadChurchModules(churchId: string) {
    try {
      const payload = await authorizedFetch<ChurchModulesResponse>(
        `/churches/${churchId}/modules`,
      );
      setModulesState(payload);
    } catch (error) {
      setModulesState({
        unlocked: false,
        status: "DISCOVERY",
        modules: [],
        message:
          error instanceof Error
            ? error.message
            : "Failed to load module state.",
      });
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setAuthError("");

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const payload = await readJson<{
        token?: string;
        message?: string;
      }>(response);

      if (!response.ok || !payload.token) {
        throw new Error(payload.message ?? "Login failed.");
      }

      setToken(payload.token);
      await loadDashboard(payload.token);
      setActionMessage("Admin session started.");
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Unable to sign in.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateLeadStatus(leadId: string, status: LeadStatus) {
    try {
      await authorizedFetch<{ lead: ChurchLead }>(
        `/church-intake/${leadId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      );
      setActionMessage(`Lead status updated to ${status.toLowerCase()}.`);
      await loadDashboard();
    } catch (error) {
      setActionMessage(
        error instanceof Error
          ? error.message
          : "Failed to update lead status.",
      );
    }
  }

  async function convertLead(leadId: string) {
    try {
      const payload = await authorizedFetch<{
        church: Church;
        message: string;
      }>(`/church-intake/${leadId}/convert`, {
        method: "POST",
      });
      setActionMessage(payload.message);
      await loadDashboard();
      setSelectedChurchId(payload.church.id);
    } catch (error) {
      setActionMessage(
        error instanceof Error ? error.message : "Failed to convert lead.",
      );
    }
  }

  async function handleConfigLogoUpload(file: File) {
    setLogoUploadState("Uploading logo...");

    try {
      const logoUrl = await uploadChurchLogo(apiBaseUrl, file);
      setConfigForm((current) => ({
        ...current,
        logoUrl,
      }));
      setLogoUploadState("Logo uploaded.");
    } catch (error) {
      setLogoUploadState(
        error instanceof Error ? error.message : "Logo upload failed.",
      );
    }
  }

  function toggleConfigValue(
    field: "selectedFeatures" | "communicationChannels" | "workspaceModules",
    value: string,
  ) {
    setConfigForm((current) => {
      const nextValues = current[field].includes(value)
        ? current[field].filter((entry) => entry !== value)
        : [...current[field], value];

      return {
        ...current,
        [field]: nextValues,
      };
    });
  }

  async function handleSaveConfiguration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedChurch) {
      return;
    }

    try {
      const payload = await authorizedFetch<{
        church: Church;
        message: string;
      }>(`/churches/${selectedChurch.id}/configuration`, {
        method: "PATCH",
        body: JSON.stringify({
          churchName: configForm.churchName,
          logoUrl: configForm.logoUrl || undefined,
          primaryContactName: configForm.primaryContactName,
          primaryContactEmail: configForm.primaryContactEmail || undefined,
          primaryContactPhone: configForm.primaryContactPhone,
          address: configForm.address,
          city: configForm.city,
          denomination: configForm.denomination || undefined,
          membershipSize: configForm.membershipSize,
          branchCount: Number(configForm.branchCount),
          serviceDays: configForm.serviceDays,
          serviceTimes: configForm.serviceTimes,
          selectedFeatures: configForm.selectedFeatures,
          communicationChannels: configForm.communicationChannels,
          requirementsNotes: configForm.requirementsNotes || undefined,
          status: configForm.status,
          workspaceModules: configForm.workspaceModules,
          onboardingChecklist: configForm.onboardingChecklist,
        }),
      });

      setActionMessage(payload.message);
      await loadDashboard();
      await loadChurchModules(selectedChurch.id);
    } catch (error) {
      setActionMessage(
        error instanceof Error
          ? error.message
          : "Failed to save church configuration.",
      );
    }
  }

  if (!token) {
    return (
      <div style={{ maxWidth: 560, margin: "48px auto", padding: "0 24px" }}>
        <div
          style={{
            border: "1px solid #E8E8E4",
            borderRadius: 20,
            background: "#fff",
            padding: 28,
            boxShadow: "0 16px 40px rgba(24, 95, 165, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#185FA5",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: "0 0 8px",
                }}
              >
                Internal Admin
              </p>
              <h2 style={{ fontSize: 28, margin: 0, color: "#111" }}>
                Church Leads Dashboard
              </h2>
            </div>
            <button
              onClick={onBack}
              style={{
                border: "1px solid #D0D5DD",
                background: "#fff",
                borderRadius: 10,
                padding: "10px 14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Back to Site
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <div
              style={{
                display: "grid",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <label style={{ display: "grid", gap: 8, fontWeight: 700 }}>
                Email
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  required
                  style={{
                    border: "1px solid #D0D5DD",
                    borderRadius: 12,
                    padding: "12px 14px",
                  }}
                />
              </label>
              <label style={{ display: "grid", gap: 8, fontWeight: 700 }}>
                Password
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  required
                  style={{
                    border: "1px solid #D0D5DD",
                    borderRadius: 12,
                    padding: "12px 14px",
                  }}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: "#185FA5",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "14px 20px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {loading ? "Signing in..." : "Open admin workspace"}
            </button>
          </form>

          <p
            style={{ marginTop: 16, color: authError ? "#B42318" : "#667085" }}
          >
            {authError ||
              "Use the seeded admin account first, then review church leads and configure sample projects."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 28,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "#185FA5",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 8px",
            }}
          >
            Internal Admin
          </p>
          <h1 style={{ fontSize: 34, margin: "0 0 10px", color: "#111" }}>
            Church Leads And Project Configuration
          </h1>
          <p
            style={{
              margin: 0,
              color: "#667085",
              maxWidth: 760,
              lineHeight: 1.6,
            }}
          >
            Review submitted churches, update onboarding status, convert
            approved leads into real church workspaces, upload logos, and unlock
            modules only after onboarding is complete.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => void loadDashboard()}
            style={{
              border: "1px solid #D0D5DD",
              background: "#fff",
              borderRadius: 10,
              padding: "10px 14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
          <button
            onClick={() => {
              setToken("");
              setLeads([]);
              setChurches([]);
              setSelectedChurchId("");
              setConfigForm(buildInitialConfigForm());
              setModulesState(null);
            }}
            style={{
              border: "1px solid #D0D5DD",
              background: "#fff",
              borderRadius: 10,
              padding: "10px 14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
          <button
            onClick={onBack}
            style={{
              border: "none",
              background: "#185FA5",
              color: "#fff",
              borderRadius: 10,
              padding: "10px 14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Back to public site
          </button>
        </div>
      </div>

      <p style={{ margin: "0 0 24px", color: "#185FA5", fontWeight: 700 }}>
        {actionMessage || "Admin workspace ready."}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 420px) minmax(0, 1fr)",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: 20 }}>
          <section
            style={{
              border: "1px solid #E8E8E4",
              borderRadius: 20,
              background: "#fff",
              padding: 20,
            }}
          >
            <h2 style={{ margin: "0 0 16px", fontSize: 22 }}>
              Submitted Leads
            </h2>
            <div style={{ display: "grid", gap: 14 }}>
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  style={{
                    border: "1px solid #E8E8E4",
                    borderRadius: 16,
                    padding: 16,
                    background: "#FCFCFD",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <img
                      src={
                        lead.logoUrl || "https://placehold.co/64x64/png?text=SC"
                      }
                      alt={lead.churchName}
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 12,
                        objectFit: "cover",
                        border: "1px solid #E4E7EC",
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontSize: 16,
                          fontWeight: 800,
                          color: "#111",
                        }}
                      >
                        {lead.churchName}
                      </p>
                      <p style={{ margin: 0, color: "#667085", fontSize: 13 }}>
                        {lead.contactName} · {lead.city}
                      </p>
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <span style={statusStyles(lead.status)}>{lead.status}</span>
                  </div>

                  <p
                    style={{
                      margin: "0 0 12px",
                      fontSize: 13,
                      color: "#475467",
                    }}
                  >
                    {lead.membershipSize} members · {lead.branchCount}{" "}
                    branch(es)
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <select
                      value={lead.status}
                      onChange={(event) =>
                        void updateLeadStatus(
                          lead.id,
                          event.target.value as LeadStatus,
                        )
                      }
                      style={{
                        border: "1px solid #D0D5DD",
                        borderRadius: 10,
                        padding: "10px 12px",
                      }}
                    >
                      {[
                        "NEW",
                        "REVIEWING",
                        "QUALIFIED",
                        "CONVERTED",
                        "ARCHIVED",
                      ].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => void convertLead(lead.id)}
                      disabled={lead.status === "CONVERTED"}
                      style={{
                        border: "none",
                        background:
                          lead.status === "CONVERTED" ? "#D0D5DD" : "#185FA5",
                        color: "#fff",
                        borderRadius: 10,
                        padding: "12px 14px",
                        fontWeight: 800,
                        cursor:
                          lead.status === "CONVERTED"
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {lead.status === "CONVERTED"
                        ? "Already converted"
                        : "Convert to church workspace"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            style={{
              border: "1px solid #E8E8E4",
              borderRadius: 20,
              background: "#fff",
              padding: 20,
            }}
          >
            <h2 style={{ margin: "0 0 16px", fontSize: 22 }}>
              Onboarded Churches
            </h2>
            <div style={{ display: "grid", gap: 10 }}>
              {churches.map((church) => (
                <button
                  key={church.id}
                  onClick={() => selectChurch(church)}
                  style={{
                    textAlign: "left",
                    border:
                      selectedChurchId === church.id
                        ? "2px solid #185FA5"
                        : "1px solid #E8E8E4",
                    background: "#fff",
                    borderRadius: 14,
                    padding: 14,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: "0 0 6px",
                          fontWeight: 800,
                          color: "#111",
                        }}
                      >
                        {church.churchName}
                      </p>
                      <p style={{ margin: 0, color: "#667085", fontSize: 13 }}>
                        {church.slug}
                      </p>
                    </div>
                    <span style={statusStyles(church.status)}>
                      {church.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          <section
            style={{
              border: "1px solid #E8E8E4",
              borderRadius: 20,
              background: "#fff",
              padding: 24,
            }}
          >
            <h2 style={{ margin: "0 0 18px", fontSize: 24 }}>
              Project Configuration
            </h2>

            {!selectedChurch ? (
              <p style={{ margin: 0, color: "#667085" }}>
                Select an onboarded church to configure its workspace.
              </p>
            ) : (
              <form onSubmit={handleSaveConfiguration}>
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
                    },
                    {
                      label: "Primary Contact",
                      field: "primaryContactName" as const,
                    },
                    {
                      label: "Primary Contact Email",
                      field: "primaryContactEmail" as const,
                    },
                    {
                      label: "Primary Contact Phone",
                      field: "primaryContactPhone" as const,
                    },
                    {
                      label: "Address",
                      field: "address" as const,
                    },
                    {
                      label: "City",
                      field: "city" as const,
                    },
                    {
                      label: "Denomination",
                      field: "denomination" as const,
                    },
                    {
                      label: "Service Days",
                      field: "serviceDays" as const,
                    },
                    {
                      label: "Service Times",
                      field: "serviceTimes" as const,
                    },
                  ].map((input) => (
                    <label
                      key={input.field}
                      style={{
                        display: "grid",
                        gap: 8,
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {input.label}
                      <input
                        value={configForm[input.field]}
                        onChange={(event) =>
                          setConfigForm((current) => ({
                            ...current,
                            [input.field]: event.target.value,
                          }))
                        }
                        style={{
                          border: "1px solid #D0D5DD",
                          borderRadius: 12,
                          padding: "12px 14px",
                        }}
                      />
                    </label>
                  ))}

                  <label style={{ display: "grid", gap: 8, fontWeight: 700 }}>
                    Membership Size
                    <select
                      value={configForm.membershipSize}
                      onChange={(event) =>
                        setConfigForm((current) => ({
                          ...current,
                          membershipSize: event.target.value,
                        }))
                      }
                      style={{
                        border: "1px solid #D0D5DD",
                        borderRadius: 12,
                        padding: "12px 14px",
                      }}
                    >
                      {membershipSizeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={{ display: "grid", gap: 8, fontWeight: 700 }}>
                    Branch Count
                    <input
                      type="number"
                      min="1"
                      value={configForm.branchCount}
                      onChange={(event) =>
                        setConfigForm((current) => ({
                          ...current,
                          branchCount: event.target.value,
                        }))
                      }
                      style={{
                        border: "1px solid #D0D5DD",
                        borderRadius: 12,
                        padding: "12px 14px",
                      }}
                    />
                  </label>

                  <label style={{ display: "grid", gap: 8, fontWeight: 700 }}>
                    Church Status
                    <select
                      value={configForm.status}
                      onChange={(event) =>
                        setConfigForm((current) => ({
                          ...current,
                          status: event.target.value as ChurchStatus,
                        }))
                      }
                      style={{
                        border: "1px solid #D0D5DD",
                        borderRadius: 12,
                        padding: "12px 14px",
                      }}
                    >
                      {["DISCOVERY", "CONFIGURING", "SAMPLE_READY", "LIVE"].map(
                        (status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                </div>

                <div
                  style={{
                    border: "1px solid #E8E8E4",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <img
                      src={
                        configForm.logoUrl ||
                        "https://placehold.co/96x96/png?text=Logo"
                      }
                      alt={configForm.churchName || "Church logo preview"}
                      style={{
                        width: 84,
                        height: 84,
                        borderRadius: 16,
                        objectFit: "cover",
                        border: "1px solid #E4E7EC",
                      }}
                    />
                    <div style={{ display: "grid", gap: 8 }}>
                      <label style={{ fontWeight: 700 }}>
                        Upload Church Logo
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              void handleConfigLogoUpload(file);
                            }
                          }}
                          style={{ display: "block", marginTop: 8 }}
                        />
                      </label>
                      <p style={{ margin: 0, color: "#667085", fontSize: 13 }}>
                        {logoUploadState ||
                          "Upload a logo to personalize the church workspace."}
                      </p>
                    </div>
                  </div>
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
                      border: "1px solid #E8E8E4",
                      borderRadius: 16,
                      padding: 16,
                    }}
                  >
                    <p style={{ margin: "0 0 12px", fontWeight: 800 }}>
                      Selected Features
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {churchFeatureOptions.map((option) => {
                        const active =
                          configForm.selectedFeatures.includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              toggleConfigValue("selectedFeatures", option)
                            }
                            style={{
                              border: active
                                ? "1px solid #185FA5"
                                : "1px solid #D0D5DD",
                              background: active ? "#EAF3FF" : "#fff",
                              color: active ? "#185FA5" : "#344054",
                              borderRadius: 999,
                              padding: "10px 12px",
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
                      border: "1px solid #E8E8E4",
                      borderRadius: 16,
                      padding: 16,
                    }}
                  >
                    <p style={{ margin: "0 0 12px", fontWeight: 800 }}>
                      Communication Channels
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {communicationChannelOptions.map((option) => {
                        const active =
                          configForm.communicationChannels.includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              toggleConfigValue("communicationChannels", option)
                            }
                            style={{
                              border: active
                                ? "1px solid #185FA5"
                                : "1px solid #D0D5DD",
                              background: active ? "#EAF3FF" : "#fff",
                              color: active ? "#185FA5" : "#344054",
                              borderRadius: 999,
                              padding: "10px 12px",
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
                    display: "grid",
                    gap: 8,
                    fontWeight: 700,
                    marginBottom: 16,
                  }}
                >
                  Requirements Notes
                  <textarea
                    value={configForm.requirementsNotes}
                    onChange={(event) =>
                      setConfigForm((current) => ({
                        ...current,
                        requirementsNotes: event.target.value,
                      }))
                    }
                    rows={4}
                    style={{
                      border: "1px solid #D0D5DD",
                      borderRadius: 12,
                      padding: "12px 14px",
                      resize: "vertical",
                    }}
                  />
                </label>

                <label
                  style={{
                    display: "grid",
                    gap: 8,
                    fontWeight: 700,
                    marginBottom: 16,
                  }}
                >
                  Workspace Modules
                  <textarea
                    value={configForm.workspaceModules.join("\n")}
                    onChange={(event) =>
                      setConfigForm((current) => ({
                        ...current,
                        workspaceModules: event.target.value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean),
                      }))
                    }
                    rows={5}
                    style={{
                      border: "1px solid #D0D5DD",
                      borderRadius: 12,
                      padding: "12px 14px",
                      resize: "vertical",
                    }}
                  />
                </label>

                <label
                  style={{
                    display: "grid",
                    gap: 8,
                    fontWeight: 700,
                    marginBottom: 20,
                  }}
                >
                  Onboarding Checklist
                  <textarea
                    value={configForm.onboardingChecklist.join("\n")}
                    onChange={(event) =>
                      setConfigForm((current) => ({
                        ...current,
                        onboardingChecklist: event.target.value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean),
                      }))
                    }
                    rows={5}
                    style={{
                      border: "1px solid #D0D5DD",
                      borderRadius: 12,
                      padding: "12px 14px",
                      resize: "vertical",
                    }}
                  />
                </label>

                <button
                  type="submit"
                  style={{
                    border: "none",
                    background: "#185FA5",
                    color: "#fff",
                    borderRadius: 10,
                    padding: "14px 18px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Save project configuration
                </button>
              </form>
            )}
          </section>

          <section
            style={{
              border: "1px solid #E8E8E4",
              borderRadius: 20,
              background: "#fff",
              padding: 24,
            }}
          >
            <h2 style={{ margin: "0 0 14px", fontSize: 24 }}>
              Product Module Access
            </h2>
            {!selectedChurch ? (
              <p style={{ margin: 0, color: "#667085" }}>
                Select a church to see which product modules are unlocked.
              </p>
            ) : !modulesState?.unlocked ? (
              <div
                style={{
                  border: "1px dashed #D0D5DD",
                  borderRadius: 16,
                  padding: 18,
                  background: "#FCFCFD",
                }}
              >
                <p
                  style={{ margin: "0 0 8px", fontWeight: 800, color: "#111" }}
                >
                  Modules Locked
                </p>
                <p style={{ margin: 0, color: "#667085" }}>
                  {modulesState?.message ??
                    "Modules stay locked until the church has been onboarded."}
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                <p style={{ margin: 0, color: "#067647", fontWeight: 700 }}>
                  {modulesState.message}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 12,
                  }}
                >
                  {modulesState.modules.map((moduleName) => (
                    <div
                      key={moduleName}
                      style={{
                        border: "1px solid #D6F5E8",
                        background: "#F4FFFA",
                        borderRadius: 14,
                        padding: 14,
                      }}
                    >
                      <p
                        style={{ margin: 0, fontWeight: 800, color: "#0F6E56" }}
                      >
                        {moduleName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
