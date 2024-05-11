@echo off

REM Store the current directory
SET "original_dir=%CD%"

REM The purpose here is to avoid code duplication.
REM Define the types and gRPC API once in the .proto file, and then generate idiomatic TypeScript code, and Rust code!

echo Compiling protobuf files

echo Navigate to the folder in case the user ran this batch file from root directory of the project.
cd protobuf

echo Checking for grpc_api.ts
if exist "%original_dir%\..\electron\src\shared\src\proto\grpc_api.ts" (
    echo Deleting "%original_dir%\..\electron\src\shared\src\proto\grpc_api.ts"
    del "%original_dir%\..\electron\src\shared\src\proto\grpc_api.ts"
)

echo Checking for grpc_api_with_services.ts
if exist "%original_dir%\..\electron\src\shared\src\proto\grpc_api_with_services.ts" (
    echo Deleting "%original_dir%\..\electron\src\shared\src\proto\grpc_api_with_services.ts"
    del "%original_dir%\..\electron\src\shared\src\proto\grpc_api_with_services.ts"
)

echo Compiling for TypeScript with services using ts-proto
"./precompiled/protobuf_compiler/protoc-25.2/bin/protoc.exe" --plugin=protoc-gen-ts_proto="%original_dir%/../electron/node_modules/.bin/protoc-gen-ts_proto.cmd" --ts_proto_out="%original_dir%/../electron/src/shared/src" --ts_proto_opt=outputServices=grpc-js "./proto/grpc_api.proto" --ts_proto_opt=esModuleInterop=true
REM The reason we need to create 2 generated files is that the version without the services can be
REM safely imported from the renderer, which would normally cause an error of not having access to
REM any node.js libraries which are required by the grpc-js client server implementations.
echo Renaming...
cd "%original_dir%\..\electron\src\shared\src\proto"
ren "grpc_api.ts" "grpc_api_with_services.ts"
cd "%original_dir%"
echo Compiling for TypeScript without services using ts-proto
"./precompiled/protobuf_compiler/protoc-25.2/bin/protoc.exe" --plugin=protoc-gen-ts_proto="%original_dir%/../electron/node_modules/.bin/protoc-gen-ts_proto.cmd" --ts_proto_out="%original_dir%/../electron/src/shared/src" "./proto/grpc_api.proto" --ts_proto_opt=esModuleInterop=true
