#!/bin/sh

read ddoc
echo "Importing $ddoc"
curl -d "@design_docs/$ddoc.json" -H "Content-type: application/json" -X PUT "http://127.0.0.1:5984/geeklistdb/_design/$ddoc"

