import type {
    FirebaseOptions
} from 'firebase/app';

const FIREBASE_CREDENTIALS_LOCAL: FirebaseOptions = {
    projectId: 'chat-app-d2a9a',
    databaseURL: 'http://localhost:8080?ns=chat-app-d2a9a'    
};

export const FIREBASE_CREDENTIALS: FirebaseOptions = FIREBASE_CREDENTIALS_LOCAL;

export const USERS_COLLECTION = 'users';
export const MESSAGES_COLLECTION = 'messages';
