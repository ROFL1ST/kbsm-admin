import React, { createContext, useContext, useState } from "react";
import API from "@/config/API";
import { ApiResponse, Pagination } from "@/types";

export interface Review {
  id: number;
  name: string;
  role: string;
  review: string;
  rating: number;
  image: string;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  exx: number;
}

export interface GetReviewsKey {
  page: number;
  size: number;
  search?: string;
}

export interface CreateReviewKey {
  image: File;
  name: string;
  role: string;
  review: string;
  rating: number;
}

export interface UpdateReviewKey {
  image?: File | null;
  name: string;
  role: string;
  review: string;
  rating: number;
  review_id: number;
}

export interface DeleteReviewKey {
  review_id: number;
}

interface ReviewsContextType {
  reviews: Review[];
  pagination: Pagination;
  getReviews: (params: GetReviewsKey) => Promise<ApiResponse | null>;
  createReview: (params: CreateReviewKey) => Promise<ApiResponse | null>;
  updateReview: (params: UpdateReviewKey) => Promise<ApiResponse | null>;
  deleteReview: (params: DeleteReviewKey) => Promise<ApiResponse | null>;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error("useReviews must be used within a ReviewsProvider");
  }
  return context;
};

export const ReviewsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<Pagination>(null);

  const getReviews = async (
    params: GetReviewsKey,
  ): Promise<ApiResponse | null> => {
    try {
      const response = await API.get<ApiResponse>("/products/review", { params });
      if (response?.data?.status) {
        setPagination({
          total_data: response.data.data.total_data,
          total_page: response.data.data.total_page,
        });
        setReviews(response.data.data.reviews);
      }
      return response?.data;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return null;
    }
  };

  const createReview = async (
    params: CreateReviewKey,
  ): Promise<ApiResponse | null> => {
    try {
      const formData = new FormData();
      formData.append("image", params.image);
      formData.append("name", params.name);
      formData.append("role", params.role);
      formData.append("review", params.review);
      formData.append("rating", String(params.rating));
      const response = await API.post<ApiResponse>("/products/review", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response?.data;
    } catch (error) {
      console.error("Error creating review:", error);
      return null;
    }
  };

  const updateReview = async (
    params: UpdateReviewKey,
  ): Promise<ApiResponse | null> => {
    try {
      const formData = new FormData();
      formData.append("name", params.name);
      formData.append("role", params.role);
      formData.append("review", params.review);
      formData.append("rating", String(params.rating));
      formData.append("review_id", String(params.review_id));
      if (params.image) {
        formData.append("image", params.image);
      }
      const response = await API.patch<ApiResponse>("/products/review", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response?.data;
    } catch (error) {
      console.error("Error updating review:", error);
      return null;
    }
  };

  const deleteReview = async (
    params: DeleteReviewKey,
  ): Promise<ApiResponse | null> => {
    try {
      const response = await API.delete<ApiResponse>("/products/review", {
        params,
      });
      return response?.data;
    } catch (error) {
      console.error("Error deleting review:", error);
      return null;
    }
  };

  const value: ReviewsContextType = {
    reviews,
    pagination,
    getReviews,
    createReview,
    updateReview,
    deleteReview,
  };

  return (
    <ReviewsContext.Provider value={value}>
      {children}
    </ReviewsContext.Provider>
  );
};
