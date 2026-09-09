# @kwiva/services (/api/services)



`@kwiva/services` is the framework's service container. A service is a typed object of business logic that doesn't belong in a controller or model — billing, mail, sync, notification flows. Services live one per file in `src/app/services/`, are created with the `defineService` factory, and are resolved anywhere in the process through the container's typed `resolve()` helper from `@kwiva/core`.

## Exports [#exports]

| Export          | Purpose                            | Stability |
| --------------- | ---------------------------------- | --------- |
| `defineService` | Create a typed, injectable service | Stable    |

Service resolution uses `resolve()` from `@kwiva/core` — see the [core reference](/api/core) for the container contract.

## `defineService` [#defineservice]

```ts title="src/app/services/email.ts"
// src/app/services/email.ts
import { defineService } from '@kwiva/services'

export default defineService('email', {
  sendWelcome: async (user: User) => {
    await mailer.send({
      to: user.email,
      subject: 'Welcome to our app',
      template: 'welcome',
      data: { name: user.name },
    })
  },

  sendPasswordReset: async (user: User, token: string) => {
    await mailer.send({
      to: user.email,
      subject: 'Reset your password',
      template: 'password-reset',
      data: { token },
    })
  },
})
```

### Signature [#signature]

```ts title="signature.ts"
defineService<const Methods extends ServiceMethods>(name: string, methods: Methods): Service<Methods>
```

The factory takes two arguments:

| Argument  | Type     | Description                                                         |
| --------- | -------- | ------------------------------------------------------------------- |
| `name`    | `string` | Service name, lowercase and kebab-case, e.g. `'email'`, `'billing'` |
| `methods` | `object` | An object of async or sync methods that make up the service         |

### Return Type [#return-type]

The return value is a **typed service object** — the methods you passed, with all parameter and return types intact. The default export of a service file is both the callable object and the identity token you hand to `resolve()`.

The factory takes an object literal rather than a class, so inference is structural: method signatures stay exactly as written, and nothing needs an interface. Service methods may reference models, config, other services, and any framework API; typing flows through the whole object.

## Typed Injection [#typed-injection]

Services are available anywhere in the process through the container:

```ts title="typed-injection.ts"
import { resolve } from '@kwiva/core'
import EmailService from '../app/services/email'

const email = resolve(EmailService)
await email.sendWelcome(user)
```

`resolve()` takes the typed `defineService` result and returns the same typed object from the container. Because resolution is keyed by the object itself, callers never construct services, never touch globals, and never see an untyped lookup. The injected instance is what a service test fakes, and what the container shares across controllers, jobs, and page loaders.

## Service Composition [#service-composition]

Services are the coordination layer: they own workflows that span multiple models and other services. Compose by resolving peer services at the call site, so each method states its dependencies explicitly:

```ts title="src/app/services/orders.ts"
// src/app/services/orders.ts
import { defineService } from '@kwiva/services'
import { resolve, config } from '@kwiva/core'
import MailService from './email'

export default defineService('orders', {
  place: async (input: { userId: string; items: CartItem[] }) => {
    const mail = resolve(MailService)
    const currency = config('billing.currency')

    const order = await Order.create({
      ...input,
      currency,
      total: input.items.reduce((sum, item) => sum + item.price, 0),
    })

    const user = await User.findOrFail(input.userId)
    await mail.sendReceipt(user, order)
    return order
  },

  refund: async (orderId: string, reason: string) => {
    const order = await Order.findOrFail(orderId)
    await order.update({ status: 'refunded', refundReason: reason })
    await RefundJob.dispatch({ orderId, reason })
    return order
  },
})
```

Services compose with the same tools as the rest of the framework: models and transactions for data, `config()` and `env()` for settings, and `dispatch()` for deferring work to the queue.

## Using Services from Controllers [#using-services-from-controllers]

Controllers call services directly, either by importing the service or by resolving it from the container:

```ts title="src/app/http/controllers/auth.ts"
// src/app/http/controllers/auth.ts
import { defineController } from '@kwiva/http'
import EmailService from '../../app/services/email'

export default defineController('auth', (c) => ({
  register: c.post('/register', async ({ body }) => {
    const user = await User.create(body)
    await EmailService.sendWelcome(user)
    return user
  }),
}))
```

Keeping mail, billing, and sync flows inside a service keeps the controller a thin translation layer between HTTP and business logic.

## Using Services from Jobs [#using-services-from-jobs]

Job handlers run outside the request lifecycle but inside the same process container, so they resolve services identically:

```ts title="src/app/jobs/send-welcome.ts"
// src/app/jobs/send-welcome.ts
import { defineJob } from '@kwiva/queue'
import { resolve } from '@kwiva/core'
import EmailService from '../services/email'

export default defineJob(
  'send-welcome',
  async ({ payload }) => {
    const user = await User.findOrFail(payload.userId)
    const email = resolve(EmailService)
    await email.sendWelcome(user)
    return { delivered: true }
  },
  { queue: 'emails', attempts: 5, backoff: 'exponential' },
)
```

A worker that retries a job re-enters the same handler; because the service is resolved inside the handler, each attempt gets a fresh, fully constructed instance.

## Using Services from Page Loaders [#using-services-from-page-loaders]

Page loaders run server-side and can resolve services to prepare data before render:

```ts title="src/ui/pages/account.tsx"
// src/ui/pages/account.tsx
import { definePage } from '@kwiva/react'
import { resolve } from '@kwiva/core'
import BillingService from '../../app/services/billing'

export default definePage({
  loader: async ({ params, session }) => {
    const billing = resolve(BillingService)
    const invoice = await billing.currentInvoice(session.user.id)
    return { invoice }
  },
  component: ({ loaderData: { invoice } }) => <InvoiceView invoice={invoice} />,
})
```

Because services carry their types end to end, the loader data type flows into `loaderData` — no manual annotation anywhere in the chain.

## What to Read Next [#what-to-read-next]

* [Services](/docs/core-concepts/services) — Service architecture and the container
* [Core Reference](/api/core) — `resolve()`, context, and the DI container
* [Application Composition](/docs/core-concepts/applications) — How services fit into the kernel
* [Jobs](/docs/background-work/jobs) — `defineJob` and queued work
* [Loaders](/docs/frontend/loaders) — Server-side data loading in pages
