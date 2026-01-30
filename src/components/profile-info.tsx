"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ProfileInfoData {
  core_idea: string;
  pain_point: string;
  audience_profile: string[];
  technical_level: string;
  product_role: string;
  intensity_level: number;
  content_goal: string;
  language: string;
}

interface ProfileInfoProps {
  onSave?: (data: ProfileInfoData) => void | Promise<void>;
  initialData?: Partial<ProfileInfoData>;
  isSaving?: boolean;
}

const painPointOptions = [
  "Frustration from not progressing",
  "FOMO / Falling behind",
  "Block when starting projects",
  "Too much theory",
  "Lack of technical confidence",
];

const audienceProfileOptions = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Professional",
  "Student",
];

const technicalLevelOptions = ["Beginner", "Intermediate", "Advanced"];

const productRoleOptions = [
  "Learning accelerator",
  "Alternative method",
  "Mental framework",
  "Bridge from theory to product",
];

const contentGoalOptions = [
  "Awareness",
  "Education",
  "Traffic to your brand",
  "Expert positioning",
];

const languageOptions = ["English", "Spanish"];

export default function ProfileInfo({ onSave, initialData, isSaving = false }: ProfileInfoProps) {
  const [formData, setFormData] = useState<ProfileInfoData>({
    core_idea: initialData?.core_idea || "",
    pain_point: initialData?.pain_point || "",
    audience_profile: initialData?.audience_profile || [],
    technical_level: initialData?.technical_level || "",
    product_role: initialData?.product_role || "",
    intensity_level: initialData?.intensity_level || 3,
    content_goal: initialData?.content_goal || "",
    language: initialData?.language || "English",
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        core_idea: initialData.core_idea ?? prev.core_idea,
        pain_point: initialData.pain_point ?? prev.pain_point,
        audience_profile: initialData.audience_profile ?? prev.audience_profile,
        technical_level: initialData.technical_level ?? prev.technical_level,
        product_role: initialData.product_role ?? prev.product_role,
        intensity_level: initialData.intensity_level ?? prev.intensity_level,
        content_goal: initialData.content_goal ?? prev.content_goal,
        language: initialData.language ?? prev.language,
      }));
    }
  }, [initialData]);

  const handleInputChange = (
    field: keyof ProfileInfoData,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAudienceProfileToggle = (option: string) => {
    setFormData((prev) => {
      const current = prev.audience_profile;
      const newProfile = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return {
        ...prev,
        audience_profile: newProfile,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      await onSave(formData);
    }
  };

  return (
    <div className="bg-zinc-800/40 border border-zinc-700/60 rounded-xl p-6 sm:p-8 space-y-6 shadow-lg backdrop-blur-sm">
      <div className="space-y-1">
        <h2 className="text-white text-xl font-semibold">Profile Information</h2>
        <p className="text-zinc-400 text-sm">
          Fill in the following information to customize your content generation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Core Idea / Key Message */}
        <div className="space-y-2">
          <label className="text-white text-sm font-semibold block">
            1. Core Idea / Key Message
          </label>
          <p className="text-zinc-400 text-xs">
            The semantic axis of all content. Without this, the model cannot build narrative coherence.
          </p>
          <Textarea
            placeholder='e.g., "People learn to code but cannot build real products"'
            value={formData.core_idea}
            onChange={(e) => handleInputChange("core_idea", e.target.value)}
            className="bg-zinc-900/60 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600/50 min-h-[110px] resize-y"
          />
        </div>

        {/* 2. Main Pain Point */}
        <div className="space-y-2">
          <label className="text-white text-sm font-semibold block">
            2. Main Pain Point
          </label>
          <p className="text-zinc-400 text-xs">
            Determines the emotional angle of the hook, slides, and caption.
          </p>
          <select
            value={formData.pain_point}
            onChange={(e) => handleInputChange("pain_point", e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600/50"
          >
            <option value="">Select a pain point</option>
            {painPointOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Audience Profile */}
        <div className="space-y-2">
          <label className="text-white text-sm font-semibold block">
            3. Audience Profile
          </label>
          <p className="text-zinc-400 text-xs">
            Adjusts vocabulary, complexity, and implicit references.
          </p>
          <div className="space-y-2">
            {audienceProfileOptions.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 cursor-pointer hover:bg-zinc-900/40 p-2 rounded-md transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.audience_profile.includes(option)}
                  onChange={() => handleAudienceProfileToggle(option)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-900/60 text-emerald-600 focus:ring-2 focus:ring-emerald-600/50"
                />
                <span className="text-white text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 4. Audience Technical Level */}
        <div className="space-y-2">
          <label className="text-white text-sm font-semibold block">
            4. Audience Technical Level
          </label>
          <p className="text-zinc-400 text-xs">
            Avoids misalignment (too simple or too technical).
          </p>
          <select
            value={formData.technical_level}
            onChange={(e) => handleInputChange("technical_level", e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600/50"
          >
            <option value="">Select a level</option>
            {technicalLevelOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Role in Content */}
        <div className="space-y-2">
          <label className="text-white text-sm font-semibold block">
            5. Role in Content
          </label>
          <p className="text-zinc-400 text-xs">
            Defines how the product is introduced (key to not sound commercial).
          </p>
          <select
            value={formData.product_role}
            onChange={(e) => handleInputChange("product_role", e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600/50"
          >
            <option value="">Select a role</option>
            {productRoleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* 6. Message Intensity */}
        <div className="space-y-2">
          <label className="text-white text-sm font-semibold block">
            6. Message Intensity
          </label>
          <p className="text-zinc-400 text-xs">
            Controls the aggressiveness of the hook and language. 1 = very educational / soft, 5 = very direct / uncomfortable
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={formData.intensity_level}
              onChange={(e) =>
                handleInputChange("intensity_level", parseInt(e.target.value))
              }
              className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <span className="text-emerald-400 text-sm font-semibold w-8 text-right tabular-nums">
              {formData.intensity_level}
            </span>
          </div>
        </div>

        {/* 7. Content Goal */}
        <div className="space-y-2">
          <label className="text-white text-sm font-semibold block">
            7. Content Goal
          </label>
          <p className="text-zinc-400 text-xs">
            Adjusts CTA and closing.
          </p>
          <select
            value={formData.content_goal}
            onChange={(e) => handleInputChange("content_goal", e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600/50"
          >
            <option value="">Select a goal</option>
            {contentGoalOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* 8. Language */}
        <div className="space-y-2">
          <label className="text-white text-sm font-semibold block">
            8. Language
          </label>
          <p className="text-zinc-400 text-xs">
            Critical for scaling.
          </p>
          <select
            value={formData.language}
            onChange={(e) => handleInputChange("language", e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600/50"
          >
            {languageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end pt-4 border-t border-zinc-700/30">
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}

