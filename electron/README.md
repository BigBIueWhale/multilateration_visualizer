# Original Template
Electron React TypeScript based on Electron React Boilerplate. See `electron/.git.readme/remote.txt`

## Customization
A few things are customized compared to the default Electron React Boilerplate repo:
* `shared` folder with infrastructure for statically typed communication between `main` and renderer via Inter Process Communication. This includes: Remote Procedural Calls initiated by `renderer` to call a function in `main` (`electron/src/shared/src/ipc/clientToServer.ts`), and push notifications initiated by `main` to trigger anyone listening in `renderer` (`electron/src/shared/src/ipc/serverToClient.ts`)
* A couple important Inter Process Communication functions exposed in `electron/src/main/preload.ts` for access in the renderer
* Custom Material UI (@mui) based GUI
* Toast implementation for pop-up messages to show user
* Main server application handled in one main class `electron/src/main/src/MyApp.ts`, that is instantiated, initialized, and cleaned up in `electron/src/main/main.ts`
