#!/bin/sh

echo "setting up special dbs required by couch 3.0"
curl -X PUT http://127.0.0.1:5984/_users

curl -X PUT http://127.0.0.1:5984/_replicator

curl -X PUT http://127.0.0.1:5984/_global_changes


echo "deleting db"
curl -X DELETE http://127.0.0.1:5984/geeklistdb

echo "creating db"
curl -X PUT http://127.0.0.1:5984/geeklistdb

echo "geeklist docs"
curl -d @data/geeklists.json -H "Content-type: application/json" -X POST http://127.0.0.1:5984/geeklistdb/_bulk_docs

echo "geeklists view"
curl -d @design_docs/geeklists.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/geeklists

echo "geeklist view"
curl -d @design_docs/geeklist.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/geeklist

echo "boardgame view"
curl -d @design_docs/boardgame.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/boardgame
curl -d @design_docs/boardgame2.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/boardgame2


echo "boardgamestats view"
curl -d @design_docs/boardgamestats.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/boardgamestats

echo "geekliststats view"
curl -d @design_docs/geekliststats.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/geekliststats

echo "geeklistfilters view"
curl -d @design_docs/geeklistfilters.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/geeklistfilters
