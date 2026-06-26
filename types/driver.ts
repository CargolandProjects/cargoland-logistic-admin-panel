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
