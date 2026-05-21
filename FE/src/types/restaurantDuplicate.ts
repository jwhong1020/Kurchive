export type DuplicateCandidate = {
  id: number;
  name: string;
  address?: string | null;
  location_link?: string | null;
  distance_m?: number;
  thumbnail_url?: string | null;
  is_name_similar?: boolean;
};

export type DuplicateConflict = {
  message: string;
  kind: "exact" | "nearby";
  candidates: DuplicateCandidate[];
};
