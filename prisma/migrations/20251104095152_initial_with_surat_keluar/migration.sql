-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "StatusDisposisi" AS ENUM ('SELESAI');

-- CreateEnum
CREATE TYPE "PengolahSurat" AS ENUM ('KETUA_DPRD', 'WAKIL_KETUA_1', 'WAKIL_KETUA_2', 'WAKIL_KETUA_3', 'SEKWAN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surat_masuk" (
    "id" TEXT NOT NULL,
    "noUrut" INTEGER NOT NULL,
    "nomorSurat" TEXT NOT NULL,
    "tanggalSurat" TIMESTAMP(3) NOT NULL,
    "asalSurat" TEXT NOT NULL,
    "perihal" TEXT NOT NULL,
    "keterangan" TEXT,
    "filePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "surat_masuk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disposisi" (
    "id" TEXT NOT NULL,
    "nomorDisposisi" TEXT,
    "noUrut" INTEGER NOT NULL,
    "tanggalDisposisi" TIMESTAMP(3) NOT NULL,
    "tujuanDisposisi" TEXT NOT NULL,
    "isiDisposisi" TEXT NOT NULL,
    "keterangan" TEXT,
    "status" "StatusDisposisi" NOT NULL DEFAULT 'SELESAI',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "suratMasukId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "disposisi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surat_keluar" (
    "id" TEXT NOT NULL,
    "noUrut" INTEGER NOT NULL,
    "klas" TEXT NOT NULL,
    "pengolah" "PengolahSurat" NOT NULL,
    "tanggalSurat" TIMESTAMP(3) NOT NULL,
    "perihalSurat" TEXT NOT NULL,
    "kirimKepada" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "suratMasukId" TEXT,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "surat_keluar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "surat_masuk_noUrut_key" ON "surat_masuk"("noUrut");

-- CreateIndex
CREATE UNIQUE INDEX "surat_masuk_nomorSurat_key" ON "surat_masuk"("nomorSurat");

-- CreateIndex
CREATE UNIQUE INDEX "disposisi_nomorDisposisi_key" ON "disposisi"("nomorDisposisi");

-- CreateIndex
CREATE UNIQUE INDEX "surat_keluar_noUrut_key" ON "surat_keluar"("noUrut");

-- AddForeignKey
ALTER TABLE "surat_masuk" ADD CONSTRAINT "surat_masuk_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disposisi" ADD CONSTRAINT "disposisi_suratMasukId_fkey" FOREIGN KEY ("suratMasukId") REFERENCES "surat_masuk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disposisi" ADD CONSTRAINT "disposisi_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surat_keluar" ADD CONSTRAINT "surat_keluar_suratMasukId_fkey" FOREIGN KEY ("suratMasukId") REFERENCES "surat_masuk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surat_keluar" ADD CONSTRAINT "surat_keluar_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
