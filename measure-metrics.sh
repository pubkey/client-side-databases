#!/bin/sh
set -e

npm run build
npm run measure:size

npm run test:aws
npm run server:firebase:setup && npm run test:firebase
npm run test:pouchdb
npm run test:rxdb-pouchdb
npm run test:rxdb-lokijs
npm run test:rxdb-dexie
npm run test:watermelondb

npm run aggregate-metrics
