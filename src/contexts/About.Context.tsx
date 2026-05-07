import React, { createContext, useContext, useState } from "react";
import API from "@/config/API";
import { ApiResponse } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────────
export interface AboutCta {
  label: string;
  href: string;
}

export interface AboutHero {
  badge: string;
  title_html: string;
  subtitle_html: string;
  cta_primary: AboutCta;
  cta_secondary: AboutCta;
}

export interface AboutBrandStory {
  badge: string;
  title_html: string;
  content_html: string;
  tags: string[];
  established_year: string;
  location: string;
}

export interface AboutStatItem {
  value: number;
  suffix: string;
  label: string;
}

export interface AboutStats {
  badge: string;
  title_html: string;
  items: AboutStatItem[];
}

export interface AboutValueItem {
  icon: string;
  title: string;
  description_html: string;
}

export interface AboutValues {
  badge: string;
  title_html: string;
  subtitle_html: string;
  items: AboutValueItem[];
}

export interface AboutCtaSection {
  title_html: string;
  subtitle_html: string;
  cta_primary: AboutCta;
  cta_secondary: AboutCta;
}

export interface AboutData {
  hero: AboutHero;
  brand_story: AboutBrandStory;
  stats: AboutStats;
  values: AboutValues;
  cta?: AboutCtaSection;
}

interface AboutContextType {
  aboutData: AboutData | null;
  isLoading: boolean;
  getAbout: () => Promise<void>;
  updateAbout: (data: AboutData) => Promise<ApiResponse<any>>;
}

// ─── Context ──────────────────────────────────────────────────────────────────────
const AboutContext = createContext<AboutContextType | undefined>(undefined);

export const useAbout = () => {
  const context = useContext(AboutContext);
  if (!context) throw new Error("useAbout must be used within an AboutProvider");
  return context;
};

// ─── Provider ────────────────────────────────────────────────────────────────────
export const AboutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getAbout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const res = await API.get("/company/abouts");
      if (res.data?.status) setAboutData(res.data.data);
    } catch (error) {
      console.error("Error fetching about data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAbout = async (data: AboutData): Promise<ApiResponse<any>> => {
    const res = await API.patch("/company/about", data);
    return res.data;
  };

  return (
    <AboutContext.Provider value={{ aboutData, isLoading, getAbout, updateAbout }}>
      {children}
    </AboutContext.Provider>
  );
};
