# Components

Общая Nx React-библиотека интерфейса NX Mono Repo. Frontend зависит от неё как от workspace-пакета `@nx-react-nestjs/components`; обратной зависимости от приложения нет.

## Структура

- `src/components/ui` — базовые ShadCN-примитивы;
- `src/components/app` — составные компоненты приложения;
- локализация не входит в библиотеку компонентов и находится в `apps/frontend/src/app/i18n.tsx`;
- библиотека содержит только UI и view-компоненты; состояние запросов и локализация находятся во фронтенд-приложении (`apps/frontend/src/app`).

Доступны корневые экспорты и явные subpath-импорты, например:

```ts
import { Button } from '@nx-react-nestjs/components/ui/button';
import { DataTable } from '@nx-react-nestjs/components/app/data-table';
```

## Проверка

```bash
npm exec -- nx lint components
npm exec -- nx test components
npm exec -- nx typecheck components
```
