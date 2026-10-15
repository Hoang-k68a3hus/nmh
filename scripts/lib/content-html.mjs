export function injectContentMetadata(html, content) {
  const escape = (value) => value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
  const values = {
    TITLE: content.page.title,
    DESCRIPTION: content.page.description,
    THEME: content.theme.background,
  };
  return html.replace(/__CONTENT_(TITLE|DESCRIPTION|THEME)__/g, (_, key) => escape(values[key]));
}
