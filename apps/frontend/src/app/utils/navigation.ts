const defaultListQuery = '?page=1&limit=10&sort=createdAt&order=desc';

function listRoute(path: `/${string}`) {
  return { path: path.slice(1), href: `${path}${defaultListQuery}` };
}

export const listRoutes = {
  products: listRoute('/products'),
  invoices: listRoute('/invoices'),
  shipping: listRoute('/shipping'),
  users: listRoute('/users'),
} as const;

export function getNavigationRoute<TRoute extends { id: string; path: string }>(
  pathname: string,
  routes: readonly TRoute[],
): TRoute {
  return (
    routes.find(({ path }) => pathname === `/${path}`) ??
    routes.find(({ id }) => id === 'data-flow') ??
    routes[0]
  );
}
