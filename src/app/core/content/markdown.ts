// Tiny, safe markdown renderer: headings, lists, bold/italic, links, paragraphs.
// Input is HTML-escaped first, so authored content can never inject markup.

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function inline(s: string): string {
  return escapeHtml(s)
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:|tel:|\/|#)[^)\s]*)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
}

export function renderMarkdown(md: string | undefined | null): string {
  if (!md) return '';
  const html: string[] = [];
  for (const block of md.replace(/\r\n/g, '\n').split(/\n{2,}/)) {
    const lines = block.split('\n').filter((l) => l.trim() !== '');
    if (!lines.length) continue;
    const heading = /^(#{1,4})\s+(.*)$/.exec(lines[0]);
    if (heading && lines.length === 1) {
      // The page already owns the <h1>, so "#" renders as <h2>.
      const level = Math.min(heading[1].length + 1, 5);
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
    } else if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
      html.push(`<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*]\s+/, ''))}</li>`).join('')}</ul>`);
    } else if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
      html.push(`<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ''))}</li>`).join('')}</ol>`);
    } else {
      html.push(`<p>${lines.map(inline).join('<br>')}</p>`);
    }
  }
  return html.join('');
}
