// Pure helper functions for reading CMS content that useSite() fetches from the
// API. This file holds NO content/data — the database is the single source of
// truth (seed or admin dashboard). Admin editor field schema lives in
// ./contentTypes.js.

// First item of a content group, or a safe empty shape when the group is missing.
export const first = (site, key) => site[key]?.[0] || { title: '', data: {} }

// Read an editable label from the "Section Titles" (siteText) singleton, with a fallback.
export const text = (site, key, fallback = '') => {
  const v = first(site, 'siteText').data?.[key]
  return v === undefined || v === '' ? fallback : v
}

// Coerce a value into an array (accepts an array or a comma-separated string).
export const asArray = (value) =>
  Array.isArray(value)
    ? value
    : String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
