import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { ChurchStatus, LeadStatus, PrismaClient, Role } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run the seed script.");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPasswordHash = await bcrypt.hash("SmartChurch123!", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@smartchurch.local" },
    update: {},
    create: {
      email: "admin@smartchurch.local",
      passwordHash: adminPasswordHash,
      phone: "08000000000",
      role: Role.ADMIN,
    },
  });

  const leadSeedData = {
    churchName: "Living Faith Assembly",
    logoUrl: "https://placehold.co/160x160/png?text=LFA",
    contactName: "Pastor Segun Awolumate",
    contactEmail: "pastor@livingfaithassembly.org",
    contactPhone: "08030000000",
    address: "12 Church Avenue, Ikeja",
    city: "Lagos",
    denomination: "Pentecostal",
    membershipSize: "500-1000",
    branchCount: 2,
    serviceDays: "Sunday, Wednesday",
    serviceTimes: "7:30 AM, 9:30 AM, 5:00 PM",
    preferredFeaturesJson: [
      "Attendance dashboard",
      "QR check-in",
      "Absentee follow-up",
      "PDF/CSV reports",
    ],
    preferredChannelsJson: ["Email", "WhatsApp"],
    requirementsNotes:
      "Need two-service support and branded member-facing experience.",
    status: LeadStatus.NEW,
  };
  const existingLead = await prisma.churchLead.findFirst({
    where: { contactPhone: leadSeedData.contactPhone },
  });
  const lead = existingLead
    ? await prisma.churchLead.update({
        where: { id: existingLead.id },
        data: leadSeedData,
      })
    : await prisma.churchLead.create({
        data: leadSeedData,
      });

  await prisma.church.upsert({
    where: { leadId: lead.id },
    update: {
      churchName: lead.churchName,
      logoUrl: lead.logoUrl,
      slug: "living-faith-assembly-demo",
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
      selectedFeaturesJson: lead.preferredFeaturesJson,
      communicationJson: lead.preferredChannelsJson,
      requirementsNotes: lead.requirementsNotes,
      status: ChurchStatus.SAMPLE_READY,
    },
    create: {
      leadId: lead.id,
      churchName: lead.churchName,
      logoUrl: lead.logoUrl,
      slug: "living-faith-assembly-demo",
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
      selectedFeaturesJson: lead.preferredFeaturesJson,
      communicationJson: lead.preferredChannelsJson,
      requirementsNotes: lead.requirementsNotes,
      status: ChurchStatus.SAMPLE_READY,
    },
  });

  const church = await prisma.church.findUniqueOrThrow({
    where: { leadId: lead.id },
  });

  await prisma.churchSampleWorkspace.upsert({
    where: { churchId: church.id },
    update: {
      projectName: "Living Faith Assembly Sample Workspace",
      subdomain: "living-faith-assembly-demo",
      adminEmail: lead.contactEmail,
      modulesJson: [
        "Church profile",
        "Branch setup",
        "Attendance dashboard",
        "QR check-in",
        "Absentee follow-up",
        "PDF/CSV reports",
      ],
      onboardingChecklistJson: [
        "Confirm branding assets",
        "Review service structure",
        "Approve member registration workflow",
        "Enable Sunday reporting",
        "Walk through sample dashboard",
      ],
      sampleDataJson: {
        branches: ["Main Campus", "Annex"],
        serviceTimes: ["7:30 AM", "9:30 AM", "5:00 PM"],
        sampleDepartments: ["Choir", "Ushering", "Media", "Children"],
      },
    },
    create: {
      churchId: church.id,
      projectName: "Living Faith Assembly Sample Workspace",
      subdomain: "living-faith-assembly-demo",
      adminEmail: lead.contactEmail,
      modulesJson: [
        "Church profile",
        "Branch setup",
        "Attendance dashboard",
        "QR check-in",
        "Absentee follow-up",
        "PDF/CSV reports",
      ],
      onboardingChecklistJson: [
        "Confirm branding assets",
        "Review service structure",
        "Approve member registration workflow",
        "Enable Sunday reporting",
        "Walk through sample dashboard",
      ],
      sampleDataJson: {
        branches: ["Main Campus", "Annex"],
        serviceTimes: ["7:30 AM", "9:30 AM", "5:00 PM"],
        sampleDepartments: ["Choir", "Ushering", "Media", "Children"],
      },
    },
  });

  await prisma.churchLead.update({
    where: { id: lead.id },
    data: { status: LeadStatus.CONVERTED },
  });

  console.log("Seed complete.");
  console.log("Admin login:", adminUser.email);
  console.log("Admin password: SmartChurch123!");
  console.log("Demo church lead: Living Faith Assembly");
  console.log("Demo church sample: living-faith-assembly-demo");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
