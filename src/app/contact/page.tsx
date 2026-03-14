import Link from "next/link";

import { Card } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <main className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Contact</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">Talk to the NextGen TMS Team</h1>
          </div>
          <Link className="text-sm font-semibold text-emerald-700" href="/">
            Back to Home
          </Link>
        </div>

        <Card className="border-white/80 bg-white/72">
          <p className="text-base text-slate-700">
            For demos, implementation, partnerships, or enterprise pricing, contact our team:
          </p>
          <div className="mt-5 space-y-2 text-sm text-slate-700">
            <p>
              Email: <a className="font-semibold text-emerald-700" href="mailto:sales@nextgentms.com">sales@nextgentms.com</a>
            </p>
            <p>
              Support: <a className="font-semibold text-emerald-700" href="mailto:support@nextgentms.com">support@nextgentms.com</a>
            </p>
            <p>Hours: Monday to Friday, 9:00 AM - 6:00 PM (local time)</p>
          </div>
          <div className="mt-6">
            <Link
              href="/signup"
              className="inline-flex rounded-lg bg-gradient-to-r from-emerald-700 to-teal-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Create a Trial Workspace
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
