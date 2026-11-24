# Background Work (/docs/background-work)



# Background Work [#background-work]

| Topic             | Page                                                     |
| ----------------- | -------------------------------------------------------- |
| Jobs (defineJob)  | [Jobs](/docs/background-work/jobs)                       |
| Queues & Workers  | [Queues & Workers](/docs/background-work/queues)         |
| Scheduled Tasks   | [Scheduled Tasks](/docs/background-work/scheduling)      |
| Job Observability | [Job Observability](/docs/background-work/observability) |

## Model of work [#model-of-work]

```
defineJob ──► dispatch() ──► queue ──► worker ──► retry loop
```

## Related [#related]

* [@kwiva/jobs API](/api/jobs) — full public surface (dispatch, outbox, middleware, cron, metrics)
