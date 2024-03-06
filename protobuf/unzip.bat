@echo off
setlocal EnableDelayedExpansion

:: Get the directory of the script itself
set "SCRIPT_DIR=%~dp0"

:: Parse the command line arguments
set "platform=%~2"
if "%1" NEQ "--platform" goto usage
if "%platform%"=="" goto usage

:: Define the path to the zip file relative to the script's location
set "ZIP_FILE=%SCRIPT_DIR%precompiled\protobuf_compiler\protoc-25.2-%platform%.zip"

:: Delete the existing protoc-25.2 folder
rmdir /s /q "%SCRIPT_DIR%precompiled\protobuf_compiler\protoc-25.2"

:: Check if the zip file exists
if not exist "!ZIP_FILE!" (
    echo Zip file not found: !ZIP_FILE!
    exit /b 1
)

:: Unzip into a new folder
powershell -command "Expand-Archive -LiteralPath '!ZIP_FILE!' -DestinationPath '%SCRIPT_DIR%precompiled\protobuf_compiler\protoc-25.2' -Force"
goto :eof

:usage
echo Usage: %0 --platform ^<platform^>
echo Available platforms:
echo   - win32
echo   - win64
exit /b 1
