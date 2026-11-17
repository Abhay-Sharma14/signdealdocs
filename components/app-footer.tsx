export function AppFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/85">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:px-6 lg:px-8">
        <span>© {new Date().getFullYear()} SignDealDocs. All rights reserved.</span>
        <a href="mailto:hello@signdealdocs.com" className="font-medium hover:text-slate-900">Contact</a>
      </div>
    </footer>
  );
}
