import React from 'react';

function renderInline(text) {
  if (!text) return '';
  const parts = [];
  let key = 0;
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[\d+\])/g;
  let lastIndex = 0;
  let match;
  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.substring(lastIndex, match.index));
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`'))
      parts.push(<code key={key++} className="md-inline-code">{token.slice(1,-1)}</code>);
    else if (token.startsWith('**') && token.endsWith('**'))
      parts.push(<strong key={key++}>{token.slice(2,-2)}</strong>);
    else if (token.startsWith('*') && token.endsWith('*'))
      parts.push(<em key={key++}>{token.slice(1,-1)}</em>);
    else if (/^\[\d+\]$/.test(token))
      parts.push(<span key={key++} className="citation-tag-pill">{token}</span>);
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) parts.push(text.substring(lastIndex));
  return parts.length ? parts : text;
}

export function MarkdownMessage({ content }) {
  if (!content) return null;
  const lines = content.split('\n');
  const elements = [];
  let currentList = null;
  let currentTable = null;
  let inCodeBlock = false;
  let codeLines = [];

  const flushList = () => {
    if (!currentList) return;
    if (currentList.type === 'ul')
      elements.push(<ul key={elements.length} className="md-ul">{currentList.items.map((item, idx) => <li key={idx}>{renderInline(item)}</li>)}</ul>);
    else
      elements.push(<ol key={elements.length} className="md-ol">{currentList.items.map((item, idx) => <li key={idx}>{renderInline(item)}</li>)}</ol>);
    currentList = null;
  };

  const flushTable = () => {
    if (!currentTable) return;
    elements.push(
      <div key={elements.length} className="md-table-wrap">
        <table className="md-table">
          <thead><tr>{currentTable.headers.map((h, i) => <th key={i}>{renderInline(h)}</th>)}</tr></thead>
          <tbody>{currentTable.rows.map((row, ri) => <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{renderInline(cell)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
    currentTable = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (line.startsWith('```')) {
      flushList(); flushTable();
      if (inCodeBlock) {
        elements.push(<pre key={elements.length} className="md-codeblock"><code>{codeLines.join('\n')}</code></pre>);
        codeLines = []; inCodeBlock = false;
      } else { inCodeBlock = true; }
      continue;
    }
    if (inCodeBlock) { codeLines.push(rawLine); continue; }
    if (!line) { flushList(); flushTable(); continue; }
    if (line.startsWith('|') && line.endsWith('|')) {
      flushList();
      const cells = line.slice(1,-1).split('|').map(c => c.trim());
      if (cells.every(c => /^[-:]+$/.test(c))) continue;
      if (!currentTable) currentTable = { headers: cells, rows: [] };
      else currentTable.rows.push(cells);
      continue;
    }
    flushTable();
    if (line === '---' || line === '***') { flushList(); elements.push(<hr key={elements.length} className="md-hr" />); }
    else if (line.startsWith('### ')) { flushList(); elements.push(<h4 key={elements.length} className="md-h4">{renderInline(line.slice(4))}</h4>); }
    else if (line.startsWith('## '))  { flushList(); elements.push(<h3 key={elements.length} className="md-h3">{renderInline(line.slice(3))}</h3>); }
    else if (line.startsWith('# '))   { flushList(); elements.push(<h2 key={elements.length} className="md-h2">{renderInline(line.slice(2))}</h2>); }
    else if (/^(\*|-)\s+/.test(line)) {
      const t = line.replace(/^(\*|-)\s+/, '');
      if (currentList?.type === 'ul') currentList.items.push(t);
      else { flushList(); currentList = { type: 'ul', items: [t] }; }
    } else if (/^\d+\.\s+/.test(line)) {
      const t = line.replace(/^\d+\.\s+/, '');
      if (currentList?.type === 'ol') currentList.items.push(t);
      else { flushList(); currentList = { type: 'ol', items: [t] }; }
    } else { flushList(); elements.push(<p key={elements.length} className="md-p">{renderInline(line)}</p>); }
  }
  flushList(); flushTable();
  if (inCodeBlock && codeLines.length)
    elements.push(<pre key={elements.length} className="md-codeblock"><code>{codeLines.join('\n')}</code></pre>);
  return <div className="formatted-markdown">{elements}</div>;
}
