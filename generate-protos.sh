#!/bin/bash
set -euxo pipefail
PROTOC_ARGS='--proto_path=proto --go_out=gen/proto --go_opt=paths=source_relative --go-grpc_out=gen/proto --go-grpc_opt=paths=source_relative --grpc-gateway_out=gen/proto --grpc-gateway_opt=paths=source_relative --js_out=import_style=commonjs,binary:web/gen/proto --grpc-web_out=import_style=typescript,mode=grpcwebtext:web/gen/proto'

mkdir -p gen/proto
mkdir -p web/gen/proto
protoc $PROTOC_ARGS proto/campsite/v1/*.proto
protoc $PROTOC_ARGS proto/google/api/*.proto
