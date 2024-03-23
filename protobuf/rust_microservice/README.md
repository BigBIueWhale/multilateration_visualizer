# Purpose
Rust workhorse for the electron app of this project.

A CLI executable- gRPC server that provides an API specific for this application.

The heavy lifting, and the serial communication is done here.

# Dev Dependencies
1. If Windows:
    1. Visual Studio 2022 globally installed with C++ and CMake enabled.
    2. Add CMake to windows PATH if needed:
    ```text
    C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin>cmake --version
    cmake version 3.26.4-msvc4
    
    CMake suite maintained and supported by Kitware (kitware.com/cmake).
    ```
    3. Rust then installed via rustup and set to use MSVC (as opposed to MinGW):
    ```cmd
    C:\Users\user>cargo --version
    cargo 1.76.0 (c84b36747 2024-01-18)
    C:\Users\user>rustup --version
    rustup 1.26.0 (5af9b9484 2023-04-05)
    info: This is the version for the rustup toolchain manager, not the rustccompiler.
    info: The currently active `rustc` version is `rustc 1.76.0 (07dca489a2024-02-04)`
    ```
2. If Linux:
    1. `sudo apt install build-essential`
    2. Install this specific version of CMake version 3.26.4 from source on your Linux distro (sudo make install), just in case. This might be needed because some Rust libraries compile themselves using a global installation of CMake.
    3. Install Rust via Rustup after running 
3. VS Code 1.87.0 (User Setup) on Windows 10 22H2
4. C/C++ Extension Pack v1.3.0 by Microsoft
5. crates v0.6.6 by Seray Uzgur
6. Even Better TOML v0.19.2 Preview by tamasfe
7. Material Icon Theme v4.34.0 by Philipp Kief
8. rust-analyzer v0.3.1868 by The Rust Programming Language
9. Todo Tree v0.0.226 by Gruntfuggly
10. vscode-proto3 by zxh404
11. CodeLLDB v1.10.0 by Vadim Chugunov
12. Being online during build for crates.io index

# Build
1. Install the `Dependencies`
1. Run `protobuf/unzip.bat`, and read the outputed usage.
2. Based on the usage instructions, run: `protobuf/unzip.bat --platform your_platform`
3. Open `rust_microservice` folder in VS Code (not any encompassing folder)
4. Run `compile.bat` while online and wait for the build to succeed. All further calls to cargo need to be ran in the same PowerShell / CMD window as a window in which you have already ran `compile.bat`. This is because `compile.bat` sets the `PROTOC` environment variable locally in the terminal.
5. You can now use `target/release/grpc_microservice.exe` which must be ran before running the electron app.

# Develop
1. First follow `Build` instructions
2. Make sure VS Code is still open in `rust_microservice` folder.
3. Be connected to the internet during development.
4. Close VS Code and reopen `rust_microservice` folder to let rust-analyzer download the dependencies for the project
5. Once rust-analyzer is done, check that intellisense works.
6. Check that debug works by navigating to `main.rs` in VS Code and then clicking on Run -> Start Debugging (F5) in the VS Code menu bar.
7. If it asks you: choose `LLDB` (not C++) (that's why you need the extension).
8. If `.vscode/launch.json` doesn't exist, the debug will error out and then VS Code will ask you with a pop-up:
```text
Cargo.toml has been detected in this workspace.
Would you like to generate launch configurations for its targets?
```
In that case, click yes (that's what I did to get the launch.json).
9. If when trying to debug, the build fails with `protoc not found` error, first run `compile.bat` and only then try to debug.
10. Note: you can also click on the `Debug` button above the `async fn main()` function in VS Code, but Code LLDB is a better debugger. It also allows for more advanced debugging such as conditional breakpoints.

# Distributing
Look at `.cargo/config.toml`.

This is how it looks like when an executable was compiled in a way that's good for distributing to Windows users:
```cmd
C:\Users\user>"C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\14.37.32822\bin\Hostx64\x64\dumpbin.exe" /DEPENDENTS C:\Users\user\Desktop\multilateration_visualizer\protobuf\rust_microservice\target\release\grpc_microservice.exe
Microsoft (R) COFF/PE Dumper Version 14.37.32822.0
Copyright (C) Microsoft Corporation.  All rights reserved.


Dump of file C:\Users\user\Desktop\multilateration_visualizer\protobuf\rust_microservice\target\release\grpc_microservice.exe

File Type: EXECUTABLE IMAGE

  Image has the following dependencies:

    bcrypt.dll
    ADVAPI32.dll
    ws2_32.dll
    kernel32.dll
    ntdll.dll
    VCRUNTIME140.dll
    api-ms-win-crt-math-l1-1-0.dll
    api-ms-win-crt-runtime-l1-1-0.dll
    api-ms-win-crt-stdio-l1-1-0.dll
    api-ms-win-crt-locale-l1-1-0.dll
    api-ms-win-crt-heap-l1-1-0.dll

  Summary

        4000 .data
       13000 .pdata
       A0000 .rdata
        5000 .reloc
      158000 .text

C:\Users\user>
```
Notice that it requires a bunch of MSVC C/C++ runtime libraries.

A good executable will have this output from `dumpbin` utility:
```cmd
C:\Users\user>"C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\14.37.32822\bin\Hostx64\x64\dumpbin.exe" /DEPENDENTS C:\Users\user\Desktop\multilateration_visualizer\protobuf\rust_microservice\target\release\grpc_microservice.exe
Microsoft (R) COFF/PE Dumper Version 14.37.32822.0
Copyright (C) Microsoft Corporation.  All rights reserved.


Dump of file C:\Users\user\Desktop\multilateration_visualizer\protobuf\rust_microservice\target\release\grpc_microservice.exe

File Type: EXECUTABLE IMAGE

  Image has the following dependencies:

    bcrypt.dll
    ADVAPI32.dll
    ws2_32.dll
    kernel32.dll
    ntdll.dll

  Summary

        5000 .data
       14000 .pdata
       AC000 .rdata
        5000 .reloc
      168000 .text
        1000 _RDATA

C:\Users\user>
```

# Performance Profiling
1. Make sure you're using Rust version `stable-x86_64-pc-windows-msvc`.
2. Run `cargo build --release` (make sure that cargo.toml is configured to compile with debug symbols). If you want better debugging, run `$env:RUSTFLAGS="-C inline-threshold=0"; cargo build --release` in PowerShell to compile the Rust code while disabling inlining.
3. See the generated output: `target\release\grpc_microservice.exe`, `target\release\grpc_microservice.pdb`
4. Then use vs studio community (not vscode). Just open the .exe compiled with debug info, make the exe the default project and use the profiler. It works great! (see Reddit discussion https://www.reddit.com/r/rust/comments/stedol/comment/hx7zq0a/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button)

The settings I used were:
1. Open Visual Studio Community 2022 on Windows 10 22H2
2. Continue without code
3. Click `Debug` toolbar -> `Relaunch Performance Profiler`
4. In the newly opened `Analysis Target` page, click `Change Target` dropdown menu.
5. Choose `Executable` option from the dropdown menu.
6. Set `Path to executable` to `C:\Users\user\Desktop\multilateration_visualizer\protobuf\rust_microservice\target\release\grpc_microservice.exe` (change to the full path to the compiled Rust EXE with debug symbols enabled).
6. Set `Working directory:` to the containing folder of that exe. In my case: `C:\Users\user\Desktop\multilateration_visualizer\protobuf\rust_microservice\target\release`.
7. Click `Ok`.
8. In `Available Tools` section, check `CPU Usage` checkbox, and leave all other unchecked.
9. Click the ⚙`Settings` icon near `CPU Usage` to open Performance Profiler Property Pages window.
10. Change from `Default (1000 samples / second)` to `Low (100 samples / second)` and click Ok.
11. Check the checkbox `Start with collection paused`, and click `Start`.
12. A CMD window will open with the text: `Server listening on [::1]:50051`.
13. Go back the the Visual Studio window and click `⚪Record` (enable profiling).
14. Run the Electron GUI and press `CONNECT TO RUST`. Let the Rust work hard for ~2 minutes for a good sampling.
15. Press CTRL+C in the CMD window where the Rust app is running to gracefully stop the Rust program, and wait for Visual Studio to collect the analysis.
16. Visual Studio will automatically open a Report123xxx...diagsession tab with a function call stack (Hot path)
17. We want to see everything, so on the top-right choose: `Settings` and make sure that `Show Just My Code` is unchecked, and that `Show Native Code` is checked.
18. Click the blue text `Open details...`.
19. A pop-up file explorer window will appear: `Find Source: thread.rs` with hint: Original location: `/rustc/07dca489ac2d933c78d3c5158e3f43beefeb02ce/library\std\src\sys\windows\thread.rs`. Choose the up-to-date `thread.rs` file from the Rust installation folder. In my I pasted into `File name:` text box the full path to thread.rs: `C:\Users\user\.rustup\toolchains\stable-x86_64-pc-windows-msvc\lib\rustlib\src\rust\library\std\src\sys\windows\thread.rs`.
20. Generally speaking the standard library *.rs files can be found by starting in: `C:\Users\<your-username>\.rustup\toolchains\stable-x86_64-pc-windows-msvc\lib\rustlib\src\rust\library`. And following the `Original location:` hint (`library\`...).
20. If for a specific standard library *.rs file you don't actually care about the line-by-line analysis of that file, you can choose to click `Cancel` on the dialog and continue until you find your own source code (that is part of your PDB so Visual Studio will show you line-by-line analysis).
21. Actually you'll discover that that after choosing the full directory to `thread.rs` (or whichever is the first source file that Visual Studio requests), it automatically finds the rest of the source files of the standard library.
22. Change `Current View:` dropdown to `Call Tree` instead of the default `Caller/Callee`.
23. Click on `Total CPU [unit, %]` such that it's in descending order 🔽.
24. Click on `Show Hot Path` to bypass the junk and get to the important part (your own code).
25. Double-click on a row to see line-by-line analysis of which lines of code are slow.

### Result
This is how the analysis looks in the performance profiler:
![Performance Profiler Screenshot](/doc/performance_profiler.png)

Note: Code implementations that use Tokio cooperative multitasking actually obfuscate performance profiling results. For high performance code it's probably better to use real threads.
