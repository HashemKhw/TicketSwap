export function Footer() {
  return (
    <footer className="mt-24 bg-[var(--surface-low)] pb-10 pt-16">
      <div className="page-shell px-5 sm:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-headline text-xl font-extrabold tracking-[-0.04em] text-[var(--foreground)]">
              TicketSwap
            </p>
            <p className="mt-4 max-w-md text-sm leading-7 text-[var(--muted)]">
              Discover premium live experiences, compare verified resale inventory, and move
              through checkout with confidence.
            </p>
          </div>
          <div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
              Platform
            </p>
            <div className="space-y-3 text-sm text-[var(--muted)]">
              <p>Events</p>
              <p>Sell tickets</p>
              <p>Dashboard</p>
            </div>
          </div>
          <div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
              Trust
            </p>
            <div className="space-y-3 text-sm text-[var(--muted)]">
              <p>Verified listings</p>
              <p>Secure checkout</p>
              <p>Stripe test mode</p>
            </div>
          </div>
        </div>
        <div className="subtle-divider mt-12 flex flex-col gap-3 pt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>TicketSwap MVP — resale marketplace.</p>
          <p>Built for trusted event exchanges.</p>
        </div>
      </div>
    </footer>
  );
}
