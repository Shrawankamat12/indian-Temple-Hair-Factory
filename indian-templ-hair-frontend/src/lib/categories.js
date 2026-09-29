// Public /categories returns every category (including inactive and child ones).
// Storefront navigation and tiles only want active, top-level categories.
export const topLevelCategories = (categories = []) =>
  categories.filter((c) => c.active !== false && !c.parentId);

export const menuCategories = (categories = []) =>
  topLevelCategories(categories).filter((c) => c.showInMegaMenu !== false);
