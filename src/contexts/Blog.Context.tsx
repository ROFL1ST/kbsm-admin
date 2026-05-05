import React, { createContext, useContext, useState } from "react";
import API from "@/config/API";
import { ApiResponse, Pagination } from "@/types";

// ─── Category ────────────────────────────────────────────────────────────────
export interface BlogCategoryField {
  id: number;
  name: string;
  exx: number;
}

export interface BlogCategoryListKey {
  size: number;
  page: number;
  search: string;
}

export interface CreateBlogCategoryKey {
  name: string;
}

export interface UpdateBlogCategoryKey {
  category_blog_id: number;
  name: string;
}

// ─── Blog Post ───────────────────────────────────────────────────────────────
export interface BlogPostField {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string | null;
  category_blog_id: number;
  category_blog_name: string;
  author_name: string;
  author_avatar: string | null;
  author_bio: string;
  published_date: string;
  read_time: number;
  tags: string[];
  featured: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  exx: number;
}

export interface BlogListKey {
  size: number;
  page: number;
  search: string;
}

export interface CreateBlogKey {
  title: string;
  excerpt: string;
  content: string;
  category_blog_id: number;
  author_name: string;
  author_avatar?: File;
  author_bio: string;
  published_date: string;
  tags: string[];
  featured: boolean;
  image?: File;
}

export interface UpdateBlogKey extends CreateBlogKey {
  blog_id: number;
}

// ─── Context Type ─────────────────────────────────────────────────────────────
interface BlogContextType {
  blogCategories: BlogCategoryField[];
  paginationCategory: Pagination;
  blogs: BlogPostField[];
  paginationBlog: Pagination;
  getBlogCategories: (params: BlogCategoryListKey) => Promise<ApiResponse>;
  createBlogCategory: (params: CreateBlogCategoryKey) => Promise<ApiResponse>;
  updateBlogCategory: (params: UpdateBlogCategoryKey) => Promise<ApiResponse>;
  deleteBlogCategory: (category_blog_id: number) => Promise<ApiResponse>;
  getBlogs: (params: BlogListKey) => Promise<ApiResponse>;
  createBlog: (params: CreateBlogKey) => Promise<ApiResponse>;
  updateBlog: (params: UpdateBlogKey) => Promise<ApiResponse>;
  deleteBlog: (blog_id: number) => Promise<ApiResponse>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) throw new Error("useBlog must be used within a BlogProvider");
  return context;
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [blogCategories, setBlogCategories] = useState<BlogCategoryField[]>([]);
  const [paginationCategory, setPaginationCategory] = useState<Pagination>(null);
  const [blogs, setBlogs] = useState<BlogPostField[]>([]);
  const [paginationBlog, setPaginationBlog] = useState<Pagination>(null);

  // ── GET /blogs/categories ──────────────────────────────────────────────────
  const getBlogCategories = async (params: BlogCategoryListKey): Promise<ApiResponse> => {
    try {
      const response = await API.get("/blogs/categories", { params });
      if (response?.data?.status) {
        setBlogCategories(response.data.data.blog_categories ?? []);
        setPaginationCategory({
          total_data: response.data.data.total_data,
          total_page: response.data.data.total_page,
        });
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching blog categories:", error);
      return null;
    }
  };

  // ── POST /blogs/categories ─────────────────────────────────────────────────
  const createBlogCategory = async (params: CreateBlogCategoryKey): Promise<ApiResponse> => {
    try {
      const response = await API.post("/blogs/categories", params, {
        validateStatus: () => true,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating blog category:", error);
      return null;
    }
  };

  // ── PATCH /blogs/categories ────────────────────────────────────────────────
  const updateBlogCategory = async (params: UpdateBlogCategoryKey): Promise<ApiResponse> => {
    try {
      const response = await API.patch("/blogs/categories", params, {
        validateStatus: () => true,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating blog category:", error);
      return null;
    }
  };

  // ── DELETE /blogs/categories ───────────────────────────────────────────────
  const deleteBlogCategory = async (category_blog_id: number): Promise<ApiResponse> => {
    try {
      const response = await API.delete("/blogs/categories", {
        params: { category_blog_id },
        validateStatus: () => true,
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting blog category:", error);
      return null;
    }
  };

  // ── GET /blogs ─────────────────────────────────────────────────────────────
  const getBlogs = async (params: BlogListKey): Promise<ApiResponse> => {
    try {
      const response = await API.get("/blogs", { params });
      if (response?.data?.status) {
        setBlogs(response.data.data.blog_posts ?? []);
        setPaginationBlog({
          total_data: response.data.data.total_data,
          total_page: response.data.data.total_page,
        });
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching blogs:", error);
      return null;
    }
  };

  // ── POST /blogs ────────────────────────────────────────────────────────────
  const createBlog = async (params: CreateBlogKey): Promise<ApiResponse> => {
    try {
      const formData = new FormData();
      formData.append("title", params.title);
      formData.append("excerpt", params.excerpt);
      formData.append("content", params.content);
      formData.append("category_blog_id", String(params.category_blog_id));
      formData.append("author_name", params.author_name);
      formData.append("author_bio", params.author_bio);
      formData.append("published_date", params.published_date);
      formData.append("tags", JSON.stringify(params.tags));
      formData.append("featured", String(params.featured));
      if (params.image) formData.append("image", params.image);
      if (params.author_avatar) formData.append("author_avatar", params.author_avatar);

      const response = await API.post("/blogs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        validateStatus: () => true,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating blog:", error);
      return null;
    }
  };

  // ── PATCH /blogs ───────────────────────────────────────────────────────────
  const updateBlog = async (params: UpdateBlogKey): Promise<ApiResponse> => {
    try {
      const formData = new FormData();
      formData.append("blog_id", String(params.blog_id));
      formData.append("title", params.title);
      formData.append("excerpt", params.excerpt);
      formData.append("content", params.content);
      formData.append("category_blog_id", String(params.category_blog_id));
      formData.append("author_name", params.author_name);
      formData.append("author_bio", params.author_bio);
      formData.append("published_date", params.published_date);
      formData.append("tags", JSON.stringify(params.tags));
      formData.append("featured", String(params.featured));
      if (params.image) formData.append("image", params.image);
      if (params.author_avatar) formData.append("author_avatar", params.author_avatar);

      const response = await API.patch("/blogs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        validateStatus: () => true,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating blog:", error);
      return null;
    }
  };

  // ── DELETE /blogs ──────────────────────────────────────────────────────────
  const deleteBlog = async (blog_id: number): Promise<ApiResponse> => {
    try {
      const response = await API.delete("/blogs", {
        params: { blog_id },
        validateStatus: () => true,
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting blog:", error);
      return null;
    }
  };

  const value: BlogContextType = {
    blogCategories,
    paginationCategory,
    blogs,
    paginationBlog,
    getBlogCategories,
    createBlogCategory,
    updateBlogCategory,
    deleteBlogCategory,
    getBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};
