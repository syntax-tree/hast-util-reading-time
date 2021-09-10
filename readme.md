# hast-util-reading-time

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[hast][]** utility to estimate the reading time, taking readability of the
document and a target age group into account.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install hast-util-reading-time
```

## Use

Say we have the following HTML from [“Word per minute: Alphanumeric entry” on
Wikipedia](https://en.wikipedia.org/wiki/Words_per_minute#Alphanumeric_entry) in
`example.html`:

```html
<p>Since the length or duration of words is clearly variable, for the purpose of measurement of text entry, the definition of each "word" is often standardized to be five characters or keystrokes long in English, including spaces and punctuation. For example, under such a method applied to plain English text the phrase "I run" counts as one word, but "rhinoceros" and "let's talk" would both count as two.</p>
<p>Karat et al. found that one study of average computer users in 1999, the average rate for transcription was 32.5 words per minute, and 19.0 words per minute for composition. In the same study, when the group was divided into "fast", "moderate", and "slow" groups, the average speeds were 40 wpm, 35 wpm, and 23 wpm, respectively.</p>
<p>With the onset of the era of desktop computers, fast typing skills became much more widespread.</p>
<p>An average professional typist types usually in speeds of 43 to 80 wpm, while some positions can require 80 to 95 (usually the minimum required for dispatch positions and other time-sensitive typing jobs), and some advanced typists work at speeds above 120 wpm. Two-finger typists, sometimes also referred to as "hunt and peck" typists, commonly reach sustained speeds of about 37 wpm for memorized text and 27 wpm when copying text, but in bursts may be able to reach much higher speeds. From the 1920s through the 1970s, typing speed (along with shorthand speed) was an important secretarial qualification and typing contests were popular and often publicized by typewriter companies as promotional tools.</p>
```

And our module, `example.js`:

```js
import fs from 'node:fs'
import {unified} from 'unified'
import rehypeParse from 'rehype-parse'
import {readingTime} from 'hast-util-reading-time'

const example = fs.readFileSync('example.html')
const tree = unified().use(rehypeParse, {fragment: true}).parse(example)

console.log(
  `It takes about ${Math.ceil(readingTime(tree, {age: 18}))}-${Math.ceil(readingTime(tree, {age: 14}))}m to read`
)
```

Now, running `node example.js` yields:

```txt
It takes about 2-3m to read
```

## API

This package exports the following identifiers: `readingTime`.
There is no default export.

### `readingTime(tree, options?)`

Utility to estimate the reading time, taking readability of the document and
a target age group into account.

The algorithm works as follows:

*   Estimate the WPM of the audience age based on the facts that English can be
    read at ±228 WPM (Trauzettel-Klosinski), and that reading rate increases 14
    WPM per grade (Carver)
*   Apply the readability algorithms [Dale—Chall][dale-chall],
    [Automated Readability][automated-readability], [Coleman-Liau][],
    [Flesch][], [Gunning-Fog][], [SMOG][], and [Spache][]
*   Adjust the WPM of the audience for whether the readability algorithms
    estimate its above or below their level
*   `wordCount / adjustedWpm`

Note: this algorithm is specific to English!

###### `options.age`

Target age group (`number`, default: `16`).
This is the age your target audience was still in school.
Set it to 18 if you expect all readers to have finished high school, 21 if you
expect your readers to all be college graduates, etc.

###### Returns

`number` — Reading time in minutes.
The result’s not rounded so it’s possible to retrieve estimated seconds from it.

## Security

Use of `hast-util-reading-time` is safe.

## Related

## Contribute

See [`contributing.md` in `syntax-tree/.github`][contributing] for ways to get
started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/syntax-tree/hast-util-reading-time/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/hast-util-reading-time/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/hast-util-reading-time.svg

[coverage]: https://codecov.io/github/syntax-tree/hast-util-reading-time

[downloads-badge]: https://img.shields.io/npm/dm/hast-util-reading-time.svg

[downloads]: https://www.npmjs.com/package/hast-util-reading-time

[size-badge]: https://img.shields.io/bundlephobia/minzip/hast-util-reading-time.svg

[size]: https://bundlephobia.com/result?p=hast-util-reading-time

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/syntax-tree/unist/discussions

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com

[contributing]: https://github.com/syntax-tree/.github/blob/HEAD/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/HEAD/support.md

[coc]: https://github.com/syntax-tree/.github/blob/HEAD/code-of-conduct.md

[hast]: https://github.com/syntax-tree/hast

[dale-chall]: https://github.com/words/dale-chall-formula

[automated-readability]: https://github.com/words/automated-readability

[coleman-liau]: https://github.com/words/coleman-liau

[flesch]: https://github.com/words/flesch

[gunning-fog]: https://github.com/words/gunning-fog

[spache]: https://github.com/words/spache-formula

[smog]: https://github.com/words/smog-formula
