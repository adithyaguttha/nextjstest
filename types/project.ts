export type Project = {
  id: string;
  name: string;
  developer_id: string;
  city_id: string;
  locality_id: string;
  price_range: {
    min: number;
    max: number;
    currency: string;
    min_unit: string | null;
    max_unit: string | null;
  };
  emi_details: {
    amount: number;
    duration: number;
    interest_rate: number;
  };
  construction_status: 'Ready to Move' | 'Under Construction' | 'Not Started' | 'Completed';
  project_highlights: string[];
  location_coordinates: {
    latitude: number;
    longitude: number;
  };
  city: {
    id: string;
    name: string;
  };
  locality: {
    id: string;
    name: string;
  };
  brochure_url: string | null;
  project_size: {
    unit: string;
    total_area: string | number;
    built_up_area: number;
  };
  created_at: string;
  updated_at: string;
  created_by: string;
  is_active: boolean;
  cover_image_url: string;
  amenities: string[];
  is_featured: boolean;
  possession_date: string | null;
  rera_verified: boolean;
  rera_id: string | null;
  video_url: string | null;
  slug: string | null;
  developer_name: string | null;
  developer: {
    id: string;
    name: string;
    phone: string;
  };
  models?: {
    bhk_type: string;
    availability_status: 'available' | 'sold_out' | 'coming_soon';
  }[];
}; 