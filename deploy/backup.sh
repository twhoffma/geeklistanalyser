#!/bin/bash

base="$HOME/backup/"
filebase="-geeklistdb.dump"
dest="$base`date +%Y%m%d-%H%M%S`$filebase"

couchdb-dump -b 100 "http://127.0.0.1:5984/geeklistdb" > $dest &&
gzip $dest &&
s3cmd put "$dest.gz" s3://hoffy-geeklistdb &&
find $dest -type f -name "*${filebase}.gz" -mtime +30 -delete

#TODO: Cleanup using find
#find /var/backups -type f -name "${media_basename}*" -mtime +$keep -delete
#dest="/var/backups/${basename}_`date +%Y%m%d-%H%M%S`.sql.xz"
#password and username for design docs in env var
