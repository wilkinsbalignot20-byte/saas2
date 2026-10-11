// components/dashboard/products/product-form/useProductFields.ts
"use client";

import { useState } from "react";
import type { ProductFormProps } from "./types";

/** Basic info states. Pareho ang pangalan ng props ng BasicInfoSection, kaya pwedeng i-spread. */
export function useProductFields(initialData: ProductFormProps["initialData"]) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [status, setStatus] = useState(initialData?.status || "draft");
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [newCategoryName, setNewCategoryName] = useState("");

  return {
    name, setName,
    description, setDescription,
    categoryId, setCategoryId,
    status, setStatus,
    newCategoryName, setNewCategoryName,
    images, setImages,
  };
}