# Deployment Architecture (/architecture/deployment-architecture)



# Deployment Architecture [#deployment-architecture]

* Build: `kwiva build` → `dist/` + `.kwiva/types/route-tree.gen.ts`
* Deploy targets: Node/Bun standalone, Docker/K8s, serverless
* Stateless by construction (external DB via Postgres)

See [Deployment](/docs/deployment/).
