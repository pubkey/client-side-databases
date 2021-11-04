#!/bin/sh
npm run build
npm run measure:size

npm run test:aws
npm run server:firebase:setup && npm run test:firebase
npm run test:pouchdb
npm run test:rxdb
npm run test:rxdb-lokijs
npm run test:watermelondb

npm run aggregate-metrics
