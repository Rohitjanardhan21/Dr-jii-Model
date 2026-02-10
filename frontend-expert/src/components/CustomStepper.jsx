import React from "react";
import { ProgressBar, Step } from "react-step-progress-bar";
import "react-step-progress-bar/styles.css";

const steps = [
  "Personal Details",
  "Qualification & Registration Details",
  "Work Details",
  "Preview Profile",
];

const CustomStepper = ({ ActiveStep }) => {
  return (
    <ProgressBar
      percent={(ActiveStep / (steps.length - 1)) * 100}
      filledBackground='#0095D9'
      height='4px'
    >
      {steps.map((label, index) => (
        <Step key={index}>
          {({ accomplished, position }) => (
            <div
              style={{
                color: accomplished ? "#fff" : "#0095D9",
                background: accomplished ? "#0095D9" : "#ccc",
                padding: "8px 12px",
                borderRadius: "50%",
                textAlign: "center",
              }}
            >
              {accomplished && ActiveStep !== position ? "✓" : index + 1}
            </div>
          )}
        </Step>
      ))}
    </ProgressBar>
  );
};

export default CustomStepper;
