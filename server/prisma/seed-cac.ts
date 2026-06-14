import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  BranchStatus,
  ChurchStatus,
  LeadStatus,
  PrismaClient,
  Role,
} from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run the seed script.");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

const CAC_SLUG = "cac-rejoice-arena-district-hq";

const CAC_LEAD = {
  churchName: "CAC Rejoice Arena District HQ",
  logoUrl:
    "https://smartchurch-cams.onrender.com/uploads/church-logos/church-logo-1781360751082-816484a3-96cb-4292-aa2f-bf7d69aaeff0.png",
  contactName: "Pastor Segun Awolumate",
  contactEmail: "cacrejoicearena@gmail.com",
  contactPhone: "08034094490",
  address:
    "Opposite Community Primary, Off Fayose Housing Estate Ado-Ekiti, Ado 360001, Ekiti",
  city: "Ado-Ekiti",
  denomination: "Christ Apostolic Church (CAC)",
  membershipSize: "1000+",
  branchCount: 3,
  serviceDays: "Sunday, Wednesday",
  serviceTimes: "7:00 AM",
  preferredFeaturesJson: [
    "Attendance dashboard",
    "QR check-in",
    "Absentee follow-up",
    "Member self-service portal",
    "PDF/CSV reports",
    "Multi-branch support",
  ],
  preferredChannelsJson: ["Email", "WhatsApp", "SMS", "Phone call"],
  requirementsNotes:
    "HQ-first rollout. Sunday attendance only in v1. Fresh digital registration. Single Sunday QR with 8 AM–1:30 PM window.",
  status: LeadStatus.CONVERTED,
};

async function main() {
  console.log("Seeding CAC Rejoice Arena District HQ...");

  // 1. Super admin user for internal SmartChurch team
  const internalAdminHash = await bcrypt.hash("SmartChurch123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@smartchurch.local" },
    update: {},
    create: {
      email: "admin@smartchurch.local",
      passwordHash: internalAdminHash,
      phone: "08000000000",
      role: Role.ADMIN,
    },
  });

  // 2. Church lead
  const existingLead = await prisma.churchLead.findFirst({
    where: { contactPhone: CAC_LEAD.contactPhone },
  });
  const lead = existingLead
    ? await prisma.churchLead.update({
        where: { id: existingLead.id },
        data: CAC_LEAD,
      })
    : await prisma.churchLead.create({ data: CAC_LEAD });

  // 3. Church record
  const churchData = {
    churchName: CAC_LEAD.churchName,
    logoUrl: CAC_LEAD.logoUrl,
    slug: CAC_SLUG,
    primaryContactName: CAC_LEAD.contactName,
    primaryContactEmail: CAC_LEAD.contactEmail,
    primaryContactPhone: CAC_LEAD.contactPhone,
    address: CAC_LEAD.address,
    city: CAC_LEAD.city,
    denomination: CAC_LEAD.denomination,
    membershipSize: CAC_LEAD.membershipSize,
    branchCount: CAC_LEAD.branchCount,
    serviceDays: CAC_LEAD.serviceDays,
    serviceTimes: CAC_LEAD.serviceTimes,
    selectedFeaturesJson: CAC_LEAD.preferredFeaturesJson,
    communicationJson: CAC_LEAD.preferredChannelsJson,
    requirementsNotes: CAC_LEAD.requirementsNotes,
    status: ChurchStatus.CONFIGURING,
  };

  await prisma.church.upsert({
    where: { leadId: lead.id },
    update: churchData,
    create: { leadId: lead.id, ...churchData },
  });

  const church = await prisma.church.findUniqueOrThrow({
    where: { leadId: lead.id },
  });

  // 4. Sample workspace
  await prisma.churchSampleWorkspace.upsert({
    where: { churchId: church.id },
    update: {
      projectName: "CAC Rejoice Arena District HQ Sample Workspace",
      subdomain: CAC_SLUG,
      adminEmail: CAC_LEAD.contactEmail,
      modulesJson: [
        "Church profile",
        "Branch setup",
        "Attendance dashboard",
        "QR check-in",
        "Absentee follow-up",
        "Member self-service portal",
        "PDF/CSV reports",
        "Multi-branch support",
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
          city: "Ado-Ekiti",
          membershipSize: "1000+",
          serviceDays: "Sunday, Wednesday",
          serviceTimes: "7:00 AM",
        },
        communicationChannels: ["Email", "WhatsApp", "SMS", "Phone call"],
        selectedFeatures: CAC_LEAD.preferredFeaturesJson,
        sampleDepartments: [
          "Choir",
          "Ushering",
          "Media",
          "Children",
          "Women's Ministry",
          "Men's Fellowship",
          "Sunday School",
        ],
        qrWindow: { openTime: "08:00", closeTime: "13:30" },
        reportRecipient: "Pastor Segun Awolumate",
      },
    },
    create: {
      churchId: church.id,
      projectName: "CAC Rejoice Arena District HQ Sample Workspace",
      subdomain: CAC_SLUG,
      adminEmail: CAC_LEAD.contactEmail,
      modulesJson: [
        "Church profile",
        "Branch setup",
        "Attendance dashboard",
        "QR check-in",
        "Absentee follow-up",
        "Member self-service portal",
        "PDF/CSV reports",
        "Multi-branch support",
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
          city: "Ado-Ekiti",
          membershipSize: "1000+",
          serviceDays: "Sunday, Wednesday",
          serviceTimes: "7:00 AM",
        },
        communicationChannels: ["Email", "WhatsApp", "SMS", "Phone call"],
        selectedFeatures: CAC_LEAD.preferredFeaturesJson,
        sampleDepartments: [
          "Choir",
          "Ushering",
          "Media",
          "Children",
          "Women's Ministry",
          "Men's Fellowship",
          "Sunday School",
        ],
        qrWindow: { openTime: "08:00", closeTime: "13:30" },
        reportRecipient: "Pastor Segun Awolumate",
      },
    },
  });

  // 5. Branches: HQ (active), Iwaro (inactive), Igbaye (inactive)
  const branches = [
    {
      name: "CAC Rejoice Arena HQ",
      slug: "hq",
      address:
        "Opposite Community Primary, Off Fayose Housing Estate Ado-Ekiti",
      city: "Ado-Ekiti",
      contactName: "Pastor Segun Awolumate",
      contactPhone: "08034094490",
      isHq: true,
      status: BranchStatus.ACTIVE,
    },
    {
      name: "CAC Rejoice Arena Iwaro",
      slug: "iwaro",
      address: null,
      city: "Ado-Ekiti",
      contactName: null,
      contactPhone: null,
      isHq: false,
      status: BranchStatus.INACTIVE,
    },
    {
      name: "CAC Rejoice Arena Igbaye",
      slug: "igbaye",
      address: null,
      city: "Ado-Ekiti",
      contactName: null,
      contactPhone: null,
      isHq: false,
      status: BranchStatus.INACTIVE,
    },
  ];

  for (const branchData of branches) {
    const existing = await prisma.branch.findFirst({
      where: { churchId: church.id, slug: branchData.slug },
    });

    if (existing) {
      await prisma.branch.update({
        where: { id: existing.id },
        data: branchData,
      });
    } else {
      await prisma.branch.create({
        data: { churchId: church.id, ...branchData },
      });
    }
  }

  // 6. Super Admin user for Pastor Segun Awolumate
  const pastorHash = await bcrypt.hash("Rejoice@2026", 10);
  const pastorUser = await prisma.user.upsert({
    where: { email: "cacrejoicearena@gmail.com" },
    update: {},
    create: {
      email: "cacrejoicearena@gmail.com",
      passwordHash: pastorHash,
      phone: "08034094490",
      role: Role.ADMIN,
    },
  });

  console.log("\nCAC Rejoice Arena District HQ — Seed complete.");
  console.log("─────────────────────────────────────────────");
  console.log("Church slug  :", CAC_SLUG);
  console.log("Church status:", ChurchStatus.CONFIGURING);
  console.log("Branches     : HQ (ACTIVE), Iwaro (INACTIVE), Igbaye (INACTIVE)");
  console.log("\nAdmin accounts:");
  console.log("  Internal admin  : admin@smartchurch.local / SmartChurch123!");
  console.log("  Pastor Segun    :", pastorUser.email, "/ Rejoice@2026");
  console.log("\nNext step     : Run the server and verify HQ branch setup");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
