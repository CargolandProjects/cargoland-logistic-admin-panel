import { CheckCircle2, MapPin, Gauge, User, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ShipmentDetail } from "@/types/shipment";

export function TelemetryPanel({
  shipment,
  onReassignDriver,
  onFlagDelay,
}: {
  shipment: ShipmentDetail;
  onReassignDriver: () => void;
  onFlagDelay: () => void;
}) {
  const { vehicleStatus, driver, vehicle, telemetry } = shipment;

  return (
    <div className="space-y-4">
      {/* Operating status */}
      <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />
        <div>
          <p className="text-sm font-semibold text-green-800">{vehicleStatus.headline}</p>
          <p className="text-xs text-green-700">{vehicleStatus.subtext}</p>
        </div>
      </div>

      {/* Location / speed / driver / vehicle */}
      <div className="grid grid-cols-2 gap-3">
        <InfoBox icon={MapPin} label="Current Location" value={vehicleStatus.location} />
        <InfoBox icon={Gauge} label="Speed" value={vehicleStatus.speed} />
        <InfoBox
          icon={User}
          label="Driver"
          value={`${driver.name}`}
          hint={`ID: ${driver.id} · ${driver.status}`}
        />
        <InfoBox
          icon={Truck}
          label="Vehicle"
          value={vehicle.model}
          hint={`Plate: ${vehicle.plate}`}
        />
      </div>

      {/* Live telemetry readings */}
      <div className="rounded-lg border border-border p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Live Telemetry
        </p>
        <dl className="space-y-2.5">
          {telemetry.map((t) => (
            <div key={t.label} className="flex items-center justify-between text-sm">
              <dt className="text-muted-foreground">{t.label}</dt>
              <dd className="font-medium text-foreground">{t.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Fleet admin controls */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Fleet Admin Controls
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onReassignDriver}>
            Reassign Driver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Full route view isn't available yet.")}
          >
            View Full Route
          </Button>
          <Button variant="outline" size="sm" className="text-destructive" onClick={onFlagDelay}>
            Flag Delay
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoBox({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg bg-secondary/60 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="text-sm font-semibold text-foreground">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
