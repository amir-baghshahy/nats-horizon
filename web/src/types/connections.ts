/**
 * Connection information
 */
export interface Connection {
  id: number;
  user: string;
  ip: string;
  server: string;
  port: number;
  name: string;
  lang: string;
  subs: number;
  status: "open" | "closed";
  start: string;
  last_activity: string;
}

/**
 * Connection filter options
 */
export interface ConnectionFilters {
  search: string;
  server: string;
  status: "open" | "closed" | "all";
}

/**
 * Connection statistics
 */
export interface ConnectionStats {
  total: number;
  uniqueUsers: number;
  totalSubscriptions: number;
  avgSubscriptions: number;
}

/**
 * Server distribution
 */
export interface ServerDistribution {
  server: string;
  connections: number;
}
