<#
.SYNOPSIS
Explanation: When you create the trigger with New-ScheduledTaskTrigger, 
the time you specify is converted to UTC time and saved as a string in the trigger's StartBoundary property. On my machine, 10:15am produces a $trigger.StartBoundary of "2017-12-19T15:15:00Z", where the "Z" indicates UTC time. 
To specify a local time, we need to convert this date back into local time and remove the "Z"; 
we want "2017-12-19T10:15:00". 
The function parses the date string, converts it to local time, and formats it in the correct format.
Credit https://social.technet.microsoft.com/Forums/en-US/e1dad780-6a99-44f2-9688-041e7026854b/quotsynchronize-across-time-zonesquot-scheduled-task-option-and-newscheduledtasktrigger?forum=winserverpowershell
#>
function Disable-SynchronizeTimeZone {
    param(
        [parameter(ValueFromPipeline)] 
        [CimInstance] $trigger 
    )
    $newTrigger = $trigger.Clone()
    $newTrigger.StartBoundary = [DateTime]::Parse($trigger.StartBoundary).ToLocalTime().ToString("s")
    $newTrigger
}

# Specify the trigger settings in UTC time, the instance need to set time to UTC
$trigger = New-ScheduledTaskTrigger -At "6:50pm" -Daily | Disable-SynchronizeTimeZone #1.50am BKK time
$user = "NT AUTHORITY\SYSTEM" # Specify the account to run the script

$command = {
    New-Item -Path "c:/logs" -ItemType Directory -Force;
    $utcNow = [System.DateTime]::UtcNow.ToString("yyyy-MM-ddTHH-mm-ssZ")
    $logName = "shutdown-$utcNow.txt"
    "Instance shutdown at $utcNow" | Out-File "c:/logs/$logName";
    Stop-Computer -Force
}

$x = New-ScheduledTaskSettingsSet
$x.UseUnifiedSchedulingEngine = $false

$action = New-ScheduledTaskAction `
    -Execute "PowerShell.exe" `
    -Argument "-Command & { $command }" 

Register-ScheduledTask `
    -TaskName "ShutdownTheInstance" `
    -Trigger $trigger `
    -User $user `
    -Action $action `
    -RunLevel Highest `
    -Force