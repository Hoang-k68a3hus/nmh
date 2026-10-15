export const CONTENT_TOKENS = [
  'recipient.name', 'recipient.nickname', 'recipient.displayName',
  'sender.name', 'occasion.label', 'occasion.displayDate', 'occasion.shortDate',
];

export function resolveContentTemplates(content) {
  const name = content.recipient.name.trim();
  const nickname = content.recipient.nickname.trim();
  const values = {
    'recipient.name': name,
    'recipient.nickname': nickname || name,
    'recipient.displayName': nickname || name,
    'sender.name': content.sender.name.trim(),
    'occasion.label': content.occasion.label,
    'occasion.displayDate': content.occasion.displayDate,
    'occasion.shortDate': content.occasion.shortDate,
  };
  const replace = (value, field) => {
    if (typeof value === 'string') {
      const rendered = value.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (_, token) => {
        if (!CONTENT_TOKENS.includes(token)) throw new Error(`Token không hợp lệ tại ${field}: {{${token}}}.`);
        return values[token];
      });
      if (/\{\{|\}\}/.test(rendered)) throw new Error(`Token chưa hoàn chỉnh tại ${field}.`);
      return rendered;
    }
    if (Array.isArray(value)) return value.map((entry, index) => replace(entry, `${field}[${index}]`));
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, replace(entry, `${field}.${key}`)]));
    }
    return value;
  };
  return replace(content, 'content');
}
