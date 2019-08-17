#!/bin/sh

echo "remove boardgames index"
curl -XDELETE 'http://127.0.0.1:9200/boardgames/'
#curl -XDELETE 'http://127.0.0.1:9201/boardgames/'

echo "create boardgames index"
curl -XPUT 'http://127.0.0.1:9200/boardgames' -d @elastic_index_boardgames.json -H 'Content-Type: application/json'
#curl -XPUT 'http://127.0.0.1:9201/boardgames' -H 'Content-Type: application/json' -d @elastic_index_boardgames.json

