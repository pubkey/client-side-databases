# remove container if exists
# @link https://stackoverflow.com/a/45171589
docker container inspect couchdb && docker rm -f couchdb

# start new container with couchdb
docker run \
    --rm \
    --name couchdb \
    -p 5984:5984 \
trivago/couchdb-cors:latest