param(
  [Parameter(Mandatory = $true)]
  [string]$OutputPath,

  [Parameter(Mandatory = $true, ValueFromRemainingArguments = $true)]
  [string[]]$InputPaths
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$images = [System.Collections.Generic.List[System.Drawing.Image]]::new()
try {
  foreach ($inputPath in $InputPaths) {
    $images.Add([System.Drawing.Image]::FromFile($inputPath))
  }

  $width = ($images | Measure-Object -Property Width -Maximum).Maximum
  $height = ($images | Measure-Object -Property Height -Sum).Sum
  $bitmap = [System.Drawing.Bitmap]::new(
    $width,
    $height,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )

  try {
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
      $graphics.Clear([System.Drawing.Color]::Transparent)
      $offset = 0
      foreach ($image in $images) {
        $graphics.DrawImageUnscaled($image, 0, $offset)
        $offset += $image.Height
      }
    }
    finally {
      $graphics.Dispose()
    }

    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $bitmap.Dispose()
  }
}
finally {
  foreach ($image in $images) {
    $image.Dispose()
  }
}
