@echo off
cd /d "%~dp0"
set PORT=8000
set URL=http://localhost:%PORT%/przewodnik-gotowania.html

set IP=
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do if not defined IP set IP=%%a
if defined IP (
  set IP=%IP: =%
  echo Na telefonie w tej samej sieci Wi-Fi: http://%IP%:%PORT%/przewodnik-gotowania.html
  echo ^(tylko podglad w przegladarce - instalacja i tryb offline wymagaja HTTPS, patrz Instrukcja^)
)

where python >nul 2>nul
if %errorlevel%==0 (
  start "" "%URL%"
  echo Serwer dziala: %URL%  (zatrzymanie: Ctrl+C)
  python -m http.server %PORT%
  goto :eof
)

where npx >nul 2>nul
if %errorlevel%==0 (
  start "" "%URL%"
  echo Serwer dziala: %URL%  (zatrzymanie: Ctrl+C)
  npx --yes http-server -p %PORT% -c-1
  goto :eof
)

echo Nie znaleziono Pythona ani Node.js. Zainstaluj jedno z nich i uruchom ponownie.
pause
