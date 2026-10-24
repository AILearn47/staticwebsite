import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('returns an empty string for empty input', () => {
    expect(renderMarkdown('')).toBe('');
    expect(renderMarkdown(undefined)).toBe('');
  });

  it('demotes "#" to h2 because the page owns the h1', () => {
    expect(renderMarkdown('# Title')).toBe('<h2>Title</h2>');
  });

  it('renders lists, bold and safe links', () => {
    expect(renderMarkdown('- a\n- **b**')).toBe('<ul><li>a</li><li><strong>b</strong></li></ul>');
    expect(renderMarkdown('[x](/contact)')).toBe('<p><a href="/contact">x</a></p>');
  });

  it('escapes raw HTML and refuses javascript: links', () => {
    expect(renderMarkdown('<script>alert(1)</script>')).not.toContain('<script>');
    expect(renderMarkdown('[x](javascript:alert(1))')).not.toContain('<a ');
  });
});
