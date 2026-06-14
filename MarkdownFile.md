**SmartChurch Attendance Platform**

**PRODUCT REQUIREMENTS DOCUMENT**

Church Attendance Management System (CAMS)

| Version | 1.1 |
| --- | --- |
| Status | Updated Draft |
| Date | June 2026 |
| Owner | Church Tech Team |
| Audience | Developers, Pastoral Team, Admins |

# Document Change Log

| Version | Change Summary | Date |
| --- | --- | --- |
| 1.0 | Initial draft | May 2026 |
| 1.1 | Updated to entry-triggered attendance (not exit); replaced dedicated scanner with general member QR code scanned by member at entry; revised Section 1, 3, 5.2, 5.3, 7, 8, 9 accordingly | June 2026 |

# 1\. Executive Summary

The Church Attendance Management System (CAMS) is a purpose-built digital platform designed to modernize how churches track and understand member attendance. By replacing manual registers, paper sign-in sheets, and ad hoc spreadsheets with a streamlined, QR-code-based digital solution, CAMS enables church leadership to make data-informed pastoral decisions, monitor congregation growth, and follow up effectively with members.

**The system is anchored by three core principles:**

*   **—** Ease of Onboarding

Members complete a one-time registration form to enter the church database.

*   **—** Frictionless Weekly Tracking

Each member holds a personal QR code. On Sundays, members scan the general church QR code displayed at the entrance using their own phone to self-record attendance.

*   **—** Entry-Triggered Confirmation

Attendance is marked and finalized the moment a member physically enters the premises and scans the QR code, ensuring real-time accuracy.

_ℹ v1.1 Change: Attendance is now confirmed at entry (not exit). Members use their own phones to scan a general QR code at the entrance — there is no dedicated scanner device._

Once the QR code is scanned, the member database and attendance spreadsheet update automatically in real time.

Automated Sunday queries run at scheduled intervals to generate attendance reports and flag absentees for pastoral follow-up, making CAMS a living pastoral tool rather than a static database.

# 2\. Problem Statement

## 2.1 Current Pain Points

Most churches today rely on manual attendance methods with significant limitations:

| Problem | Impact |
| --- | --- |
| Manual paper registers | Prone to illegible handwriting, loss of records, and inaccurate tallies |
| No member database | Impossible to identify recurring absentees or contact members proactively |
| Slow check-in queues | Congestion at entry disrupts worship flow and latecomer experience |
| No reporting | Leadership cannot track trends, identify growth, or measure engagement over time |

## 2.2 Opportunity

A general QR code posted at the church entrance, scanned by members on their own phones as they arrive, combined with automated Sunday reporting, addresses all these pain points while remaining familiar and easy-to-use for congregations of all ages and tech literacy levels. No dedicated scanner hardware is required.

# 3\. Goals & Success Metrics

## 3.1 Product Goals

*   Build a centralized, searchable member database populated via one-time registration
*   Display a general church QR code at the entrance that is active exclusively on Sundays
*   Log attendance precisely at the moment a member enters and scans the QR code with their personal device
*   Automate weekly Sunday attendance queries and generate pastoral reports
*   Provide dashboard views of attendance trends, absenteeism, and growth metrics

## 3.2 Success Metrics

| Metric | Target | Timeline |
| --- | --- | --- |
| Member registration rate | 80% of active members onboarded | Month 1 |
| Sunday QR scan rate | ≥ 90% of attendees scanned | Week 4 |
| Data accuracy | < 2% discrepancy vs manual count | Ongoing |
| Report generation time | < 5 minutes post-service | Launch |
| Admin time saved | ≥ 3 hours/week | Month 2 |

# 4\. User Personas

| Persona | Profile | Primary Needs |
| --- | --- | --- |
| Church Member | Regular Sunday attendee; all age groups; varying tech comfort | Scan the entrance QR code with their phone on arrival; no repeated data entry |
| First-Time Visitor | Attending for the first or second time; no profile yet | Easy one-time registration form on mobile or kiosk |
| Admin / Usher | Manages QR display and assists members | Ability to manually record attendance if member cannot scan |
| Pastor / Leadership | Needs congregation health insights for pastoral care | Weekly reports, absentee lists, trend dashboards |
| IT / Developer | Maintains system; runs Sunday queries; manages database | Scheduled automation; clean APIs; audit logs |

# 5\. Core Features & Requirements

## 5.1 One-Time Member Registration Form

Every person must complete a registration form once to be entered into the church database. This form is the single source of truth for member identity and contact information.

**Form Fields (Required)**

| Field | Description | Validation |
| --- | --- | --- |
| Full Name | First and last name | Min 2 characters, letters only |
| Phone Number | Primary contact (WhatsApp preferred) | 11-digit Nigerian format |
| Email Address | For digital communications | Valid email format (optional) |
| Date of Birth | For age group classification | Valid date, not future |
| Gender | Male / Female | Required selection |
| Home Address | Zone/area for cell group mapping | Free text, required |
| Department / Ministry | e.g. Choir, Ushers, Youth (optional) | Dropdown, multi-select |
| Member Status | New, Active, Transferred | Radio button |
| Emergency Contact | Name + phone of next of kin | Required |
| Photo (optional) | Face photo for profile card | JPEG/PNG, max 2MB |

**Post-Registration**

*   System assigns a unique Member ID (e.g., RJ-00234) and links it to the member record
*   Admin receives notification of each new registration
*   Member can update their profile anytime via a self-service link (except Member ID)
*   Member's QR code is not personally held — the general church entrance QR is used for all members

## 5.2 QR Code Attendance — Sundays Only (Entry-Triggered)

_ℹ v1.1 Change: Each member no longer holds an individual QR code. Instead, a single general QR code is displayed at the church entrance. Members scan it with their own phones upon entering. The system identifies the member from their authenticated session or phone-linked profile._

QR code scanning is restricted exclusively to Sundays. On any other day, the scan endpoint returns an error: "Attendance scanning is only active on Sundays."

**How It Works**

*   A general church QR code is displayed prominently at the entrance each Sunday
*   As a member enters the building, they open the CAMS app or web link and scan the entrance QR code
*   The system identifies the member via their logged-in account or registered phone number
*   System timestamps the entry, marks the member as Attended, and saves the record immediately
*   The member database and attendance spreadsheet update in real time upon each successful scan

**QR Code Technical Specs**

| Attribute | Detail |
| --- | --- |
| Format | QR Code (ISO 18004), Error Correction Level M |
| Type | General church entrance QR — one code, all members |
| Encoded Data | Church session ID + Sunday date + HMAC signature for tamper prevention |
| Rotation | New QR generated each Sunday; previous codes invalidated automatically |
| Member Identification | Member identified by authenticated app session or phone-linked profile |
| Fallback | Admin can manually search member name and mark attendance if scanning fails |

## 5.3 Entry-Triggered Attendance Logic

Attendance is confirmed at entry. This design ensures the record reflects actual service participation from the moment a member walks in.

_ℹ v1.1 Change: Previous versions recorded attendance at exit. This has been updated — attendance is now recorded at entry when the member scans the general entrance QR code._

| State | Behaviour |
| --- | --- |
| Member enters & scans QR | Attendance record created: Member ID, Date, Entry Timestamp, Service Session |
| Member enters without scanning | No record created. Admin can manually add attendance post-service. |
| Member scans more than once | Duplicate scan detected; original entry timestamp preserved; no duplicate record created |
| Non-Sunday scan attempt | System rejects scan with message: 'Scanning only available on Sundays' |
| Unregistered visitor attempts to scan | System prompts visitor to complete one-time registration before attendance can be recorded |

## 5.4 Automated Sunday Query Engine

Every Sunday, the system runs a scheduled automated query to generate attendance analytics. This replaces manual counting and report compilation entirely.

**Query Schedule**

| Time | Query | Purpose |
| --- | --- | --- |
| 8:00 AM | Pre-Service Query | Confirms QR system is live; validates Sunday date check; entrance QR activated |
| 11:00 AM | Mid-Service Snapshot | Interim attendance count for ushers and leadership |
| 1:30 PM | Post-Service Final Query | Closes attendance window; generates full report; entrance QR deactivated |
| 2:00 PM | Absentee Query | Cross-references member database vs attendance; flags absences |

**Report Contents**

*   Total attendance count for the Sunday
*   Breakdown by department, gender, age group
*   First-time visitors (registered that day)
*   Members absent for 2+ consecutive Sundays (flagged for pastoral follow-up)
*   Comparative trend: attendance vs previous 4 Sundays
*   Export formats: PDF summary, CSV raw data

# 6\. System Architecture Overview

## 6.1 Technology Stack (Recommended)

| Layer | Technology | Rationale |
| --- | --- | --- |
| Frontend | React / Next.js + PWA | Mobile-first; members scan using their own phones |
| Backend | Node.js + Express or Django | REST API; scheduled job support |
| Database | PostgreSQL | Relational; strong query support for reports |
| QR Generation | qrcode.js / python-qrcode | Lightweight; HMAC signing built-in; generates Sunday session QR |
| QR Scanning | ZXing / jsQR | Browser-native; no app install required; member scans via phone camera |
| Scheduler | node-cron / Celery Beat | Sunday query automation |
| Hosting | Render / Railway / DigitalOcean | Low-cost; supports scheduled jobs |
| Auth | JWT + Role-based access control | Secure admin vs member access; phone-linked member sessions |

## 6.2 Data Model (Core Tables)

**members**

member\_id (PK), full\_name, phone, email, dob, gender, address, department, status, photo\_url, created\_at

**attendance\_records**

record\_id (PK), member\_id (FK), scan\_date, entry\_timestamp, service\_session, created\_at

**sunday\_reports**

report\_id (PK), report\_date, total\_count, breakdown\_json, absentee\_list\_json, generated\_at

**manual\_overrides**

override\_id, member\_id, date, reason, added\_by\_admin, created\_at

**sunday\_qr\_sessions**

session\_id (PK), session\_date, qr\_hash, activated\_at, deactivated\_at, created\_by\_admin

_ℹ New table in v1.1: tracks each Sunday's general entrance QR code, its HMAC hash, and active window._

# 7\. Feature Priority Table

| Feature | Description | Priority | Owner |
| --- | --- | --- | --- |
| Member Registration Form | One-time form with all required fields and validation | High | Dev |
| General Entrance QR Generation | Auto-generate a single Sunday entrance QR each week; deactivate after service | High | Dev |
| Entry-Triggered Scan | Member scans entrance QR on arrival; attendance logged at entry on Sundays only | High | Dev |
| Sunday Day-Lock | Enforce that scanning only works on Sundays; entrance QR inactive all other days | High | Dev |
| Automated Sunday Query | Cron jobs at 8AM, 11AM, 1:30PM, 2PM each Sunday | High | Dev |
| Attendance Dashboard | Visual summary of attendance stats for admins | High | Admin |
| Absentee Flagging | Flag members missing 2+ consecutive Sundays | High | Pastor |
| Report Export (PDF/CSV) | Download Sunday reports in multiple formats | Medium | Admin |
| Manual Attendance Override | Admin adds attendance for members who could not scan | Medium | Admin |
| Member Self-Service Portal | Members update own profile information | Medium | Dev |
| Department Breakdown | Filter attendance by ministry/department | Medium | Admin |
| First-Timer Detection | Flag and count first-time visitors each Sunday | Medium | Pastor |
| Multi-Session Support | Track 1st and 2nd service separately with distinct Sunday QR windows | Low | Dev |
| SMS Notifications | Automated follow-up SMS to absentees | Low | Dev |

# 8\. User Stories

## 8.1 Member Stories

*   As a new member, I want to fill out a one-time registration form so that I am in the church database and can use QR attendance.
*   As a returning member, I want to scan the entrance QR code with my phone as I walk in on Sunday so that my attendance is automatically recorded without queuing or carrying a separate card.
*   As a member, I want the scan confirmation to appear instantly on my phone so that I know my attendance has been recorded.

## 8.2 Admin / Usher Stories

*   As an admin, I want to display the Sunday entrance QR code on a screen or printed poster at the door so that all members can scan it easily as they arrive.
*   As an admin, I want to manually mark attendance for members whose scan failed so that no one is incorrectly recorded as absent.
*   As an admin, I want the system to reject scans on non-Sunday days so that test or accidental scans do not pollute attendance data.
*   As an admin, I want the entrance QR to activate automatically at 8AM and deactivate at 1:30PM each Sunday so that I do not need to manage it manually.

## 8.3 Pastor / Leadership Stories

*   As a pastor, I want an automated Sunday attendance report delivered to my inbox by 2PM every Sunday so that I can act on pastoral concerns immediately.
*   As a pastor, I want a list of members absent for 2 or more consecutive Sundays so that my care team can reach out proactively.
*   As a leader, I want to see attendance trends over the last month, quarter, and year so that I can measure congregation growth.

# 9\. Non-Functional Requirements

| Category | Requirement |
| --- | --- |
| Performance | QR scan-to-confirmation must complete in under 2 seconds on a standard 4G connection |
| Reliability | System uptime ≥ 99.5%; scheduled Sunday queries must not fail; retry mechanism on failure |
| Scalability | Support up to 5,000 registered members and 2,000 concurrent Sunday scans from personal devices |
| Security | HTTPS only; JWT auth; Sunday entrance QR HMAC-signed and date-scoped; admin access behind 2FA |
| Privacy | Member data stored in Nigeria or compliant server; NDPR-compliant data handling |
| Offline Support | If a member's phone loses connection mid-scan, the app caches the scan locally and syncs when restored |
| Accessibility | Registration form WCAG 2.1 AA compliant; large-button scanning UI for elderly members; QR display large enough for easy phone scanning from 0.5m |
| Auditability | All attendance records, overrides, and report generations logged with admin ID and timestamp |

# 10\. Implementation Roadmap

| Phase | Timeline | Deliverables |
| --- | --- | --- |
| Phase 1 — Foundation | Weeks 1–3 | Database schema, member registration form, admin portal |
| Phase 2 — Scanning | Weeks 4–5 | Sunday entrance QR generation & display, entry scan interface (mobile), Sunday-only lock, manual override, attendance records |
| Phase 3 — Automation | Week 6 | Sunday cron jobs (4 scheduled queries), report generation, PDF/CSV export |
| Phase 4 — Insights | Weeks 7–8 | Attendance dashboard, absentee flagging, trend charts, pastoral alerts |
| Phase 5 — Hardening | Weeks 9–10 | Offline sync, security audit, NDPR review, user training & go-live |

# 11\. Open Questions & Decisions Needed

*   Will each service session (1st/2nd) require a separate Sunday QR code and scan window, or is one Sunday-wide QR sufficient?
*   Should visitors who have not registered yet be prompted via a quick guest registration form immediately after attempting to scan the entrance QR?
*   Who receives the Sunday report by default — pastor only, or department heads as well?
*   What is the data retention policy — how long are attendance records kept?
*   Should the absentee follow-up be an automated WhatsApp/SMS, or a task assigned to a care team member?
*   Will the system need multi-branch support if the church has multiple campuses? (Each campus would have its own entrance QR.)
*   How will elderly or non-smartphone members be accommodated — via usher-assisted manual check-in or a dedicated kiosk?

# 12\. Approvals & Sign-Off

| Role | Name | Date |
| --- | --- | --- |
| Product Owner | SEGUN AJIBOLA & OGUNLEYE OLASUNKANMI ANTHONY| 2026-13-06 |
| Lead Developer | OGUNLEYE OLASUNKANMI ANTHONY| 2026-13-06 |  
| Church Administrator | PASTOR SEGUN AWOLUMATE | 2026-13-06 |
| IT / Systems Lead | SEGUN AJIBOLA | 2026-13-06 |

_SmartChurch Attendance Platform — PRD v1.1 — Confidential_