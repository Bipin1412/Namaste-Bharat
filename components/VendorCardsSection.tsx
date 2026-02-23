import Link from "next/link";
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import type { Business } from "@/lib/backend/types";

type VendorCard = {
  id: string;
  businessName: string;
  ownerName: string;
  mobileNumber: string;
  website: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  businessType: string;
  businessInfo: string;
};

const fallbackVendors: VendorCard[] = [
  {
    id: "vendor-1",
    businessName: "SaP IT Solutions",
    ownerName: "Santosh Deshpande",
    mobileNumber: "9822042064",
    website: "www.sapitsolutions.com",
    email: "sapitsolutions@yahoo.com",
    address:
      "Sr No 98, 5, Shweta Residency, Right Bhusari Opp Zcon, Kothrud, Pune 411038",
    city: "Pune",
    pincode: "411038",
    businessType: "Product Seller",
    businessInfo:
      "Computers and laptops sales, services, rental, antivirus distribution, Microsoft Windows and Office, networking, CAD, Adobe software, Tally, storage and backup solutions.",
  },
];

function toWebsiteUrl(value: string) {
  if (!value.trim()) {
    return "";
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return `https://${value}`;
}

function toTel(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return "";
  }
  return `tel:+91${digits.slice(-10)}`;
}

type VendorCardsSectionProps = {
  vendors?: VendorCard[];
};

function mapBusinessToVendorCard(business: Business): VendorCard {
  return {
    id: business.id,
    businessName: business.name,
    ownerName: business.ownerName || "Business Owner",
    mobileNumber: business.phone || "",
    website: business.website || "",
    email: business.email || "",
    address: business.addressLine1 || business.locality || business.city,
    city: business.city,
    pincode: business.pincode || "",
    businessType: business.category,
    businessInfo: business.description || business.tagline || "Business listing",
  };
}

export function buildVendorCardsFromBusinesses(businesses: Business[]): VendorCard[] {
  return businesses.map(mapBusinessToVendorCard);
}

export default function VendorCardsSection({ vendors = [] }: VendorCardsSectionProps) {
  const cards = vendors.length > 0 ? vendors : fallbackVendors;

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_30px_-22px_rgba(15,23,42,0.35)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Vendor Spotlight
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Registered Vendor Cards
          </h2>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {cards.map((vendor) => (
          <article
            key={vendor.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
          >
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-4 text-white">
              <p className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]">
                <Building2 className="h-3.5 w-3.5" aria-hidden />
                {vendor.businessType}
              </p>
              <h3 className="mt-2 text-xl font-semibold">{vendor.businessName}</h3>
              <p className="mt-1 inline-flex items-center gap-1 text-sm text-blue-100">
                <UserRound className="h-4 w-4" aria-hidden />
                {vendor.ownerName}
              </p>
            </div>

            <div className="space-y-3 p-4">
              <p className="text-sm leading-relaxed text-slate-700">
                {vendor.businessInfo}
              </p>

              <div className="grid gap-2 text-sm text-slate-700">
                <p className="inline-flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" aria-hidden />
                  <span>
                    {vendor.address}
                    <span className="ml-1 font-medium text-slate-900">
                      ({vendor.city} - {vendor.pincode})
                    </span>
                  </span>
                </p>
                <p className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-700" aria-hidden />
                  <span>{vendor.mobileNumber}</span>
                </p>
                <p className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 text-orange-700" aria-hidden />
                  <span>{vendor.email}</span>
                </p>
                <p className="inline-flex items-center gap-2">
                  <Globe className="h-4 w-4 text-indigo-700" aria-hidden />
                  <span>{vendor.website}</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={toWebsiteUrl(vendor.website)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Visit Website
                </Link>
                <Link
                  href={toTel(vendor.mobileNumber)}
                  className="inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Call Now
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
