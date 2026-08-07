param(
    [string]$SatelliteSource = "D:\Project Drive\DZ\road-overlay-work\chernarus-map\satellite-corrected",
    [string]$RoadSource = "D:\Project Drive\DZ\road-overlay-work\chernarus-map\test\data\chernarus-roads-overlay-final.geojson",
    [string]$RepositoryRoot = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($RepositoryRoot)) {
    $RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
} else {
    $RepositoryRoot = (Resolve-Path $RepositoryRoot).Path
}

$SatelliteTarget = Join-Path $RepositoryRoot "assets\chernarus-map\satellite-corrected"
$RoadTargetDir = Join-Path $RepositoryRoot "assets\chernarus-map\overlays\roads"
$RoadTarget = Join-Path $RoadTargetDir "chernarus-roads-overlay-final.geojson"

Write-Host "=== World War Z Chernarus Production Map Installer ==="
Write-Host "Repository: $RepositoryRoot"
Write-Host "Satellite:  $SatelliteSource"
Write-Host "Roads:      $RoadSource"
Write-Host ""

if (-not (Test-Path -LiteralPath $SatelliteSource -PathType Container)) {
    throw "Corrected satellite source was not found: $SatelliteSource"
}

if (-not (Test-Path -LiteralPath (Join-Path $SatelliteSource "0\0\0.jpg") -PathType Leaf)) {
    throw "The satellite source does not contain the expected root tile 0\0\0.jpg."
}

if (-not (Test-Path -LiteralPath $RoadSource -PathType Leaf)) {
    throw "Production road GeoJSON was not found: $RoadSource"
}

$sourceJpg = @(Get-ChildItem -LiteralPath $SatelliteSource -Recurse -File -Filter "*.jpg")
$sourceOther = @(Get-ChildItem -LiteralPath $SatelliteSource -Recurse -File | Where-Object { $_.Extension -notin @(".jpg", ".md") })

if ($sourceJpg.Count -ne 4810) {
    throw "Corrected satellite source contains $($sourceJpg.Count) JPG tiles; expected 4,810."
}

if ($sourceOther.Count -gt 0) {
    throw "Corrected satellite source contains unexpected non-JPG production files."
}

foreach ($zoom in 0..6) {
    $zoomPath = Join-Path $SatelliteSource ([string]$zoom)
    if (-not (Test-Path -LiteralPath $zoomPath -PathType Container)) {
        throw "Corrected satellite source is missing native zoom $zoom."
    }
}

$retiredPaths = @(
    (Join-Path $RepositoryRoot "assets\chernarus-map\overview.webp"),
    (Join-Path $RepositoryRoot "assets\chernarus-map\tile-report.json"),
    (Join-Path $RepositoryRoot "assets\chernarus-map\tiles"),
    (Join-Path $RepositoryRoot "assets\images\maps\chernarus-vector.svg")
)

Write-Host "Removing retired map assets..."
foreach ($path in $retiredPaths) {
    if (Test-Path -LiteralPath $path) {
        Remove-Item -LiteralPath $path -Recurse -Force
        Write-Host "  Removed: $path"
    }
}

Write-Host "Installing corrected satellite pyramid..."
New-Item -ItemType Directory -Path $SatelliteTarget -Force | Out-Null
Get-ChildItem -LiteralPath $SatelliteTarget -Force | Where-Object { $_.Name -ne "README.md" } | Remove-Item -Recurse -Force
foreach ($zoom in 0..6) {
    Copy-Item -LiteralPath (Join-Path $SatelliteSource ([string]$zoom)) -Destination $SatelliteTarget -Recurse -Force
}

Write-Host "Installing final production road GeoJSON..."
New-Item -ItemType Directory -Path $RoadTargetDir -Force | Out-Null
Copy-Item -LiteralPath $RoadSource -Destination $RoadTarget -Force

$installedJpg = @(Get-ChildItem -LiteralPath $SatelliteTarget -Recurse -File -Filter "*.jpg")
if ($installedJpg.Count -ne 4810) {
    throw "Installed satellite pyramid contains $($installedJpg.Count) JPG tiles; expected 4,810."
}

$pythonArgs = @((Join-Path $RepositoryRoot "scripts\validate_site.py"), "--require-map-assets")
$py = Get-Command py -ErrorAction SilentlyContinue
$python = Get-Command python -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Running strict website validation..."
if ($py) {
    & $py.Source @pythonArgs
} elseif ($python) {
    & $python.Source @pythonArgs
} else {
    throw "Python was not found. Install Python or run scripts\validate_site.py --require-map-assets manually."
}

if ($LASTEXITCODE -ne 0) {
    throw "Strict website validation failed."
}

Write-Host ""
Write-Host "SUCCESS"
Write-Host "Installed 4,810 corrected JPG satellite tiles."
Write-Host "Installed chernarus-roads-overlay-final.geojson."
Write-Host "The repository is ready for GitHub Pages validation/deployment."
