$files = Get-ChildItem "d:\dotnet-fullStack\docs\*.html"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8

    # Fix: the previous script replaced <meta charset="UTF-8"> with a broken line
    # Restore <meta charset> and have the favicon link follow it on the next line
    if ($content -match '`n  <link rel="icon"') {
        $content = $content -replace '`n  <link rel="icon" type="image/svg\+xml" href="favicon\.svg">', "<meta charset=`"UTF-8`">`n  <link rel=`"icon`" type=`"image/svg+xml`" href=`"favicon.svg`">"
        Set-Content $file.FullName $content -Encoding UTF8 -NoNewline
        Write-Host "Fixed: $($file.Name)"
    } else {
        Write-Host "OK (no fix needed): $($file.Name)"
    }
}
