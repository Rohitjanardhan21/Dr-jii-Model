// import React from 'react';
// import { Col, Row } from 'react-bootstrap';

// const steps = ['Personal Details','Qualification & Registration Details','Work Details','Preview Profile'];

// const Stepper = ({ActiveStep}) => {
//     return (
//         <div className=''>
//             <Row className="stepper">
//                 {steps.map((label, index) => (
//                     <Col key={label} className="step-container">
//                         <div className={`step-icon ${ActiveStep === index ? 'active' : ''} ${index < ActiveStep ? 'completed' : ''}`}>
//                             {index < ActiveStep ? '✓' : index + 1}
//                         </div>
//                         <div className="step-label">{label}</div>
//                     </Col>
//                 ))}
//             </Row>
//             <style jsx>{`
//         .stepper {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 2rem;
//         }

//         .step-container {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           position: relative;
//         }

//         .step-container::before {
//           content: '';
//           position: absolute;
//           top: 20px;
//           left: -50%;
//           width: 100%;
//           height: 2px;
//           background-color: #ccc;
//           z-index: 1;
//         }

//         .step-container:first-child::before {
//           display: none;
//         }

//         .step-icon {
//           width: 32px;
//           height: 32px;
//           border-radius: 50%;
//           background-color: #ccc;
//           color: #fff;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           z-index: 2;
//           position: relative;
//         }

//         .step-icon.active {
//           background-color: #007bff;
//         }

//         .step-icon.completed {
//           background-color: #28a745;
//         }

//         .step-label {
//           margin-top: 8px;
//           color: #666;
//         }
//       `}</style>
//         </div>
//     );
// };

// export default Stepper;

import React from "react";

const steps = [
  "Personal Details",
  "Qualification & Registration Details",
  "Work Details",
  "Preview Profile",
];

const Stepper = ({ ActiveStep }) => {
  return (
    <div>
      <div className='flex flex-wrap justify-center gap-4'>
        {steps.map((label, index) => (
          <div
            key={label}
            className='flex w-full flex-col items-center sm:w-1/2 lg:w-1/4'
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${ActiveStep === index ? "border-blue-500 bg-blue-500 text-white" : ""} ${index < ActiveStep ? "border-green-500 bg-green-500 text-white" : "border-gray-300 text-gray-600"}`}
            >
              {index < ActiveStep ? "✓" : index + 1}
            </div>
            <p className='mt-2 text-center text-sm font-medium'>{label}</p>
          </div>
        ))}
      </div>

      <style jsx>{`
        .stepper {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .step-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          margin-bottom: 1rem;
        }

        .step-container::before {
          content: "";
          position: absolute;
          top: 20px;
          left: -50%;
          width: 100%;
          height: 2px;
          background-color: #ccc;
          z-index: 1;
        }

        .step-container:first-child::before {
          display: none;
        }

        .step-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #ccc;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          position: relative;
        }

        .step-icon.active {
          background-color: #007bff;
        }

        .step-icon.completed {
          background-color: #28a745;
        }

        .step-label {
          margin-top: 8px;
          color: #666;
          text-align: center;
        }

        @media (max-width: 768px) {
          .step-container {
            margin-bottom: 2rem;
          }

          .step-container::before {
            top: 40px;
          }
        }
      `}</style>
    </div>
  );
};

export default Stepper;

// import React from 'react';


// const steps = ['Personal Details', 'Qualification & Registration Details', 'Work Details', 'Preview Profile'];

// const Stepper = ({ ActiveStep }) => {
//   return (
//     <div className="stepper-container">
//       <Row className="stepper">
//         {steps.map((label, index) => (
//           <Col key={label} xs={3} className="step-container">
//             <div className={`step-icon ${ActiveStep === index ? 'active' : ''} ${index < ActiveStep ? 'completed' : ''}`}>
//               {index < ActiveStep ? '✓' : index + 1}
//             </div>
//             <div className="step-label">{label}</div>
//           </Col>
//         ))}
//       </Row>

//       <style>{`
//                 .stepper-container {
//                     width: 100%;
//                     padding: 10px 0;
//                     overflow-x: auto;
//                 }

//                 .stepper {
//                     display: flex;
//                     justify-content: space-between;
//                     align-items: center;
//                     margin-bottom: 1.5rem;
//                     flex-wrap: nowrap;
//                     overflow-x: auto;
//                 }

//                 .step-container {
//                     display: flex;
//                     flex-direction: column;
//                     align-items: center;
//                     text-align: center;
//                     position: relative;
//                     min-width: 100px; /* Ensures proper spacing on small screens */
//                 }

//                 .step-container::before {
//                     content: '';
//                     position: absolute;
//                     top: 20px;
//                     left: -50%;
//                     width: 100%;
//                     height: 2px;
//                     background-color: #ccc;
//                     z-index: 1;
//                 }

//                 .step-container:first-child::before {
//                     display: none;
//                 }

//                 .step-icon {
//                     width: 32px;
//                     height: 32px;
//                     border-radius: 50%;
//                     background-color: #ccc;
//                     color: #fff;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     z-index: 2;
//                     position: relative;
//                     font-size: 16px;
//                     font-weight: bold;
//                 }

//                 .step-icon.active {
//                     background-color: #007bff;
//                 }

//                 .step-icon.completed {
//                     background-color: #28a745;
//                 }

//                 .step-label {
//                     margin-top: 8px;
//                     color: #666;
//                     font-size: 14px;
//                     max-width: 100px; /* Prevents text from stretching too much */
//                 }

//                 @media (max-width: 768px) {
//                     .step-icon {
//                         width: 24px;
//                         height: 24px;
//                         font-size: 12px;
//                     }

//                     .step-label {
//                         font-size: 12px;
//                         max-width: 80px;
//                     }
//                 }

//                 @media (max-width: 480px) {
//                     .stepper {
//                         justify-content: flex-start;
//                         gap: 15px;
//                     }

//                     .step-container {
//                         min-width: 80px;
//                     }

//                     .step-icon {
//                         width: 20px;
//                         height: 20px;
//                         font-size: 10px;
//                     }

//                     .step-label {
//                         font-size: 10px;
//                         max-width: 60px;
//                     }
//                 }
//             `}</style>
//     </div>
//   );
// };

// export default Stepper;
