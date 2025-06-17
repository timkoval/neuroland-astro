import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";
const parser = new MarkdownIt();

// Helper to strip markdown from text
function stripMarkdown(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Replace markdown links with just the text
    .replace(/[*_`~]/g, ""); // Remove markdown formatting characters
}

// Helper to strip MDX component tags but preserve images
function stripMDXComponents(text) {
  return (
    text
      // Convert ResourceBook components to a simpler format with image and text (handling multiline format)
      .replace(
        /<ResourceBook[\s\S]*?url="([^"]*)"[\s\S]*?title="([^"]*)"[\s\S]*?author="([^"]*)"[\s\S]*?image=\{([^}]*)\}[\s\S]*?>([\s\S]*?)<\/ResourceBook>/g,
        (match, url, title, author, image, content) => {
          const cleanContent = content.trim();
          return `<a href="${url}"><strong>${title}</strong></a> by ${author}${cleanContent ? `\n\n${cleanContent}` : ""}`;
        },
      )
      // Convert BasicImage components to standard img tags
      .replace(
        /<BasicImage[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/>/g,
        (match, src, alt) => `<img src="${src}" alt="${alt}" />`,
      )
      // Convert RemoteImage components to standard img tags
      .replace(
        /<RemoteImage[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/>/g,
        (match, src, alt) => `<img src="${src}" alt="${alt}" />`,
      )
      // Remove Spacer components
      .replace(/<Spacer[^>]*\/>/g, "")
      // Remove all other self-closing MDX component tags
      .replace(/<([A-Z][A-Za-z]*)[^>]*\/>/g, "")
      // Remove all other MDX component tags with content
      .replace(/<([A-Z][A-Za-z]*)[\s\S]*?<\/\1>/g, "")
  );
}

export async function GET(context) {
  const notes = await getCollection("notes", ({ data }) => !data.draft);
  const projects = await getCollection("projects", ({ data }) => !data.draft);
  const chronicles = await getCollection("chronicles", ({ data }) => !data.draft);

  return rss({
    title: "Tim Koval",
    description: "Edge Computing and Robotics Researcher and Engineer's dynamic space where I cultivate evolving notes, projects, and insights, fostering continuous growth and development",
    site: context.site,
    items: [
      ...notes.map((post) => ({
        title: post.data.title,
        pubDate: post.data.startDate,
        description: post.data.description,
        link: `/${post.id}/`,
      })),
      ...projects.map((post) => ({
        title: post.data.title,
        pubDate: post.data.startDate,
        description: post.data.description,
        link: `/${post.id}/`,
      })),
      ...chronicles.map((post) => {
        // Get first non-import, non-empty line of content
        const firstLine = post.body
          .split("\n")
          .filter((line) => !line.startsWith("import") && line.trim() !== "")[0];

        // Filter out import statements from content
        const contentWithoutImports = post.body
          .split("\n")
          .filter((line) => !line.startsWith("import"))
          .join("\n");

        // First strip MDX components, then render markdown
        const processedContent = stripMDXComponents(contentWithoutImports);
        const renderedContent = parser.render(processedContent);

        return {
          title: post.data.title,
          pubDate: post.data.startDate,
          description: post.data.external
            ? `${post.data.external.title} by ${post.data.external.author || "Unknown"}`
            : post.data.citation
              ? `${post.data.citation.title} by ${post.data.citation.authors.join(", ")}`
              : stripMarkdown(firstLine || ""),
          link: `/${post.id}/`,
          content: sanitizeHtml(
            (post.data.external
              ? `<a href="${post.data.external.url}">${post.data.external.title}</a>\n\n`
              : post.data.citation
                ? `<a href="${post.data.citation.url}">${post.data.citation.title}</a>\n\n`
                : "") + renderedContent,
            {
              allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
              allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                img: ["src", "alt"],
              },
            },
          ),
        };
      }),
    ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf()),
    customData: `<language>en-us</language>`,
  });
}
