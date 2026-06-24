import { api, apiList } from "@/lib/api/client";
import type { Driver, DriverInput } from "@/types/driver";

export interface DriverListParams {
  page?: number;
  limit?: number;
}

function mapDriver(raw: Partial<Driver> & Record<string, unknown>, i: number): Driver {
  return {
    id: (raw.id as string) ?? (raw.driverTrackingId as string) ?? String(i),
    driverTrackingId: raw.driverTrackingId ?? "",
    firstName: raw.firstName ?? "",
    lastname: raw.lastname ?? "",
    phoneNumber: raw.phoneNumber ?? "",
    emailAddress: raw.emailAddress ?? "",
    dob: raw.dob ?? "",
    gender: raw.gender ?? "",
    driverLicenseNo: raw.driverLicenseNo ?? "",
    licenseExpiry: raw.licenseExpiry ?? "",
    nationalId: raw.nationalId ?? "",
    yearOfExperience: raw.yearOfExperience ?? "",
    assignToVehicle: raw.assignToVehicle ?? "",
    contactName: raw.contactName ?? "",
    contactPhone: raw.contactPhone ?? "",
    activateAccountImmediately: Boolean(raw.activateAccountImmediately),
    sendWelcomeSms: Boolean(raw.sendWelcomeSms),
    currentLocation: raw.currentLocation,
    createdAt: raw.createdAt,
  };
}

export async function listDrivers(params: DriverListParams = {}): Promise<Driver[]> {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("limit", String(params.limit ?? 50));
  const res = await apiList.get<Partial<Driver> & Record<string, unknown>>(
    `/admin/drivers?${qs.toString()}`,
  );
  return res.data.map(mapDriver);
}

export async function createDriver(body: DriverInput): Promise<Driver> {
  return api.post<Driver>("/admin/drivers", body);
}

export async function updateDriver(id: string, body: DriverInput): Promise<Driver> {
  return api.put<Driver>(`/admin/drivers/${id}`, body);
}
