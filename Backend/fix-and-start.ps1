Write-Host "🔧 Fixing Express version and installing dependencies..." -ForegroundColor Green
Write-Host ""

Write-Host "📦 Removing node_modules and package-lock.json..." -ForegroundColor Yellow
if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
if (Test-Path "package-lock.json") { Remove-Item -Force "package-lock.json" }

Write-Host ""
Write-Host "📥 Installing Express 4.18.2 and other dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "🚀 Starting the server..." -ForegroundColor Green
npm start

Read-Host "Press Enter to continue..."
