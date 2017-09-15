#!/bin/sh

sudo ssh -M -S /tmp/ssh-tun-couch -N toby@www.hoffy.no -L5984:127.0.0.1:15984 &

curl -H 'Content-Type: application/json' -X POST http://localhost:5984/_replicate -d ' {"source": "http://localhost:15984/geeklistdb", "target": "http://localhost:5984/geeklistdb2", "create_target": true, "continuous": true}'

ssh -S /tmp/ssh-tun-couch -0 exit toby@www.hoffy.no
