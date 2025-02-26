const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
// const pluginTOC = require('eleventy-plugin-toc')
// const markdownIt = require('markdown-it');
// const markdownItAnchor = require('markdown-it-anchor');

module.exports = async function (eleventyConfig) {
	const { IdAttributePlugin } = await import("@11ty/eleventy");

	// eleventyConfig.setLibrary('md', markdownIt().use(markdownItAnchor));

	eleventyConfig.addPlugin(IdAttributePlugin);
	eleventyConfig.addPlugin(syntaxHighlight);
	eleventyConfig.addPlugin(eleventyNavigationPlugin);

	// eleventyConfig.addPlugin(pluginTOC)
	// <nav>
	// {{ collections.all | eleventyNavigation | eleventyNavigationToHtml | safe }}
	// </nav>
	// <aside>
	// {{ content | toc | safe }}
	// </aside>

	eleventyConfig.addPassthroughCopy("img");
	eleventyConfig.addPassthroughCopy("css");
	eleventyConfig.addPassthroughCopy("js");
}
