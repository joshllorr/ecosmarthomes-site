@echo off
cd /d "%~dp0"
echo ==============================================
echo EcoSmartHomes - Git Push to GitHub (v3.9.8)
echo ==============================================
git status
echo.
echo Staging all modified and mirrored files...
git add -A
echo.
echo Committing v3.9.8 release...
git commit -m "feat: deploy Day-1 Cashflow Decider, Cowboy Quote Defroster, and Van-to-Tender BoQ Locker (v3.9.8)"
echo.
echo Creating release tag v3.9.8-installer-boq-margin-locker...
git tag -a v3.9.8-installer-boq-margin-locker -m "Release v3.9.8: 90-Second Van-to-Tender BoQ & Margin Locker"
echo.
echo Pushing commits and tags to GitHub (origin main)...
git push origin main --tags
echo.
echo ==============================================
echo Push Complete! Production Deployed.
echo ==============================================
pause
