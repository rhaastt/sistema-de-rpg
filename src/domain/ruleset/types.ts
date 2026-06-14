export interface Race {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
}

export interface RulesetClass {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
}

export interface Specialization {
  id: string;
  classId: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
}
