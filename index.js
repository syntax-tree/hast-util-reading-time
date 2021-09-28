/**
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Content} Content
 * @typedef {Root|Content} Node
 *
 * @typedef Options
 * @property {number} [age=16]
 *   Target age group.
 *   This is the age your target audience was still in school.
 *   Set it to 18 if you expect all readers to have finished high school,
 *   21 if you expect your readers to all be college graduates, etc.
 */

import {toText} from 'hast-util-to-text'
import readabilityScores from 'readability-scores'
// @ts-expect-error: untyped.
import median from 'compute-median'

// See source [1].
const firstGradeAge = 5
const highschoolGraduationAge = 18
const graduationAge = 22

// See source [2].
// Note that different other algorithms vary between 200, 230, 270, and 280.
// 228 seems to at least be based in research.
const reasonableWpm = 228
const reasonableWpmMax = 340

// See source [3].
const addedWpmPerGrade = 14
const baseWpm =
  reasonableWpm - (highschoolGraduationAge - firstGradeAge) * addedWpmPerGrade

const accuracy = 1e6

/**
 * Utility to estimate the reading time, taking readability of the document and
 * a target age group into account.
 *
 * *   [1] For more info on US education/grade levels, see:
 *     <https://en.wikipedia.org/wiki/Educational_stage#United_States>.
 * *   [2] For the wpm of people reading English, see:
 *     <https://en.wikipedia.org/wiki/Words_per_minute#Reading_and_comprehension>
 * *   [3] For information on reading rate, including how grade levels affect
 *     them, see: <https://en.wikipedia.org/wiki/Reading#Reading_rate>.
 *
 * And some more background info/history and a few insight on where this comes
 * from, see: <https://martech.org/estimated-reading-times-increase-engagement/>.
 *
 * @param {Node} tree
 *   Content to estimate.
 * @param {Options} [options]
 *   Configuration.
 * @returns {number}
 *   Estimated reading time in minutes.
 */
export function readingTime(tree, options = {}) {
  // Cap an age to a reasonable and meaningful age in school.
  const targetAge = Math.min(
    graduationAge,
    Math.max(firstGradeAge, Math.round(options.age || 16))
  )
  const text = toText(tree)
  const scores = readabilityScores(text) || {}
  const score = median(
    [
      scores.daleChall,
      scores.ari,
      scores.colemanLiau,
      scores.fleschKincaid,
      scores.smog,
      scores.gunningFog
    ].filter((d) => d !== undefined)
  )

  if (score === null) {
    return 0
  }

  /** @type {number} */
  const readabilityAge = firstGradeAge + score

  // WPM the target audience normally reads.
  const targetWpm = baseWpm + (targetAge - firstGradeAge) * addedWpmPerGrade

  // If the text requires higher comprehension than the target age group is,
  // estimated to have, make it a bit slower (and vice versa).
  const adjustedWpm =
    targetWpm - (readabilityAge - targetAge) * (addedWpmPerGrade / 2)

  // Cap it to a WPM that’s reasonable.
  const wpm = Math.min(reasonableWpmMax, Math.max(baseWpm, adjustedWpm))

  return Math.round((scores.wordCount / wpm) * accuracy) / accuracy
}
