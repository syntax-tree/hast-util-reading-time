# hast-util-reading-time

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[hast][] utility to estimate the reading time, taking readability of the
document into account.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`readingTime(tree[, options])`](#readingtimetree-options)
    *   [`Options`](#options)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a utility that takes a [hast][] (HTML) syntax tree and estimates
the reading time, taking readability of the document and a target age group into
account.

## When should I use this?

This is a small utility useful when you have an AST, know your audience, and
want a really smart reading time algorithm.

The rehype plugin
[`rehype-infer-reading-time-meta`][rehype-infer-reading-time-meta]
wraps this utility to figure, for use with [`rehype-meta`][rehype-meta].

## Install

This package is [ESM only][esm].
In Node.js (version 16.0+), install with [npm][]:

```sh
npm install hast-util-reading-time
```

In Deno with [`esm.sh`][esmsh]:

```js
import {readingTime} from 'https://esm.sh/hast-util-reading-time@2'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {readingTime} from 'https://esm.sh/hast-util-reading-time@2?bundle'
</script>
```

## Use

Say our document `example.html` contains (from [“Word per minute: Alphanumeric
entry” on Wikipedia][wiki]:

```html
<p>Since the length or duration of words is clearly variable, for the purpose of measurement of text entry, the definition of each "word" is often standardized to be five characters or keystrokes long in English, including spaces and punctuation. For example, under such a method applied to plain English text the phrase "I run" counts as one word, but "rhinoceros" and "let's talk" would both count as two.</p>
<p>Karat et al. found that one study of average computer users in 1999, the average rate for transcription was 32.5 words per minute, and 19.0 words per minute for composition. In the same study, when the group was divided into "fast", "moderate", and "slow" groups, the average speeds were 40 wpm, 35 wpm, and 23 wpm, respectively.</p>
<p>With the onset of the era of desktop computers, fast typing skills became much more widespread.</p>
<p>An average professional typist types usually in speeds of 43 to 80 wpm, while some positions can require 80 to 95 (usually the minimum required for dispatch positions and other time-sensitive typing jobs), and some advanced typists work at speeds above 120 wpm. Two-finger typists, sometimes also referred to as "hunt and peck" typists, commonly reach sustained speeds of about 37 wpm for memorized text and 27 wpm when copying text, but in bursts may be able to reach much higher speeds. From the 1920s through the 1970s, typing speed (along with shorthand speed) was an important secretarial qualification and typing contests were popular and often publicized by typewriter companies as promotional tools.</p>
```

…and our module `example.js` looks as follows:

```js
import fs from 'node:fs/promises'
import {fromHtml} from 'hast-util-from-html'
import {readingTime} from 'hast-util-reading-time'

const tree = fromHtml(await fs.readFile('example.html'), {fragment: true})

console.log(
  `It takes about ${Math.ceil(readingTime(tree, {age: 18}))}-${Math.ceil(readingTime(tree, {age: 14}))}m to read`
)
```

…now running `node example.js` yields:

```txt
It takes about 2-3m to read
```

## API

This package exports the identifier [`readingTime`][api-reading-time].
There is no default export.

### `readingTime(tree[, options])`

Estimate the reading time, taking readability of the document and a target age
group into account.

For some more background info/history and a few insight on where this all comes
from, see [How estimated reading times increase content engagement][martech].

###### Algorithm

The algorithm works as follows:

*   estimate the WPM (words per minute) of the audience age based on the facts
    that English can be read at ±228 WPM (Trauzettel-Klosinski), and that
    reading rate increases 14 WPM per grade (Carver)
*   apply the readability algorithms [Dale—Chall][dale-chall],
    [Automated Readability][automated-readability], [Coleman-Liau][],
    [Flesch][], [Gunning-Fog][], [SMOG][], and [Spache][]
*   adjust the WPM of the audience for whether the readability algorithms
    estimate its above or below their level
*   `wordCount / adjustedWpm = readingTime`

> ⚠️ **Important**: this algorithm is specific to English.

###### Parameters

*   `tree` ([`Node`][node])
    — tree to inspect
*   `options` ([`Options`][api-options], optional)
    — configuration

###### Returns

Estimated reading time in minutes (`number`).

The result is not rounded so it’s possible to retrieve estimated seconds from
it.

### `Options`

Configuration (TypeScript type).

##### Fields

###### `age`

Target age group (`number`, default: `16`).

This is the age your target audience was still in school.
Set it to 18 if you expect all readers to have finished high school, 21 if you
expect your readers to all be college graduates, etc.

## Types

This package is fully typed with [TypeScript][].
It exports the additional type [`Options`][api-options].

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line,
`hast-util-reading-time@^2`, compatible with Node.js 16.

## Security

Use of `hast-util-reading-time` is safe.

## Related

*   [`rehype-infer-reading-time-meta`][rehype-infer-reading-time-meta]
    — infer reading time as file metadata from the document
*   [`rehype-meta`][rehype-meta]
    — add metadata to the head of a document

## Contribute

See [`contributing.md`][contributing] in [`syntax-tree/.github`][health] for
ways to get started.
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

[size-badge]: https://img.shields.io/badge/dynamic/json?label=minzipped%20size&query=$.size.compressedSize&url=https://deno.bundlejs.com/?q=hast-util-reading-time

[size]: https://bundlejs.com/?q=hast-util-reading-time

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/syntax-tree/unist/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[license]: license

[author]: https://wooorm.com

[health]: https://github.com/syntax-tree/.github

[contributing]: https://github.com/syntax-tree/.github/blob/main/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/main/support.md

[coc]: https://github.com/syntax-tree/.github/blob/main/code-of-conduct.md

[hast]: https://github.com/syntax-tree/hast

[node]: https://github.com/syntax-tree/hast#nodes

[dale-chall]: https://github.com/words/dale-chall-formula

[automated-readability]: https://github.com/words/automated-readability

[coleman-liau]: https://github.com/words/coleman-liau

[flesch]: https://github.com/words/flesch

[gunning-fog]: https://github.com/words/gunning-fog

[spache]: https://github.com/words/spache-formula

[smog]: https://github.com/words/smog-formula

[rehype-infer-reading-time-meta]: https://github.com/rehypejs/rehype-infer-reading-time-meta

[rehype-meta]: https://github.com/rehypejs/rehype-meta

[wiki]: https://en.wikipedia.org/wiki/Words_per_minute#Alphanumeric_entry

[martech]: https://martech.org/estimated-reading-times-increase-engagement/

[api-reading-time]: #readingtimetree-options

[api-options]: #options
