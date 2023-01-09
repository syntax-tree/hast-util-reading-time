/**
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Content} Content
 */

/**
 * @typedef {Root | Content} Node
 *
 * @typedef Options
 *   Configuration
 * @property {number | null | undefined} [age=16]
 *   Target age group.
 *
 *   This is the age your target audience was still in school.
 *   Set it to 18 if you expect all readers to have finished high school,
 *   21 if you expect your readers to all be college graduates, etc.
 */

import {toText} from 'hast-util-to-text'
import readabilityScores from 'readability-scores'
// @ts-expect-error: untyped.
import median from 'compute-median'

// See <https://en.wikipedia.org/wiki/Educational_stage#United_States>
// for more info on US education/grade levels.
const firstGradeAge = 5
const highschoolGraduationAge = 18
const graduationAge = 22

// See <https://en.wikipedia.org/wiki/Words_per_minute#Reading_and_comprehension>
// for the wpm of people reading English.
//
// Note that different other algorithms vary between 200, 230, 270, and 280.
// 228 seems to at least be based in research.
const reasonableWpm = 228
const reasonableWpmMax = 340

// See <https://en.wikipedia.org/wiki/Reading#Reading_rate>
// for information on reading rate, including how grade levels affect them.
const addedWpmPerGrade = 14
const baseWpm =
  reasonableWpm - (highschoolGraduationAge - firstGradeAge) * addedWpmPerGrade

const accuracy = 1e6

/**
 * Estimate the reading time, taking readability of the document and a target
 * age group into account.
 *
 * For some more background info/history and a few insight on where this all
 * comes from, see: <https://martech.org/estimated-reading-times-increase-engagement/>.
 *
 * ###### Algorithm
 *
 * The algorithm works as follows:
 *
 * *   estimate the WPM (words per minute) of the audience age based on the facts
 *     that English can be read at ±228 WPM (Trauzettel-Klosinski), and that
 *     reading rate increases 14 WPM per grade (Carver)
 * *   apply the readability algorithms Dale—Chall, Automated Readability,
 *     Coleman-Liau, Flesch, Gunning-Fog, SMOG, and Spache
 * *   adjust the WPM of the audience for whether the readability algorithms
 *     estimate its above or below their level
 * *   `wordCount / adjustedWpm = readingTime`
 *
 * > ⚠️ **Important**: this algorithm is specific to English.
 *
 * @param {Node} tree
 *   Tree to inspect.
 * @param {Options | null | undefined} [options]
 *   Configuration.
 * @returns {number}
 *   Estimated reading time in minutes.
 *
 *   The result is not rounded so it’s possible to retrieve estimated seconds
 *   from it.
 */
export function readingTime(tree, options) {
  const settings = options || {}
  // Cap an age to a reasonable and meaningful age in school.
  const targetAge = Math.min(
    graduationAge,
    Math.max(firstGradeAge, Math.round(settings.age || 16))
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
