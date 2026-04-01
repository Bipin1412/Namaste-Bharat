import Image from "next/image";
import Link from "next/link";
import profileLearnOne from "../../assests/namaste bharat 3 steps images/pp1.webp";
import profileLearnTwo from "../../assests/namaste bharat 3 steps images/pp2.webp";
import profileLearnThree from "../../assests/namaste bharat 3 steps images/pp3.webp";
import stepOneImage from "../../assests/namaste bharat 3 steps images/step 1.png";
import stepTwoImage from "../../assests/namaste bharat 3 steps images/step 2.png";
import stepThreeImage from "../../assests/namaste bharat 3 steps images/step 3.png";
import {
  ArrowRight,
  BadgeCheck,
  CircleHelp,
  Megaphone,
  Sparkles,
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
    image: stepOneImage,
    tint: "from-violet-50 via-white to-blue-50",
  },
  {
    title: "Add Business Profile",
    description: "Fill category, services, area, and contact preferences.",
    image: stepTwoImage,
    tint: "from-amber-50 via-white to-pink-50",
  },
  {
    title: "Go Live",
    description: "Get discovered on search, reels, and customer inquiries.",
    image: stepThreeImage,
    tint: "from-cyan-50 via-white to-sky-50",
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
    title: "How to Fill in the Essential Business Information",
    subtitle: "Build a stronger profile with complete contact and business details.",
    image: profileLearnOne,
    tint: "bg-[#f9eef1]",
  },
  {
    title: "The Art of Selecting the Right Categories",
    subtitle: "Choose accurate categories so customers can discover your business faster.",
    image: profileLearnTwo,
    tint: "bg-[#def5ff]",
  },
  {
    title: "How to Respond to Customer Reviews and Questions",
    subtitle: "Stay active, build trust, and convert inquiries into real business.",
    image: profileLearnThree,
    tint: "bg-[#eef1fb]",
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
            {listingSteps.map(({ title, description, image, tint }, index) => (
              <div
                key={title}
                className="group overflow-hidden rounded-[22px] border border-slate-100 bg-white shadow-[0_16px_30px_-24px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-1"
              >
                <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${tint}`}>
                  <div className="absolute left-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-sm font-semibold text-blue-700 shadow-sm">
                    {index + 1}
                  </div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.10),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_24%)]" />
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-contain p-5 transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>

                <div className="p-4">
                  <p className="text-base font-semibold text-slate-900">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {description}
                  </p>
                </div>
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
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 md:px-5 md:py-5"
              >
                <summary className="cursor-pointer list-none text-base font-semibold text-slate-900 md:text-lg">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
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
                className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_16px_32px_-26px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-1"
              >
                <div className={`relative h-56 w-full overflow-hidden ${item.tint}`}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-contain p-6"
                  />
                </div>
                <div className="p-6">
                  <p className="text-[1.1rem] font-semibold leading-10 text-slate-950 md:text-[1rem] md:leading-9 lg:text-[1.05rem]">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.subtitle}</p>
                  <Link
                    href="/profile"
                    className="mt-5 inline-flex items-center gap-2 text-base font-medium text-blue-700 hover:text-blue-600"
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4" aria-hidden />
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

