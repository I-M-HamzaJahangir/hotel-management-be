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
