# Components

Shared Nx React interface library for NX Monorepo. The frontend consumes it as
the `geometry-sdk/components` public workspace entry point, while the package remains independent from
the application.

## Structure

- `src/components/ui` contains the ShadCN and Radix primitives.
- `src/components/app` contains reusable composed interface components.
- `src/components/providers` contains React context providers.
- `src/components/hooks` contains reusable React hooks.
- `src/components/index.ts` is the public component barrel.
- React context providers and reusable hooks are exported through the same
  component entry point.

Use the package entry point rather than internal source paths:

```ts
import { Button, DataTable } from 'geometry-sdk/components';
import { NotificationProvider } from 'geometry-sdk/components';
```
