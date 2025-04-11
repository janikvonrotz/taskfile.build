import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight'
import eleventyNavigationPlugin from '@11ty/eleventy-navigation'
import markdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import slugify from 'slugify'

const generatePermalink = (slug, opts, state, idx) => {
    let contentTokenIdx = null
    for (let i = idx + 1; i < state.tokens.length; i++) {
        if (state.tokens[i].type === 'inline') {
            contentTokenIdx = i
            break
        }
    }

    if (contentTokenIdx) {
        const anchorHTML = `<a class="anchor" href="#${slug}" aria-labelledby="${slug}"><span>#</span></a> `

        const contentToken = state.tokens[contentTokenIdx]

        if (contentToken.children && contentToken.children.length > 0) {
            const textToken = new state.Token('html_inline', '', 0)
            textToken.content = anchorHTML
            contentToken.children.unshift(textToken)
        }
    }

    state.tokens[idx].attrs = state.tokens[idx].attrs || []
    state.tokens[idx].attrs.push(['id', slug])
}

const markdownItAnchorOptions = {
    level: [1, 2, 3],
    slugify: (str) =>
        slugify(str, {
            lower: true,
            strict: true,
            remove: /["]/g,
        }),
    tabIndex: false,
    permalink: generatePermalink,
}

const markdownLibrary = markdownIt({ html: true }).use(
    markdownItAnchor,
    markdownItAnchorOptions
)

export default async function (eleventyConfig) {
    const { IdAttributePlugin } = await import('@11ty/eleventy')

    eleventyConfig.setLibrary('md', markdownLibrary)
    eleventyConfig.addPlugin(IdAttributePlugin)
    eleventyConfig.addPlugin(syntaxHighlight)
    eleventyConfig.addPlugin(eleventyNavigationPlugin)
    eleventyConfig.addPassthroughCopy('img')
    eleventyConfig.addPassthroughCopy('css')
    eleventyConfig.addPassthroughCopy('js')
}
