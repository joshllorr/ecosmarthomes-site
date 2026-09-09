@echo off
cd /d "%~dp0"
echo ==============================================
echo EcoSmartHomes - Git Push to GitHub
echo ==============================================
git status
echo.
echo Staging modified files...
git add .
echo.
echo Committing EcoOS One-Page System and zero-jump navigation architecture...
git commit -m "feat(eco-os): deploy unified one page system with universal state bus, zero-reload workspace sheets and command palette"
echo.
echo Pulling latest changes from remote (rebase)...
git pull --rebase origin main
echo.
echo Pushing to GitHub (origin main)...
git push origin main
echo.
echo ==============================================
echo Push Complete!
echo ==============================================
pause
