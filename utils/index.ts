export * from "./date-converter";
export * from "./day-converter";

export function hasNextPageAndGet<T>(data: T[], page = 1, perPage = 10): {
  data: T[];
  hasNext: boolean;
} {
  const totalPages = Math.ceil(data.length / perPage);
  const start = (page - 1) * perPage;
  const end = start + perPage;

  return {
    data: data.slice(start, end),
    hasNext: page < totalPages,
  };
}
