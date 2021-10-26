# Offline First Database Comparison

In this project I have implemented the exact same chat application with different database technologies.
You can use it to compare metrics and learn about the differences. The chat app is web based **angular** application, with functionality similar to Whatsapp Web.

<p align="center">
  <img src="./orga/images/chat-app.png" alt="chat app" width="450" />
</p>

## Implemented Databases:
  - AWS Ampflify Datastore
  - Firebase Firestore
  - PouchDB & CouchDB
  - RxDB & GraphQL
  - WatermelonDB (no backend sync atm)

## Metrics

All metrics are measured automatically via code in a browser tests (chrome). The results heavily depend on the developers device. You should compare the values relative to another and not as absolute values. Also you might want to create new metrics that better represent how you would use the respective database.

You can reproduce these values by running `sh measure-metrics.sh` in the root folder.

| Metric \ Project                        | aws              | firebase       | pouchdb           | rxdb              | watermelondb      |
| --------------------------------------- | ---------------- | -------------- | ----------------- | ----------------- | ----------------- |
| First angular component render          | 207ms            | 270ms          | 197ms             | 201ms             | 210ms             |
| Page load time                          | 294ms            | 178ms          | 271ms             | 284ms             | 293ms             |
| First full render                       | 452ms            | 1475ms         | 1398ms            | 1454ms            | 344ms             |
| Insert one message                      | 23ms             | 380ms          | 19ms              | 128ms             | 9ms               |
| Inserting 20 messages one after another | 651ms            | 8012ms         | 581ms             | 1884ms            | 33ms              |
| Inserting 20 messages in parallel       | 187ms            | 7039ms         | 126ms             | 1705ms            | 1582ms            |
| Message insert to message list change   | 59ms             | 30ms           | 386ms             | 19ms              | 4ms               |
| Message insert to user list change      | 13ms             | 192ms          | 311ms             | 282ms             | 6ms               |
| Message search query time               | 485ms            | 299ms          | 305ms             | 90ms              | 29ms              |
| First full render with many messages    | 408ms            | 1922ms         | 1869ms            | 2287ms            | 293ms             |
| Storage usage                           | 199kb            | 3478kb         | 1395kb            | 2311kb            | 1824kb            |
| Bundle size, plain JavaScript           | 1545kb           | 915kb          | 800kb             | 1084kb            | 895kb             |
| Bundle size, minified+gzip              | 358kb            | 224kb          | 192kb             | 278kb             | 208kb             |


### Metrics Explanation
- Page load time: How long does it take to download and parse the JavaScript bundle.
- First angular component render: How long does it take for the first angular component to be rendered.
- First full render: How long does it take until all relevant data is displayed for the first time.
- Insert one message: How long does it take to insert a single message.
- Inserting 20 messages one after another: How long does it take to insert 20 messages in serial.
- Inserting 20 messages in parallel: How long does it take to insert 20 messages in serial.
- Message insert to message list change: How long does it take until a new message is rendered to the dom.
- Message insert to user list change: How long does it take until a new messages affects the sort order of the user list.
- Message search query time: How long does it take to search for a given message by regex/like-operator.
- First full render with many messages: Time to first full render when many messages exist. 
- Storage usage: Size of the stored IndexedDB database after inserting the full test dataset.
- Bundle size, plain JavaScript: The full JavaScript bundle size, without minification or gzip.
- Bundle size, minified+gzip: The full JavaScript bundle size after minification and gzip compression.

## Investigations

### Why is WatermelonDB so much faster?

WatermelonDB uses the [LokiJS](https://github.com/techfort/LokiJS) adapter which is an **in memory** database that regularly persists the data to IndexedDB either on interval, or when the browser tab is closed. Keeping and processing the data in memory has the benefit of being much master, but it also has its downsides:

- Data can be lost when the JavaScript process is killed ungracefully like when the browser crashes or the power of the PC is terminated.
- There is no multi-tab-support. The data is not shared between multiple browser tabs of the same origin.
- There is no concept of conflict handling or transactions. The last write always wins.


### Why is firebase so slow on first render?

On the first page load, firebase ensures that the local data is equal to the server side state. This means that the client has to be online at application startup which is the reason why firebase is not completely offline first. To ensure the equalness of client side data, firebase has to perform several requests to the backend, before the database will respond to queries. This makes the inital page load slow, and it becomes even more slower, the more data exists and has to be validated.

### Why is PouchDB & RxDB so slow?

For the PouchDB and RxDB (based on PouchDB storage) I used the [old](https://www.npmjs.com/package/pouchdb-adapter-idb) indexeddb adapter.
It is much less optimized then the [new](https://www.npmjs.com/package/pouchdb-adapter-indexeddb) adapter, but the new one made problems with returning the correct query results.
Theses problems have been fixed on the PouchDB master branch, but I have to wait for the next PouchDB release. I will updated the repo when this change can be done.

### Why does AWS Datastore need so less storage space?

AWS Datastore does not save any metadata together with the documents. Instead only the plain documents are stored in IndexedDB. They can do this because they only allow simple queries and have no conflict resolution.

## Feature Map

| Feature\Project          | aws                | firebase                                     | pouchdb | rxdb | watermelondb                                               |
| ------------------------ | ------------------ | -------------------------------------------- | ------- | ---- | ---------------------------------------------------------- |
| Offline First            | No, login required | Partially, must be online on first page load | Yes     | Yes  | Yes                                                        |
| Realtime Replication     | Yes                | Yes                                          | Yes     | Yes  | Partially, must be implemented by hand                     |
| Multi Tab Support        | Yes                | Yes                                          | No      | Yes  | No                                                         |
| Observable Queries       | No                 | Yes                                          | No      | Yes  | Yes                                                        |
| Complex Queries          | No                 | Yes                                          | Yes     | Yes  | Partially, limit/skip/sort not working with LokiJS adapter |
| Client Side Encryption   | No                 | No                                           | Yes     | Yes  | No                                                         |
| Schema Support           | Yes                | No                                           | No      | Yes  | Yes                                                        |
| Custom Backend           | No                 | No                                           | No      | Yes  | Yes                                                        |
| Custom Conflict Handling | Yes                | No                                           | Yes     | Yes  | No                                                         |



## Starting the projects

All sub-projects use the same port and so can **not be started in parallel**.

## Installation

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

### RxDB

* Run `npm run start:rxdb` to start the mock server and the production build frontend.
* Or run `npm run dev:rxdb` to start the mock server and the development frontend server.

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
