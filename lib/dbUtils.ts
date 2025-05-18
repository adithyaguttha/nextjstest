/**
 * Helper function to fetch localities for a city with retry capability
 */
export async function fetchLocalitiesWithRetry(cityId: string) {
  return executeWithRetry(
    () => supabase
      .from('localities')
      .select('*')
      .eq('city_id', cityId)
      .order('created_at', { ascending: false }) as Promise<PostgrestResponse<any>>,
    { description: `Fetch localities for city ${cityId}` }
  );
}

/**
 * Helper function to check for city localities with retry capability
 */
export async function checkCityLocalitiesWithRetry(cityId: string) {
  return executeWithRetry(
    () => supabase.from('localities').select('id').eq('city_id', cityId) as Promise<PostgrestResponse<any>>,
    { description: `Check localities for city ${cityId}` }
  );
}

/**
 * Helper function to delete city localities with retry capability
 */
export async function deleteCityLocalitiesWithRetry(cityId: string) {
  return executeWithRetry(
    () => supabase.from('localities').delete().eq('city_id', cityId) as Promise<PostgrestResponse<any>>,
    { description: `Delete localities for city ${cityId}` }
  );
}

/**
 * Helper function to add a locality with retry capability
 */
export async function addLocalityWithRetry(localityData: any) {
  return executeWithRetry(
    () => supabase.from('localities').insert(localityData) as Promise<PostgrestResponse<any>>,
    { description: 'Add locality' }
  );
}

/**
 * Helper function to update a locality with retry capability
 */
export async function updateLocalityWithRetry(localityId: string, localityData: any) {
  return executeWithRetry(
    () => supabase.from('localities').update(localityData).eq('id', localityId) as Promise<PostgrestResponse<any>>,
    { description: `Update locality ${localityId}` }
  );
} 