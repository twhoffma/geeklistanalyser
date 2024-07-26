#!/bin/sh

#Still more to be done here and in applications themselves. Should actually want a read-only user for the middleware and a read/write user for the backend..
#https://docs.couchdb.org/en/2.2.0/intro/security.html

set -a
. ./couchdb.env
set +a

echo "setting up special dbs required by couch 3.0"
DB_IP="127.0.0.1"
DB_PORT="5984"

echo "_users"
curl -X PUT "http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@$DB_IP:$DB_PORT/_users" 

echo "_replicator"
curl -X PUT "http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@$DB_IP:$DB_PORT/_replicator"

echo "_global_changes"
curl -X PUT "http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@$DB_IP:$DB_PORT/_global_changes"

echo "deleting db"
curl -X DELETE "http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@$DB_IP:$DB_PORT/${COUCHDB_DB}"

echo "creating db"
curl -X PUT "http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@$DB_IP:$DB_PORT/${COUCHDB_DB}"

#Add a read/write user
echo "Add user ${COUCHDB_RW_USER}"
curl -X PUT "http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@$DB_IP:$DB_PORT/_users/org.couchdb.user:${COUCHDB_RW_USER}" \
     -H "Accept: application/json" \
     -H "Content-Type: application/json" \
     -d '{"name":"'"${COUCHDB_RW_USER}"'", "roles":[], "type":"user", "password":"'"${COUCHDB_RW_PASSWORD}"'"}'

echo "Assign grog as member to geeklistdb"
curl -X PUT "http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@$DB_IP:$DB_PORT/${COUCHDB_DB}/_security" \
  -H "Content-Type: application/json" \
  -d '{"admins": { "names": [], "roles": [] }, "members": { "names": ["'"${COUCHDB_RW_USER}"'"], "roles": [] } }'

#echo "geeklist docs"
#curl -d @data/geeklists.json -H "Content-type: application/json" -X POST http://$DB_IP:$DB_PORT/geeklistdb/_bulk_docs

echo "design_docs/geeklists.json (view)"
curl -d @couchdb/design_docs/geeklists.json -H "Content-type: application/json" -X PUT "http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@$DB_IP:$DB_PORT/geeklistdb/_design/geeklists"


echo "geeklist view"
curl -d @couchdb/design_docs/geeklist.json -H "Content-type: application/json" -X PUT "http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@$DB_IP:$DB_PORT/geeklistdb/_design/geeklist"


echo "boardgame view"
curl -d @couchdb/design_docs/boardgame.json -H "Content-type: application/json" -X PUT "http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@$DB_IP:$DB_PORT/geeklistdb/_design/boardgame"

#curl -d @couchdb/design_docs/boardgame2.json -H "Content-type: application/json" -X PUT http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@$DB_IP:$DB_PORT/geeklistdb/_design/boardgame2

echo "boardgamestats view"
curl -d @couchdb/design_docs/boardgamestats.json -H "Content-type: application/json" -X PUT "http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@$DB_IP:$DB_PORT/geeklistdb/_design/boardgamestats"


echo "geekliststats view"
curl -d @couchdb/design_docs/geekliststats.json -H "Content-type: application/json" -X PUT "http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@$DB_IP:$DB_PORT/geeklistdb/_design/geekliststats"


echo "geeklistfilters view"
curl -d @couchdb/design_docs/geeklistfilters.json -H "Content-type: application/json" -X PUT "http://${COUCHDB_USER}:${COUCHDB_PASSWORD}@$DB_IP:$DB_PORT/geeklistdb/_design/geeklistfilters"
