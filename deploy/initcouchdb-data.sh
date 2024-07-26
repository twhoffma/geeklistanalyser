#!/bin/sh

set -a
. ./couchdb.env
set +a

echo "Loading data"
DB_IP="127.0.0.1"
DB_PORT="5984"

#curl -d @data/geeklists.json -H "Content-type: application/json" -X POST "http://${COUCHDB_RW_USER}:${COUCHDB_RW_PASSWORD}@$DB_IP:$DB_PORT/${COUCHDB_DB}/_bulk_docs"

curl -d @boardgameswrapped.json -H "Content-type: application/json" -X POST "http://${COUCHDB_RW_USER}:${COUCHDB_RW_PASSWORD}@$DB_IP:$DB_PORT/${COUCHDB_DB}/_bulk_docs"
