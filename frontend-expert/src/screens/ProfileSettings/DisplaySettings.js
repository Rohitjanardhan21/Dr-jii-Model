import React, { useEffect, useState, useRef } from "react";
import axios from 'axios';
import toast from "react-hot-toast";

export default function DisplaySettings({ displaySettings, setDisplaySettings }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isInitialMount = useRef(true);

  const API = axios.create({
    baseURL: process.env.REACT_APP_SERVER_BASE_URL,
    withCredentials: true, // This sends cookies with requests
  });

  const fetchDisplaySettings = async () => {
    try {
      const res = await API.get("/doctor/settings/display");

      if (res.data?.success) {
        setDisplaySettings({
          theme: res.data?.data?.theme || res.data?.settings?.theme || "light",
          fontSize: res.data?.data?.fontSize || res.data?.settings?.fontSize || "medium",
        });
      } else {
        // Set defaults if fetch fails
        setDisplaySettings({
          theme: "light",
          fontSize: "medium",
        });
      }

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch display settings");
      // Set defaults on error
      setDisplaySettings({
        theme: "light",
        fontSize: "medium",
      });
    }
  };


  const updateDisplaySettings = async (newData) => {
    if (isUpdating) return; // Prevent multiple simultaneous updates
    
    setIsUpdating(true);
    try {
      const res = await API.put("/doctor/settings/display/update", newData);

      if (res.data?.success) {
        // Update local state with response from backend
        if (res.data?.data) {
          setDisplaySettings(res.data.data);
        }
        toast.success("Display settings updated successfully");
      } else {
        toast.error(res.data?.message || "Failed to update display settings");
        // Revert to previous state on error
        await fetchDisplaySettings();
      }

    } catch (err) {
      toast.error(err.response?.data?.message || "Server error updating display settings");
      // Revert to previous state on error
      await fetchDisplaySettings();
    } finally {
      setIsUpdating(false);
    }
  };


  useEffect(() => {
    fetchDisplaySettings().then(() => {
      // Mark initial mount as complete after first fetch
      isInitialMount.current = false;
    });
  }, []);

  // Only update when user makes changes, not on initial load
  useEffect(() => {
    // Skip update on initial mount (when settings are loaded from backend)
    if (isInitialMount.current) {
      return;
    }
    
    // Only update if both theme and fontSize have values (user has made changes)
    if (displaySettings.theme && displaySettings.fontSize) {
      updateDisplaySettings(displaySettings);
    }
    // eslint-disable-next-line
  }, [displaySettings.theme, displaySettings.fontSize]);

  const handleThemeChange = (theme) => {
    setDisplaySettings((prev) => ({
      ...prev,
      theme,
    }));
  };

  const handleFontSizeChange = (e) => {
    setDisplaySettings((prev) => ({
      ...prev,
      fontSize: e.target.value,
    }));
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-3">
        Display Settings
      </h2>

      {/* Theme Section */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Theme</h3>
        <p className="text-gray-600 mb-4 text-sm">
          Adjust how would you like Docare to appear on this browser.
        </p>
        <div className="flex gap-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="light"
              checked={displaySettings.theme === "light"}
              onChange={() => handleThemeChange("light")}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-900">Light</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={displaySettings.theme === "dark"}
              onChange={() => handleThemeChange("dark")}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-900">Dark</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="auto"
              checked={displaySettings.theme === "auto"}
              onChange={() => handleThemeChange("auto")}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-900">Auto</span>
          </label>
        </div>
      </div>

      {/* Font size Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Font size</h3>
        <p className="text-gray-600 mb-4 text-sm">
          Adjust how would you like Text size to appear on this browser.
        </p>
        <div className="relative">
          <select
            value={displaySettings.fontSize}
            onChange={handleFontSizeChange}
            className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="xlarge">Extra Large</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

