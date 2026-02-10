import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useDoctorAuthStore } from "../../store/useDoctorAuthStore";

export default function PrivacySettings({ privacySettings, setPrivacySettings }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showDeactivateAccountModal, setShowDeactivateAccountModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const { doctor, doctorLogout } = useDoctorAuthStore();
  const navigate = useNavigate();
  
  const BASE_URL = process.env.REACT_APP_SERVER_BASE_URL;
  
  const getPrivacySettings = async () => {
    try {
      const res = await fetch(`${BASE_URL}/doctor/settings/privacy`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setPrivacySettings(data.data);
      } else {
        toast.error(data.message || "Failed to fetch privacy settings");
      }

    } catch (error) {
      toast.error("Server error fetching privacy settings");
    }
  };

  const updatePrivacySettings = async (updates) => {
    if (isUpdating) return; // Prevent multiple simultaneous updates
    
    const doctorId = doctor?._id;
    if (!doctorId) {
      toast.error("Doctor ID not found. Please log in again.");
      return;
    }
    
    setIsUpdating(true);
    try {
      const res = await fetch(`${BASE_URL}/doctor/settings/privacy/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...updates,
          doctorId: doctorId, // Include doctorId in request body
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Update local state with the response from backend
        setPrivacySettings(data.data);
        toast.success("Privacy settings updated successfully");
      } else {
        toast.error(data.message || "Failed to update privacy settings");
        // Revert to previous state on error
        await getPrivacySettings();
      }

    } catch (error) {
      toast.error("Server error updating privacy settings");
      // Revert to previous state on error
      await getPrivacySettings();
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    getPrivacySettings();
  }, []);

  const handleToggle = async (key) => {
    const newValue = !privacySettings[key];
    
    // Optimistically update local state
    setPrivacySettings((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    // Update backend
    await updatePrivacySettings({ [key]: newValue });
  };

  const handleRadioChange = async (value) => {
    // Optimistically update local state
    setPrivacySettings((prev) => ({
      ...prev,
      whoCanSendMessage: value,
    }));

    // Update backend
    await updatePrivacySettings({ whoCanSendMessage: value });
  };

  const handleDeactivateAccount = () => {
    setShowDeactivateAccountModal(true);
  };

  const handleDeleteAccount = () => {
    setShowDeleteAccountModal(true);
  };

  const handleDeleteAccountConfirm = async () => {
    if (!deletePassword.trim()) {
      toast.error("Please enter your password to confirm account deletion");
      return;
    }

    setIsDeleting(true);
    try {
      const doctorId = doctor?.docRefId?._id || doctor?._id;
      if (!doctorId) {
        toast.error("Doctor ID not found. Please log in again.");
        setShowDeleteAccountModal(false);
        setDeletePassword("");
        return;
      }

      // Call delete account API with password verification
      const res = await axios.post(
        `${BASE_URL}/doctor/schedule-account-deletion`,
        {
          password: deletePassword,
          doctorId: doctorId,
        },
        { withCredentials: true }
      );

      if (res.data.success || res.status === 200) {
        toast.success("Account scheduled for deletion in 30 days");
        setShowDeleteAccountModal(false);
        setDeletePassword("");
        
        // Logout the user
        const logoutSuccess = await doctorLogout();
        if (logoutSuccess) {
          navigate("/");
        }
      } else {
        toast.error(res.data.message || "Failed to delete account. Please check your password.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account. Please check your password.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeactivateAccountConfirm = async () => {
    if (!deactivatePassword.trim()) {
      toast.error("Please enter your password to confirm account deactivation");
      return;
    }

    setIsDeactivating(true);
    try {
      const doctorId = doctor?.docRefId?._id || doctor?._id;
      if (!doctorId) {
        toast.error("Doctor ID not found. Please log in again.");
        setShowDeactivateAccountModal(false);
        setDeactivatePassword("");
        return;
      }

      // Call deactivate account API with password verification
      const res = await axios.post(
        `${BASE_URL}/doctor/deactivate-account`,
        {
          password: deactivatePassword,
          doctorId: doctorId,
        },
        { withCredentials: true }
      );

      if (res.data.success || res.status === 200) {
        toast.success("Account deactivated successfully");
        setShowDeactivateAccountModal(false);
        setDeactivatePassword("");
        
        // Logout the user
        const logoutSuccess = await doctorLogout();
        if (logoutSuccess) {
          navigate("/");
        }
      } else {
        toast.error(res.data.message || "Failed to deactivate account. Please check your password.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to deactivate account. Please check your password.");
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-3">
        Privacy Settings
      </h2>

      {/* Privacy Settings Section */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="space-y-6">
          {/* Allow search engine to index your name */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-900">Allow search engine to index your name</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacySettings.allowSearchEngineIndex}
                  onChange={() => handleToggle("allowSearchEngineIndex")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <button className="text-gray-500 hover:text-gray-700 underline text-sm">
              Learn more
            </button>
          </div>

          {/* Allow adult content in recommendations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-900">Allow adult content in recommendations</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacySettings.allowAdultContent}
                  onChange={() => handleToggle("allowAdultContent")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <button className="text-gray-500 hover:text-gray-700 underline text-sm">
              Learn more
            </button>
          </div>

          {/* Allow your profile to be discovered by email */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-gray-900">Allow your profile to be discovered by email</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacySettings.allowProfileDiscoveryByEmail}
                  onChange={() => handleToggle("allowProfileDiscoveryByEmail")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Allow large language models to be trained on your content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-900">Allow large language models to be trained on your content</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacySettings.allowLLMTraining}
                  onChange={() => handleToggle("allowLLMTraining")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <button className="text-gray-500 hover:text-gray-700 underline text-sm">
              Learn more
            </button>
          </div>
        </div>
      </div>

      {/* Inbox Preferences Section */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inbox Preferences</h3>
        <div className="mb-4">
          <p className="text-gray-900 mb-4">Who can send you message?</p>
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="whoCanSendMessage"
                value="anyone"
                checked={privacySettings.whoCanSendMessage === "anyone"}
                onChange={() => handleRadioChange("anyone")}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-900">Anyone on Docare</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="whoCanSendMessage"
                value="followed"
                checked={privacySettings.whoCanSendMessage === "followed"}
                onChange={() => handleRadioChange("followed")}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-900">
                People I Follow and admins and moderators of spaces I follow
              </span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="whoCanSendMessage"
                value="noone"
                checked={privacySettings.whoCanSendMessage === "noone"}
                onChange={() => handleRadioChange("noone")}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-900">No one</span>
            </label>
          </div>
        </div>
      </div>

      {/* Comment Preferences Section */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comment Preferences</h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-900">Allow people to comment on your answers and posts</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={privacySettings.allowComments}
              onChange={() => handleToggle("allowComments")}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Content Preferences Section */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Preferences</h3>
        <div className="space-y-6">
          {/* Allow GIF's to play automatically */}
          <div className="flex items-center justify-between">
            <span className="text-gray-900">Allow GIF's to play automatically</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.allowGifsAutoPlay}
                onChange={() => handleToggle("allowGifsAutoPlay")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Allow advertisers on Docare to promote your answers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-900">Allow advertisers on Docare to promote your answers</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacySettings.allowAdvertisersPromote}
                  onChange={() => handleToggle("allowAdvertisersPromote")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <button className="text-gray-500 hover:text-gray-700 underline text-sm">
              Learn more
            </button>
          </div>

          {/* Notify your subscribers of your new questions */}
          <div className="flex items-center justify-between">
            <span className="text-gray-900">Notify your subscribers of your new questions</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.notifySubscribers}
                onChange={() => handleToggle("notifySubscribers")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Delete or Deactivate your Account Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete or Deactivate your Account</h3>
        <div className="space-y-3">
          <button
            onClick={handleDeactivateAccount}
            className="text-red-600 hover:text-red-800 underline text-sm"
          >
            Deactivate Account
          </button>
          <div>
            <button
              onClick={handleDeleteAccount}
              className="text-red-600 hover:text-red-800 underline text-sm"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteAccountModal(false);
              setDeletePassword("");
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Delete Account</h3>
            <p className="text-gray-600 text-sm mb-4">
              This action cannot be undone. Your account will be scheduled for deletion in 30 days.
              After deletion, all your data will be permanently removed.
            </p>
            <p className="text-gray-600 text-sm mb-4">
              To confirm, please enter your password:
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && deletePassword.trim()) {
                    handleDeleteAccountConfirm();
                  }
                }}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteAccountModal(false);
                  setDeletePassword("");
                }}
                className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccountConfirm}
                disabled={isDeleting || !deletePassword.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Account Modal */}
      {showDeactivateAccountModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeactivateAccountModal(false);
              setDeactivatePassword("");
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600"> Deactivate Account</h3>
            <p className="text-gray-600 text-sm mb-4">
              Your account will be deactivated and to reactivate it, you will need to login again.
            </p>
            <p className="text-gray-600 text-sm mb-4">
              To confirm, please enter your password:
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={deactivatePassword}
                onChange={(e) => setDeactivatePassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && deactivatePassword.trim()) {
                    handleDeactivateAccountConfirm();
                  }
                }}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeactivateAccountModal(false);
                  setDeactivatePassword("");
                }}
                className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                disabled={isDeactivating}
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateAccountConfirm}
                disabled={isDeactivating || !deactivatePassword.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeactivating ? "Deactivating..." : "Deactivate Account"}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

