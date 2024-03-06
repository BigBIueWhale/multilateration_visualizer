@echo off
SETLOCAL EnableDelayedExpansion

:: Get the directory of the script itself
SET "SCRIPT_DIR=%~dp0"

:: Remove trailing backslash from SCRIPT_DIR
SET "SCRIPT_DIR=!SCRIPT_DIR:~0,-1!"

:: Define the path to the protobuf compiler executable relative to the script's location
SET "PROTOC=!SCRIPT_DIR!\..\precompiled\protobuf_compiler\protoc-25.2\bin\protoc.exe"

:: Export the PROTOC environment variable
SETX PROTOC "%PROTOC%"

:: Run cargo build
cargo build --release
SET BUILD_STATUS=%ERRORLEVEL%

:: Check if cargo build was successful
IF NOT %BUILD_STATUS% == 0 (
    echo Cargo build failed with status: %BUILD_STATUS%
    exit /b %BUILD_STATUS%
)

echo Cargo build completed successfully.
ENDLOCAL
