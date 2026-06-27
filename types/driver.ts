export const GENDER_OPTIONS = ["Male", "Female", "Other"];

/**
 * Normalize a stored date string (the API uses `MM/DD/YYYY`, but values may also
 * be ISO) into the `YYYY-MM-DD` a native date input expects. Returns "" if it
 * can't parse, so the picker just shows empty rather than breaking.
 */
export function toDateInput(value?: string): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const [, mm, dd, yyyy] = m;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  return "";
}

/** Driver item (IDriverDoc). Note the API spells it "lastname" (lowercase n). */
export interface Driver {
  id: string;
  driverTrackingId: string;
  firstName: string;
  lastname: string;
  phoneNumber: string;
  emailAddress: string;
  dob: string;
  gender: string;
  driverLicenseNo: string;
  licenseExpiry: string;
  nationalId: string;
  yearOfExperience: string;
  assignToVehicle: string;
  contactName: string;
  contactPhone: string;
  activateAccountImmediately: boolean;
  sendWelcomeSms: boolean;
  currentLocation?: string;
  createdAt?: string;
}

/** POST/PUT /admin/drivers body (DriverDto). */
export interface DriverInput {
  firstName: string;
  lastname: string;
  phoneNumber: string;
  emailAddress: string;
  dob: string;
  gender: string;
  driverLicenseNo: string;
  licenseExpiry: string;
  nationalId: string;
  yearOfExperience: string;
  contactName: string;
  contactPhone: string;
  activateAccountImmediately: boolean;
  sendWelcomeSms: boolean;
}
