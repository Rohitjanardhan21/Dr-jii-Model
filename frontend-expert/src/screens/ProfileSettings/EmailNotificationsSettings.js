import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function EmailNotificationsSettings({ emailNotifications, setEmailNotifications }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isInitialMount = useRef(true);

  const API = axios.create({
    baseURL: process.env.REACT_APP_SERVER_BASE_URL,
    withCredentials: true,
  });

  // Fetch email notification settings from backend
  const fetchEmailNotificationSettings = async () => {
    try {
      const res = await API.get("/doctor/settings/email-notifications");

      if (res.data?.success && res.data?.data) {
        setEmailNotifications({
          // Content Channels - General questions and answers
          newAnswers: res.data.data.newAnswers ?? true,
          requests: res.data.data.requests ?? true,
          // Content Channels - Messages, comments and mentions
          messages: res.data.data.messages ?? true,
          commentsAndReplies: res.data.data.commentsAndReplies ?? true,
          mentions: res.data.data.mentions ?? true,
          // Content Channels - Spaces
          spaceInvites: res.data.data.spaceInvites ?? true,
          spaceUpdates: res.data.data.spaceUpdates ?? true,
          spacesForYou: res.data.data.spacesForYou ?? true,
          // Your network
          newFollowers: res.data.data.newFollowers ?? true,
          // Activity on your content
          upvotes: res.data.data.upvotes ?? true,
          shares: res.data.data.shares ?? true,
          moderation: res.data.data.moderation ?? true,
          // From Docare
          docareDigest: res.data.data.docareDigest ?? true,
          digestFrequency: res.data.data.digestFrequency || "asAvailable",
          popularAnswers: res.data.data.popularAnswers ?? true,
          storiesBasedOnActivity: res.data.data.storiesBasedOnActivity ?? true,
          recommendedQuestions: res.data.data.recommendedQuestions ?? true,
        });
      }
    } catch (err) {
      console.error("Error fetching email notification settings:", err);
      toast.error(err.response?.data?.message || "Failed to fetch email notification settings");
    }
  };

  // Update email notification settings on backend
  const updateEmailNotificationSettings = async (newData) => {
    if (isUpdating) return; // Prevent multiple simultaneous updates

    setIsUpdating(true);
    try {
      const res = await API.put("/doctor/settings/email-notifications/update", newData);

      if (res.data?.success) {
        if (res.data?.data) {
          setEmailNotifications((prev) => ({
            ...prev,
            ...res.data.data,
          }));
        }
        // Silent success - no toast to avoid spam on every toggle
      } else {
        toast.error(res.data?.message || "Failed to update email notification settings");
        await fetchEmailNotificationSettings();
      }
    } catch (err) {
      console.error("Error updating email notification settings:", err);
      toast.error(err.response?.data?.message || "Server error updating email notification settings");
      await fetchEmailNotificationSettings();
    } finally {
      setIsUpdating(false);
    }
  };

  // Fetch settings on component mount
  useEffect(() => {
    fetchEmailNotificationSettings().then(() => {
      isInitialMount.current = false;
    });
  }, []);

  const handleToggle = async (key) => {
    const newValue = !emailNotifications[key];
    
    // Update local state immediately for UI responsiveness
    setEmailNotifications((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    // Save to backend
    await updateEmailNotificationSettings({
      ...emailNotifications,
      [key]: newValue,
    });
  };

  const handleFrequencyChange = async (frequency) => {
    // Update local state immediately
    setEmailNotifications((prev) => ({
      ...prev,
      digestFrequency: frequency,
    }));

    // Save to backend
    await updateEmailNotificationSettings({
      ...emailNotifications,
      digestFrequency: frequency,
    });
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-900 font-medium">{label}</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
      {description && (
        <p className="text-gray-600 text-sm">{description}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-3">
        Email & Notifications
      </h2>

      {/* Content Channels Section */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Content Channels</h3>

        {/* General questions and answers */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">General questions and answers</h4>
          <ToggleSwitch
            checked={emailNotifications.newAnswers}
            onChange={() => handleToggle("newAnswers")}
            label="New answers"
            description="Email me when there are new answers to questions I asked or follow."
          />
          <ToggleSwitch
            checked={emailNotifications.requests}
            onChange={() => handleToggle("requests")}
            label="Requests"
            description="Email me when when someone requests me to answer a question."
          />
        </div>

        {/* Messages, comments and mentions */}
        <div className="mb-6 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Messages, comments and mentions</h4>
          <ToggleSwitch
            checked={emailNotifications.messages}
            onChange={() => handleToggle("messages")}
            label="Messages"
            description="Email me when someone sends me a direct message."
          />
          <ToggleSwitch
            checked={emailNotifications.commentsAndReplies}
            onChange={() => handleToggle("commentsAndReplies")}
            label="Comments and replies"
            description="Email me of comments on my content and replies to my comments."
          />
          <ToggleSwitch
            checked={emailNotifications.mentions}
            onChange={() => handleToggle("mentions")}
            label="Mentions"
            description="Email me when someone mentions me."
          />
        </div>

        {/* Spaces */}
        <div className="pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Spaces</h4>
          <ToggleSwitch
            checked={emailNotifications.spaceInvites}
            onChange={() => handleToggle("spaceInvites")}
            label="Space invites"
            description="Email me when someone invites me or accept my invitation to a space."
          />
          <ToggleSwitch
            checked={emailNotifications.spaceUpdates}
            onChange={() => handleToggle("spaceUpdates")}
            label="Space updates"
            description="Email me when there are feature updates to my space."
          />
          <ToggleSwitch
            checked={emailNotifications.spacesForYou}
            onChange={() => handleToggle("spacesForYou")}
            label="Spaces for you"
            description="Email me about Spaces I might like."
          />
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-900 font-medium block mb-1">Spaces you follow</span>
                <p className="text-gray-600 text-sm">
                  Email me with updates from spaces I follow at my preferred frequency.
                </p>
              </div>
              <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition">
                Manage
              </button>
            </div>
          </div>
        </div>

        {/* Your network */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Your network</h4>
          <ToggleSwitch
            checked={emailNotifications.newFollowers}
            onChange={() => handleToggle("newFollowers")}
            label="New followers"
            description="Email me of new followers."
          />
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-900 font-medium block mb-1">People you follow</span>
                <p className="text-gray-600 text-sm">
                  Manage notifications from people that I follow
                </p>
              </div>
              <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition">
                Manage
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activity on your content Section */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Activity on your content</h3>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-900 font-medium">Upvotes</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications.upvotes}
                onChange={() => handleToggle("upvotes")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <p className="text-gray-600 text-sm">Email me when someone upvotes my content.</p>
        </div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-900 font-medium">Shares</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications.shares}
                onChange={() => handleToggle("shares")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <p className="text-gray-600 text-sm">Email me when someone shares any of my content.</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-900 font-medium">Moderation</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications.moderation}
                onChange={() => handleToggle("moderation")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <p className="text-gray-600 text-sm">Email me when moderation actions are taken on my answers.</p>
        </div>
      </div>

      {/* From Docare Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">From Docare</h3>
        
        {/* Docare Digest */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-900 font-medium">Docare Digest</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications.docareDigest}
                onChange={() => handleToggle("docareDigest")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <p className="text-gray-600 text-sm">Email me with the top stories on Docare</p>
        </div>

        {/* Digest Frequency */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Digest Frequency:</h4>
          <div className="space-y-3">
            <label className="flex items-start cursor-pointer">
              <input
                type="radio"
                name="digestFrequency"
                value="asAvailable"
                checked={emailNotifications.digestFrequency === "asAvailable"}
                onChange={() => handleFrequencyChange("asAvailable")}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
              />
              <div className="ml-3">
                <span className="text-gray-900 block">As available</span>
                <p className="text-gray-600 text-sm">Top stories as they become available.</p>
              </div>
            </label>
            <label className="flex items-start cursor-pointer">
              <input
                type="radio"
                name="digestFrequency"
                value="daily"
                checked={emailNotifications.digestFrequency === "daily"}
                onChange={() => handleFrequencyChange("daily")}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
              />
              <div className="ml-3">
                <span className="text-gray-900 block">Daily</span>
                <p className="text-gray-600 text-sm">Up to digest every day, based on UTC.</p>
              </div>
            </label>
            <label className="flex items-start cursor-pointer">
              <input
                type="radio"
                name="digestFrequency"
                value="weekly"
                checked={emailNotifications.digestFrequency === "weekly"}
                onChange={() => handleFrequencyChange("weekly")}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
              />
              <div className="ml-3">
                <span className="text-gray-900 block">Weekly</span>
                <p className="text-gray-600 text-sm">Exactly 1 digest per week.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Things you might like */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Things you might like</h4>
          <ToggleSwitch
            checked={emailNotifications.popularAnswers}
            onChange={() => handleToggle("popularAnswers")}
            label="Popular answers"
            description="Email me with answers and shares upvoted by people I follow."
          />
          <ToggleSwitch
            checked={emailNotifications.storiesBasedOnActivity}
            onChange={() => handleToggle("storiesBasedOnActivity")}
            label="Stories based on my activity"
            description="Email me with more stories related to things I read."
          />
          <ToggleSwitch
            checked={emailNotifications.recommendedQuestions}
            onChange={() => handleToggle("recommendedQuestions")}
            label="Recommended questions"
            description="Email me with questions for me answer."
          />
        </div>
      </div>
    </div>
  );
}

