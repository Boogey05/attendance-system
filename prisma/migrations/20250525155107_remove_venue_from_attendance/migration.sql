/*
  Warnings:

  - You are about to drop the column `venue` on the `Attendance` table. All the data in the column will be lost.
  - Added the required column `markedBy` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "venue",
ADD COLUMN     "markedBy" TEXT NOT NULL;
