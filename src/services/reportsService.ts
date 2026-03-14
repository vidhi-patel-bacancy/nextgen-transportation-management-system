import { format } from "date-fns";

import { listCarriers } from "@/services/carriersService";
import { listShipments } from "@/services/shipmentsService";
import { listTrackingEvents } from "@/services/trackingService";
import type { CarrierPerformanceMetric, MonthlyShipmentMetric } from "@/types";

export async function getShipmentsPerMonth(): Promise<MonthlyShipmentMetric[]> {
  const shipments = await listShipments();
  const grouped = new Map<string, number>();

  for (const shipment of shipments) {
    const monthKey = format(new Date(shipment.created_at), "MMM yyyy");
    grouped.set(monthKey, (grouped.get(monthKey) ?? 0) + 1);
  }

  return Array.from(grouped.entries()).map(([month, count]) => ({ month, count }));
}

export async function getOnTimeDeliveryRate(): Promise<number> {
  const shipments = await listShipments();
  const delivered = shipments.filter((shipment) => shipment.status === "delivered");
  if (delivered.length === 0) return 0;

  const allEvents = await listTrackingEvents();
  const deliveredEventByShipment = new Map(
    allEvents.filter((event) => event.status === "delivered").map((event) => [event.shipment_id, event]),
  );

  const onTimeCount = delivered.reduce((count, shipment) => {
    const event = deliveredEventByShipment.get(shipment.id);
    if (!event || !shipment.estimated_delivery) {
      return count;
    }

    return new Date(event.timestamp) <= new Date(shipment.estimated_delivery) ? count + 1 : count;
  }, 0);

  return Number(((onTimeCount / delivered.length) * 100).toFixed(2));
}

export async function getCarrierPerformance(): Promise<CarrierPerformanceMetric[]> {
  const [carriers, shipments] = await Promise.all([listCarriers(), listShipments()]);

  return carriers.map((carrier) => {
    const carrierShipments = shipments.filter((shipment) => shipment.carrier_id === carrier.id);
    const deliveredCount = carrierShipments.filter((shipment) => shipment.status === "delivered").length;

    return {
      carrierName: carrier.company_name,
      total: carrierShipments.length,
      delivered: deliveredCount,
      onTimeRate: carrierShipments.length
        ? Number(((deliveredCount / carrierShipments.length) * 100).toFixed(2))
        : 0,
    };
  });
}
