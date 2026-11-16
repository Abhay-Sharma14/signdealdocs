export function ProposalView({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-700">
      {lines.map((line, index) => {
        const key = `${index}-${line.slice(0, 24)}`;
        if (line.startsWith("### ")) {
          return (
            <h4 key={key} className="pt-2 text-sm font-bold text-slate-950">
              {line.slice(4)}
            </h4>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h3
              key={key}
              className="flex items-center gap-2 pt-4 font-mono text-xs font-bold uppercase tracking-wider text-brand"
            >
              {line.slice(3)}
            </h3>
          );
        }
        if (line.startsWith("# ")) {
          return (
            <h2 key={key} className="font-display pt-2 text-xl font-extrabold text-slate-950">
              {line.slice(2)}
            </h2>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <li key={key} className="ml-5 list-disc">
              {line.slice(2)}
            </li>
          );
        }
        if (!line.trim()) {
          return <div key={key} className="h-1" />;
        }
        return <p key={key}>{line}</p>;
      })}
    </div>
  );
}
