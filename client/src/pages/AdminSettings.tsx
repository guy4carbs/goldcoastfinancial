import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminNav from "@/components/AdminNav";
import {
  Building2,
  Phone,
  Share2,
  Search as SearchIcon,
  Mail,
  Palette,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info,
  ExternalLink
} from "lucide-react";

interface SiteSetting {
  id: number;
  key: string;
  value: string | null;
  type: string;
  category: string;
  label: string | null;
  description: string | null;
  updatedAt: string;
}

interface SettingsGroup {
  category: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  settings: SiteSetting[];
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; description: string }> = {
  general: {
    label: "General",
    icon: <Building2 className="w-5 h-5" />,
    description: "Company name, tagline, and basic business information"
  },
  contact: {
    label: "Contact",
    icon: <Phone className="w-5 h-5" />,
    description: "Contact information displayed across the website"
  },
  social: {
    label: "Social Media",
    icon: <Share2 className="w-5 h-5" />,
    description: "Social media profile links for footer and sharing"
  },
  seo: {
    label: "SEO",
    icon: <SearchIcon className="w-5 h-5" />,
    description: "Search engine optimization defaults and meta tags"
  },
  email: {
    label: "Email",
    icon: <Mail className="w-5 h-5" />,
    description: "Email notification settings and recipients"
  },
  branding: {
    label: "Branding",
    icon: <Palette className="w-5 h-5" />,
    description: "Brand colors and visual identity settings"
  }
};

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch all settings
  const { data: settings = [], isLoading, error } = useQuery<SiteSetting[]>({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/settings", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data = await response.json();
      // Map snake_case from DB to camelCase for frontend
      return (data.settings || []).map((s: any) => ({
        id: s.id,
        key: s.key,
        value: s.value,
        type: s.type,
        category: s.category,
        label: s.label,
        description: s.description,
        updatedAt: s.updated_at,
      }));
    }
  });

  // Group settings by category
  const settingsGroups: SettingsGroup[] = Object.entries(CATEGORY_CONFIG).map(([category, config]) => ({
    category,
    ...config,
    settings: settings.filter(s => s.category === category)
  }));

  // Initialize edited values when settings load
  useEffect(() => {
    if (settings.length > 0 && Object.keys(editedValues).length === 0) {
      const initial: Record<string, string> = {};
      settings.forEach(s => {
        initial[s.key] = s.value || "";
      });
      setEditedValues(initial);
    }
  }, [settings]);

  // Track changes
  useEffect(() => {
    if (settings.length === 0) return;
    const hasAnyChange = settings.some(s => {
      const original = s.value || "";
      const edited = editedValues[s.key] || "";
      return original !== edited;
    });
    setHasChanges(hasAnyChange);
  }, [editedValues, settings]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (updates: Record<string, string>) => {
      // Convert object to array format the API expects
      const settingsArray = Object.entries(updates).map(([key, value]) => ({ key, value }));
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ settings: settingsArray })
      });
      if (!response.ok) throw new Error("Failed to save settings");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      setSaveSuccess(true);
      setHasChanges(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  });

  const handleValueChange = (key: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Only send changed values
    const changedSettings: Record<string, string> = {};
    settings.forEach(s => {
      const original = s.value || "";
      const edited = editedValues[s.key] || "";
      if (original !== edited) {
        changedSettings[s.key] = edited;
      }
    });
    if (Object.keys(changedSettings).length > 0) {
      saveMutation.mutate(changedSettings);
    }
  };

  const handleReset = () => {
    const initial: Record<string, string> = {};
    settings.forEach(s => {
      initial[s.key] = s.value || "";
    });
    setEditedValues(initial);
    setHasChanges(false);
  };

  const renderSettingInput = (setting: SiteSetting) => {
    const value = editedValues[setting.key] || "";
    const originalValue = setting.value || "";
    const isModified = value !== originalValue;

    if (setting.type === "boolean") {
      return (
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleValueChange(setting.key, value === "true" ? "false" : "true")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value === "true" ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value === "true" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm text-gray-600">
            {value === "true" ? "Enabled" : "Disabled"}
          </span>
          {isModified && (
            <span className="text-xs text-amber-600 ml-2">• Modified</span>
          )}
        </div>
      );
    }

    if (setting.key.includes("description") || setting.key.includes("address")) {
      return (
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            rows={3}
            className={`w-full bg-white border rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
              isModified ? "border-amber-500" : "border-gray-300"
            }`}
          />
          {isModified && (
            <span className="absolute -top-2 right-2 text-xs text-amber-600 bg-white px-1">Modified</span>
          )}
        </div>
      );
    }

    if (setting.key.includes("color")) {
      return (
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={value || "#1e3a5f"}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            className="w-12 h-10 rounded cursor-pointer border border-gray-300"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            placeholder="#000000"
            className={`flex-1 bg-white border rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary font-mono ${
              isModified ? "border-amber-500" : "border-gray-300"
            }`}
          />
          {isModified && (
            <span className="text-xs text-amber-600">• Modified</span>
          )}
        </div>
      );
    }

    if (setting.key.includes("url") || setting.key.includes("social_")) {
      return (
        <div className="relative flex gap-2">
          <input
            type="url"
            value={value}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            placeholder="https://"
            className={`flex-1 bg-white border rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary ${
              isModified ? "border-amber-500" : "border-gray-300"
            }`}
          />
          {value && (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-gray-500" />
            </a>
          )}
          {isModified && (
            <span className="absolute -top-2 right-14 text-xs text-amber-600 bg-white px-1">Modified</span>
          )}
        </div>
      );
    }

    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => handleValueChange(setting.key, e.target.value)}
          className={`w-full bg-white border rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary ${
            isModified ? "border-amber-500" : "border-gray-300"
          }`}
        />
        {isModified && (
          <span className="absolute -top-2 right-2 text-xs text-amber-600 bg-white px-1">Modified</span>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
        <AdminNav />
        <div className="flex-1 flex items-center justify-center pt-[72px] lg:pt-0">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
        <AdminNav />
        <div className="flex-1 p-8 pt-[72px] lg:pt-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Settings</h3>
            <p className="text-gray-600">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );
  }

  const activeGroup = settingsGroups.find(g => g.category === activeTab);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <AdminNav />

      <div className="flex-1 pt-[72px] lg:pt-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
              <p className="text-gray-600">Manage your website configuration and preferences</p>
            </div>
            <div className="flex items-center gap-3">
              {saveSuccess && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settings saved</span>
                </div>
              )}
              {hasChanges && (
                <>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {saveMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {/* Unsaved Changes Warning */}
          {hasChanges && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-amber-800 text-sm">
                You have unsaved changes. Click "Save Changes" to apply them.
              </p>
            </div>
          )}

          {/* Main Content */}
          <div className="flex gap-6">
            {/* Sidebar Tabs */}
            <div className="w-64 flex-shrink-0">
              <nav className="space-y-1">
                {settingsGroups.map((group) => (
                  <button
                    key={group.category}
                    onClick={() => setActiveTab(group.category)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === group.category
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {group.icon}
                    <div>
                      <div className="font-medium">{group.label}</div>
                      <div className="text-xs opacity-70">
                        {group.settings.length} setting{group.settings.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Settings Panel */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm">
              {activeGroup && (
                <>
                  {/* Panel Header */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {activeGroup.icon}
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {activeGroup.label} Settings
                        </h2>
                        <p className="text-sm text-gray-600">{activeGroup.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Settings List */}
                  <div className="p-6 space-y-6">
                    {activeGroup.settings.length === 0 ? (
                      <div className="text-center py-8">
                        <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No settings in this category</p>
                      </div>
                    ) : (
                      activeGroup.settings.map((setting) => (
                        <div key={setting.key} className="space-y-2">
                          <label className="block">
                            <span className="text-gray-900 font-medium">
                              {setting.label || setting.key}
                            </span>
                            {setting.description && (
                              <span className="block text-sm text-gray-500 mt-0.5">
                                {setting.description}
                              </span>
                            )}
                          </label>
                          {renderSettingInput(setting)}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              How Settings Work
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <strong className="text-gray-900 block mb-1">General & Contact</strong>
                Updates your company information displayed in the header, footer, and contact pages.
              </div>
              <div>
                <strong className="text-gray-900 block mb-1">Social & SEO</strong>
                Links to your social profiles and default meta tags for search engine optimization.
              </div>
              <div>
                <strong className="text-gray-900 block mb-1">Email & Branding</strong>
                Configure notification recipients and customize brand colors across the site.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
