# Services (/docs/core-concepts/services)



# Services [#services]

`defineService(factory)` — services are just factories.

```ts title="src/app/services/notification.ts"
import { defineService } from "@kwiva/core";
import { EmailSender } from "../../app/http/controllers";

export const NotificationService = defineService(async () => {
  const sender = await EmailSender();
  return {
    async notify(msg) { await sender.send(msg); },
  };
});
```

## API [#api]

| API                                   | Notes                               |
| ------------------------------------- | ----------------------------------- |
| `defineService(factory)`              | → `ServiceFactory{create(context)}` |
| `instantiateServices(factories, app)` | —                                   |

## In controllers [#in-controllers]

```ts
const notif = await instantiateServices({ NotificationService }, appCtx);
```

## DI model [#di-model]

Kwiva has a simplified DI — no class hierarchy; factories with lazy creation.
