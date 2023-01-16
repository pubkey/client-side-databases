export const GRAPHQL_PORT = 10102;
export const GRAPHQL_PATH = '/graphql';
export const GRAPHQL_SUBSCRIPTION_PORT = 10103;
export const GRAPHQL_SUBSCRIPTION_PATH = '/subscriptions';



const MOD = 1000;

/**
 * graphql does not allow int32
 * so we remove the last 3 chars and later add them
 */
export function unixTimestampToGraphql(t: number): number {
    return Math.floor(t / MOD);
}

export function graphQLTimestampToUnix(t: number): number {
    return Math.floor(t * MOD);
}
