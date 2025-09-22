/*
  Warnings:

  - You are about to drop the column `longUrl` on the `Url` table. All the data in the column will be lost.
  - You are about to drop the column `shortCode` on the `Url` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[original]` on the table `Url` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[short]` on the table `Url` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `original` to the `Url` table without a default value. This is not possible if the table is not empty.
  - Added the required column `short` to the `Url` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Url_longUrl_key";

-- DropIndex
DROP INDEX "public"."Url_shortCode_key";

-- AlterTable
ALTER TABLE "public"."Url" DROP COLUMN "longUrl",
DROP COLUMN "shortCode",
ADD COLUMN     "original" TEXT NOT NULL,
ADD COLUMN     "short" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Url_original_key" ON "public"."Url"("original");

-- CreateIndex
CREATE UNIQUE INDEX "Url_short_key" ON "public"."Url"("short");
