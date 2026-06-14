-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('REGULAR', 'NEW_MEMBER', 'FIRST_TIME_VISITOR');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "memberType" "MemberType" NOT NULL DEFAULT 'REGULAR';
