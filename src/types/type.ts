import { BED_TYPES } from "../constants/constant";

export interface JwtTokenPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AmenityUpdate {
  name: string;
  isActive: boolean;
  icon?: {
    url: string;
    publicId: string;
  };
}

// types/type.ts

export interface RoomTypeImage {
  url: string;
  publicId: string;
}

export interface RoomTypeBed {
  type: (typeof BED_TYPES)[number];
  quantity: number;
}

export interface RoomTypeUpdate {
  name: string;
  description: string;
  basePrice: number;
  capacity: number;
  beds: RoomTypeBed[];
  isActive: boolean;
  images?: RoomTypeImage[];
  amenities?:string[]
}
