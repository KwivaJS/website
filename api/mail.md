# @kwiva/mail (/api/mail)



# @kwiva/mail [#kwivamail]

Mail package: declarative mailing with `defineMail`, markdown/string/component templates, and transports (memory, console, SMTP, Resend).

## Mailable [#mailable]

| Symbol                                                                                                     | Kind     | Signature                                                  |
| ---------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------- |
| `defineMail(options)`                                                                                      | function | `Mailable{to(recipient): PendingMail, send, queue, later}` |
| `PendingMail<T>.send(data, transport?)` / `.queue(data, transport?)` / `.later(delayMs, data, transport?)` | methods  | `Promise<OutgoingMessage>`                                 |

Field semantics — `MailField<TData, V> = V \| ((data: TData) => V)`:

| Field                                | Type                                                                                   |
| ------------------------------------ | -------------------------------------------------------------------------------------- |
| `to`                                 | `Address \| Address[]` — `formatAddress(addr)`, `Address = string \| {address, name?}` |
| `cc`, `bcc`                          | `Address \| Address[]`                                                                 |
| `replyTo`                            | `Address \| Address[]`                                                                 |
| `from`                               | `Address`                                                                              |
| `subject`                            | string or `(data) => string`                                                           |
| `render(data): string`               | → template string                                                                      |
| `html?`                              | `string` (raw HTML)                                                                    |
| `markdown?`                          | `string` (raw markdown)                                                                |
| `text?`                              | `string` (plain)                                                                       |
| `tags?`, `metadata?`, `attachments?` | arrays/objects                                                                         |

## Transports [#transports]

| Symbol                                                    | Kind      | Signature                                                       |
| --------------------------------------------------------- | --------- | --------------------------------------------------------------- |
| `setTransport(t)` / `getTransport()` / `resetTransport()` | functions | —                                                               |
| `class MemoryTransport`                                   | class     | `{name: "memory", sent: OutgoingMessage[], send(msg), clear()}` |
| `class ConsoleTransport`                                  | class     | `{name: "console", send(msg)}`                                  |
| `Transport{name, send(message): void\|Promise<void>}`     | interface | —                                                               |
| `defineMailTransport(definition)`                         | function  | → `MailTransportDefinition{name, create()}`                     |

## Transports in repo [#transports-in-repo]

* `@kwiva/mail-smtp` — `SmtpTransport` (Nodemailer-backed, `name: "smtp"`; options `host`, `port` = 587, `secure`, `auth: { user, pass }`, `from`, `pool`, `maxConnections`, `ignoreTLS`, `requireTLS`).
* `@kwiva/mail-resend` — `ResendTransport` (`name: "resend"`; options apiKey, from?, baseUrl?; data attachments only — throws on `path`).

## Config [#config]

| Symbol                                                         | Kind      | Signature                                         |
| -------------------------------------------------------------- | --------- | ------------------------------------------------- |
| `setMailConfig(cfg)` / `getMailConfig()` / `resetMailConfig()` | functions | `MailConfig{transport?, from?}`                   |
| `validateMailConfig(section)`                                  | function  | asserts shape (non-empty `from`, known transport) |

## Templates [#templates]

| Symbol                                                                      | Kind      | Signature                                        |
| --------------------------------------------------------------------------- | --------- | ------------------------------------------------ |
| `renderString(template, data)`                                              | function  | `{{ key }}` dotted interpolation; missing → `""` |
| `markdownToHtml(src)`                                                       | function  | —                                                |
| `renderMarkdown(template, data)`                                            | function  | —                                                |
| `mailButton({text, url})`, `mailPanel(content)`, `mailTable(headers, rows)` | functions | —                                                |

## Usage [#usage]

```ts title="src/app/mail/todo-mail.ts"
import { defineMail } from "@kwiva/mail";
import { smtpTransport } from "@kwiva/mail-smtp";

export const TodoMail = defineMail({
  to(user) {
    return user.email;
  },
  from: "todos@example.com",
  subject: () => "Your todo was created",
  render() {
    return `Todo created`;
  },
});

await TodoMail(user).send({ todoId: 42 }, smtpTransport);
```

> \[!TIP]
> Set the transport globally with `setMailTransport(new MemoryTransport())` in tests; use `formatAddress` for headers.
