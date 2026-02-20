import Link from "next/link";

const footerLinks = [
  { label: "Design Review", href: "/design-review" },
  { label: "Free Listing", href: "/free-listing" },
  { label: "Offers", href: "/offers" },
  { label: "Stories", href: "/stories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function SiteFooter() {
  return (
    <footer className="mt-6 border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <p className="text-sm font-semibold text-slate-900">Namaste Bharat</p>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600">
          Bharat-first local business discovery platform for MSMEs. Built for
          fast discovery, verified listings, and direct WhatsApp engagement.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex h-8 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Copyright {new Date().getFullYear()} Namaste Bharat. Demo build for
          client testing and design review.
        </p>
      </div>
    </footer>
  );
}
