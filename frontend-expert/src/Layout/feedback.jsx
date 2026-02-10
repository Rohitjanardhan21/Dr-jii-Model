
import React, { useState } from "react";
import { Dropdown } from 'react-bootstrap';
import ReactStars from "react-rating-stars-component";
import Button from '@mui/material/Button';
import { useDoctorAuthStore } from "../store/useDoctorAuthStore";

const Feedback = () => {
  const [selectedValue, setSelectedValue] = useState("Topic");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [topic, setTopic] = useState("");
  
  const topics = ["Appointment", "Diagnosis", "Doctor", "Other"];

  const handleSelect = (value) => {
    setSelectedValue(value);
    setTopic(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("entry.1803008543", topic);       // Topic
    formData.append("entry.2012886485", feedback);    // Feedback
    formData.append("entry.1546748672", rating);      // Rating

    try {
      await fetch("https://docs.google.com/forms/d/e/1FAIpQLSe3iQbezvQKnJMy9FNZGi2-ASZaFRW6SpzMnHcEU6dH790VbA/formResponse", {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      alert("Feedback submitted successfully to Google Sheets!");
      setTopic("");
      setFeedback("");
      setRating(0);
      setSelectedValue("Topic");
    } catch (error) {
      console.error("Error submitting to Google Form:", error);
      alert("Submission failed.");
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800">Share Your Feedback</h3>
        <p className="text-sm text-gray-500">Help us improve your experience</p>
      </div>

      {/* Topic Dropdown */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Select Topic</label>
        <Dropdown>
          <Dropdown.Toggle 
            variant="outline" 
            className="w-full flex justify-between items-center px-4 py-3 border border-blue-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <span className={selectedValue === "Topic" ? "text-gray-400" : "text-gray-700"}>
              {selectedValue}
            </span>
            {/* <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg> */}
          </Dropdown.Toggle>

          <Dropdown.Menu className="w-full border border-gray-200 rounded-lg shadow-lg">
            {topics.map((topic, index) => (
              <Dropdown.Item
                key={index}
                className="px-4 py-3 hover:bg-blue-50 text-gray-700 transition-colors duration-150"
                onClick={() => handleSelect(topic)}
              >
                {topic}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* Feedback Text Area */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Your Feedback</label>
        <textarea
          className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
          placeholder="Please share your thoughts and suggestions..."
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </div>

      {/* Rating and Submit */}
      <div className="flex justify-between items-center pt-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Rating</label>
          <ReactStars
            count={5}
            value={rating}
            size={28}
            activeColor="#fbbf24"
            color="#e5e7eb"
            emptyIcon={<span className="text-gray-300">★</span>}
            filledIcon={<span className="text-yellow-400">★</span>}
            onChange={(newRating) => setRating(newRating)}
          />
        </div>
        
        <Button 
          variant="contained" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
          onClick={handleSubmit}
          disabled={!topic || topic === "Topic" || !feedback.trim()}
        >
          Send
        </Button>
      </div>
    </div>
  );
};


export default Feedback;