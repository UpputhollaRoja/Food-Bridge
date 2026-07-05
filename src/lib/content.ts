import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

// Content directory lives at project-root/content/
const contentDir = path.join(process.cwd(), 'content')

/**
 * Read a .md file from /content/ by slug (filename without .md)
 * Returns parsed front-matter data + rendered HTML body.
 */
export async function getContent(slug: string): Promise<{
  data: Record<string, string>
  contentHtml: string
}> {
  const filePath = path.join(contentDir, `${slug}.md`)
  const raw = fs.readFileSync(filePath, 'utf8')

  // Parse front-matter and markdown body
  const { data, content } = matter(raw)

  // Convert Markdown body → HTML
  const processed = await remark().use(remarkHtml).process(content)
  const contentHtml = processed.toString()

  return { data, contentHtml }
}
