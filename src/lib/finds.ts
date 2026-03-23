import { finds, collections, type Find, type FindType, type FindItem } from "@/content/finds";

export function getAllFinds(): Find[] {
  return [...finds].sort((a, b) => {
    const priorityDiff = (b.priority ?? 1) - (a.priority ?? 1);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
  });
}

export function getAllFindItems(): FindItem[] {
  const items: FindItem[] = [...finds, ...collections];
  return items.sort((a, b) => {
    const priorityDiff = (b.priority ?? 1) - (a.priority ?? 1);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
  });
}

export function getFindsByType(type: FindType): Find[] {
  return getAllFinds().filter((f) => f.type === type);
}

export function getAllFindTypes(): FindType[] {
  const allTypes = new Set<FindType>();
  finds.forEach((f) => allTypes.add(f.type));
  collections.forEach((c) => c.items.forEach((f) => allTypes.add(f.type)));
  return Array.from(allTypes).sort();
}
