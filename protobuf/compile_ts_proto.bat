@echo off

echo Compiling protobuf files

echo Navigate to the folder in case the user ran this batch file from root directory of the project.
cd protobuf

echo Checking for ../shared/serialApiProto.ts
if exist "../electron/src/shared/serialApiProto.ts" (
    echo Deleting ../shared/serialApiProto.ts
    del "../electron/src/shared/serialApiProto.ts"
)

echo Compiling for TypeScript using ts-proto
"./precompiled/protobuf_compiler/protoc-25.2/bin/protoc.exe" --plugin=protoc-gen-ts_proto="%CD%/../electron/node_modules/.bin/protoc-gen-ts_proto.cmd" --ts_proto_out="%CD%/../electron/src/shared" --ts_proto_opt=outputServices=grpc-js "./proto/serial_api.proto"
