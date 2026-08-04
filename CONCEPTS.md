# Adding concepts from a new lesson doc

There's no automated ingestion pipeline yet — this is the manual process for
turning a tutoring session PDF into `concepts` rows.

## 1. Split the doc into concepts

One lesson doc usually covers several grammar/pattern points (a particle, a
time expression, a verb pattern, a set of question words...). Split into one
`Concept` per distinct rule — don't lump unrelated patterns together, and
don't split a single rule into multiple concepts just because it has many
example rows.

## 2. Write the concept fields

- `title` — short, specific (e.g. "Object marker 을/를", not "Particles")
- `explanation` — one or two sentences stating the rule, written for a learner
  reviewing months later without the original lesson context
- `pattern` — a compact shorthand, e.g. `[noun]+을/를 + verb`
- `sourceLabel` — where it came from, e.g. `Lesson 2026-07-27` or a textbook
  reference, so origin is traceable

## 3. Write drills

Each drill is one multiple-choice question:

- `prompt` — a Korean sentence with exactly **one** blank (`__`), plus an
  English gloss of the target sentence in parens so the question is
  answerable without already knowing the answer
- `answer` — the single correct fill
- `distractors` — 2-3 wrong-but-plausible options. Good distractors are other
  members of the *same grammatical category* the concept is drilling (e.g.
  for a particle drill, other particles — not random unrelated words). Weak
  distractors that are obviously wrong don't test anything.
- `gloss` — the completed Korean sentence + its English translation, shown
  after the user answers

Prefer 5+ drills per concept pulled directly from the doc's own substitution
examples — don't invent vocab the lesson didn't cover.

## 4. Insert into the database

No UI for this yet. Insert directly via the Neon MCP tool (`run_sql`) against
project `blue-paper-01232421` (`korean-study-friend`), table `concepts`.
Required columns: `id` (`gen_random_uuid()::text`), `title`, `explanation`,
`pattern`, `source_label`, `drills` (JSONB array matching the shape above),
`created_at`/`srs_due_date` (`floor(extract(epoch from now())*1000)` so it's
immediately due), `srs_interval`/`srs_repetitions` = 0, `srs_ease_factor` =
2.5 (unused, kept for schema symmetry with `cards`), `srs_last_review` = 0,
`user_id` = the studying user's email.

See `lib/types.ts` (`Concept`, `ConceptDrill`) for the exact shape and
`lib/db.ts` (`dbUpsertConcept`) for the column mapping.
