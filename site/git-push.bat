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
echo Committing Wallet Rescue Wizard and smart-nav syntax fixes...
git commit -m "fix(wizard): resolve syntax error in smart-nav.js, restore live carbon tax penalty clock, fuel selectors, range slider and shield deployment"
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
