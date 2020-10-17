#!/bin/bash
set -euxo pipefail

./generate-protos.sh
go generate ./...

mkdir -p build
go build -v -o build -trimpath ./apiserver
