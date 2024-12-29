import { KV } from '$db'
import { jwtVerify, SignJWT } from 'jose';
import { KVEndpoint } from '$constants'

export const jwt_secret = (await KV.get(KVEndpoint.jwt_secret))!
export const secret = new TextEncoder().encode(jwt_secret);

export const JWT = {
    async signed(body: any): Promise<string> {
        return await new SignJWT(body)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('15d')
            .sign(secret)
    },
    async verified<T>(token: string): Promise<false | T> {
        try {
            const { payload } = await jwtVerify(token, secret);
            return payload as T
        } catch (error) {
            return false
        }
    }
}