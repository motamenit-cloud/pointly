export function Divider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4 w-full">
      <div className="flex-1 h-px bg-navy/10" />
      <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
        {text}
      </span>
      <div className="flex-1 h-px bg-navy/10" />
    </div>
  );
}
