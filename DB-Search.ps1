$Files = Get-ChildItem "$PSScriptRoot\_data\fetchdb"
$Cards = $Files | Foreach-Object -Process { $_ | Get-Content | Out-String | ConvertFrom-JSON}