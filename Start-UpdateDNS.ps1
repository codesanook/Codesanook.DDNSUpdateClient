while ($true) {
    try {
        Start-Process -FilePath "node" -ArgumentList @("./dist/index.js") -NoNewWindow -Wait
    }
    catch {
        $_.Exception
    }
    finally {
        Start-Sleep -Seconds (5 * 60)
    }
}