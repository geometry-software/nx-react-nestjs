export type RepositorySortOrder = "asc" | "desc";

export type PageQuery = {
  page: number;
  limit: number;
};

export class RepositoryQuery {
  page = 1;
  limit = 10;
  search?: string;
  sort = "createdAt";
  order: RepositorySortOrder = "desc";

  constructor(values: Partial<RepositoryQuery> = {}) {
    Object.assign(this, values);
  }
}

export function isValidPageQuery(query: PageQuery): boolean {
  return (
    Number.isInteger(query.page) &&
    query.page >= 1 &&
    Number.isInteger(query.limit) &&
    query.limit >= 1
  );
}
