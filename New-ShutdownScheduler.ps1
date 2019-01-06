# Specify the trigger settings in UTC time, the instance need to set time to UTC
$trigger = New-ScheduledTaskTrigger -At '6:50pm' -Daily #1.50am BKK time

$user = "NT AUTHORITY\SYSTEM" # Specify the account to run the script
$utcNow = [System.DateTime]::UtcNow.ToString('yyyy-MM-ddTHH-mm-ssZ')
$logName = "shutdown-$utcNow.txt"

$command = 
    "New-Item -Path 'c:/logs' -ItemType Directory -Force;" +
    "'Shutdown at $utcNow' | Out-File 'c:/logs/$logName';" +
    "Stop-Computer -Force"

$action = New-ScheduledTaskAction `
    -Execute "PowerShell.exe" `
    -Argument "-Command $command" 

Register-ScheduledTask `
    -TaskName "ShutdownTheInstance" `
    -Trigger $trigger `
    -User $user `
    -Action $action `
    -RunLevel Highest `
    -Force