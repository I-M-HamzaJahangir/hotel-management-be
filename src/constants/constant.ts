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
