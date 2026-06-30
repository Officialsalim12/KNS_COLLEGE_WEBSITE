# Builds deploy-package/ for Sector Link (httpdocs). Run from repo root:
#   powershell -ExecutionPolicy Bypass -File scripts/prepare-deploy.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$out = Join-Path $root 'deploy-package'

$excludeDirs = @('node_modules', '.git', '.githooks', 'deploy-package', 'iisnode', 'logs', '.cursor', '.vscode', '.idea', 'scripts', 'database')
$excludeFiles = @('.env', '.env.local', '.env.production', '.gitignore', 'render.yaml', 'README.md', 'server.js', 'package.json', 'package-lock.json', 'security-helpers.js', 'startup-test.js', 'setup-sender.js')

if (Test-Path $out) {
    Remove-Item $out -Recurse -Force
}
New-Item -ItemType Directory -Path $out | Out-Null

function ShouldSkipDir([string]$name) {
    return $excludeDirs -contains $name
}

function ShouldSkipFile([string]$name) {
    if ($excludeFiles -contains $name) { return $true }
    if ($name -like '.env*') { return $true }
    return $false
}

Get-ChildItem -Path $root -Force | ForEach-Object {
    if ($_.PSIsContainer) {
        if (ShouldSkipDir $_.Name) { return }
        Copy-Item -Path $_.FullName -Destination (Join-Path $out $_.Name) -Recurse -Force
    } else {
        if (ShouldSkipFile $_.Name) { return }
        Copy-Item -Path $_.FullName -Destination (Join-Path $out $_.Name) -Force
    }
}

$prodEnv = Join-Path $root '.env.production'
if (Test-Path $prodEnv) {
    Write-Host 'Note: .env.production is not included (API runs on Render, not Sector Link).'
}

$zip = Join-Path $root 'kns-deploy.zip'
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path (Join-Path $out '*') -DestinationPath $zip -Force

Write-Host ''
Write-Host 'Deploy package ready:'
Write-Host "  Folder: $out"
Write-Host "  Zip:    $zip"
Write-Host ''
Write-Host 'Upload contents of deploy-package/ to Sector Link httpdocs (static site only).'
Write-Host 'API + database run on Render (see render.yaml).'
