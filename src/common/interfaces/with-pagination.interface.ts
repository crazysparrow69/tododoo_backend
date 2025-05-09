export interface WithPagination<T> {
  results: T[];
  page: number;
  totalPages: number;
}
