import assert from 'node:assert/strict'
import test from 'node:test'
import {fromHtml} from 'hast-util-from-html'
import {readingTime} from 'hast-util-reading-time'

// https://simple.wikipedia.org/wiki/Reading
const somewhatSimple = `<p>Reading is what we do when we understand writing.</p>
<p>More fully, it a cognitive process of understanding information represented by printed or written language. It is a way of getting information and insights about something that is written. Reading involves understanding the symbols in that language. It can only be done if one knows the language. Reading and hearing are the two most common ways to get information. Information gained from reading can include entertainment, especially when reading fiction or humor.</p>
<p>Proofreading is a kind of reading that is done to find mistakes in a piece of writing</p>
<p>Directed Reading-Thinking Activity is a method which aims to develop better reading.</p>
<ol>
<li>Making predictions/hypothesis about the content, idea, and concepts from the title of the reading material.</li>
<li>Sectional reading or processing (chunking) of the material.</li>
<li>Checking the reliability and similarity of the read content with the predictions supported by evidence from the text.</li>
<li>For better comprehension, to know what and why the text says: review vocabulary, understanding of the main idea, syntax of the sentence, details/facts and sequence of the story, and make inferences about the characters’ attitudes, behaviors or circumstances in the story.</li>
<li>Make plausible predictions about what the next section will be about in the reading material.</li>
</ol>`

// https://en.wikipedia.org/wiki/Words_per_minute#Alphanumeric_entry
// Capped at exactly the same number of words of `somewhatSimple`.
const somewhatComplex = `<p>Since the length or duration of words is clearly variable, for the purpose of measurement of text entry, the definition of each "word" is often standardized to be five characters or keystrokes long in English, including spaces and punctuation. For example, under such a method applied to plain English text the phrase "I run" counts as one word, but "rhinoceros" and "let's talk" would both count as two.</p>
<p>Karat et al. found that one study of average computer users in 1999, the average rate for transcription was 32.5 words per minute, and 19.0 words per minute for composition. In the same study, when the group was divided into "fast", "moderate", and "slow" groups, the average speeds were 40 wpm, 35 wpm, and 23 wpm, respectively.</p>
<p>With the onset of the era of desktop computers, fast typing skills became much more widespread.</p>
<p>An average professional typist types usually in speeds of 43 to 80 wpm, while some positions can require 80 to 95 (usually the minimum required for dispatch positions and other time-sensitive typing jobs), and some advanced typists work at speeds above 120 wpm. Two-finger typists, sometimes also referred to as "hunt and peck" typists, commonly reach sustained speeds of about 37 wpm for memorized</p>
`

const tree = fromHtml(somewhatComplex, {fragment: true})
const treeSomewhatSimple = fromHtml(somewhatSimple, {fragment: true})

test('readingTime', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(
      Object.keys(await import('hast-util-reading-time')).sort(),
      ['readingTime']
    )
  })

  await t.test('should estimate (somewhat complex)', async function () {
    assert.deepEqual(readingTime(tree).toFixed(2), '1.22')
  })

  await t.test('should estimate (somewhat simple)', async function () {
    assert.deepEqual(readingTime(treeSomewhatSimple).toFixed(2), '1.10')
  })

  await t.test('should estimate (empty)', async function () {
    assert.deepEqual(
      readingTime({type: 'root', children: []}).toFixed(2),
      '0.00'
    )
  })

  await t.test(
    'should take age into account (1, somewhat complex)',
    async function () {
      assert.deepEqual(readingTime(tree, {age: 12}).toFixed(2), '2.44')
    }
  )

  await t.test(
    'should take age into account (1, somewhat simple)',
    async function () {
      assert.deepEqual(
        readingTime(treeSomewhatSimple, {age: 12}).toFixed(2),
        '1.98'
      )
    }
  )

  await t.test(
    'should take age into account (2, somewhat complex)',
    async function () {
      assert.deepEqual(readingTime(tree, {age: 21}).toFixed(2), '0.75')
    }
  )

  await t.test(
    'should take age into account (2, somewhat simple)',
    async function () {
      assert.deepEqual(
        readingTime(treeSomewhatSimple, {age: 21}).toFixed(2),
        '0.71'
      )
    }
  )

  await t.test('should cap at a reasonable time (1)', async function () {
    assert.deepEqual(readingTime(tree, {age: 1}).toFixed(2), '4.46')
  })

  await t.test('should cap at a reasonable time (2)', async function () {
    assert.deepEqual(readingTime(tree, {age: 81}).toFixed(2), '0.70')
  })
})
