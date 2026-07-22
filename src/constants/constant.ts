export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,

  INTERNAL_SERVER_ERROR: 500,
} as const;

export const IMAGES_FOLDER = {
  Amenities: "hotel-management/amenities",
  RoomTypes: "hotel-management/roomTypes",
} as const;

export const BED_TYPES = [
  "single",
  "double",
  "queen",
  "king",
  "bunk",
  "sofa",
] as const;

export const ROOM_STATUS = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  MAINTENANCE: "maintenance",
  CLEANING: "cleaning",
} as const;

export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CHECKED_IN: "checked_in",
  CHECKED_OUT: "checked_out",
  CANCELLED: "cancelled",
};


export const BOOKING_TRANSITIONS: Record<string, string[]> = {
  [BOOKING_STATUS.CONFIRMED]:   [BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.CHECKED_IN]:  [BOOKING_STATUS.CHECKED_OUT, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.CHECKED_OUT]: [],   
  [BOOKING_STATUS.CANCELLED]:   [],   
};