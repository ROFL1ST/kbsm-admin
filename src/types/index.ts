export interface ApiResponse<T = any> {
  status: boolean;
  data: T;
  messages: string;
}

export interface Pagination {
  total_page: number;
  total_data: number;
}
export interface Filter {
  lookup_value_code: string;
  value: string | number;
}
