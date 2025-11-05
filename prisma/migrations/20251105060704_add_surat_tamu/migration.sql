-- CreateTable
CREATE TABLE "surat_tamu" (
    "id" TEXT NOT NULL,
    "noUrut" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "keperluan" TEXT NOT NULL,
    "asalSurat" TEXT NOT NULL,
    "tujuanSurat" TEXT NOT NULL,
    "nomorTelpon" TEXT,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "surat_tamu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "surat_tamu_noUrut_key" ON "surat_tamu"("noUrut");

-- AddForeignKey
ALTER TABLE "surat_tamu" ADD CONSTRAINT "surat_tamu_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
