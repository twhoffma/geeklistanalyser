#!/bin/sh

echo "deleting db"
curl -X DELETE http://127.0.0.1:5984/geeklistdb

echo "creating db"
curl -X PUT http://127.0.0.1:5984/geeklistdb

echo "geeklist docs"
curl -d @data/geeklists.json -H "Content-type: application/json" -X POST http://127.0.0.1:5984/geeklistdb/_bulk_docs

echo "geeklists view"
curl -d @views_geeklists.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/geeklists

echo "geeklist view"
curl -d @views_geeklist.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/geeklist

echo "boardgame view"
curl -d @views_boardgame.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/boardgame

echo "boardgamestats view"
curl -d @views_boardgamestats.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/boardgamestats

echo "geekliststats view"
curl -d @views_geekliststats.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/geekliststats

echo "geeklistfilters view"
curl -d @views_geeklistfilters.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/geeklistfilters
