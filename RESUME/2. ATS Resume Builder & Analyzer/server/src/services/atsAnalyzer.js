/**
 * Heuristic ATS analyzer — no external AI required.
 *
 * Given a structured resume and a target job description, it estimates how well
 * an Applicant Tracking System would rank the resume: keyword overlap, contact
 * completeness, measurable impact, action verbs, section coverage and length.
 */

const STOPWORDS = new Set(
  `a an and or the of to in on for with at by from as is are be will you your we our their they them this that these those it its into over under out up down off above below can could should would may might must have has had do does did not no nor so than too very just also about across after again against all am any because been before being between both during each few further here how into itself more most other some such only own same then there through until while who whom why work working role position job candidate team teams company companies looking seeking join help build using use used within per etc ability able strong good great excellent required requirement requirements responsibilities responsibility including include includes preferred plus years year experience experiences skill skills knowledge understanding proficient proficiency familiar familiarity ideal candidate opportunity opportunities environment applicants apply need needs needed hiring hire hired someone somebody want wants join joining bonus nice must-have`
    .split(/\s+/)
);

const ACTION_VERBS = new Set(
  `led managed built designed developed created implemented launched shipped improved increased reduced optimized delivered drove owned architected engineered automated streamlined migrated scaled mentored coordinated analyzed researched founded initiated established spearheaded orchestrated accelerated boosted generated grew resolved refactored deployed maintained integrated collaborated directed produced achieved`
    .split(/\s+/)
);

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^\.+|\.+$/g, ""))
    .filter(Boolean);
}

// Turn the structured resume into a single searchable text blob.
function resumeToText(resume = {}) {
  const parts = [];
  const p = resume.personal || {};
  parts.push(p.fullName, p.jobTitle, p.summary, p.location);
  (resume.experience || []).forEach((e) => {
    parts.push(e.company, e.role, e.location, ...(e.bullets || []));
  });
  (resume.education || []).forEach((e) => parts.push(e.school, e.degree, e.field));
  (resume.projects || []).forEach((pr) =>
    parts.push(pr.name, pr.description, ...(pr.tech || []))
  );
  (resume.certifications || []).forEach((c) => parts.push(c.name, c.issuer));
  parts.push(...(resume.skills || []), ...(resume.languages || []));
  return parts.filter(Boolean).join("\n");
}

// Rank the most meaningful keywords in the job description by frequency.
function extractKeywords(jobDescription, limit = 30) {
  const tokens = tokenize(jobDescription).filter(
    (t) => t.length > 2 && !STOPWORDS.has(t) && !/^\d+$/.test(t)
  );
  const freq = new Map();
  for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term, count]) => ({ term, count }));
}

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function analyzeResume(resume, jobDescription) {
  const resumeText = resumeToText(resume);
  const resumeTokens = new Set(tokenize(resumeText));
  const keywords = extractKeywords(jobDescription);

  // 1. Keyword overlap with the job description.
  const matched = [];
  const missing = [];
  for (const kw of keywords) {
    if (resumeTokens.has(kw.term)) matched.push(kw.term);
    else missing.push(kw.term);
  }
  const keywordScore = keywords.length
    ? Math.round((matched.length / keywords.length) * 100)
    : 0;

  // 2. Contact completeness.
  const p = resume.personal || {};
  const contactChecks = [
    Boolean((p.email || "").includes("@")),
    Boolean((p.phone || "").replace(/\D/g, "").length >= 7),
    Boolean(p.location),
    Boolean(p.linkedin || p.website || p.github),
  ];
  const contactScore = Math.round(
    (contactChecks.filter(Boolean).length / contactChecks.length) * 100
  );

  // 3. Section coverage.
  const sectionChecks = [
    Boolean((p.summary || "").trim().length > 30),
    (resume.experience || []).length > 0,
    (resume.education || []).length > 0,
    (resume.skills || []).length >= 3,
  ];
  const sectionScore = Math.round(
    (sectionChecks.filter(Boolean).length / sectionChecks.length) * 100
  );

  // 4. Measurable impact — bullets containing numbers/percentages/currency.
  const allBullets = (resume.experience || []).flatMap((e) => e.bullets || []);
  const quantified = allBullets.filter((b) => /\d|%|\$|\bx\b/i.test(b)).length;
  const impactScore = allBullets.length
    ? clamp(Math.round((quantified / allBullets.length) * 100))
    : 0;

  // 5. Action verbs starting the bullets.
  const strongBullets = allBullets.filter((b) => {
    const first = tokenize(b)[0];
    return first && ACTION_VERBS.has(first);
  }).length;
  const actionScore = allBullets.length
    ? clamp(Math.round((strongBullets / allBullets.length) * 100))
    : 0;

  // 6. Length — ATS-friendly resumes usually sit between ~250 and ~850 words.
  const wordCount = tokenize(resumeText).length;
  let lengthScore = 100;
  if (wordCount < 150) lengthScore = clamp(Math.round((wordCount / 150) * 100));
  else if (wordCount > 950) lengthScore = clamp(100 - Math.round((wordCount - 950) / 15));

  const breakdown = [
    {
      key: "keywords",
      label: "Keyword match",
      weight: 0.4,
      score: keywordScore,
      tip:
        missing.length > 0
          ? `Add these job keywords where truthful: ${missing.slice(0, 6).join(", ")}.`
          : "Great keyword coverage against this job description.",
    },
    {
      key: "sections",
      label: "Section coverage",
      weight: 0.15,
      score: sectionScore,
      tip: "Include a summary, experience, education and at least 3 skills.",
    },
    {
      key: "impact",
      label: "Measurable impact",
      weight: 0.15,
      score: impactScore,
      tip: "Quantify achievements with numbers, %, or $ (e.g. 'cut load time 40%').",
    },
    {
      key: "actionVerbs",
      label: "Action verbs",
      weight: 0.12,
      score: actionScore,
      tip: "Start each bullet with a strong verb (Led, Built, Reduced, Shipped).",
    },
    {
      key: "contact",
      label: "Contact info",
      weight: 0.1,
      score: contactScore,
      tip: "Add email, phone, location and a LinkedIn/portfolio link.",
    },
    {
      key: "length",
      label: "Length",
      weight: 0.08,
      score: lengthScore,
      tip:
        wordCount < 150
          ? "Resume looks thin — expand your experience bullets."
          : wordCount > 950
          ? "Resume is long — trim to the most relevant achievements."
          : "Length is in a healthy range.",
    },
  ];

  const overall = clamp(
    Math.round(breakdown.reduce((sum, b) => sum + b.score * b.weight, 0))
  );

  const rating =
    overall >= 80 ? "Excellent" : overall >= 65 ? "Good" : overall >= 45 ? "Fair" : "Needs work";

  // Actionable, prioritized suggestions.
  const suggestions = [];
  if (missing.length) {
    suggestions.push({
      priority: "high",
      text: `Weave in missing keywords: ${missing.slice(0, 8).join(", ")}.`,
    });
  }
  if (impactScore < 50) {
    suggestions.push({
      priority: "high",
      text: "Add measurable results (numbers, %, $) to more experience bullets.",
    });
  }
  if (actionScore < 60) {
    suggestions.push({
      priority: "medium",
      text: "Rewrite bullets to start with strong action verbs.",
    });
  }
  if (contactScore < 100) {
    suggestions.push({
      priority: "medium",
      text: "Complete your contact block (email, phone, location, LinkedIn).",
    });
  }
  if (sectionScore < 100) {
    suggestions.push({
      priority: "medium",
      text: "Fill out every core section: summary, experience, education, skills.",
    });
  }
  if (!suggestions.length) {
    suggestions.push({ priority: "low", text: "Strong resume — tailor the summary per application." });
  }

  return {
    score: overall,
    rating,
    wordCount,
    breakdown,
    matchedKeywords: matched,
    missingKeywords: missing,
    totalKeywords: keywords.length,
    suggestions,
  };
}
