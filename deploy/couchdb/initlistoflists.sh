#!/bin/sh


echo "geeklist docs"
curl -d @data/listsoflists.json -H "Content-type: application/json" -X POST http://127.0.0.1:5984/geeklistdb/_bulk_docs

