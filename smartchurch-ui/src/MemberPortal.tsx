"use client";

import { useState } from "react";
import type { CSSProperties, FormEvent } from "react";

type PortalTab = "register" | "checkin";

type RegistrationForm = {
  fullName: string;
  phone: string;
  email: string;
  dob: string;
  gender: "MALE" | "FEMALE" | "";
  address: string;
  department: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
};

type CheckInForm = {
  memberId: string;
};

type ApiState = {
  type: "idle" | "loading" | "success" | "error";
  message: string;
};

const PRIMARY = "#185FA5";
const ACCENT = "#28a745";

const DEPARTMENTS = [
  "Choir",
  "Ushering",
  "Media",
  "Children",
  "Women's Ministry",
  "Men's Fellowship",
  "Sunday School",
  "Youth Ministry",
  "Prayer Team",
];

const inputStyle: CSSProperties = {
  border: "1px solid #D0D5DD",
  borderRadius: 10,
  padding: "11px 14px",
  fontSize: 14,
  color: "#111",
  background: "#fff",
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 13,
  fontWeight: 600,
  color: "#344054",
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label style={labelStyle}>
      {label}
      {required ? (
        <span style={{ color: "#B42318", marginLeft: 2 }}>*</span>
      ) : null}
      {children}
    </label>
  );
}

const initialRegistration: RegistrationForm = {
  fullName: "",
  phone: "",
  email: "",
  dob: "",
  gender: "",
  address: "",
  department: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
};

const initialCheckIn: CheckInForm = { memberId: "" };

export function MemberPortal({
  apiBaseUrl,
  onBack,
}: {
  apiBaseUrl: string;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<PortalTab>("register");
  const [form, setForm] = useState<RegistrationForm>(initialRegistration);
  const [regState, setRegState] = useState<ApiState>({
    type: "idle",
    message: "",
  });
  const [registeredMember, setRegisteredMember] = useState<{
    memberCode: string;
    fullName: string;
  } | null>(null);

  const [checkInForm, setCheckInForm] = useState<CheckInForm>(initialCheckIn);
  const [checkInState, setCheckInState] = useState<ApiState>({
    type: "idle",
    message: "",
  });

  const updateField = (field: keyof RegistrationForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setRegState({ type: "loading", message: "Registering your details..." });

    try {
      const res = await fetch(`${apiBaseUrl}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          email: form.email || undefined,
          dob: form.dob ? new Date(form.dob).toISOString() : undefined,
          gender: form.gender || undefined,
          address: form.address,
          department: form.department || undefined,
          emergencyContactName: form.emergencyContactName,
          emergencyContactPhone: form.emergencyContactPhone,
          status: "NEW",
        }),
      });

      const payload = (await res.json()) as {
        member?: { memberCode: string; fullName: string };
        message?: string;
      };

      if (!res.ok) {
        throw new Error(payload.message ?? "Registration failed.");
      }

      setRegisteredMember({
        memberCode: payload.member?.memberCode ?? "",
        fullName: payload.member?.fullName ?? form.fullName,
      });
      setForm(initialRegistration);
      setRegState({ type: "success", message: "Registration complete!" });
    } catch (err) {
      setRegState({
        type: "error",
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  const handleCheckIn = async (e: FormEvent) => {
    e.preventDefault();
    setCheckInState({ type: "loading", message: "Recording attendance..." });

    try {
      const res = await fetch(`${apiBaseUrl}/attendance/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: checkInForm.memberId,
          serviceSession: "GENERAL",
        }),
      });

      const payload = (await res.json()) as { message?: string };

      if (!res.ok) {
        throw new Error(payload.message ?? "Check-in failed.");
      }

      setCheckInForm(initialCheckIn);
      setCheckInState({
        type: "success",
        message:
          payload.message === "Duplicate scan detected"
            ? "You are already checked in for this service."
            : "Attendance recorded. God bless you!",
      });
    } catch (err) {
      setCheckInState({
        type: "error",
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Inter', 'Segoe UI', -apple-system, sans-serif",
        background: "#F9FAFB",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: PRIMARY,
          padding: "0 20px",
          boxShadow: "0 2px 8px rgba(24,95,165,0.18)",
        }}
      >
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 0",
          }}
        >
          {/* Church icon */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "rgba(255,255,255,0.15)",
              border: "2px solid rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2L12 6M10 4H14" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 20V11L12 5L21 11V20H15V14H9V20H3Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: "#fff",
                margin: 0,
              }}
            >
              Member Portal
            </p>
            <p
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.75)",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Member Self-Service Portal
            </p>
          </div>
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Back
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #E4E7EC",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            display: "flex",
          }}
        >
          {(
            [
              { id: "register", label: "New Member Registration" },
              { id: "checkin", label: "Sunday Check-In" },
            ] as { id: PortalTab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: "none",
                border: "none",
                padding: "14px 16px",
                fontSize: 13,
                fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? PRIMARY : "#667085",
                cursor: "pointer",
                borderBottom:
                  tab === t.id
                    ? `2px solid ${PRIMARY}`
                    : "2px solid transparent",
                whiteSpace: "nowrap",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "28px 20px 60px",
        }}
      >
        {/* Registration tab */}
        {tab === "register" && (
          <div>
            {regState.type === "success" && registeredMember ? (
              <div
                style={{
                  background: "#ECFDF3",
                  border: "1px solid #ABEFC6",
                  borderRadius: 16,
                  padding: 28,
                  textAlign: "center",
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: ACCENT,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12L10 17L19 8"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#067647",
                    margin: "0 0 8px",
                  }}
                >
                  Welcome, {registeredMember.fullName}!
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: "#344054",
                    margin: "0 0 16px",
                  }}
                >
                  Your member record has been created. Your Member ID is:
                </p>
                <div
                  style={{
                    background: "#fff",
                    border: `2px solid ${ACCENT}`,
                    borderRadius: 12,
                    padding: "14px 24px",
                    display: "inline-block",
                    fontSize: 22,
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    color: "#1a1a1a",
                    marginBottom: 20,
                  }}
                >
                  {registeredMember.memberCode}
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "#667085",
                    margin: "0 0 20px",
                  }}
                >
                  Save this ID. You will need it for Sunday check-in if you
                  cannot scan the entrance QR code.
                </p>
                <button
                  onClick={() => {
                    setRegisteredMember(null);
                    setRegState({ type: "idle", message: "" });
                  }}
                  style={{
                    background: PRIMARY,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "11px 24px",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Register another member
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister}>
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#101828",
                    margin: "0 0 4px",
                  }}
                >
                  Register as a member
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    color: "#667085",
                    margin: "0 0 24px",
                  }}
                >
                  Fill this form once to join the church member database. You
                  will receive a unique Member ID.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: 16,
                    marginBottom: 16,
                  }}
                >
                  <Field label="Full Name" required>
                    <input
                      style={inputStyle}
                      type="text"
                      value={form.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder="Blessing Okafor"
                      required
                    />
                  </Field>

                  <Field label="Phone Number" required>
                    <input
                      style={inputStyle}
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="08012345678"
                      required
                    />
                  </Field>

                  <Field label="Email Address">
                    <input
                      style={inputStyle}
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="blessing@email.com"
                    />
                  </Field>

                  <Field label="Date of Birth">
                    <input
                      style={inputStyle}
                      type="date"
                      value={form.dob}
                      onChange={(e) => updateField("dob", e.target.value)}
                    />
                  </Field>

                  <Field label="Gender" required>
                    <select
                      style={inputStyle}
                      value={form.gender}
                      onChange={(e) =>
                        updateField(
                          "gender",
                          e.target.value as "MALE" | "FEMALE",
                        )
                      }
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </Field>

                  <Field label="Department / Ministry">
                    <select
                      style={inputStyle}
                      value={form.department}
                      onChange={(e) =>
                        updateField("department", e.target.value)
                      }
                    >
                      <option value="">Select department (optional)</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <Field label="Home Address" required>
                    <input
                      style={inputStyle}
                      type="text"
                      value={form.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="12 Church Street"
                      required
                    />
                  </Field>
                </div>

                <div
                  style={{
                    background: "#F9FAFB",
                    border: "1px solid #E4E7EC",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 20,
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#667085",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      margin: "0 0 12px",
                    }}
                  >
                    Emergency Contact
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 16,
                    }}
                  >
                    <Field label="Contact Name" required>
                      <input
                        style={inputStyle}
                        type="text"
                        value={form.emergencyContactName}
                        onChange={(e) =>
                          updateField("emergencyContactName", e.target.value)
                        }
                        placeholder="John Okafor"
                        required
                      />
                    </Field>
                    <Field label="Contact Phone" required>
                      <input
                        style={inputStyle}
                        type="tel"
                        value={form.emergencyContactPhone}
                        onChange={(e) =>
                          updateField("emergencyContactPhone", e.target.value)
                        }
                        placeholder="08098765432"
                        required
                      />
                    </Field>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="submit"
                    disabled={regState.type === "loading"}
                    style={{
                      background:
                        regState.type === "loading" ? "#80bdff" : PRIMARY,
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      padding: "13px 28px",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor:
                        regState.type === "loading" ? "not-allowed" : "pointer",
                    }}
                  >
                    {regState.type === "loading"
                      ? "Registering..."
                      : "Complete registration"}
                  </button>

                  {regState.type === "error" ? (
                    <p
                      style={{
                        fontSize: 13,
                        color: "#B42318",
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      {regState.message}
                    </p>
                  ) : null}
                </div>
              </form>
            )}
          </div>
        )}

        {/* Check-in tab */}
        {tab === "checkin" && (
          <div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#101828",
                margin: "0 0 4px",
              }}
            >
              Sunday Check-In
            </h2>
            <p style={{ fontSize: 13, color: "#667085", margin: "0 0 24px" }}>
              Already a registered member? Enter your Member ID below to record
              your attendance if you were unable to scan the entrance QR code.
            </p>

            <div
              style={{
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: 12,
                padding: "14px 18px",
                marginBottom: 24,
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="#1D4ED8" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p style={{ fontSize: 13, color: "#1D4ED8", margin: 0 }}>
                Scanning the QR code at the church entrance automatically
                records your attendance. Use this form only if you arrived but
                could not scan.
              </p>
            </div>

            {checkInState.type === "success" ? (
              <div
                style={{
                  background: "#ECFDF3",
                  border: "1px solid #ABEFC6",
                  borderRadius: 14,
                  padding: 24,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: ACCENT,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px",
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12L10 17L19 8"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#067647",
                    margin: "0 0 16px",
                  }}
                >
                  {checkInState.message}
                </p>
                <button
                  onClick={() =>
                    setCheckInState({ type: "idle", message: "" })
                  }
                  style={{
                    background: ACCENT,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 20px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Check in another member
                </button>
              </div>
            ) : (
              <form onSubmit={handleCheckIn}>
                <div style={{ marginBottom: 16 }}>
                  <Field label="Member ID" required>
                    <input
                      style={{ ...inputStyle, fontSize: 18, fontWeight: 700 }}
                      type="text"
                      value={checkInForm.memberId}
                      onChange={(e) =>
                        setCheckInForm({ memberId: e.target.value })
                      }
                      placeholder="MBR-00001"
                      required
                    />
                  </Field>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#667085",
                      margin: "6px 0 0",
                    }}
                  >
                    Your Member ID was given to you when you registered. Example: MBR-00001
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="submit"
                    disabled={checkInState.type === "loading"}
                    style={{
                      background:
                        checkInState.type === "loading"
                          ? "#6fc88a"
                          : ACCENT,
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      padding: "13px 28px",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor:
                        checkInState.type === "loading"
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {checkInState.type === "loading"
                      ? "Recording..."
                      : "Record my attendance"}
                  </button>

                  {checkInState.type === "error" ? (
                    <p
                      style={{
                        fontSize: 13,
                        color: "#B42318",
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      {checkInState.message}
                    </p>
                  ) : null}
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
