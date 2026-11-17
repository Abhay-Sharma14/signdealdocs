import type { ReactNode } from "react";

function inlineMarkdown(value: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\n]+)\*|\x60([^\x60]+)\x60)/g;
  let cursor = 0;
  for (const match of value.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > cursor) nodes.push(value.slice(cursor, start));
    const content = match[2] ?? match[3] ?? match[4] ?? match[5] ?? "";
    if (match[2] || match[3]) nodes.push(<strong key={start} className="font-semibold text-slate-900">{content}</strong>);
    else if (match[4]) nodes.push(<em key={start}>{content}</em>);
    else nodes.push(<code key={start} className="rounded bg-slate-100 px-1 text-[.9em]">{content}</code>);
    cursor = start + match[0].length;
  }
  if (cursor < value.length) nodes.push(value.slice(cursor));
  return nodes;
}

export function ProposalView({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  return (
    <div className="space-y-2 break-words text-sm leading-relaxed text-slate-700">
      {lines.map((line, index) => {
        const key = index;
        const heading = /^(#{1,3})\s+(.+)$/.exec(line);
        if (heading) {
          const content = inlineMarkdown(heading[2]);
          if (heading[1].length === 1) return <h2 key={key} className="pt-3 font-display text-xl font-extrabold text-slate-950">{content}</h2>;
          if (heading[1].length === 2) return <h3 key={key} className="pt-4 text-sm font-bold uppercase tracking-wide text-indigo-700">{content}</h3>;
          return <h4 key={key} className="pt-2 text-sm font-bold text-slate-950">{content}</h4>;
        }
        const bullet = /^\s*[-*]\s+(.+)$/.exec(line);
        if (bullet) return <div key={key} className="flex gap-2 pl-2"><span aria-hidden="true" className="text-indigo-600">•</span><span>{inlineMarkdown(bullet[1])}</span></div>;
        const ordered = /^\s*\d+[.)]\s+(.+)$/.exec(line);
        if (ordered) return <p key={key} className="pl-3">{inlineMarkdown(line.trim())}</p>;
        if (!line.trim()) return <div key={key} className="h-1" />;
        return <p key={key}>{inlineMarkdown(line)}</p>;
      })}
    </div>
  );
}
