#!/bin/bash

if [[ "$(uname)" == "Linux" ]]; then
    export MODE=development
elif [[ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" || "$(expr substr $(uname -s) 1 10)" == "MINGW64_NT" ]]; then
    set MODE=development
else
    echo "Unsupported operating system"
    exit 1
fi

npm run start:prod
