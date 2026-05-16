export const ERROR_CATEGORIES = [
  {
    id: 'hallucinated-citation',
    label: 'Hallucinated citation',
    definition: 'A case name, docket number, or statutory reference that does not exist but is presented as real authority.',
    danger: 'Submitting a non-existent citation to a court is a breach of candour and has resulted in sanctions and bar referrals in documented cases.',
  },
  {
    id: 'misrepresented-holding',
    label: 'Misrepresented holding',
    definition: 'A real case is cited but its holding, ratio, or significance is incorrectly described.',
    danger: 'Opposing counsel or the court may identify the misrepresentation; the lawyer bears responsibility regardless of whether AI generated it.',
  },
  {
    id: 'jurisdictional-drift',
    label: 'Jurisdictional drift',
    definition: 'The law of a different jurisdiction is applied to the matter at hand without acknowledgment.',
    danger: 'Advice premised on the wrong jurisdiction\'s law may be entirely inapplicable, exposing the client to unadvised risk.',
  },
  {
    id: 'temporal-error',
    label: 'Temporal error',
    definition: 'An overruled precedent, repealed statute, or superseded regulation is cited as current authority.',
    danger: 'Reliance on outdated law can vitiate the advice entirely and expose the lawyer to malpractice liability.',
  },
  {
    id: 'false-precision',
    label: 'False precision',
    definition: 'A statute, rule, or regulation is cited with a subtly incorrect section number, subsection, or cross-reference.',
    danger: 'The error may not be caught on superficial review; the cited provision may say something different or may not exist.',
  },
  {
    id: 'omission-error',
    label: 'Omission error',
    definition: 'A material exception, carve-out, qualification, or contrary authority is omitted from an otherwise accurate statement.',
    danger: 'The incomplete statement may be technically accurate but misleading in context, creating liability for incomplete advice.',
  },
]

export const ERROR_CATEGORY_MAP = Object.fromEntries(
  ERROR_CATEGORIES.map(c => [c.id, c])
)
