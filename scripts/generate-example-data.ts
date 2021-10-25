/**
 * We generate the example data and write that into a json.
 * This ensure the frontends do not have to include the faker library,
 * and also it makes sure we use the same data each time.
 */

import {
    name as FakerName,
    lorem as FakerLorem
} from 'faker';
import faker from 'faker';
import { Message, User } from '../src/shared/types';
import {
    randomBoolean,
    randomOfArray,
    sortArrayByKey,
    unixInSeconds
} from '../src/shared/util-server';
import * as fs from 'fs';
import * as path from 'path';

const EXAMPLE_DATA_PATH = path.join(
    __dirname,
    '../',
    'example-data.json'
);

/**
 * use a seed to ensure each time we generate the same data
 */
faker.seed(123);

let lastId = 0;
let lastRecieved = false;
function randMessage(
    sender: string,
    reciever: string,
    read = true,
    createdAt = unixInSeconds()
): Message {
    lastId++;
    lastRecieved = !lastRecieved;
    return {
        id: lastId + '',
        text: FakerLorem.sentence(),
        createdAt,
        read,
        sender,
        reciever
    };
}

let lastUserId = 0;
function randUser(): User {
    lastUserId++;
    return {
        id: FakerName.firstName().toLowerCase(),
        createdAt: unixInSeconds()
    };
}

/**
 * returns a complete set of users with messages
 */
function getExampleDataset(
    messageAmount: number = 100,
    userAmount: number = 10
): {
    messages: Message[];
    users: User[];
} {

    if (userAmount < 2) {
        throw new Error('userAmount must be >= 2');
    }

    const users: User[] = new Array(userAmount).fill(0).map(() => randUser());
    let currentCreatedAt = unixInSeconds() - messageAmount;
    const messages = new Array(messageAmount).fill(0).map(() => {
        const sender = randomOfArray(users);
        let reciever = randomOfArray(users);

        // ensure sender != reciever
        while (sender.id === reciever.id) {
            reciever = randomOfArray(users);
        }

        /*
         * Ensure all messages have a different createdAt
         * so that the sort order is deterministic.
         */
        currentCreatedAt = currentCreatedAt + 1;

        return randMessage(
            sender.id,
            reciever.id,
            randomBoolean(),
            currentCreatedAt
        );
    });

    return JSON.parse(
        JSON.stringify(
            {
                users: sortArrayByKey(users, 'id'),
                messages
            }
        )
    );
}


async function run() {
    const data = getExampleDataset();
    fs.writeFileSync(
        EXAMPLE_DATA_PATH,
        JSON.stringify(data, null, 4)
    );
}
run();
