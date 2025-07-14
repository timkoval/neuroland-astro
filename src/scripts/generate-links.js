import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_PATH = path.join(__dirname, "../content");

// Function to extract text between double brackets
const bracketsExtractor = (content) => {
  if (!content) return null;
  const matches = content.match(/\[\[(.*?)\]\]/g);
  if (!matches) return null;
  return matches.map((match) => match.slice(2, -2));
};

// Get all content files from a directory
const getFilesFromDir = (dir) => {
  try {
    return fs.readdirSync(dir).filter((file) => file.endsWith(".mdx"));
  } catch (e) {
    console.warn(`No directory found for ${dir}`);
    return [];
  }
};

// Get data for backlinks
const getDataForBacklinks = (fileNames, filePath) =>
  fileNames
    .map((fileName) => {
      const file = fs.readFileSync(path.join(filePath, fileName), "utf8");
      const { content, data } = matter(file);
      const slug = fileName.replace(/\.mdx?$/, "");
      const { title, aliases, growthStage, description, draft } = data;

      // Skip draft posts
      if (draft === true) {
        return null;
      }

      return {
        content,
        slug,
        title,
        aliases,
        growthStage,
        description,
      };
    })
    .filter(Boolean); // Remove null entries (drafts)

const getAllPostData = () => {
  // Get all content files
  const projectFiles = getFilesFromDir(path.join(CONTENT_PATH, "projects"));
  const noteFiles = getFilesFromDir(path.join(CONTENT_PATH, "notes"));
  const chronicleFiles = getFilesFromDir(path.join(CONTENT_PATH, "chronicles"));
  // const talkFiles = getFilesFromDir(path.join(CONTENT_PATH, "talks"));

  const projectsData = getDataForBacklinks(
    projectFiles,
    path.join(CONTENT_PATH, "projects"),
  );
  const notesData = getDataForBacklinks(
    noteFiles,
    path.join(CONTENT_PATH, "notes"),
  );
  const chroniclesData = getDataForBacklinks(
    chronicleFiles,
    path.join(CONTENT_PATH, "chronicles"),
  );
  // const talksData = getDataForBacklinks(
  //   talkFiles,
  //   path.join(CONTENT_PATH, "talks"),
  // );

  return [...projectsData, ...notesData, ...chroniclesData /*, ...talksData*/];
};

// Main execution
(function () {
  // Get content and frontmatter for each post
  const totalPostData = getAllPostData();

  // Create initial objects with identifiers and empty link arrays
  const posts = totalPostData.map(
    ({ title, aliases, slug, growthStage, description }) => ({
      ids: [title, ...(aliases ? aliases : [])],
      slug,
      growthStage,
      description,
      outboundLinks: [],
      inboundLinks: [],
    }),
  );

  // Get all outbound links
  totalPostData.forEach((postData, index) => {
    const { content } = postData;
    const bracketContents = bracketsExtractor(content);

    bracketContents?.forEach((alias) => {
      // Find matching post by title or alias
      const match = posts.find((p) => {
        const normalisedAlias = alias
          .replace(/\n/g, "")
          .replace(/\s+/g, " ")
          .trim();
        return p.ids.some(
          (id) => id.toLowerCase() === normalisedAlias.toLowerCase(),
        );
      });

      if (match) {
        // Add to outbound links
        posts[index].outboundLinks.push({
          matchedId: alias,
          title: match.ids[0],
          slug: match.slug,
          growthStage: match.growthStage,
          description: match.description,
        });
      }
    });
  });

  // Get inbound links
  for (const outerPost of posts) {
    const outerPostTitle = outerPost.ids[0];

    for (const innerPost of posts) {
      const innerPostTitle = innerPost.ids[0];

      if (
        innerPost.outboundLinks.some((link) => link.title === outerPostTitle)
      ) {
        outerPost.inboundLinks.push({
          title: innerPostTitle,
          slug: innerPost.slug,
          growthStage: innerPost.growthStage,
          description: innerPost.description,
        });
      }
    }
  }

  // Write to links.json
  fs.writeFileSync(
    path.join(__dirname, "../links.json"),
    JSON.stringify(posts, null, 2),
  );
  console.log("✨ Generated links.json");
})();
