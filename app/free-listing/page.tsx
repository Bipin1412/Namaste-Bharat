import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CircleHelp,
  FileCheck2,
  Megaphone,
  NotebookPen,
  Sparkles,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import FreeListingForm from "@/components/FreeListingForm";

const successStories = [
  {
    name: "Anjali Home Bakers",
    city: "Pune",
    growth: "3.4x more monthly leads",
    image: "/showcase/story-bakers.svg",
  },
  {
    name: "Ritika Dental Care",
    city: "Indore",
    growth: "82% bookings via WhatsApp",
    image: "/showcase/story-dental.svg",
  },
  {
    name: "Aarav Electricals",
    city: "Nashik",
    growth: "4.8 star rating in 45 days",
    image: "/showcase/story-electrical.svg",
  },
];

const listingSteps = [
  {
    title: "Create Account",
    description: "Enter your mobile number and basic business details.",
    Icon: NotebookPen,
  },
  {
    title: "Add Business Profile",
    description: "Fill category, services, area, and contact preferences.",
    Icon: FileCheck2,
  },
  {
    title: "Go Live",
    description: "Get discovered on search, reels, and customer inquiries.",
    Icon: TrendingUp,
  },
];

const faqs = [
  {
    question: "Is listing available on Namaste Bharat?",
    answer:
      "Yes. Creating and publishing your basic business profile is available without signup charge. Paid promotional slots are optional.",
  },
  {
    question: "How long does verification take?",
    answer:
      "Most listings are verified in 24 to 48 hours after contact and business details are confirmed.",
  },
  {
    question: "Can I receive leads on WhatsApp?",
    answer:
      "Yes. Your listing includes a direct WhatsApp CTA so customers can contact you instantly.",
  },
  {
    question: "Can I edit my profile after submission?",
    answer:
      "Yes. You can update business name, category, location, and contact information after activation.",
  },
];

const learningCards = [
  {
    title: "How to write a strong business profile",
    subtitle: "Get more leads with clear services and trust signals.",
    image: "/showcase/service-professional.svg",
  },
  {
    title: "How to choose the right categories",
    subtitle: "Improve discoverability in local searches.",
    image: "/showcase/service-home.svg",
  },
  {
    title: "How to respond faster on WhatsApp",
    subtitle: "Turn inquiries into paying customers quickly.",
    image: "/showcase/service-food.svg",
  },
];

export default function ListingPage() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <section className="mx-auto max-w-7xl space-y-6 px-4 pb-24 pt-4 md:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_34px_-24px_rgba(15,23,42,0.4)] md:p-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
              <Megaphone className="h-3.5 w-3.5" aria-hidden />
              Listing
            </p>
            <h1 className="text-3xl font-semibold leading-tight tracking-[0.01em] text-slate-900 md:text-4xl">
              List Your Business on Namaste Bharat
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              Build trust, get discovered by nearby customers, and receive
              direct inquiries on call and WhatsApp.
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                  Verified Businesses
                </p>
                <p className="mt-1 text-2xl font-semibold text-emerald-800">18.4K+</p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
                  Monthly Leads
                </p>
                <p className="mt-1 text-2xl font-semibold text-blue-800">8.2L+</p>
              </div>
            </div>

            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden />
                Get discovered by nearby customers.
              </li>
              <li className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden />
                Receive call and WhatsApp inquiries.
              </li>
              <li className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden />
                Showcase services with reels and listing profile.
              </li>
            </ul>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/free-listing/detailed"
                className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Open Detailed Listing Form
              </Link>
              <Link
                href="/business/b-1"
                className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                View Detailed Listing Demo
              </Link>
            </div>

            <div className="relative h-44 w-full overflow-hidden rounded-xl border border-slate-200">
              <Image
                src="/showcase/offer-growth.svg"
                alt="Business growth illustration"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <FreeListingForm />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Success stories</p>
            <Link
              href="/search"
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-600"
            >
              View businesses
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {successStories.map((story) => (
              <div
                key={story.name}
                className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
              >
                <div className="relative h-32 w-full">
                  <Image src={story.image} alt={story.name} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <p className="text-base font-semibold text-slate-900">{story.name}</p>
                  <p className="text-sm text-slate-500">{story.city}</p>
                  <p className="mt-2 rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700">
                    {story.growth}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
          <p className="mb-4 text-lg font-semibold text-slate-900">
            Get a Business Listing in 3 Simple Steps
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {listingSteps.map(({ title, description, Icon }, index) => (
              <div
                key={title}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <p className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  {index + 1}
                </p>
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-base font-semibold text-slate-900">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <UserCheck className="h-5 w-5 text-blue-700" aria-hidden />
              Connect with New Customers
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden />
                Trusted listing page with business details.
              </li>
              <li className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden />
                Better ranking with complete profile.
              </li>
              <li className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden />
                Instant lead flow via call and WhatsApp CTA.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-700 to-indigo-700 p-5 text-white">
            <p className="inline-flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="h-5 w-5" aria-hidden />
              Premium Visibility (Optional)
            </p>
            <p className="mt-2 text-sm text-blue-100">
              Boost your listing through highlighted placement, featured reels,
              and location-specific promotion packs.
            </p>
            <button
              type="button"
              className="mt-4 inline-flex h-10 items-center rounded-lg bg-white px-3 text-sm font-semibold text-blue-700"
            >
              Learn promotional plans
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
          <p className="mb-3 inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
            <CircleHelp className="h-5 w-5 text-blue-700" aria-hidden />
            Got a question?
          </p>
          <div className="space-y-2">
            {faqs.map((item) => (
              <details
                key={item.question}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <summary className="cursor-pointer list-none text-sm font-medium text-slate-800">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
          <p className="mb-3 text-lg font-semibold text-slate-900">
            Learn to make your profile more professional
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {learningCards.map((item) => (
              <div
                key={item.title}
                className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
              >
                <div className="relative h-32 w-full">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{item.subtitle}</p>
                  <Link
                    href="/profile"
                    className="mt-3 inline-flex text-xs font-medium text-blue-700 hover:text-blue-600"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

