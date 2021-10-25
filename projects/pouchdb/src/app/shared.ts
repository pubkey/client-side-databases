import clone from 'clone';

export const COUCHDB_PATH = 'http://localhost:5984/';

export function pouchDocToNormal(pouchDoc: any): any {
    if (!pouchDoc) {
        return pouchDoc;
    }
    const cloned = clone(pouchDoc);
    const primary = cloned._id;
    delete cloned._id;
    delete cloned._rev;
    cloned.id = primary;
    return cloned;
}

export function normalToPouchDoc(normal: any): any {
    if (!normal) {
        return normal;
    }
    const cloned = clone(normal);
    const primary = cloned.id;
    delete cloned.id;
    cloned._id = primary;
    return cloned;
}
