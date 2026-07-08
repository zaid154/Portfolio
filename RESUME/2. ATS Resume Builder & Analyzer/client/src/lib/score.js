// Shared colour scale for ATS scores across the app.
export function scoreColor(score) {
  if (score == null) return "#94a3b8";
  if (score >= 80) return "#16a34a";
  if (score >= 65) return "#22c55e";
  if (score >= 45) return "#d97706";
  return "#dc2626";
}

export function scoreLabel(score) {
  if (score == null) return "Not scored";
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 45) return "Fair";
  return "Needs work";
}
