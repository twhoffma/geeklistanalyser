#!/bin/sh

echo "remove boardgames index"
curl -XDELETE 'http://127.0.0.1:9200/boardgames/'

echo "create boardgames index"
curl -XPUT 'http://127.0.0.1:9200/boardgames' -d @elastic_index_boardgames.json

