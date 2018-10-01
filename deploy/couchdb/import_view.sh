#!/bin/sh

read ddoc

rev=$(curl "http://127.0.0.1:5984/geeklistdb/_design/$ddoc" | jq -s '.[0]._rev')

if [ "$rev" != "null" ]; then
  echo "$ddoc already exists with revision $rev. Overwrite? [YN]"
  read ow
fi

if [ $ow = "Y" ]; then
  echo "Importing $ddoc"
  cat design_docs/$ddoc.json|jq "._rev=$rev" | curl -d @- -H "Content-type: application/json" -X PUT "http://127.0.0.1:5984/geeklistdb/_design/$ddoc"
fi
