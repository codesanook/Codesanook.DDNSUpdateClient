# Install "NSSM - the Non-Sucking Service Manager" from chocolatey 
# choco install nssm -y
# Create a logs folder

New-Item -Path "logs" -ItemType Directory -ErrorAction Ignore

$projectDir = "C:\projects\CodeSanook.DDNSUpdateClient"
nssm install UpdateDNS PowerShell -Command "Set-Location '$projectDir'; .\Start-UpdateDNS.ps1"
nssm set UpdateDNS Description "Update router's IP to noip.com periodically"

# Setup logging file
$logFolder = Join-Path $projectDir "logs"
$stdOutFile = Join-Path -Path $logFolder -ChildPath "std-out.txt"
$stdOutFile

$stdErrFile = Join-Path -Path $logFolder -ChildPath "std-err.txt"
$stdErrFile

nssm set UpdateDNS AppStdout $stdOutFile
nssm set UpdateDNS AppStderr $stdErrFile

$rotateInDay = 1 * 24 * 60
$rotateInBytes = 32 * 1024
nssm set UpdateDNS AppStdoutCreationDisposition 4
nssm set UpdateDNS AppStderrCreationDisposition 4
nssm set UpdateDNS AppRotateFiles 1
nssm set UpdateDNS AppRotateOnline 0
nssm set UpdateDNS AppRotateSeconds $rotateInDay 
nssm set UpdateDNS AppRotateBytes $rotateInBytes

nssm start UpdateDNS