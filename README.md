# Offline First Database Comparison

In this project I have implemented the exact same chat application with different database technologies.
You can use it to compare metrics and learn about the differences. The chat app is web based **angular** application, with functionality similar to Whatsapp Web.

<p align="center">
  <img src="./orga/images/chat-app.png" alt="chat app" width="650" />
</p>

## Implemented Databases:
  - AWS Ampflify Datastore
  - Firebase Firestore
  - PouchDB & CouchDB
  - RxDB & GraphQL
  - WatermelonDB (no backend sync atm)

## Metrics

All metrics are measured via code in a browser test (chrome). The results heavily depend on the developers device.
You should compare the values relative to another and not as absolute values.

You can reproduce these values by running `sh measure-metrics.sh` in the root folder.

| Metric \ Project                                | aws     | firebase | pouchdb | rxdb    | watermelondb |
| ----------------------------------------------- | ------- | -------- | ------- | ------- | ------------ |
| First angular component render                  | 212 ms  | 272 ms   | 200 ms  | 216 ms  | 214 ms       |
| Page load time                                  | 300 ms  | 192 ms   | 277 ms  | 301 ms  | 290 ms       |
| First full render                               | 459 ms  | 1347 ms  | 1407 ms | 1502 ms | 341 ms       |
| Insert one one message                          | 26 ms   | 417 ms   | 16 ms   | 131 ms  | 8 ms         |
| Inserting 20 messages one after another         | 636 ms  | 8049 ms  | 553 ms  | 1854 ms | 35 ms        |
| Inserting 20 messages in parallel               | 167 ms  | 7168 ms  | 107 ms  | 1695 ms | 1528 ms      |
| Time from message insert to message list change | 43 ms   | 30 ms    | 376 ms  | 16 ms   | 5 ms         |
| Message search query time                       | 496 ms  | 330 ms   | 299 ms  | 81 ms   | 38 ms        |
| First full render with many messages            | 438 ms  | 2026 ms  | 1873 ms | 2450 ms | 321 ms       |
| Bundle size, plain JavaScript                   | 1545 kb | 914 kb   | 800 kb  | 1084 kb | 895 kb       |
| Bundle size, minified+gzip                      | 358 kb  | 224 kb   | 192 kb  | 278 kb  | 207 kb       |


### Metrics Explanation
- Page load time: How long does it take to download and parse the JavaScript bundle.
- First angular component render: How long does it take for the first angular component to be rendered.
- First full render: How long does it take until all relevant data is displayed for the first time.
- Insert one one message: How long does it take to insert a single message.
- Inserting 20 messages one after another: How long does it take to insert 20 messages in serial.
- Inserting 20 messages in parallel: How long does it take to insert 20 messages in serial.
- Time from message insert to message list change: How long does it take until a new message is rendered to the dom.
- Time from message insert to user list change: How long does it take until a new messages affects the sort order of the user list.
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
