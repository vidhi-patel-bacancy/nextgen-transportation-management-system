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
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">How We Can Help</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Product demo and feature walkthrough</li>
            <li>Implementation planning and migration guidance</li>
            <li>Integration discussion (ERP, WMS, carrier data)</li>
            <li>Enterprise security and pricing review</li>
          </ul>
          <div className="mt-5 space-y-2 text-sm text-slate-700">
            <p>
              Sales:{" "}
              <a className="font-semibold text-emerald-700" href="mailto:sales@nextgentms.com">
                sales@nextgentms.com
              </a>
            </p>
            <p>
              Support:{" "}
              <a className="font-semibold text-emerald-700" href="mailto:support@nextgentms.com">
                support@nextgentms.com
              </a>
            </p>
            <p>Support hours: Monday to Friday, 9:00 AM - 6:00 PM (local time)</p>
            <p>Response target: within 1 business day</p>
          </div>
          <div className="mt-6">
            <Link
              href="/signup"
              className="inline-flex rounded-lg bg-gradient-to-r from-emerald-700 to-teal-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Create Trial Workspace
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
