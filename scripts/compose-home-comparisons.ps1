$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = (Get-Location).Path
$before = Join-Path $root 'artifacts/home-audit-before'
$after = Join-Path $root 'artifacts/home-audit-after'

function New-SideBySide([string]$name, [string]$beforeName, [string]$afterName) {
  $beforePath = Join-Path $before $beforeName
  $afterPath = Join-Path $after $afterName
  if (!(Test-Path $beforePath) -or !(Test-Path $afterPath)) { return }
  $beforeImage = [System.Drawing.Image]::FromFile($beforePath)
  $afterImage = [System.Drawing.Image]::FromFile($afterPath)
  $canvasWidth = [int]$beforeImage.Width + [int]$afterImage.Width
  $canvasHeight = [Math]::Max([int]$beforeImage.Height, [int]$afterImage.Height)
  $canvas = New-Object System.Drawing.Bitmap -ArgumentList $canvasWidth, $canvasHeight
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  $graphics.Clear([System.Drawing.Color]::White)
  $graphics.DrawImage($beforeImage, 0, 0, $beforeImage.Width, $beforeImage.Height)
  $graphics.DrawImage($afterImage, $beforeImage.Width, 0, $afterImage.Width, $afterImage.Height)
  $outputPath = Join-Path $after $name
  $canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $canvas.Dispose()
  $beforeImage.Dispose()
  $afterImage.Dispose()
}

New-SideBySide 'compare-desktop-before-after.png' 'home-1440x900-full.png' 'home-1440x900-full.png'
New-SideBySide 'compare-mobile-390-before-after.png' 'home-390x844-full.png' 'home-390x844-full.png'
New-SideBySide 'compare-mobile-430-before-after.png' 'home-430x932-full.png' 'home-430x932-full.png'
New-SideBySide 'compare-first-viewport-mobile-before-after.png' 'first-viewport-mobile.png' 'first-viewport-mobile.png'
New-SideBySide 'compare-first-viewport-desktop-before-after.png' 'first-viewport-desktop.png' 'first-viewport-desktop.png'
New-SideBySide 'compare-hero-mobile-before-after.png' 'hero-mobile.png' 'hero-mobile.png'
New-SideBySide 'compare-hero-desktop-before-after.png' 'hero-desktop.png' 'hero-desktop.png'
New-SideBySide 'compare-product-before-after.png' 'product-390.png' 'product-390.png'
New-SideBySide 'compare-proof-before-after.png' 'proof-390.png' 'proof-390.png'
New-SideBySide 'compare-offers-before-after.png' 'offers-390.png' 'offers-390.png'
New-SideBySide 'compare-footer-before-after.png' 'footer-390.png' 'footer-390.png'
