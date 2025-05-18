import { supabase } from './supabase';

interface Locality {
  id: string;
  city_id: string;
  name: string;
  created_at?: string;
  // Add other fields as needed
}

/**
 * Helper function to fetch localities for a city with retry capability
 */
export async function fetchLocalitiesWithRetry(cityId: string) {
  return supabase
    .from('localities')
    .select('*')
    .eq('city_id', cityId)
    .order('created_at', { ascending: false });
}

/**
 * Helper function to check for city localities with retry capability
 */
export async function checkCityLocalitiesWithRetry(cityId: string) {
  return supabase.from('localities').select('id').eq('city_id', cityId);
}

/**
 * Helper function to delete city localities with retry capability
 */
export async function deleteCityLocalitiesWithRetry(cityId: string) {
  return supabase.from('localities').delete().eq('city_id', cityId);
}

/**
 * Helper function to add a locality with retry capability
 */
export async function addLocalityWithRetry(localityData: Partial<Locality>) {
  return supabase.from('localities').insert(localityData);
}

/**
 * Helper function to update a locality with retry capability
 */
export async function updateLocalityWithRetry(localityId: string, localityData: Partial<Locality>) {
  return supabase.from('localities').update(localityData).eq('id', localityId);
} 