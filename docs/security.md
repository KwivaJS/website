# Security (/docs/security)



# Security [#security]

Kwiva's security is defense-in-depth. See:

* [Default Protections](/docs/security/default-protections)
* [Input Validation](/docs/security/input-validation)
* [Headers](/docs/security/headers)
* [Production Hardening](/docs/security/production)

## Core principles [#core-principles]

1. Validate inputs at every boundary (field DSL + Standard Schema + contracts)
2. CSRF on state-changing routes by default (`csrf()` middleware)
3. HttpOnly + SameSite=Lax cookies by default
4. Tenant isolation auto-enforced in data layer

## Related [#related]

* HTTP security: [CORS & Security Headers](/docs/http/cors)
* Policies: [Authorization](/docs/authorization/policies)
