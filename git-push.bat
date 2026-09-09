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
echo Committing Navigation and Persona Tab Portal Redirect Fixes...
git commit -m "fix(nav-audit): enable persona tab portal redirects, restore tools drawer initialization, and unblock direct tool navigation"
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
