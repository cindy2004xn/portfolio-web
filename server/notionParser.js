function richTextToString(richTexts) {
  if (!richTexts?.length) return '';
  return richTexts.map(rt => {
    let text = rt.plain_text || '';
    const a = rt.annotations || {};
    if (a.code) text = `\`${text}\``;
    if (a.bold) text = `**${text}**`;
    if (a.italic) text = `*${text}*`;
    if (a.strikethrough) text = `~~${text}~~`;
    return text;
  }).join('');
}

export function blocksToMarkdown(blocks) {
  const lines = [];

  for (const block of blocks) {
    const { type } = block;
    const content = block[type];
    if (!content) continue;

    switch (type) {
      case 'paragraph':
        lines.push(richTextToString(content.rich_text));
        lines.push('');
        break;

      case 'heading_1':
        lines.push(`# ${richTextToString(content.rich_text)}`);
        lines.push('');
        break;

      case 'heading_2':
        lines.push(`## ${richTextToString(content.rich_text)}`);
        lines.push('');
        break;

      case 'heading_3':
        lines.push(`### ${richTextToString(content.rich_text)}`);
        lines.push('');
        break;

      case 'bulleted_list_item':
        lines.push(`- ${richTextToString(content.rich_text)}`);
        lines.push('');
        break;

      case 'numbered_list_item':
        lines.push(`1. ${richTextToString(content.rich_text)}`);
        lines.push('');
        break;

      case 'to_do': {
        const checked = content.checked ? '[x]' : '[ ]';
        lines.push(`- ${checked} ${richTextToString(content.rich_text)}`);
        lines.push('');
        break;
      }

      case 'image': {
        const url = content.type === 'file'
          ? content.file?.url
          : content.external?.url;
        if (url) {
          const alt = richTextToString(content.caption || []) || 'image';
          lines.push(`![${alt}](${url})`);
          lines.push('');
        }
        break;
      }

      case 'video': {
        const url = content.type === 'external'
          ? content.external?.url
          : content.file?.url;
        if (url) {
          lines.push(`![video](${url})`);
          lines.push('');
        }
        break;
      }

      case 'code': {
        const lang = content.language || '';
        const code = richTextToString(content.rich_text);
        lines.push(`\`\`\`${lang}`);
        lines.push(code);
        lines.push('```');
        lines.push('');
        break;
      }

      case 'quote':
        lines.push(`> ${richTextToString(content.rich_text)}`);
        lines.push('');
        break;

      case 'divider':
        lines.push('---');
        lines.push('');
        break;

      case 'callout': {
        const emoji = content.icon?.emoji || '';
        const text = richTextToString(content.rich_text);
        lines.push(`> ${emoji} ${text}`);
        lines.push('');
        break;
      }

      case 'toggle':
        lines.push(richTextToString(content.rich_text));
        lines.push('');
        break;

      default:
        break;
    }
  }

  return lines.join('\n').trim();
}
