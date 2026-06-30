$lines = Get-Content 'D:\CarGarage\CarGarage\src\app\app.ts' -Encoding UTF8
$lines[0..471] | Set-Content 'D:\CarGarage\CarGarage\src\app\app_fixed.ts' -Encoding UTF8
Write-Host "Done. Written $($lines[0..471].Count) lines to app_fixed.ts"
