#!/bin/sh

curl 'http://127.0.0.1:5984/geeklistdb/_design/boardgame2' | jq -s '.' | cat
