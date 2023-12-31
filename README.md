# The website of Stuart Thomson

It's my personal website, where I write things that very few people read (which I know thanks to analytics).

## How it's put together

This version of my website is based on [Astro](https://astro.build/), with most content coming from [Notion](https://www.notion.so/). I've done it this way because I found myself wanting to write more in Notion than in Markdown files, and wanting to write is an important step in actually writing something. There's some extra code to generate downscaled copies of all images so that mobile devices don't need to download massive images.

The header on most pages has this whole wavey thing going on. That's powered by [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) and [SMIL](https://developer.mozilla.org/en-US/docs/Web/SVG/SVG_animation_with_SMIL). Effectively, a bunch of paths are generated and then the browser animates between them. Soe pages have a cover image, and for these the wave pattern is used as a mask, causing it to become more translucent with fewer waves.

There's a weird little feature where I misuse code blocks as ways of embedding dynamic content into the site. Most Markdown-based sites would use MDX for this, but this site doesn't use Markdown so i had to find some way of doing this. The code for this lives alongside [shiki-twoslash](https://github.com/shikijs/twoslash) for syntax highlighting for code blocks.

For this iteration of the website I decided to remove the comment section that was based on GitHub comments. I don't have the readership to support it anyway. Instead, I've added a little sticker book system that is somewhat inspired by the "like" or emoji reaction systems that many blog syndication websites have. Readers can drag these stickers to anywhere on the page, even covering up the content if they feel like it. It was pretty fun to implement, with a few secret stickers available too. I want to expand this system later, as long as I can come up with a good idea.
