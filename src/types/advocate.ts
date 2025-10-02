export interface Advocate {
  id?: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: 'MD' | 'PhD' | 'MSW';
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
  createdAt?: string;
}

export interface AdvocateApiResponse {
  data: Advocate[];
}

export interface SearchFilters {
  query?: string;
  city?: string;
  degree?: string;
  specialty?: string;
  minExperience?: number;
  maxExperience?: number;
}