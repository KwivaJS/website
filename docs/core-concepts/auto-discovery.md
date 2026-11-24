# Auto-Discovery (/docs/core-concepts/auto-discovery)



# Auto-Discovery [#auto-discovery]

`discoverKind(root, kind)` scans conventional folders and registers units by exported const name.

## Discovery map [#discovery-map]

| Kind          | Folder                     | Mode      |
| ------------- | -------------------------- | --------- |
| `models`      | `src/app/models`           | flat      |
| `services`    | `src/app/services`         | flat      |
| `policies`    | `src/app/policies`         | flat      |
| `jobs`        | `src/app/jobs`             | flat      |
| `events`      | `src/app/events`           | flat      |
| `tasks`       | `src/app/tasks`            | flat      |
| `commands`    | `src/app/commands`         | flat      |
| `controllers` | `src/app/http/controllers` | flat      |
| `middleware`  | `src/app/http/middleware`  | flat      |
| `pages`       | `src/ui/pages`             | recursive |

See [feature inventory](/docs/research/feature-inventory) for the full map + CLI extras.
