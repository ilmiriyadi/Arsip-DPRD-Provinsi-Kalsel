# Script untuk membuat ZIP project untuk pengumpulan
# Otomatis exclude file/folder yang tidak perlu

$projectName = "Arsip-DPRD-Provinsi-Kalsel"
$timestamp = Get-Date -Format "yyyy-MM-dd"
$zipFileName = "${projectName}-${timestamp}.zip"
$tempFolder = "temp-zip-$timestamp"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  ZIP PROJECT FOR SUBMISSION" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Buat temporary folder
Write-Host "[1/4] Creating temporary folder..." -ForegroundColor Yellow
if (Test-Path $tempFolder) {
    Remove-Item $tempFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $tempFolder | Out-Null

# List folder/file yang di-exclude
$excludePatterns = @(
    "node_modules",
    ".next",
    "out",
    "dist",
    "build",
    ".turbo",
    ".cache",
    ".env",
    ".env.local",
    ".env.*.local",
    "*.db",
    "*.db-journal",
    "backups",
    "database-export",
    "*.backup",
    "*.bak",
    "*.old",
    "logs",
    "*.log",
    ".git",
    ".vscode",
    ".idea",
    "*.swp",
    "*.swo",
    ".DS_Store",
    "Thumbs.db",
    "desktop.ini",
    "coverage",
    "tmp",
    "temp",
    "*.tmp",
    "test-security.*",
    ".github",
    ".vercel",
    "*.tsbuildinfo",
    "temp-zip-*",
    "*.zip"
)

# Copy files dengan exclude
Write-Host "[2/4] Copying project files..." -ForegroundColor Yellow
$itemsToCopy = Get-ChildItem -Path . -Exclude $excludePatterns

$totalItems = $itemsToCopy.Count
$currentItem = 0

foreach ($item in $itemsToCopy) {
    $currentItem++
    $percent = [math]::Round(($currentItem / $totalItems) * 100)
    Write-Progress -Activity "Copying files" -Status "$percent% Complete" -PercentComplete $percent
    
    if ($item.PSIsContainer) {
        # Folder - copy dengan exclude
        $destPath = Join-Path $tempFolder $item.Name
        robocopy $item.FullName $destPath /E /NFL /NDL /NJH /NJS /nc /ns /np /XD $excludePatterns | Out-Null
    } else {
        # File - copy langsung
        Copy-Item $item.FullName -Destination $tempFolder -Force
    }
}

Write-Progress -Activity "Copying files" -Completed

# Buat .env.example jika belum ada
$envExamplePath = Join-Path $tempFolder ".env.example"
if (-not (Test-Path $envExamplePath)) {
    Write-Host "[3/4] Creating .env.example..." -ForegroundColor Yellow
    @"
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/arsip_dprd"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
"@ | Out-File -FilePath $envExamplePath -Encoding UTF8
}

# Buat ZIP
Write-Host "[4/4] Creating ZIP file..." -ForegroundColor Yellow
if (Test-Path $zipFileName) {
    Remove-Item $zipFileName -Force
}

Compress-Archive -Path "$tempFolder\*" -DestinationPath $zipFileName -CompressionLevel Optimal

# Cleanup
Remove-Item $tempFolder -Recurse -Force

# Summary
Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  SUCCESS!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "ZIP File Created: " -NoNewline
Write-Host $zipFileName -ForegroundColor Cyan
Write-Host "Location: " -NoNewline
Write-Host (Get-Location).Path -ForegroundColor Cyan
Write-Host ""

# Show file size
$zipSize = (Get-Item $zipFileName).Length
$zipSizeMB = [math]::Round($zipSize / 1MB, 2)
Write-Host "File Size: " -NoNewline
Write-Host "$zipSizeMB MB" -ForegroundColor Yellow
Write-Host ""

Write-Host "Excluded:" -ForegroundColor Gray
Write-Host "  - node_modules/" -ForegroundColor Gray
Write-Host "  - .next/ build files" -ForegroundColor Gray
Write-Host "  - .env files (secrets)" -ForegroundColor Gray
Write-Host "  - database files" -ForegroundColor Gray
Write-Host "  - logs & backups" -ForegroundColor Gray
Write-Host "  - IDE settings" -ForegroundColor Gray
Write-Host ""

Write-Host "Included:" -ForegroundColor Green
Write-Host "  [OK] Source code (app/, lib/, components/)" -ForegroundColor Green
Write-Host "  [OK] Prisma schema & migrations" -ForegroundColor Green
Write-Host "  [OK] Configuration files" -ForegroundColor Green
Write-Host "  [OK] .env.example template" -ForegroundColor Green
Write-Host "  [OK] README and documentation" -ForegroundColor Green
Write-Host ""

Write-Host "Ready for submission!" -ForegroundColor Cyan
Write-Host ""
