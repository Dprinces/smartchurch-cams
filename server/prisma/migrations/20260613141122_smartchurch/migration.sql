-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MEMBER', 'ADMIN', 'PASTOR');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('NEW', 'ACTIVE', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "ServiceSession" AS ENUM ('GENERAL', 'FIRST_SERVICE', 'SECOND_SERVICE');

-- CreateEnum
CREATE TYPE "AttendanceSource" AS ENUM ('QR', 'MANUAL');

-- CreateEnum
CREATE TYPE "QrSessionStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'REVIEWING', 'QUALIFIED', 'CONVERTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ChurchStatus" AS ENUM ('DISCOVERY', 'CONFIGURING', 'SAMPLE_READY', 'LIVE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "memberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "memberCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "dob" TIMESTAMP(3),
    "gender" "Gender" NOT NULL,
    "address" TEXT NOT NULL,
    "department" TEXT,
    "status" "MemberStatus" NOT NULL DEFAULT 'NEW',
    "emergencyContactName" TEXT NOT NULL,
    "emergencyContactPhone" TEXT NOT NULL,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SundayQrSession" (
    "id" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "qrHash" TEXT NOT NULL,
    "status" "QrSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "activatedAt" TIMESTAMP(3),
    "deactivatedAt" TIMESTAMP(3),
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SundayQrSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "qrSessionId" TEXT,
    "scanDate" TIMESTAMP(3) NOT NULL,
    "entryTimestamp" TIMESTAMP(3) NOT NULL,
    "serviceSession" "ServiceSession" NOT NULL DEFAULT 'GENERAL',
    "source" "AttendanceSource" NOT NULL DEFAULT 'QR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SundayReport" (
    "id" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "breakdownJson" JSONB NOT NULL,
    "absenteeListJson" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SundayReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManualOverride" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "addedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManualOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchLead" (
    "id" TEXT NOT NULL,
    "churchName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "denomination" TEXT,
    "membershipSize" TEXT NOT NULL,
    "branchCount" INTEGER NOT NULL DEFAULT 1,
    "serviceDays" TEXT NOT NULL,
    "serviceTimes" TEXT NOT NULL,
    "preferredFeaturesJson" JSONB NOT NULL,
    "preferredChannelsJson" JSONB NOT NULL,
    "requirementsNotes" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChurchLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Church" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "churchName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "slug" TEXT NOT NULL,
    "primaryContactName" TEXT NOT NULL,
    "primaryContactEmail" TEXT,
    "primaryContactPhone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "denomination" TEXT,
    "membershipSize" TEXT NOT NULL,
    "branchCount" INTEGER NOT NULL DEFAULT 1,
    "serviceDays" TEXT NOT NULL,
    "serviceTimes" TEXT NOT NULL,
    "selectedFeaturesJson" JSONB NOT NULL,
    "communicationJson" JSONB NOT NULL,
    "requirementsNotes" TEXT,
    "status" "ChurchStatus" NOT NULL DEFAULT 'DISCOVERY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Church_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchSampleWorkspace" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "adminEmail" TEXT,
    "modulesJson" JSONB NOT NULL,
    "onboardingChecklistJson" JSONB NOT NULL,
    "sampleDataJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChurchSampleWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_memberId_key" ON "User"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_memberCode_key" ON "Member"("memberCode");

-- CreateIndex
CREATE UNIQUE INDEX "Member_phone_key" ON "Member"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SundayQrSession_qrHash_key" ON "SundayQrSession"("qrHash");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_memberId_scanDate_serviceSession_key" ON "AttendanceRecord"("memberId", "scanDate", "serviceSession");

-- CreateIndex
CREATE UNIQUE INDEX "SundayReport_reportDate_key" ON "SundayReport"("reportDate");

-- CreateIndex
CREATE UNIQUE INDEX "Church_leadId_key" ON "Church"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "Church_slug_key" ON "Church"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ChurchSampleWorkspace_churchId_key" ON "ChurchSampleWorkspace"("churchId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SundayQrSession" ADD CONSTRAINT "SundayQrSession_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_qrSessionId_fkey" FOREIGN KEY ("qrSessionId") REFERENCES "SundayQrSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualOverride" ADD CONSTRAINT "ManualOverride_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualOverride" ADD CONSTRAINT "ManualOverride_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Church" ADD CONSTRAINT "Church_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "ChurchLead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchSampleWorkspace" ADD CONSTRAINT "ChurchSampleWorkspace_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
