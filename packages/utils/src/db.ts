type Row = Record<string, unknown>;

function snakeToCamel(key: string): string {
  return key.replace(/_([a-zA-Z0-9])/g, (_, ch: string) => ch.toUpperCase());
}

export function toCamel<T>(row: Row): T {
  const result: Row = {};

  for (const [key, value] of Object.entries(row)) {
    result[snakeToCamel(key)] = value;
  }

  return result as T;
}

export function toCamelArray<T>(rows: Row[]): T[] {
  return rows.map((row) => toCamel<T>(row));
}
