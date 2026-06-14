import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { Router, } from "express";
import bcrypt from "bcryptjs";
import { AttendanceSource, ChurchStatus, Gender, LeadStatus, MemberStatus, QrSessionStatus, Role, ServiceSession, } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signAuthToken, verifyAuthToken } from "../lib/jwt.js";
function buildMemberCode(sequence) {
    return `RJ-${String(sequence).padStart(5, "0")}`;
}
function slugifyChurchName(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);
}
function uniqueItems(items) {
    return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}
function buildSampleWorkspace(input) {
    const slug = slugifyChurchName(input.churchName);
    return {
        projectName: `${input.churchName} Sample Workspace`,
        subdomain: slug || "church-sample",
        modulesJson: [
            "Church profile",
            "Branch setup",
            "Attendance dashboard",
            ...input.selectedFeatures,
        ],
        onboardingChecklistJson: [
            "Confirm church branding",
            "Review branch and service structure",
            "Approve member onboarding flow",
            "Enable reporting channels",
            "Prepare sample data walkthrough",
        ],
        sampleDataJson: {
            overview: {
                city: input.city,
                membershipSize: input.membershipSize,
                serviceDays: input.serviceDays,
            },
            communicationChannels: input.communicationChannels,
            sampleDepartments: ["Choir", "Ushering", "Media", "Children"],
            sampleReports: ["Sunday attendance summary", "Absentee follow-up list"],
        },
    };
}
function normalizeToDateOnly(date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
function buildDateRange(date) {
    const start = normalizeToDateOnly(date);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return { start, end };
}
function buildQrHash(sessionDate) {
    return crypto
        .createHash("sha256")
        .update(`smartchurch:${sessionDate.toISOString()}`)
        .digest("hex");
}
function buildPublicAssetUrl(request, relativePath) {
    return `${request.protocol}://${request.get("host")}${relativePath}`;
}
async function persistChurchLogo(input) {
    const match = input.dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match || !match[1] || !match[2]) {
        throw new Error("Invalid image data supplied.");
    }
    const mimeType = match[1];
    const rawBase64 = match[2];
    const allowedTypes = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/webp": "webp",
        "image/svg+xml": "svg",
    };
    const extension = allowedTypes[mimeType];
    if (!extension) {
        throw new Error("Only PNG, JPEG, WEBP, and SVG logos are supported.");
    }
    const fileBuffer = Buffer.from(rawBase64, "base64");
    const maxSizeBytes = 2 * 1024 * 1024;
    if (fileBuffer.byteLength > maxSizeBytes) {
        throw new Error("Logo file is too large. Maximum supported size is 2MB.");
    }
    const fileName = `church-logo-${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const relativePath = `/uploads/church-logos/${fileName}`;
    const absolutePath = path.join(process.cwd(), relativePath.slice(1));
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, fileBuffer);
    return buildPublicAssetUrl(input.request, relativePath);
}
function requireAuth(allowedRoles) {
    return (request, response, next) => {
        const authHeader = request.headers.authorization;
        const token = authHeader?.startsWith("Bearer ")
            ? authHeader.slice(7)
            : undefined;
        if (!token) {
            return response.status(401).json({ message: "Authentication required" });
        }
        try {
            const payload = verifyAuthToken(token);
            response.locals.auth = payload;
            if (allowedRoles && !allowedRoles.includes(payload.role)) {
                return response
                    .status(403)
                    .json({ message: "Insufficient permissions" });
            }
            return next();
        }
        catch {
            return response.status(401).json({ message: "Invalid or expired token" });
        }
    };
}
const registerSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
    phone: z.string().min(11).max(15).optional(),
    role: z.nativeEnum(Role).optional(),
    memberId: z.string().optional(),
});
const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
});
const churchIntakeSchema = z.object({
    churchName: z.string().min(2),
    logoUrl: z.string().url().optional(),
    contactName: z.string().min(2),
    contactEmail: z.email().optional(),
    contactPhone: z.string().min(11).max(15),
    address: z.string().min(5),
    city: z.string().min(2),
    denomination: z.string().optional(),
    membershipSize: z.string().min(1),
    branchCount: z.coerce.number().int().min(1).max(500),
    serviceDays: z.string().min(2),
    serviceTimes: z.string().min(2),
    preferredFeatures: z.array(z.string().min(1)).min(1),
    preferredChannels: z.array(z.string().min(1)).min(1),
    requirementsNotes: z.string().optional(),
});
const churchLeadStatusSchema = z.object({
    status: z.nativeEnum(LeadStatus),
});
const churchLogoUploadSchema = z.object({
    dataUrl: z.string().min(50),
});
const churchConfigurationSchema = z.object({
    churchName: z.string().min(2),
    logoUrl: z.string().url().optional(),
    primaryContactName: z.string().min(2),
    primaryContactEmail: z.email().optional(),
    primaryContactPhone: z.string().min(11).max(15),
    address: z.string().min(5),
    city: z.string().min(2),
    denomination: z.string().optional(),
    membershipSize: z.string().min(1),
    branchCount: z.coerce.number().int().min(1).max(500),
    serviceDays: z.string().min(2),
    serviceTimes: z.string().min(2),
    selectedFeatures: z.array(z.string().min(1)).min(1),
    communicationChannels: z.array(z.string().min(1)).min(1),
    requirementsNotes: z.string().optional(),
    status: z.nativeEnum(ChurchStatus),
    workspaceModules: z.array(z.string().min(1)).min(1),
    onboardingChecklist: z.array(z.string().min(1)).min(1),
});
const memberSchema = z.object({
    fullName: z.string().min(2),
    phone: z.string().min(11).max(15),
    email: z.email().optional(),
    dob: z.string().datetime().optional(),
    gender: z.nativeEnum(Gender),
    address: z.string().min(5),
    department: z.string().optional(),
    status: z.nativeEnum(MemberStatus).default(MemberStatus.NEW),
    emergencyContactName: z.string().min(2),
    emergencyContactPhone: z.string().min(11).max(15),
    photoUrl: z.string().url().optional(),
});
const attendanceSchema = z.object({
    memberId: z.string().min(1),
    serviceSession: z.nativeEnum(ServiceSession).default(ServiceSession.GENERAL),
    qrSessionId: z.string().optional(),
});
const manualOverrideSchema = z.object({
    memberId: z.string().min(1),
    date: z.string().datetime(),
    reason: z.string().min(3),
    serviceSession: z.nativeEnum(ServiceSession).default(ServiceSession.GENERAL),
});
export const apiRouter = Router();
apiRouter.get("/health", (_request, response) => {
    response.json({
        service: "smartchurch-cams-api",
        status: "ok",
        timestamp: new Date().toISOString(),
    });
});
apiRouter.post("/auth/register", async (request, response) => {
    const data = registerSchema.parse(request.body);
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) {
        return response.status(409).json({ message: "User already exists" });
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
        data: {
            email: data.email,
            passwordHash,
            phone: data.phone,
            role: data.role ?? Role.ADMIN,
            memberId: data.memberId,
        },
    });
    return response.status(201).json({
        token: signAuthToken({ userId: user.id, role: user.role }),
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            memberId: user.memberId,
        },
    });
});
apiRouter.post("/auth/login", async (request, response) => {
    const data = loginSchema.parse(request.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
        return response.status(401).json({ message: "Invalid credentials" });
    }
    const passwordMatches = await bcrypt.compare(data.password, user.passwordHash);
    if (!passwordMatches) {
        return response.status(401).json({ message: "Invalid credentials" });
    }
    return response.json({
        token: signAuthToken({ userId: user.id, role: user.role }),
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            memberId: user.memberId,
        },
    });
});
apiRouter.post("/church-assets/logo", async (request, response) => {
    const data = churchLogoUploadSchema.parse(request.body);
    const logoUrl = await persistChurchLogo({
        dataUrl: data.dataUrl,
        request,
    });
    response.status(201).json({
        logoUrl,
        message: "Church logo uploaded successfully.",
    });
});
apiRouter.get("/church-intake", requireAuth([Role.ADMIN, Role.PASTOR]), async (_request, response) => {
    const leads = await prisma.churchLead.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
    });
    response.json({ leads });
});
apiRouter.post("/church-intake", async (request, response) => {
    const data = churchIntakeSchema.parse(request.body);
    const preferredFeatures = uniqueItems(data.preferredFeatures);
    const preferredChannels = uniqueItems(data.preferredChannels);
    const lead = await prisma.churchLead.create({
        data: {
            churchName: data.churchName,
            logoUrl: data.logoUrl,
            contactName: data.contactName,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            address: data.address,
            city: data.city,
            denomination: data.denomination,
            membershipSize: data.membershipSize,
            branchCount: data.branchCount,
            serviceDays: data.serviceDays,
            serviceTimes: data.serviceTimes,
            preferredFeaturesJson: preferredFeatures,
            preferredChannelsJson: preferredChannels,
            requirementsNotes: data.requirementsNotes,
            status: LeadStatus.NEW,
        },
    });
    response.status(201).json({
        lead: {
            id: lead.id,
            churchName: lead.churchName,
            contactName: lead.contactName,
            status: lead.status,
        },
        message: "Church intake submitted successfully.",
    });
});
apiRouter.patch("/church-intake/:leadId/status", requireAuth([Role.ADMIN, Role.PASTOR]), async (request, response) => {
    const leadId = String(request.params.leadId);
    const data = churchLeadStatusSchema.parse(request.body);
    const lead = await prisma.churchLead.update({
        where: { id: leadId },
        data: { status: data.status },
    });
    response.json({
        lead: {
            id: lead.id,
            churchName: lead.churchName,
            status: lead.status,
        },
    });
});
apiRouter.post("/church-intake/:leadId/convert", requireAuth([Role.ADMIN, Role.PASTOR]), async (request, response) => {
    const leadId = String(request.params.leadId);
    const lead = await prisma.churchLead.findUnique({
        where: { id: leadId },
        include: { church: true },
    });
    if (!lead) {
        return response.status(404).json({ message: "Church lead not found" });
    }
    if (lead.church) {
        return response.status(409).json({
            message: "This church lead has already been converted.",
            churchId: lead.church.id,
        });
    }
    const selectedFeatures = Array.isArray(lead.preferredFeaturesJson)
        ? lead.preferredFeaturesJson.map(String)
        : [];
    const communicationChannels = Array.isArray(lead.preferredChannelsJson)
        ? lead.preferredChannelsJson.map(String)
        : [];
    const sampleWorkspace = buildSampleWorkspace({
        churchName: lead.churchName,
        city: lead.city,
        membershipSize: lead.membershipSize,
        selectedFeatures,
        communicationChannels,
        serviceDays: lead.serviceDays,
    });
    const slugBase = slugifyChurchName(lead.churchName) || "church-sample";
    const uniqueSlug = `${slugBase}-${lead.id.slice(0, 6)}`;
    const church = await prisma.church.create({
        data: {
            leadId: lead.id,
            churchName: lead.churchName,
            logoUrl: lead.logoUrl,
            slug: uniqueSlug,
            primaryContactName: lead.contactName,
            primaryContactEmail: lead.contactEmail,
            primaryContactPhone: lead.contactPhone,
            address: lead.address,
            city: lead.city,
            denomination: lead.denomination,
            membershipSize: lead.membershipSize,
            branchCount: lead.branchCount,
            serviceDays: lead.serviceDays,
            serviceTimes: lead.serviceTimes,
            selectedFeaturesJson: selectedFeatures,
            communicationJson: communicationChannels,
            requirementsNotes: lead.requirementsNotes,
            status: ChurchStatus.CONFIGURING,
            sampleWorkspace: {
                create: {
                    projectName: sampleWorkspace.projectName,
                    subdomain: sampleWorkspace.subdomain,
                    adminEmail: lead.contactEmail,
                    modulesJson: sampleWorkspace.modulesJson,
                    onboardingChecklistJson: sampleWorkspace.onboardingChecklistJson,
                    sampleDataJson: sampleWorkspace.sampleDataJson,
                },
            },
        },
        include: {
            sampleWorkspace: true,
        },
    });
    await prisma.churchLead.update({
        where: { id: lead.id },
        data: { status: LeadStatus.CONVERTED },
    });
    response.status(201).json({
        church: {
            id: church.id,
            churchName: church.churchName,
            slug: church.slug,
            status: church.status,
        },
        sampleWorkspace: church.sampleWorkspace,
        message: "Church lead converted into a configured sample workspace.",
    });
});
apiRouter.get("/churches", requireAuth([Role.ADMIN, Role.PASTOR]), async (_request, response) => {
    const churches = await prisma.church.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            sampleWorkspace: true,
        },
        take: 100,
    });
    response.json({ churches });
});
apiRouter.get("/churches/:churchId", requireAuth([Role.ADMIN, Role.PASTOR]), async (request, response) => {
    const churchId = String(request.params.churchId);
    const church = await prisma.church.findUnique({
        where: { id: churchId },
        include: {
            lead: true,
            sampleWorkspace: true,
        },
    });
    if (!church) {
        return response.status(404).json({ message: "Church not found" });
    }
    response.json({ church });
});
apiRouter.patch("/churches/:churchId/configuration", requireAuth([Role.ADMIN, Role.PASTOR]), async (request, response) => {
    const churchId = String(request.params.churchId);
    const data = churchConfigurationSchema.parse(request.body);
    const selectedFeatures = uniqueItems(data.selectedFeatures);
    const communicationChannels = uniqueItems(data.communicationChannels);
    const workspaceModules = uniqueItems(data.workspaceModules);
    const onboardingChecklist = uniqueItems(data.onboardingChecklist);
    const church = await prisma.church.update({
        where: { id: churchId },
        data: {
            churchName: data.churchName,
            logoUrl: data.logoUrl,
            primaryContactName: data.primaryContactName,
            primaryContactEmail: data.primaryContactEmail,
            primaryContactPhone: data.primaryContactPhone,
            address: data.address,
            city: data.city,
            denomination: data.denomination,
            membershipSize: data.membershipSize,
            branchCount: data.branchCount,
            serviceDays: data.serviceDays,
            serviceTimes: data.serviceTimes,
            selectedFeaturesJson: selectedFeatures,
            communicationJson: communicationChannels,
            requirementsNotes: data.requirementsNotes,
            status: data.status,
            sampleWorkspace: {
                upsert: {
                    update: {
                        projectName: `${data.churchName} Sample Workspace`,
                        subdomain: slugifyChurchName(data.churchName) || "church-sample",
                        adminEmail: data.primaryContactEmail,
                        modulesJson: workspaceModules,
                        onboardingChecklistJson: onboardingChecklist,
                        sampleDataJson: {
                            overview: {
                                city: data.city,
                                membershipSize: data.membershipSize,
                                serviceDays: data.serviceDays,
                                serviceTimes: data.serviceTimes,
                            },
                            communicationChannels,
                            selectedFeatures,
                        },
                    },
                    create: {
                        projectName: `${data.churchName} Sample Workspace`,
                        subdomain: slugifyChurchName(data.churchName) || "church-sample",
                        adminEmail: data.primaryContactEmail,
                        modulesJson: workspaceModules,
                        onboardingChecklistJson: onboardingChecklist,
                        sampleDataJson: {
                            overview: {
                                city: data.city,
                                membershipSize: data.membershipSize,
                                serviceDays: data.serviceDays,
                                serviceTimes: data.serviceTimes,
                            },
                            communicationChannels,
                            selectedFeatures,
                        },
                    },
                },
            },
        },
        include: {
            lead: true,
            sampleWorkspace: true,
        },
    });
    response.json({
        church,
        message: "Church configuration updated successfully.",
    });
});
apiRouter.get("/churches/:churchId/modules", requireAuth([Role.ADMIN, Role.PASTOR]), async (request, response) => {
    const churchId = String(request.params.churchId);
    const church = await prisma.church.findUnique({
        where: { id: churchId },
        include: {
            sampleWorkspace: true,
        },
    });
    if (!church) {
        return response.status(404).json({ message: "Church not found" });
    }
    const modules = Array.isArray(church.sampleWorkspace?.modulesJson)
        ? church.sampleWorkspace.modulesJson.map(String)
        : [];
    const unlocked = church.status === ChurchStatus.CONFIGURING ||
        church.status === ChurchStatus.SAMPLE_READY ||
        church.status === ChurchStatus.LIVE;
    response.json({
        unlocked,
        status: church.status,
        modules,
        message: unlocked
            ? "Modules are available for this onboarded church."
            : "Modules stay locked until the church has been onboarded.",
    });
});
apiRouter.get("/members", requireAuth([Role.ADMIN, Role.PASTOR]), async (request, response) => {
    const search = typeof request.query.search === "string"
        ? request.query.search
        : undefined;
    const members = await prisma.member.findMany({
        where: search
            ? {
                OR: [
                    { fullName: { contains: search, mode: "insensitive" } },
                    { phone: { contains: search } },
                    { memberCode: { contains: search, mode: "insensitive" } },
                ],
            }
            : undefined,
        orderBy: { createdAt: "desc" },
        take: 50,
    });
    response.json({ members });
});
apiRouter.post("/members", async (request, response) => {
    const data = memberSchema.parse(request.body);
    const totalMembers = await prisma.member.count();
    const member = await prisma.member.create({
        data: {
            memberCode: buildMemberCode(totalMembers + 1),
            fullName: data.fullName,
            phone: data.phone,
            email: data.email,
            dob: data.dob ? new Date(data.dob) : undefined,
            gender: data.gender,
            address: data.address,
            department: data.department,
            status: data.status,
            emergencyContactName: data.emergencyContactName,
            emergencyContactPhone: data.emergencyContactPhone,
            photoUrl: data.photoUrl,
        },
    });
    response.status(201).json({ member });
});
apiRouter.get("/qr/active", async (_request, response) => {
    const activeSession = await prisma.sundayQrSession.findFirst({
        where: { status: QrSessionStatus.ACTIVE },
        orderBy: { sessionDate: "desc" },
    });
    response.json({ session: activeSession });
});
apiRouter.post("/qr/sessions", requireAuth([Role.ADMIN]), async (request, response) => {
    const sessionDate = request.body?.sessionDate
        ? new Date(String(request.body.sessionDate))
        : new Date();
    const session = await prisma.sundayQrSession.create({
        data: {
            sessionDate,
            qrHash: buildQrHash(sessionDate),
            status: QrSessionStatus.SCHEDULED,
            createdByUserId: response.locals.auth?.userId,
        },
    });
    response.status(201).json({ session });
});
apiRouter.post("/attendance/scan", async (request, response) => {
    const today = new Date();
    if (today.getDay() !== 0) {
        return response.status(403).json({
            message: "Attendance scanning is only active on Sundays.",
        });
    }
    const data = attendanceSchema.parse(request.body);
    const scanDate = normalizeToDateOnly(today);
    const existingAttendance = await prisma.attendanceRecord.findFirst({
        where: {
            memberId: data.memberId,
            scanDate,
            serviceSession: data.serviceSession,
        },
    });
    if (existingAttendance) {
        return response.json({
            message: "Duplicate scan detected",
            attendance: existingAttendance,
        });
    }
    const attendance = await prisma.attendanceRecord.create({
        data: {
            memberId: data.memberId,
            qrSessionId: data.qrSessionId,
            scanDate,
            entryTimestamp: today,
            serviceSession: data.serviceSession,
            source: AttendanceSource.QR,
        },
    });
    response.status(201).json({ attendance });
});
apiRouter.post("/attendance/manual-override", requireAuth([Role.ADMIN, Role.PASTOR]), async (request, response) => {
    const data = manualOverrideSchema.parse(request.body);
    const overrideDate = new Date(data.date);
    const scanDate = normalizeToDateOnly(overrideDate);
    const attendance = await prisma.attendanceRecord.upsert({
        where: {
            memberId_scanDate_serviceSession: {
                memberId: data.memberId,
                scanDate,
                serviceSession: data.serviceSession,
            },
        },
        update: {
            source: AttendanceSource.MANUAL,
        },
        create: {
            memberId: data.memberId,
            scanDate,
            entryTimestamp: overrideDate,
            serviceSession: data.serviceSession,
            source: AttendanceSource.MANUAL,
        },
    });
    const manualOverride = await prisma.manualOverride.create({
        data: {
            memberId: data.memberId,
            date: overrideDate,
            reason: data.reason,
            addedByUserId: response.locals.auth?.userId,
        },
    });
    response.status(201).json({ attendance, manualOverride });
});
apiRouter.get("/reports/sunday-summary", requireAuth([Role.ADMIN, Role.PASTOR]), async (request, response) => {
    const date = request.query.date
        ? new Date(String(request.query.date))
        : new Date();
    const { start, end } = buildDateRange(date);
    const attendance = await prisma.attendanceRecord.findMany({
        where: {
            scanDate: {
                gte: start,
                lt: end,
            },
        },
        include: {
            member: true,
        },
    });
    const totalCount = attendance.length;
    const byDepartment = attendance.reduce((acc, record) => {
        const department = record.member.department ?? "Unassigned";
        acc[department] = (acc[department] ?? 0) + 1;
        return acc;
    }, {});
    response.json({
        summary: {
            date: start.toISOString(),
            totalCount,
            byDepartment,
        },
    });
});
