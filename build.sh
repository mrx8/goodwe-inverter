#!/bin/bash
version=$(cat package.json | grep version | cut -d '"' -f4)
docker build . -t goodwe-inverters:$version
