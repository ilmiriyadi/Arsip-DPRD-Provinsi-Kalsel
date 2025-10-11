-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "surat_masuk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomorSurat" TEXT NOT NULL,
    "tanggalSurat" DATETIME NOT NULL,
    "asalSurat" TEXT NOT NULL,
    "perihal" TEXT NOT NULL,
    "keterangan" TEXT,
    "filePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "surat_masuk_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "disposisi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomorDisposisi" TEXT NOT NULL,
    "tanggalDisposisi" DATETIME NOT NULL,
    "tujuanDisposisi" TEXT NOT NULL,
    "isiDisposisi" TEXT NOT NULL,
    "keterangan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "suratMasukId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "disposisi_suratMasukId_fkey" FOREIGN KEY ("suratMasukId") REFERENCES "surat_masuk" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "disposisi_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "surat_masuk_nomorSurat_key" ON "surat_masuk"("nomorSurat");

-- CreateIndex
CREATE UNIQUE INDEX "disposisi_nomorDisposisi_key" ON "disposisi"("nomorDisposisi");
