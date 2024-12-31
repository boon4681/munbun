import type { ClientResponse, ClientRequestOptions } from "hono/client";
import type { StatusCode } from "hono/utils/http-status";
import type { Endpoint } from "hono/types";
type InferEndpointType<T> = T extends (args: infer R, options: any | undefined) => Promise<infer U>
    ? U extends ClientResponse<infer O, infer S, infer F>
    ? {
        input: NonNullable<R>;
        output: O;
        outputFormat: F;
        status: S;
    }
    : never
    : never;

type InferResponseTypeFromEndpoint<T extends Endpoint, U extends StatusCode> = T extends {
    output: infer O;
    status: infer S;
} ? S extends U ? O : never : never;

type InferResponseType<T, U extends StatusCode = StatusCode> = InferDataType<InferResponseTypeFromEndpoint<InferEndpointType<T>, U>>;
type InferDataType<T> = T extends { data: infer D } ? D : T;
type InferArgs<T> = T extends (args: infer A, ...rest: any[]) => any ? A : never;
type InferOptions<T> = T extends (args: any, options: infer O) => any ? O : never;
export const api = <T extends (args?: any, options?: ClientRequestOptions) => Promise<ClientResponse<any, any, any>>>(func: T) => {
    return async (
        args?: InferArgs<T>,
        options?: InferOptions<T>
    ): Promise<InferResponseType<T, 200>> => {
        const res = await func(args, options)
        if (res.status !== 200) {
            throw await res.json()
        }
        const json = await res.json()
        return json.data
    }
}