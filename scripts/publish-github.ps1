# Publish shop-logbook to GitHub Pages (run after: gh auth login)
$ErrorActionPreference = 'Stop'
$env:PATH = "$env:LOCALAPPDATA\MinGit\cmd;$env:LOCALAPPDATA\gh-cli\bin;$env:PATH"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

gh auth status | Out-Null
$owner = gh api user -q .login
$siteUrl = "https://$owner.github.io/shop-logbook/"
Write-Host "GitHub user: $owner"
Write-Host "Site URL: $siteUrl"

$qr = Join-Path $root 'public\qr.html'
$qrText = Get-Content $qr -Raw
$qrText = $qrText -replace "https://YOUR_USERNAME\.github\.io/shop-logbook/", $siteUrl
Set-Content $qr -Value $qrText -NoNewline

foreach ($file in @('GITHUB.md', 'GO-LIVE.md', 'README.md')) {
  $path = Join-Path $root $file
  if (Test-Path $path) {
    $text = Get-Content $path -Raw
    $text = $text -replace 'YOUR_USERNAME', $owner
    Set-Content $path -Value $text -NoNewline
  }
}

git add public/qr.html GITHUB.md GO-LIVE.md README.md
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  git commit -m "Set GitHub Pages site URL for $owner"
}

$remote = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) { $remote = $null }
if (-not $remote) {
  gh repo create shop-logbook --public --source=. --remote=origin --push
} else {
  git push -u origin main
}

gh api --method POST "repos/$owner/shop-logbook/pages" -f build_type=workflow 2>$null | Out-Null
Write-Host ""
Write-Host "Done. GitHub Actions will deploy in ~1-2 minutes."
Write-Host "Live at: $siteUrl"
