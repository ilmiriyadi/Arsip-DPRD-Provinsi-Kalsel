/*
  Warnings:

  - Added the required column `tanggalDiteruskan` to the `surat_masuk` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- First add the column with a default value
ALTER TABLE "surat_masuk" ADD COLUMN "tanggalDiteruskan" TIMESTAMP(3);

-- Update existing rows to use tanggalSurat as default value for tanggalDiteruskan
UPDATE "surat_masuk" SET "tanggalDiteruskan" = "tanggalSurat" WHERE "tanggalDiteruskan" IS NULL;

-- Make the column NOT NULL after updating existing data
ALTER TABLE "surat_masuk" ALTER COLUMN "tanggalDiteruskan" SET NOT NULL;
