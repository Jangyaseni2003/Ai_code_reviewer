@echo off
echo 🔧 Fixing Express version and installing dependencies...
echo.

echo 📦 Removing node_modules and package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo 📥 Installing Express 4.18.2 and other dependencies...
npm install

echo.
echo 🚀 Starting the server...
npm start

pause
