import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function LanguagesSettings({ selectedLanguage, setSelectedLanguage }) {
  const [languages, setLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const isInitialMount = useRef(true);

  const API = axios.create({
    baseURL: process.env.REACT_APP_SERVER_BASE_URL,
    withCredentials: true,
  });

  // Fetch language settings from backend
  const fetchLanguageSettings = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/doctor/settings/language");

      if (res.data?.success) {
        // Update available languages from backend response
        if (res.data.availableLanguages && res.data.availableLanguages.length > 0) {
          setLanguages(res.data.availableLanguages);
        } else {
          // Fallback to default languages if backend doesn't provide
          setLanguages([
            { code: "EN", name: "English", color: "bg-blue-500", isPrimary: true },
            { code: "ES", name: "Espanol", color: "bg-orange-500", isPrimary: false },
            { code: "FR", name: "Francis", color: "bg-green-500", isPrimary: false },
            { code: "DE", name: "Deutch", color: "bg-purple-500", isPrimary: false },
            { code: "IT", name: "Italiano", color: "bg-pink-500", isPrimary: false },
            { code: "JA", name: "Javap", color: "bg-red-500", isPrimary: false },
          ]);
        }

        // Update selected language from backend
        if (res.data.selectedLanguage) {
          setSelectedLanguage(res.data.selectedLanguage);
        }
      }
    } catch (err) {
      console.error("Error fetching language settings:", err);
      toast.error(err.response?.data?.message || "Failed to fetch language settings");
      // Fallback to default languages on error
      setLanguages([
        { code: "EN", name: "English", color: "bg-blue-500", isPrimary: true },
        { code: "ES", name: "Espanol", color: "bg-orange-500", isPrimary: false },
        { code: "FR", name: "Francis", color: "bg-green-500", isPrimary: false },
        { code: "DE", name: "Deutch", color: "bg-purple-500", isPrimary: false },
        { code: "IT", name: "Italiano", color: "bg-pink-500", isPrimary: false },
        { code: "JA", name: "Javap", color: "bg-red-500", isPrimary: false },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update language settings on backend
  const updateLanguageSettings = async (language) => {
    if (isUpdating) return; // Prevent multiple simultaneous updates

    setIsUpdating(true);
    try {
      const res = await API.put("/doctor/settings/language/update", { language });

      if (res.data?.success) {
        setSelectedLanguage(language);
        toast.success(res.data?.message || "Language settings updated successfully");
      } else {
        toast.error(res.data?.message || "Failed to update language settings");
        await fetchLanguageSettings(); // Revert to server state
      }
    } catch (err) {
      console.error("Error updating language settings:", err);
      toast.error(err.response?.data?.message || "Server error updating language settings");
      await fetchLanguageSettings(); // Revert to server state
    } finally {
      setIsUpdating(false);
    }
  };

  // Fetch settings on component mount
  useEffect(() => {
    fetchLanguageSettings().then(() => {
      isInitialMount.current = false;
    });
  }, []);

  const handleLanguageSelect = async (languageName) => {
    // Update local state immediately for UI responsiveness
    setSelectedLanguage(languageName);

    // Save to backend
    await updateLanguageSettings(languageName);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-3">
          Language Settings
        </h2>
        <div className="text-center py-12 text-gray-500">Loading language settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-3">
        Language Settings
      </h2>

      <div className="space-y-0">
        {languages.map((language, index) => (
          <div key={language.code}>
            <div
              className={`flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 transition ${
                index < languages.length - 1 ? "border-b border-gray-200" : ""
              } ${selectedLanguage === language.name ? "bg-blue-50" : ""} ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => !isUpdating && handleLanguageSelect(language.name)}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`${language.color} w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm`}
                >
                  {language.code}
                </div>
                <span className="text-gray-900 font-medium">{language.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {selectedLanguage === language.name && (
                  <span className="text-blue-600 text-sm font-medium">Selected</span>
                )}
                {language.isPrimary && (
                  <span className="text-gray-500 text-sm">Primary</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

