# Client-Side Auth (/docs/auth/client-usage)



# Client-Side Auth [#client-side-auth]

`@kwiva/auth` client hooks — React peer deps (`react`, `react-dom`).

## `useSession(endpoint = "/session")` [#usesessionendpoint--session]

```tsx
const { session, user, isLoading, refresh } = useSession();
```

## `useCan(ability)` / `AbilitiesProvider` [#usecanability--abilitiesprovider]

## SSR [#ssr]

`ssrSafeAuth()` — session read without redirects during SSR.

## Login flow [#login-flow]

1. Submit credentials → `POST /auth/login`
2. Kwiva sets `kwiva_session` cookie → reload or soft-navigate

## Logout [#logout]

`POST /auth/logout` → clear cookies.

> \[!TIP]
> Built-in hooks: `useSession`, `AbilitiesProvider`, `useCan`, `setAmbientAbilities`, `getAmbientAbilities`.
