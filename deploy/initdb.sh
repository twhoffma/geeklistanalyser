#!/bin/sh

curl -X PUT http://127.0.0.1:5984/geeklistdb

curl -d @geeklists.json -H "Content-type: application/json" -X POST http://127.0.0.1:5984/geeklistdb/_bulk_docs

curl -d @views_geeklists.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/geeklists

curl -d @views_geeklist.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/geeklist

curl -d @views_boardgame.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/boardgame

curl -d @views_boardgamestats.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/boardgamestats

curl -d @views_geekliststats.json -H "Content-type: application/json" -X PUT http://127.0.0.1:5984/geeklistdb/_design/geekliststats
