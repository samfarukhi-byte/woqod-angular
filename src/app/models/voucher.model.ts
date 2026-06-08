// Retail Voucher Management
//
// A corporate customer generates fuel vouchers against their available credit limit
// and assigns each to a driver. The driver receives an SMS containing a link with a
// dynamic QR code that is scanned at the pump. Vouchers can be restricted by amount,
// expiry, allowed stations, allowed days of the week, and daily/weekly/monthly caps.

export type VoucherBaseStatus = 'Active' | 'Cancelled';

/** Effective status shown in the UI (derived from base status, redemptions and expiry). */
export type VoucherStatus = 'Active' | 'Redeemed' | 'Expired' | 'Cancelled';

export type WeekDay = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export interface WoqodStation {
  code: string;
  name: string;
}

/** A fleet vehicle with its assigned driver + mobile number. */
export interface FleetVehicle {
  vehicleId: string;
  plateNo: string;
  type: string;          // e.g. Pickup, Sedan, Tanker
  driverName: string;
  driverPhone: string;
}

/** A single redemption (utilization) event against a voucher. */
export interface VoucherRedemption {
  date: string;        // ISO timestamp
  amount: number;      // QAR redeemed
  stationCode: string;
  stationName: string;
}

export interface Voucher {
  voucherId: string;
  code: string;            // human-readable voucher code, e.g. WQ-VCH-8F3A
  qrToken: string;         // token embedded in the SMS link / dynamic QR
  vehicleId?: string;      // assigned fleet vehicle (optional)
  vehiclePlate?: string;
  driverName: string;
  driverPhone: string;     // SMS recipient (+974-XXXX-XXXX)
  amount: number;          // total face value (QAR)
  expiryDate: string;      // ISO date (YYYY-MM-DD)
  createdDate: string;     // ISO timestamp
  baseStatus: VoucherBaseStatus;

  // ----- restrictions -----
  stationCodes: string[];  // allowed stations (empty = any station)
  allowedDays: WeekDay[];  // allowed week days (empty = any day)
  dailyLimit: number | null;
  weeklyLimit: number | null;
  monthlyLimit: number | null;

  // ----- utilization -----
  redemptions: VoucherRedemption[];
  lastModified?: string;
}
