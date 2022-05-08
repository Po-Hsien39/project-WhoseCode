docker run --rm --ulimit cpu=2 --memory="20m" --cpus=".05" -v $(pwd)/scripts/$1:/execute.py python:3.9.12-alpine3.15 python3 /execute.py