#!/bin/sh
read ddoc
curl "http://127.0.0.1:5984/geeklistdb/_design/$ddoc" | jq -s '.[0]' | cat  
