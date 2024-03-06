@echo off

echo Compiling protobuf files

echo Navigate to the folder in case the user ran this batch file from root directory of the project.
cd protobuf

echo Checking for grpc_api.ts
if exist "%CD%\..\electron\src\shared\src\proto\grpc_api.ts" (
    echo Deleting "%CD%\..\electron\src\shared\src\proto\grpc_api.ts"
    del "%CD%\..\electron\src\shared\src\proto\grpc_api.ts"
)

echo Compiling for TypeScript using ts-proto
"./precompiled/protobuf_compiler/protoc-25.2/bin/protoc.exe" --plugin=protoc-gen-ts_proto="%CD%/../electron/node_modules/.bin/protoc-gen-ts_proto.cmd" --ts_proto_out="%CD%/../electron/src/shared/src" --ts_proto_opt=outputServices=grpc-js "./proto/grpc_api.proto"
