import { FastifyAuthFunction } from "@fastify/auth";
import { nanoid } from "nanoid";

export const AUTH_COOKIE_NAME = "JSESSIONID";

const _useAuth_static = (function _useAuth_staticFn() {
    type UserAuthInfo<SU extends string = string, SP extends string = string> = { username: SU, password: SP };
    type UserInfo<NId extends number = number, SName extends string = string, SEmail extends string = string> = {
        id: NId,
        name: SName,
        email: SEmail,
        role: "admin" | "editor" | "courier"
    };
    type UserEntry<SU extends string = string, SP extends string = string, NId extends number = number, SName extends string = string, SEmail extends string = string> = UserAuthInfo<SU, SP> & UserInfo<NId, SName, SEmail>;

    const _makeUsers = <TS extends string, TN extends number, TUsersObj extends Array<UserEntry<TS, TS, TN, TS, TS>>>(usersObj: TUsersObj) => usersObj;
    const USERS = _makeUsers([
        {
            id: 0,
            username: "sysadmin",
            password: "mp",
            name: "Admin",
            email: "admin@g.com",
            role: "admin",
        },
        {
            id: 1,
            username: "editor",
            password: "mp",
            name: "Editor",
            email: "editor@g.com",
            role: "editor",
        },
        {
            id: 2,
            username: "courier",
            password: "mp",
            name: "Courier",
            email: "courier@g.com",
            role: "courier",
        },
    ]);
    
    const AUTHENTICATED_EPHEMERAL: { [token: string]: UserEntry } = {};
    const AUTHENTICATED_EPHEMERAL_BYUSERNAME: { [username: string]: { token: string } } = {};

    const tryLogin = (userInfo: UserAuthInfo): { success: true, token: string } | { success: false } => {
        const foundUser = USERS.find(_ => _.username === userInfo.username && _.password === userInfo.password);
        const success = foundUser !== void 0;
        if (success) {
            let token = AUTHENTICATED_EPHEMERAL_BYUSERNAME[userInfo.username]?.token;
            if (token === void 0) {
                token = nanoid();
                AUTHENTICATED_EPHEMERAL[token] = foundUser;
                AUTHENTICATED_EPHEMERAL_BYUSERNAME[userInfo.username] = { token };
                console.log(`[useAuth.ts] Generated token for user '${userInfo.username}': ${token}`);
            };
            return { success, token };
        } else {
            return { success };
        }
    };
    const authenticator = (roles: UserEntry["role"] | "ANY_ROLE"): FastifyAuthFunction => {
        const fastifyAuthFn: FastifyAuthFunction = (request, reply, done) => {
            const token = request.cookies[AUTH_COOKIE_NAME] as string | undefined;
            if (token === void 0) {
                done(new Error(`[MOCK SERVER] Missing '${AUTH_COOKIE_NAME}' cookie in request, can't authenticate`));
                return;
            };

            const userEntry = AUTHENTICATED_EPHEMERAL[token];
            const isLoggedIn = userEntry !== void 0;

            if (isLoggedIn) {
                const isUserRoleContainedInRolesParam = roles === "ANY_ROLE" ? true : roles.includes(userEntry.role);
                if (isUserRoleContainedInRolesParam) {
                    done();
                } else {
                    done(new Error(`[MOCK SERVER] User is logged in, but authorization failed for token '${token}'. Accepted roles: '${JSON.stringify(roles)}', user roles: '${JSON.stringify(userEntry.role)}'`));
                }
            } else {
                done(new Error(`[MOCK SERVER] Authentication failed for token '${token}'`));
            }
        };
        return fastifyAuthFn;
    };
    const getUserInfo = (token: string): UserInfo => {
        const userInfo = { ...AUTHENTICATED_EPHEMERAL[token] };
        if (userInfo === void 0) throw new Error(`getUserInfo failed for token '${token}'`);
        return userInfo;
    };
    const logout = (token: string): void => {
        const toLogOut = { ...AUTHENTICATED_EPHEMERAL[token] };
        if (toLogOut !== void 0) {
            delete AUTHENTICATED_EPHEMERAL[token];
            delete AUTHENTICATED_EPHEMERAL_BYUSERNAME[toLogOut.username];
        }
    };
    
    return {
        tryLogin,
        authenticator,
        getUserInfo,
        logout,
    };
})();
export const useAuth = () => _useAuth_static;