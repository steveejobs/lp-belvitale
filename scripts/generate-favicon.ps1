param(
  [string]$Source = "galeria belvitale\logos belvitale\logo sem fundo preta.png",
  [string]$OutputDirectory = "public"
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path -LiteralPath $Source).Path
$outputPath = (Resolve-Path -LiteralPath $OutputDirectory).Path
$sourceBitmap = [System.Drawing.Bitmap]::FromFile($sourcePath)

try {
  $contentBounds = [System.Drawing.Rectangle]::FromLTRB(137, 86, 391, 342)
  $markBitmap = [System.Drawing.Bitmap]::new(
    $contentBounds.Width,
    $contentBounds.Height,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )

  for ($y = 0; $y -lt $contentBounds.Height; $y++) {
    for ($x = 0; $x -lt $contentBounds.Width; $x++) {
      $sourceColor = $sourceBitmap.GetPixel($contentBounds.X + $x, $contentBounds.Y + $y)
      $alpha = $sourceColor.A

      if ($alpha -ge 192) {
        $normalizedAlpha = 255
      }
      elseif ($alpha -le 8) {
        $normalizedAlpha = 0
      }
      else {
        $progress = $alpha / 192
        $normalizedAlpha = [int][Math]::Round(255 * $progress * $progress * (3 - 2 * $progress))
      }

      $markBitmap.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($normalizedAlpha, 0, 0, 0))
    }
  }

  function New-RoundedRectanglePath {
    param(
      [System.Drawing.RectangleF]$Bounds,
      [float]$Radius
    )

    $diameter = $Radius * 2
    $arc = [System.Drawing.RectangleF]::new($Bounds.X, $Bounds.Y, $diameter, $diameter)
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $path.AddArc($arc, 180, 90)
    $arc.X = $Bounds.Right - $diameter
    $path.AddArc($arc, 270, 90)
    $arc.Y = $Bounds.Bottom - $diameter
    $path.AddArc($arc, 0, 90)
    $arc.X = $Bounds.Left
    $path.AddArc($arc, 90, 90)
    $path.CloseFigure()
    return $path
  }

  function New-FaviconBitmap {
    param([int]$Size)

    $bitmap = [System.Drawing.Bitmap]::new($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $bitmap.SetResolution(96, 96)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

    try {
      $graphics.Clear([System.Drawing.Color]::Transparent)
      $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

      $inset = [Math]::Max(0.5, $Size * 0.015)
      $tileBounds = [System.Drawing.RectangleF]::new(
        [float]$inset,
        [float]$inset,
        [float]($Size - 2 * $inset),
        [float]($Size - 2 * $inset)
      )
      $tilePath = New-RoundedRectanglePath -Bounds $tileBounds -Radius ([float]($Size * 0.22))
      $whiteBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)

      try {
        $graphics.FillPath($whiteBrush, $tilePath)
      }
      finally {
        $whiteBrush.Dispose()
        $tilePath.Dispose()
      }

      $markSize = [int][Math]::Round($Size * 0.74)
      $markOffset = [int][Math]::Round(($Size - $markSize) / 2)
      $markBounds = [System.Drawing.Rectangle]::new(
        $markOffset,
        $markOffset,
        $markSize,
        $markSize
      )

      $graphics.DrawImage(
        $markBitmap,
        $markBounds,
        0,
        0,
        $markBitmap.Width,
        $markBitmap.Height,
        [System.Drawing.GraphicsUnit]::Pixel
      )
    }
    finally {
      $graphics.Dispose()
    }

    return $bitmap
  }

  function Save-Png {
    param(
      [int]$Size,
      [string]$Filename
    )

    $bitmap = New-FaviconBitmap -Size $Size
    try {
      $bitmap.Save((Join-Path $outputPath $Filename), [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
      $bitmap.Dispose()
    }
  }

  $pngExports = @(
    @{ Size = 16; Filename = "favicon-16x16.png" },
    @{ Size = 32; Filename = "favicon-32x32.png" },
    @{ Size = 48; Filename = "favicon-48x48.png" },
    @{ Size = 180; Filename = "apple-touch-icon.png" },
    @{ Size = 192; Filename = "favicon-192x192.png" },
    @{ Size = 512; Filename = "favicon.png" }
  )

  foreach ($export in $pngExports) {
    Save-Png -Size $export.Size -Filename $export.Filename
  }

  $icoSizes = @(16, 32, 48)
  $icoImages = foreach ($size in $icoSizes) {
    $bitmap = New-FaviconBitmap -Size $size
    $stream = [System.IO.MemoryStream]::new()
    try {
      $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
      [pscustomobject]@{ Size = $size; Bytes = $stream.ToArray() }
    }
    finally {
      $stream.Dispose()
      $bitmap.Dispose()
    }
  }

  $icoPath = Join-Path $outputPath "favicon.ico"
  $fileStream = [System.IO.File]::Open($icoPath, [System.IO.FileMode]::Create)
  $writer = [System.IO.BinaryWriter]::new($fileStream)
  try {
    $writer.Write([uint16]0)
    $writer.Write([uint16]1)
    $writer.Write([uint16]$icoImages.Count)
    $dataOffset = 6 + (16 * $icoImages.Count)

    foreach ($image in $icoImages) {
      $writer.Write([byte]$image.Size)
      $writer.Write([byte]$image.Size)
      $writer.Write([byte]0)
      $writer.Write([byte]0)
      $writer.Write([uint16]1)
      $writer.Write([uint16]32)
      $writer.Write([uint32]$image.Bytes.Length)
      $writer.Write([uint32]$dataOffset)
      $dataOffset += $image.Bytes.Length
    }

    foreach ($image in $icoImages) {
      $writer.Write($image.Bytes)
    }
  }
  finally {
    $writer.Dispose()
    $fileStream.Dispose()
  }
}
finally {
  if ($null -ne $markBitmap) {
    $markBitmap.Dispose()
  }
  $sourceBitmap.Dispose()
}
