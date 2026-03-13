export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  licenseNumber: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
