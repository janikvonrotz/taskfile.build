module.exports = async function (eleventyConfig) {
	const { IdAttributePlugin } = await import("@11ty/eleventy");
	const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

	eleventyConfig.addPlugin(IdAttributePlugin);
	eleventyConfig.addPlugin(syntaxHighlight);

	eleventyConfig.addPassthroughCopy("img");
}