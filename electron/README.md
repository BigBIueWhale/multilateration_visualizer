# Purpose
Electron app that renders a 3d scene with Orbit control and displays Voxels based on the frames received from the Rust gRPC server via a stream response.

That allows us to visualize the quality and accuracy of multilateration tracking in realtime.

# Dev Dependencies
1. Being online during `npm install` (having access to npm server for libraries)
2. Install `dev_environment/node-v20.11.0-x64.msi` on Windows or run `dev_environment/install_correct_node_version.sh` on Linux (need to run as sudo, then re-run according to usage instructions).
3. Developed with Windows 10 22H2
4. Developed with VS Code 1.87.0
5. Extension: Material Icon Theme v4.34.0 by Philipp Kief
6. Extension: Prettier - Code formatter v10.1.0 by Prettier
7. Extension: Todo Tree v0.0.226 by Gruntfuggly
8. Extension: vscode-proto3 v0.5.5 by zxh404

# Build
1. Navigate to `/protobuf` and run in CMD window: `unzip.bat --platform win64` then: `compile_ts_proto.bat`

TODO: Add a `compile_ts_proto.sh` so that the app can be built on Linux / MacOS.

2. Open the folder `/electron` in VS Code- so that debugging works (VS Code knows what project to run when choosing to debug)

3. Run `npm install` while online. The `node_modules` folder can then be transferred to an offline computer (transfer only works with the same OS) to work on this Electron app offline

4. Run `npm run build` and wait ~2 minutes for exit code 0 in building both `main` and `renderer`

5. Run `npm run start` to launch the Electron app for development purposes.

6. Click Run -> Start Debugging (F5) in VS Code menu bar to launch the Electron app in debug mode (allows to set breakpoints in `main`, not renderer). Uses the `/electron/.vscode/launch.json` that comes with Electron React Boilerplate

7. Run `npm run package` to create an installer exe in `release` folder that can then be distributed to any Windows 10+ computer (assuming the installer was built on Windows)

# Original Template
Electron React TypeScript based on Electron React Boilerplate. See `electron/.git.readme/remote.txt`

## Customization
A few things are customized compared to the default Electron React Boilerplate repo:
* `shared` folder with infrastructure for statically typed communication between `main` and renderer via Inter Process Communication. This includes: Remote Procedural Calls initiated by `renderer` to call a function in `main` (`electron/src/shared/src/ipc/clientToServer.ts`), and push notifications initiated by `main` to trigger anyone listening in `renderer` (`electron/src/shared/src/ipc/serverToClient.ts`)
* A couple important Inter Process Communication functions exposed in `electron/src/main/preload.ts` for access in the renderer
* Custom Material UI (@mui) based GUI
* Toast implementation for pop-up messages to show user
* Main server application handled in one main class `electron/src/main/src/MyApp.ts`, that is instantiated, initialized, and cleaned up in `electron/src/main/main.ts`
* Type checking by default when building. electron-react-boilerplate has `transpileOnly: true` enabled in webpack.config.base so I disabled it to enable type checking.
* `protobuf/compile_ts_proto.bat` generates a ts file that is required for building this project: `electron/src/shared/src/proto/grpc_api.ts`
* Version number, project name, description, contact information, contributers, website etc. were updates in the package.json files.
* Icon was changed to this project's icon.
