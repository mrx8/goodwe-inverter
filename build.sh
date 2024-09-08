#!/bin/bash
version=$(cat package.json | grep version | cut -d '"' -f4)
docker buildx build --build-arg TZ=CET . -t goodwe-inverters:$version
