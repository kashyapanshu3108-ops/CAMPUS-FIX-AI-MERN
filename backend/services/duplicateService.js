const Issue = require("../models/Issue");

// Common English stopwords stripped out before comparing text, so
// matching focuses on meaningful words (e.g. "hostel", "leak")
// rather than "the", "is", "near", etc.
const STOPWORDS = new Set([
  "the","a","an","is","are","was","were","near","in","on","at","of","to","and",
  "there","this","that","it","its","has","have","had","being","been","for","with",
  "from","outside","inside","by","some","any","students","student","report","reported",
]);

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

// Jaccard similarity between two sets of words: intersection size / union size.
function jaccardSimilarity(wordsA, wordsB) {
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const w of setA) if (setB.has(w)) intersection++;

  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

const SIMILARITY_THRESHOLD = 0.28;

/**
 * Looks for an existing unresolved issue that appears to describe the same
 * real-world problem as the new one, using: same category (if already known),
 * similar location text, and word-overlap similarity between title+description.
 * Returns the existing Issue document (the "master") or null.
 */
async function findDuplicate(newIssue) {
  const candidates = await Issue.find({
    status: { $ne: "Resolved" },
    duplicateOf: null, // only compare against master issues, not against other duplicates
  }).limit(200);

  const newWords = tokenize(`${newIssue.title} ${newIssue.description}`);
  const newLocation = (newIssue.location || "").toLowerCase().trim();

  let best = null;
  let bestScore = 0;

  for (const candidate of candidates) {
    if (String(candidate._id) === String(newIssue._id)) continue;

    const candidateWords = tokenize(`${candidate.title} ${candidate.description}`);
    const textScore = jaccardSimilarity(newWords, candidateWords);

    const candidateLocation = (candidate.location || "").toLowerCase().trim();
    const locationMatch =
      candidateLocation &&
      newLocation &&
      (candidateLocation.includes(newLocation) || newLocation.includes(candidateLocation));

    // Location match gives a meaningful boost since two reports at the same
    // spot are much more likely to describe the same real-world problem.
    const score = textScore + (locationMatch ? 0.2 : 0);

    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  if (best && bestScore >= SIMILARITY_THRESHOLD) {
    return best;
  }
  return null;
}

module.exports = { findDuplicate, jaccardSimilarity, tokenize };
