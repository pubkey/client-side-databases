# Offline First Database Comparison

In this project I have implemented the exact same chat application with different database technologies.
You can use it to compare metrics and learn about the differences. The chat app is a web based **angular** application, with functionality similar to Whatsapp Web.

<p align="center">
  <img src="./orga/images/chat-app.png" alt="chat app" width="450" />
</p>

## Implemented Databases:
  - AWS Amplify Datastore
  - Firebase Firestore
  - [PouchDB](https://github.com/pouchdb/pouchdb) with IndexedDB adapter & CouchDB replication
  - [RxDB PouchDB](https://github.com/pubkey/rxdb) with PouchDB Storage & GraphQL replication
  - [RxDB LokiJS](https://rxdb.info/rx-storage-lokijs.html) with LokiJS Storage & GraphQL replication
  - [RxDB Dexie.js](https://rxdb.info/rx-storage-dexie.html) with Dexie.js Storage & GraphQL replication
  - [WatermelonDB](https://github.com/Nozbe/WatermelonDB) with LokiJS adapter (no backend sync atm)

## Metrics

All metrics are measured automatically via code in a browser tests (chrome:headless). The results heavily depend on the developers device. You should compare the values relative to another and not as absolute values. Also you might want to create new metrics that better represent how you would use the respective database.

You can reproduce these values by running `sh measure-metrics.sh` in the root folder.

<!-- !!! DO NOT EDIT THIS TABLE DIRECTLY, IT IS GENERATED BY ./scripts/aggregate-metrics.mjs !!! -->

| Metric \ Project                        | aws    | firebase | pouchdb | rxdb-dexie | rxdb-lokijs | rxdb-pouchdb | watermelondb |
| --------------------------------------- | ------ | -------- | ------- | ---------- | ----------- | ------------ | ------------ |
| First angular component render          | 219ms  | 265ms    | 187ms   | 219ms      | 204ms       | 201ms        | 232ms        |
| Page load time                          | 299ms  | 201ms    | 259ms   | 307ms      | 285ms       | 291ms        | 303ms        |
| First full render                       | 399ms  | 1343ms   | 832ms   | 623ms      | 615ms       | 919ms        | 329ms        |
| Insert one message                      | 17ms   | 330ms    | 19ms    | 38ms       | 15ms        | 29ms         | 8ms          |
| Inserting 20 messages one after another | 465ms  | 5919ms   | 275ms   | 243ms      | 186ms       | 300ms        | 122ms        |
| Inserting 20 messages in parallel       | 133ms  | 4521ms   | 102ms   | 237ms      | 52ms        | 293ms        | 111ms        |
| Message insert to message list change   | 43ms   | 14ms     | 158ms   | 19ms       | 8ms         | 21ms         | 3ms          |
| User change to message list change      | 14ms   | 95ms     | 138ms   | 44ms       | 4ms         | 126ms        | 2ms          |
| Message search query time               | 410ms  | 252ms    | 226ms   | 53ms       | 21ms        | 58ms         | 20ms         |
| First full render with many messages    | 382ms  | 1431ms   | 1305ms  | 766ms      | 539ms       | 1415ms       | 248ms        |
| Storage usage                           | 202kb  | 1094kb   | 1275kb  | 879kb      | 1981kb      | 1562kb       | 1730kb       |
| Bundle size, plain JavaScript           | 1627kb | 952kb    | 792kb   | 1136kb     | 1107kb      | 1142kb       | 956kb        |
| Bundle size, minified+gzip              | 374kb  | 235kb    | 190kb   | 279kb      | 263kb       | 283kb        | 217kb        |




### Metrics Explanation
- Page load time: How long does it take to download and parse the JavaScript bundle.
- First angular component render: How long does it take for the first angular component to be rendered.
- First full render: How long does it take until all relevant data is displayed for the first time.
- Insert one message: How long does it take to insert a single message.
- Inserting 20 messages one after another: How long does it take to insert 20 messages in serial.
- Inserting 20 messages in parallel: How long does it take to insert 20 messages in parallel.
- Message insert to message list change: How long does it take until a new message is rendered to the dom.
- User change to message list change: How long does it take from changing the user to the displaying of the new messages list.
- Message search query time: How long does it take to search for a given message by regex/like-operator.
- First full render with many messages: Time to first full render when many messages exist.
- Storage usage: Size of the stored IndexedDB database after inserting the full test dataset.
- Bundle size, plain JavaScript: The full JavaScript bundle size, without minification or gzip.
- Bundle size, minified+gzip: The full JavaScript bundle size after minification and gzip compression.

## Investigations

### Why is LokiJS so much faster?

WatermelonDB and the RxDB-LokiJS project use the [LokiJS](https://github.com/techfort/LokiJS) database as storage, which is an **in memory** database that regularly persists the data to IndexedDB either on interval, or when the browser tab is closed. By doing so, [less slow IndexedDB transaction are used](https://rxdb.info/slow-indexeddb.html). Keeping and processing the data in memory has the benefit of being much faster, but it also has its downsides:

- Initial page load is much slower when much data is already stored in the database, because all data must be loaded before any database operation can be done.
- All data must fit into memory.
- Data can be lost when the JavaScript process is killed ungracefully like when the browser crashes or the power of the PC is terminated.
- There is no multi-tab-support with plain LokiJS. The data is not shared between multiple browser tabs of the same origin. RxDB handles that by adding [its own](https://rxdb.info/rx-storage-lokijs.html) multi tab handling via the [BroadcastChannel module](https://github.com/pubkey/broadcast-channel).


### Why is Firebase so slow on first render?

On the first page load, Firebase ensures that the local data is equal to the server side state. This means that the client has to be online at application startup which is the reason why Firebase is not completely offline first. To ensure the equalness of client side data, Firebase has to perform several requests to the backend, before the database will respond to queries. This makes the inital page load slow, and it becomes even more slower, the more data exists and has to be validated.

### Why is PouchDB so slow?

For the PouchDB and RxDB (with PouchDB storage) I used the [old](https://www.npmjs.com/package/pouchdb-adapter-idb) Indexeddb adapter.
It is much less optimized than the [new](https://www.npmjs.com/package/pouchdb-adapter-indexeddb) adapter, but the new one made problems with returning the correct query results.
Theses problems have been fixed on the PouchDB master branch, but I have to wait for the next PouchDB release. I will update the repo when this change can be done.

### Why does AWS Datastore need so much less storage space?

AWS Datastore does not save any metadata together with the documents. Instead only the plain documents are stored in IndexedDB. They can do this because they only allow simple queries and do not keep a local version history.

## Feature Map

<!-- !!! DO NOT EDIT THIS TABLE DIRECTLY, IT IS GENERATED BY ./scripts/generate-feature-table.ts !!! -->

| Feature \ Project        | aws                | firebase                                     | pouchdb | rxdb-pouchdb | rxdb-lokijs | rxdb-dexie | watermelondb                           |
| ------------------------ | ------------------ | -------------------------------------------- | ------- | ------------ | ----------- | ---------- | -------------------------------------- |
| Offline First            | No, login required | Partially, must be online on first page load | **Yes** | **Yes**      | **Yes**     | **Yes**    | **Yes**                                |
| Realtime Replication     | **Yes**            | **Yes**                                      | **Yes** | **Yes**      | **Yes**     | **Yes**    | Partially, must be implemented by hand |
| Multi Tab Support        | **Yes**            | **Yes**                                      | No      | **Yes**      | **Yes**     | **Yes**    | Partially, relies on online sync       |
| Observable Queries       | No                 | **Yes**                                      | No      | **Yes**      | **Yes**     | **Yes**    | **Yes**                                |
| Complex Queries          | No                 | **Yes**                                      | **Yes** | **Yes**      | **Yes**     | **Yes**    | **Yes**                                |
| Client Side Encryption   | No                 | No                                           | **Yes** | **Yes**      | **Yes**     | **Yes**    | No                                     |
| Schema Support           | **Yes**            | No                                           | No      | **Yes**      | **Yes**     | **Yes**    | **Yes**                                |
| Custom Backend           | No                 | No                                           | No      | **Yes**      | **Yes**     | **Yes**    | **Yes**                                |
| Custom Conflict Handling | **Yes**            | No                                           | **Yes** | **Yes**      | No          | No         | No                                     |

## Starting the projects

All sub-projects use the same port and so can **not be started in parallel**.

### Installation

* You must have [installed Node.js](https://nodejs.org/en/download/)
* Clone this project
* In the root folder, run `npm install` to install the dependencies.
* In the root folder, run `npm run build` to build all projects.


### Firebase Firestore

* Run `npm run start:firebase` to start the mock server and the production build frontend.
* Or run `npm run dev:firebase` to start the mock server and the development frontend server.

* Open [http://localhost:3000/](http://localhost:3000/) to browse the frontend.

### AWS Amplify & Datastore

The official AWS mock does [not allow a live replication](https://github.com/aws-amplify/amplify-cli/issues/4155) at this point. So you first have to setup an amplify project in the `./projects/aws` folder by using [this tutorial](https://docs.amplify.aws/lib/datastore/getting-started/q/platform/js/)

* Run `npm run start:aws` to start the mock server and the production build frontend.
* Or run `npm run dev:aws` to start the mock server and the development frontend server.

* Open [http://localhost:3000/](http://localhost:3000/) to browse the frontend.

### PouchDB

* Run `npm run start:pouchdb` to start the mock server and the production build frontend.
* Or run `npm run dev:pouchdb` to start the mock server and the development frontend server.

* Open [http://localhost:3000/](http://localhost:3000/) to browse the frontend.

### RxDB PouchDB

* Run `npm run start:rxdb-pouchdb` to start the mock server and the production build frontend.
* Or run `npm run dev:rxdb-pouchdb` to start the mock server and the development frontend server.

* Open [http://localhost:3000/](http://localhost:3000/) to browse the frontend.

### RxDB LokiJS

* Run `npm run start:rxdb-lokijs` to start the mock server and the production build frontend.
* Or run `npm run dev:rxdb-lokijs` to start the mock server and the development frontend server.

* Open [http://localhost:3000/](http://localhost:3000/) to browse the frontend.

### RxDB Dexie.js

* Run `npm run start:rxdb-dexie` to start the mock server and the production build frontend.
* Or run `npm run dev:rxdb-dexie` to start the mock server and the development frontend server.

* Open [http://localhost:3000/](http://localhost:3000/) to browse the frontend.


### WatermelonDB

* Run `npm run start:watermelondb` to start the mock server and the production build frontend.
* Or run `npm run dev:watermelondb` to start the mock server and the development frontend server.

* Open [http://localhost:3000/](http://localhost:3000/) to browse the frontend.

## TODOs

Pull requests are welcomed. Please help implementing more examples:

- Meteor (with the IndexedDB offline first plugin).
- WatermelonDB backend replication.
- AWS Ampflify local backend mock with realtime replication.
- GunDB.
