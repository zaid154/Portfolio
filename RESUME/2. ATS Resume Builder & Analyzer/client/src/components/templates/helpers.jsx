// Shared rendering helpers for resume templates.

export function dateRange(start, end, current) {
  const e = current ? "Present" : end;
  if (start && e) return `${start} – ${e}`;
  return start || e || "";
}

export function contactList(p = {}) {
  return [p.email, p.phone, p.location, p.website, p.linkedin, p.github].filter(Boolean);
}

export function hasArr(a) {
  return Array.isArray(a) && a.length > 0;
}

// Renders a work / project / education section with a generic item shape.
export function Bullets({ items }) {
  const clean = (items || []).filter((b) => b && b.trim());
  if (!clean.length) return null;
  return (
    <ul>
      {clean.map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  );
}
