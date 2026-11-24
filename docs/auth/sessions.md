# Sessions (/docs/auth/sessions)



# Sessions [#sessions]

## Cookie-based sessions [#cookie-based-sessions]

```ts
import { createSession, getSession, commitSession, destroySessionCookie } from "@kwiva/auth";

const session = await createSession(user);
// → session.id (HMAC-signed cookie value), cookie via commitSession(session)
```

## API [#api]

| API                                   | Notes                                 |
| ------------------------------------- | ------------------------------------- |
| `createSession(user, options?)`       | → `Session{id, userId, expiresAt}`    |
| `getSession(request, options?)`       | → `Session \| null`                   |
| `rotateSession(sessionId, options?)`  | rotate                                |
| `refreshSession(sessionId, options?)` | extend                                |
| `destroySession(sessionId, options?)` | invalidate                            |
| `commitSession(session, options?)`    | `Set-Cookie` string                   |
| `destroySessionCookie(cookie?)`       | expiry cookie                         |
| `resolveSessionParams(ctx, options?)` | → `{secret, maxAge?, cookie?, store}` |

## Implementation details [#implementation-details]

* HMAC-SHA256 cookie signing (`serializeSessionValue`/`parseSessionValue`).
* scrypt password hashing (`hashPassword`/`verifyPassword`).

## Client: `useSession(endpoint="/session")` [#client-usesessionendpointsession]

Returns `{session, user, isLoading, refresh}` — from GET `/session`.
