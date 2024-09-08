#!/bin/bash
version=$(cat package.json | grep version | cut -d '"' -f4)
docker buildx build . -t goodwe-inverters:$version
