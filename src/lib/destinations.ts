export function destinationChoiceLabel(
  name: string,
  parentName?: string | null,
) {
  return parentName ? `${name} · ${parentName}` : name;
}

type ParentLink = {
  id: string;
  parentId: string | null;
};

export function descendantIds(id: string, rows: ParentLink[]) {
  const children = new Map<string, string[]>();
  for (const row of rows) {
    if (!row.parentId) continue;
    const list = children.get(row.parentId) ?? [];
    list.push(row.id);
    children.set(row.parentId, list);
  }

  const blocked = new Set<string>();
  const stack = [...(children.get(id) ?? [])];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || blocked.has(current)) continue;
    blocked.add(current);
    for (const child of children.get(current) ?? []) stack.push(child);
  }
  return blocked;
}

export function parentAssignmentError(
  rows: ParentLink[],
  parentId: string,
  destinationId?: string,
) {
  if (!parentId) return null;
  if (destinationId && parentId === destinationId) {
    return "A destination cannot be its own parent.";
  }
  if (!rows.some((row) => row.id === parentId)) {
    return "Choose a parent destination from the list.";
  }
  if (!destinationId) return null;

  const byId = new Map(rows.map((row) => [row.id, row.parentId]));
  let cursor: string | null = parentId;
  const seen = new Set<string>();
  while (cursor) {
    if (cursor === destinationId) {
      return "Choose a parent that is not already inside this destination.";
    }
    if (seen.has(cursor)) break;
    seen.add(cursor);
    cursor = byId.get(cursor) ?? null;
  }
  return null;
}

export function nestDestinations<
  T extends { id: string; parentId: string | null; name: string },
>(rows: T[]) {
  const ids = new Set(rows.map((row) => row.id));
  const children = new Map<string, T[]>();
  const roots: T[] = [];

  for (const row of rows) {
    if (row.parentId && ids.has(row.parentId)) {
      const list = children.get(row.parentId) ?? [];
      list.push(row);
      children.set(row.parentId, list);
    } else {
      roots.push(row);
    }
  }

  const byName = (a: T, b: T) => a.name.localeCompare(b.name);
  const nested: { item: T; depth: number }[] = [];

  const walk = (row: T, depth: number) => {
    nested.push({ item: row, depth });
    for (const child of (children.get(row.id) ?? []).slice().sort(byName)) {
      walk(child, depth + 1);
    }
  };

  for (const root of roots.slice().sort(byName)) walk(root, 0);
  return nested;
}
