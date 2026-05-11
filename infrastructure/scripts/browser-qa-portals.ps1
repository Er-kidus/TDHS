param(
  [string]$PatientPortalUrl = "http://localhost:3000/login",
  [string]$OrgPortalUrl = "http://localhost:3001/login",
  [switch]$OpenBrowser
)

$ErrorActionPreference = "Stop"

Write-Host "=== Tenadam Browser QA Script ===" -ForegroundColor Cyan
Write-Host "Patient Portal: $PatientPortalUrl"
Write-Host "Org Portal:     $OrgPortalUrl"
Write-Host ""
Write-Host "Checklist file:" -ForegroundColor Yellow
Write-Host "infrastructure/scripts/browser-qa-portals-checklist.md"
Write-Host ""

if ($OpenBrowser) {
  Write-Host "Opening browser tabs..." -ForegroundColor Green
  Start-Process $PatientPortalUrl
  Start-Process $OrgPortalUrl
}

$steps = @(
  "[Patient] Login -> Appointments -> + Book Appointment",
  "[Patient] Select nearby hospital card -> Confirm + Submit",
  "[Patient] View Details -> verify Nearby hospital block",
  "[Patient] Reschedule -> Save New Time -> verify time change",
  "[Patient] Cancel appointment -> verify status cancelled",
  "[Org] Login -> Appointments -> queue tab",
  "[Org] Queue date -> Reception Check-in -> verify arrived",
  "[Org] Click Call Next -> verify top waiting becomes in-progress",
  "[Org] Assign Resource -> Complete -> verify fulfilled",
  "[UI] Verify org appointments visual parity with patient page"
)

Write-Host "Exact click path checklist:" -ForegroundColor Yellow
for ($i = 0; $i -lt $steps.Count; $i++) {
  Write-Host (("{0}. {1}" -f ($i + 1), $steps[$i]))
}

Write-Host ""
Write-Host "Done. Follow the markdown checklist for detailed verification fields." -ForegroundColor Green
