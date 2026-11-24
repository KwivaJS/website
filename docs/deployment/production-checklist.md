# Production Checklist (/docs/deployment/production-checklist)



# Production Checklist [#production-checklist]

Before deploying:

* [ ] `APP_KEY` set (`kwiva key:generate`)
* [ ] `AUTH_SESSION_SECRET` set (non-empty)
* [ ] `kwiva migrate` applied
* [ ] `kwiva seed` for dev data (if needed)
* [ ] `storage` configured with real disks
* [ ] TLS via reverse proxy
* [ ] Rate limiting on public routes (`cors/csrf/rateLimit`)
* [ ] Observability on (logging/tracing)
* [ ] Health check: `GET /api/health`
* [ ] One replica + health checks

See also [Security → Production](/docs/security/production).
