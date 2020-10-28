#!/bin/sh

db="geeklistdb"
dbip="127.0.0.1"
dbport="5984"

read ddoc

rev=$(curl "http://$dbip:$dbport/$db/_design/$ddoc" | jq -s '.[0]._rev')

if [ "$rev" != "null" ]; then
  echo "$ddoc already exists with revision $rev. Overwrite? [YN]"
  read ow
else
  ow="Y"
fi

if [ $ow = "Y" ]; then
  echo "Importing $ddoc"
  if [ "$rev" != "null"]; then
    cat design_docs/$ddoc.json | jq "._rev=$rev" | curl -d @- -H "Content-type: application/json" -X PUT "http://$dbip:$dbport/$db/_design/$ddoc"
  else
    cat design_docs/$ddoc.json | curl -d @- -H "Content-type: application/json" -X PUT "http://$dbip:$dbport/$db/_design/$ddoc"
  fi
fi
