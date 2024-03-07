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

# Dev Dependencies
1. Node.JS npm
2. Being online (having access to npm server for libraries)

# Build
1. Navigate to `/protobuf` and run `compile_ts_proto.bat`.

TODO: Add a `compile_ts_proto.sh` so that the app can be built on Linux / MacOS.

2. Install `/dev_environment/node-v20.11.0-x64.msi` on Windows or run `/dev_environment/install_correct_node_version.sh` on Linux (need to run as sudo).

3. 
