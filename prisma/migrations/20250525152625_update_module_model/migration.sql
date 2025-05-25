/*
  Warnings:

  - Added the required column `credits` to the `Module` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semester` to the `Module` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Module` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "semester" TEXT NOT NULL DEFAULT '1',
ADD COLUMN     "year" TEXT NOT NULL DEFAULT '1st',
ALTER COLUMN "totalClasses" SET DEFAULT 0,
ALTER COLUMN "requirement" SET DEFAULT 75;

-- Update existing records with proper year and semester values based on module codes
UPDATE "Module"
SET 
  "year" = CASE 
    WHEN SUBSTRING("code", 3, 1) = '1' THEN '1st'
    WHEN SUBSTRING("code", 3, 1) = '2' THEN '2nd'
    WHEN SUBSTRING("code", 3, 1) = '3' THEN '3rd'
    WHEN SUBSTRING("code", 3, 1) = '4' THEN '4th'
    ELSE '1st'
  END,
  "semester" = CASE 
    WHEN SUBSTRING("code", 4, 1) = '1' THEN '1'
    WHEN SUBSTRING("code", 4, 1) = '2' THEN '2'
    ELSE '1'
  END,
  "credits" = CASE 
    WHEN SUBSTRING("code", 5, 1) = '1' THEN 1
    WHEN SUBSTRING("code", 5, 1) = '2' THEN 2
    WHEN SUBSTRING("code", 5, 1) = '3' THEN 3
    WHEN SUBSTRING("code", 5, 1) = '4' THEN 4
    WHEN SUBSTRING("code", 5, 1) = '5' THEN 5
    WHEN SUBSTRING("code", 5, 1) = '6' THEN 6
    ELSE 3
  END;

-- Remove default values after adding the columns
ALTER TABLE "Module" ALTER COLUMN "year" DROP DEFAULT;
ALTER TABLE "Module" ALTER COLUMN "semester" DROP DEFAULT;
ALTER TABLE "Module" ALTER COLUMN "credits" DROP DEFAULT;
