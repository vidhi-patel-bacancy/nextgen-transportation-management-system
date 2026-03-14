import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Database } from "@/types/supabase";

type TrackingEvent = Database["public"]["Tables"]["tracking_events"]["Row"];

export function TrackingTimeline({ events }: { events: TrackingEvent[] }) {
  return (
    <Card>
      <h3 className="mb-4 text-base font-semibold text-slate-900">Tracking Timeline</h3>
      <ol className="space-y-4">
        {events.length === 0 ? (
          <li className="text-sm text-slate-500">No tracking updates yet.</li>
        ) : (
          events.map((event) => (
            <li key={event.id} className="relative pl-5">
              <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-cyan-700" />
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <Badge value={event.status} />
                  <span className="text-xs text-slate-500">{format(new Date(event.timestamp), "dd MMM yyyy HH:mm")}</span>
                </div>
                <p className="text-sm font-semibold text-slate-800">{event.location}</p>
                {event.notes ? <p className="text-sm text-slate-600">{event.notes}</p> : null}
              </div>
            </li>
          ))
        )}
      </ol>
    </Card>
  );
}
