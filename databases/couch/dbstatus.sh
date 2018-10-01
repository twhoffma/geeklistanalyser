#!/bin/sh
curl http://localhost:5984/geeklistdb|jq

curl http://localhost:5984/_active_tasks
