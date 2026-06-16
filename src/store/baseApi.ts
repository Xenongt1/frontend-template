import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getApiBaseUrl } from '@/core/api/client';

export const baseApi = createApi({
  reducerPath: 'api',
  // Re-read the base URL on every request so runtime config changes are picked up.
  baseQuery: async (args, api, extraOptions) =>
    fetchBaseQuery({ baseUrl: getApiBaseUrl() })(args, api, extraOptions),
  endpoints: () => ({}),
});
