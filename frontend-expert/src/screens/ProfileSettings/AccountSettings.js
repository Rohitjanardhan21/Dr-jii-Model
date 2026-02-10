import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useDoctorAuthStore } from "../../store/useDoctorAuthStore";

export default function AccountSettings({ doctor, emailVerificationRequired, setEmailVerificationRequired }) {
  const navigate = useNavigate();
  const { setDoctor } = useDoctorAuthStore();
  const email = doctor?.personalDetails?.emailId || doctor?.emailId || "example@gmail.com";
  const secondaryEmail = doctor?.secondaryEmailId || null;
  const country = doctor?.addressPerKyc?.country || doctor?.country || "Pakistan";
  const googleEmail = doctor?.googleEmail || email;
  const isGoogleConnected = doctor?.googleEmail && doctor?.googleEmail !== email;

  // Modal states
  const [showAddEmailModal, setShowAddEmailModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showCountryInfoModal, setShowCountryInfoModal] = useState(false);
  const [showDisconnectGoogleModal, setShowDisconnectGoogleModal] = useState(false);
  const [showLogoutAllModal, setShowLogoutAllModal] = useState(false);

  // Form states
  const [newEmail, setNewEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Load email verification setting from doctor data
  useEffect(() => {
    if (doctor?.emailVerificationRequired !== undefined) {
      setEmailVerificationRequired(doctor.emailVerificationRequired);
    }
  }, [doctor, setEmailVerificationRequired]);

  const handleAddEmail = async () => {
    if (!newEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const doctorId = doctor?._id;
      if (!doctorId) {
        toast.error("Doctor ID not found");
        return;
      }

      const res = await axios.put(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/doctorProfile/update/${doctorId}`,
        {
          secondaryEmailId: newEmail.trim(),
        },
        { withCredentials: true }
      );

      if (res.data.success || res.status === 200) {
        toast.success("Additional email address added successfully");
        setNewEmail("");
        setShowAddEmailModal(false);
        // Update doctor in store
        if (res.data.data) {
          setDoctor((prev) => ({ 
            ...prev, 
            ...res.data.data,
            secondaryEmailId: res.data.data.secondaryEmailId || newEmail.trim()
          }));
        } else {
          // Fallback: update secondaryEmailId directly if data structure is different
          setDoctor((prev) => ({ 
            ...prev, 
            secondaryEmailId: newEmail.trim()
          }));
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add email address");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setLoading(true);
    try {
      const doctorId = doctor?._id;
      if (!doctorId) {
        toast.error("Doctor ID not found");
        return;
      }

      const res = await axios.put(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/change-password/${doctorId}`,
        {
          oldPassword,
          newPassword,
        },
        { withCredentials: true }
      );

      if (res.data.success || res.status === 200) {
        toast.success("Password changed successfully");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowChangePasswordModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerificationToggle = async (checked) => {
    setEmailVerificationRequired(checked);
    
    try {
      const doctorId = doctor?._id;
      if (!doctorId) {
        toast.error("Doctor ID not found");
        setEmailVerificationRequired(!checked); // Revert on error
        return;
      }

      const res = await axios.put(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/doctorProfile/update/${doctorId}`,
        {
          emailVerificationRequired: checked,
        },
        { withCredentials: true }
      );

      if (res.data.success || res.status === 200) {
        toast.success("Email verification setting updated");
        // Update doctor in store
        if (res.data.data) {
          setDoctor((prev) => ({ ...prev, ...res.data.data }));
        }
      } else {
        setEmailVerificationRequired(!checked); // Revert on error
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update email verification setting");
      setEmailVerificationRequired(!checked); // Revert on error
    }
  };

  const handleDisconnectGoogle = async () => {
    setLoading(true);
    try {
      const doctorId = doctor?._id;
      if (!doctorId) {
        toast.error("Doctor ID not found");
        return;
      }

      const res = await axios.put(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/doctorProfile/update/${doctorId}`,
        {
          disconnectGoogle: true,
        },
        { withCredentials: true }
      );

      if (res.data.success || res.status === 200) {
        toast.success("Google account disconnected successfully");
        setShowDisconnectGoogleModal(false);
        // Update doctor in store
        if (res.data.data) {
          setDoctor((prev) => ({ ...prev, ...res.data.data }));
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to disconnect Google account");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllBrowsers = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_SERVER_BASE_URL}/doctor/logout-all`,
        {},
        { withCredentials: true }
      );
      if (res.data.success || res.status === 200) {
        toast.success("Logged out of all other browsers successfully");
        setShowLogoutAllModal(false);
      } else {
        toast.error(res.data.message || "Failed to logout from other browsers");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to logout from other browsers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-3">
        Account Settings
      </h2>

      {/* Email Section */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div>
              <span className="text-gray-900">{email}</span>
              <span className="ml-2 text-gray-600">Primary Email</span>
            </div>
            {secondaryEmail && (
              <div>
                <span className="text-gray-900">{secondaryEmail}</span>
                <span className="ml-2 text-gray-600">Secondary Email</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowAddEmailModal(true)}
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Add Another Email Address
          </button>
        </div>
      </div>

      {/* Password Section */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <button
          onClick={() => setShowChangePasswordModal(true)}
          className="text-blue-600 hover:text-blue-800 underline text-sm"
        >
          Change Password
        </button>
      </div>

      {/* Country of residence Section */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Country of residence
        </label>
        <div className="flex items-center justify-between">
          <span className="text-gray-900">{country}</span>
          <button
            onClick={() => setShowCountryInfoModal(true)}
            className="text-gray-500 hover:text-gray-700 underline text-sm"
          >
            Learn more
          </button>
        </div>
      </div>

      {/* Logout Section */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Logout</label>
        <button
          onClick={() => setShowLogoutAllModal(true)}
          className="text-blue-600 hover:text-blue-800 underline text-sm"
          disabled={loading}
        >
          Log out of all other browsers
        </button>
      </div>

      {/* Login security Section */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Login security</label>
        <div className="flex items-center justify-between">
          <span className="text-gray-900">Require email verification</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={emailVerificationRequired}
              onChange={(e) => handleEmailVerificationToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Connected Accounts & Contacts Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Connected Accounts & Contacts</h3>
          <button className="text-gray-500 hover:text-gray-700 underline text-sm">
            Learn more
          </button>
        </div>

        {/* Facebook */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Facebook</label>
            <button className="text-blue-600 hover:text-blue-800 underline text-sm">
              Connect Facebook Account
            </button>
          </div>
        </div>

        {/* Google */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Google</label>
            {isGoogleConnected ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-900">{googleEmail}</span>
                <button
                  onClick={() => setShowDisconnectGoogleModal(true)}
                  className="text-red-600 hover:text-red-800 underline text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button className="text-blue-600 hover:text-blue-800 underline text-sm">
                Connect Google Account
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Email Modal */}
      {showAddEmailModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddEmailModal(false);
              setNewEmail("");
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Another Email Address</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddEmailModal(false);
                  setNewEmail("");
                }}
                className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddEmail}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowChangePasswordModal(false);
              setOldPassword("");
              setNewPassword("");
              setConfirmPassword("");
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Old Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter old password"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Country Info Modal */}
      {showCountryInfoModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCountryInfoModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Country of Residence</h3>
            <p className="text-gray-600 text-sm mb-4">
              Your country of residence is used to determine which services and features are available to you.
              This information helps us comply with local regulations and provide you with the most relevant experience.
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Your current country of residence is: <strong>{country}</strong>
            </p>
            <p className="text-gray-600 text-sm mb-6">
              If you need to change your country of residence, please contact support.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowCountryInfoModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disconnect Google Modal */}
      {showDisconnectGoogleModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDisconnectGoogleModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Disconnect Google Account</h3>
            <p className="text-gray-600 text-sm mb-4">
              Are you sure you want to disconnect your Google account ({googleEmail})? 
              You will need to use your email and password to sign in.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDisconnectGoogleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnectGoogle}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout All Browsers Confirmation Modal */}
      {showLogoutAllModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLogoutAllModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Log out of all other browsers</h3>
            <p className="text-gray-600 text-sm mb-4">
              This will log you out of all other browsers and devices where you're currently signed in. 
              You will remain signed in on this browser.
            </p>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to continue?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutAllModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutAllBrowsers}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Logging out..." : "Log out of all other browsers"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

