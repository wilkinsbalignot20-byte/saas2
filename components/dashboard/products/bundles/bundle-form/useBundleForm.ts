 'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BundleTierInput, BundleChoiceInput } from './types';

export function useBundleForm(slug: string, initialData?: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Core Bundle Campaign Name, Description & Type Selector
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  // 🌟 LAYER CHECK: Pinagbubukod ang Flexible Mix-match Bundle sa isang Pre-packed Pack/Package Box
  const [bundleType, setBundleType] = useState<string>(initialData?.bundleType || 'MIX_AND_MATCH');

  // 2. Dynamic Pricing Tiers State (Para sa Bundle o Pack pricing profiles)
  // ➔ Tinitiyak na naka-declare ito bilang array structure ng input fields
  const [tiers, setTiers] = useState<BundleTierInput[]>(
    initialData?.tiers || [{ quantity: 3, price: 0, images: '' }]
  );

  // 3. Custom choices standalone array list state builder
  // ➔ Tinitiyak na naka-declare ito bilang array structure ng selection components
  const [choices, setChoices] = useState<BundleChoiceInput[]>(
    initialData?.choices || [{ name: '', imageUrl: '' }]
  );

  // --- CONTROLLERS PARA SA DYNAMIC PRICING TIERS ---
  const handleAddTier = () => {
    // Kung FIXED_PACKAGE ang gagamitin, imumungkahi ang quantity na 1 bilang standard boxed product package guide
    const nextQty = bundleType === 'FIXED_PACKAGE' ? 1 : 5;
    setTiers([...tiers, { quantity: nextQty, price: 0, images: '' }]);
  };

  const handleRemoveTier = (index: number) => {
    if (tiers.length === 1) return;
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const handleTierChange = (index: number, field: keyof BundleTierInput, value: any) => {
    const updatedTiers = [...tiers];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    setTiers(updatedTiers);
  };

  // --- CONTROLLERS PARA SA STANDALONE CHOICE ITEMS REPEATER ---
  const handleAddChoice = () => {
    setChoices([...choices, { name: '', imageUrl: '' }]);
  };

  const handleRemoveChoice = (index: number) => {
    if (choices.length === 1) return; // Huwag payagang mabura kapag nag-iisa na lang ang hilera
    setChoices(choices.filter((_, i) => i !== index));
  };

  const handleChoiceChange = (index: number, field: keyof BundleChoiceInput, value: string) => {
    const updatedChoices = [...choices];
    updatedChoices[index] = { ...updatedChoices[index], [field]: value };
    setChoices(updatedChoices);
  };

  // --- SUBMIT CODE ENGINE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    // Propesyonal na Validations para sa bagong multi-strategy framework
    if (!name.trim()) {
      setErrorMessage('Please provide a valid package or promotion bundle title.');
      setLoading(false);
      return;
    }

    const invalidTier = tiers.some((t) => t.quantity <= 0 || t.price <= 0 || !t.images);
    if (invalidTier) {
      setErrorMessage('All configured pricing tiers must have a valid quantity, price, and a Cloudinary promo image.');
      setLoading(false);
      return;
    }

    // 🛡️ SECURITY GUARD Validation Check: 
    // Gagana lamang ang choices validation na ito KUNG ang active strategy setting ay MIX_AND_MATCH.
    // Kapag FIXED_PACKAGE (Pre-packed Box/Pack), automatic na nitong lalaktawan ang error check na ito!
    if (bundleType === 'MIX_AND_MATCH') {
      const invalidChoice = choices.some((c) => !c.name.trim() || !c.imageUrl);
      if (invalidChoice) {
        setErrorMessage('Please provide a name and upload a Cloudinary photo for all custom bundle single item choices.');
        setLoading(false);
        return;
      }
    }

    try {
      const apiUrl = initialData?.id
        ? `/api/stores/${slug}/products/bundles/${initialData.id}`
        : `/api/stores/${slug}/products/bundles`;
      const method = initialData?.id ? 'PATCH' : 'POST';

      const res = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          bundleType, // Ipinapasa ang layout classification model strategy (MIX_AND_MATCH o FIXED_PACKAGE)
          tiers,
          // ➔ Kung fixed package, nagpapadala ng malinis na empty array para ligtas sa server parameters parsing
          choices: bundleType === 'MIX_AND_MATCH' ? choices : [], 
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server rejected bundle configuration data sync.');
      }

      router.push(`/dashboard/${slug}/products/bundles`);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong while saving the wholesale configuration bundle pack.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    errorMessage,
    name,
    setName,
    description,
    setDescription,
    bundleType,
    setBundleType, // Ibinabalik para sa UI toggle cards or dropdown event mapping handlers
    tiers,
    choices,
    handleAddTier,
    handleRemoveTier,
    handleTierChange,
    handleAddChoice,
    handleRemoveChoice,
    handleChoiceChange,
    handleSubmit,
  };
}
