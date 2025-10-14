"use client";

import { useEffect, useState } from "react";
import { useTemplateStore } from "./store/useTamplate";
// import Hero from "@/components/sections/Hero";
import CategorySection from "@/components/sections/CategorySection";
import ProductSlider from "@/components/sections/ProductSlider";
import DealsBanner from "@/components/sections/DealsBanner";
import api from "@/lib/api";
import CategoryProductsSection from "@/components/sections/CategoryProductsSection";
import HeroOne from "@/components/layout/HeroSection/HeroOne";

const COMPONENT_MAP: Record<string, any> = {
  hero: HeroOne,
  category: CategorySection,
  category_products: CategoryProductsSection,
  product: ProductSlider,
  deals: DealsBanner,
};

export default function TemplateRenderer() {
  const { Template, fetchTemplate, loading } = useTemplateStore();
  const [template, setTemplate] = useState<any>(null);
  const [templateLoading, setTemplateLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadTemplate = async () => {
      await fetchTemplate();
      const selectedTemplate = Template?.[0];
      if (!selectedTemplate?.value) {
        console.warn("No template value found");
        setTemplateLoading(false);
        return;
      }

      try {
        const response = await api.post(`/template/get-template-by-id`, {
          id: selectedTemplate.value,
        });
        setTemplate(response.data.data);
      } catch (error) {
        console.error("Error fetching template details:", error);
      } finally {
        setTemplateLoading(false);
      }
    };

    loadTemplate();
  }, [fetchTemplate]);

  if (loading || templateLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!template?.sections?.length) {
    return (
      <div className="text-center py-10 text-gray-500">
        No template sections found
      </div>
    );
  }

  return (
    <div>
      {template.sections.map((section: any) => {
        const Component = COMPONENT_MAP[section.section_key];
        if (!Component) return null;
        return <Component key={section.id} config={section.config_data} />;
      })}
    </div>
  );
}
