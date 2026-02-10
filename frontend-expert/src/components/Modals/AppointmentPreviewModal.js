import React, { useState } from "react";
import Modal from "./Modal";
import { Input, Checkbox } from "../Form";
import { BiChevronDown } from "react-icons/bi";
import { HiOutlineShare, HiOutlineDownload } from "react-icons/hi";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";

function AppointmentPreviewModal({ closeModal, isOpen, datas }) {
  // Extract data from the appointment
  console.log("appointment preview datas", datas);
  
  // Check if datas is an array and use the first item if it is
  const appointmentData = Array.isArray(datas) ? datas[0] : datas;
  
  const services = appointmentData?.purposeOfVisit || appointmentData?.purpose || appointmentData?.service || "";
  const description = appointmentData?.description || appointmentData?.message || "";
  const startDate = appointmentData?.dateOfVisit ? new Date(appointmentData?.dateOfVisit) : new Date();
  const startTime = appointmentData?.startTime ? new Date(appointmentData?.startTime) : (appointmentData?.start || new Date());
  const endTime = appointmentData?.endTime ? new Date(appointmentData?.endTime) : (appointmentData?.end || new Date());
  const status = appointmentData?.status || "";
  const dateOfVisit = appointmentData?.dateOfVisit ? new Date(appointmentData?.dateOfVisit) : new Date();
  const createdAt = appointmentData?.createdAt ? new Date(appointmentData?.createdAt) : new Date();
  
  // Handle patient name - could be in different properties based on data source
  const patientName = appointmentData?.patientName || "";
  
  // Handle doctor name
  const doctorName = appointmentData?.userName || "";
  
  const shares = appointmentData?.shareWithPatient || appointmentData?.shareData || {
    email: false,
    sms: false,
    whatsapp: false,
  };
  
  console.log("Processed appointment data:", {
    patientName,
    doctorName,
    services,
    dateOfVisit,
    createdAt,
    status
  });
  
  console.log("Preview appointment data:", datas);

  // Handle download PDF
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = 20;

      // Helper function to add text with word wrap
      const addText = (text, x, y, maxWidth, fontSize = 10, isBold = false) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * fontSize * 0.5);
      };

      // Header
      doc.setFillColor(0, 151, 219);
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Appointment Details", pageWidth / 2, 20, { align: 'center' });
      
      yPosition = 45;
      doc.setTextColor(0, 0, 0);

      // Patient & Doctor Information Section
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
      doc.setTextColor(0, 151, 219);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("PATIENT & DOCTOR INFORMATION", margin + 2, yPosition + 5);
      yPosition += 15;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Patient Name:", margin, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(patientName || 'Unknown Patient', margin + 50, yPosition);
      yPosition += 8;

      doc.setFont("helvetica", "bold");
      doc.text("Doctor Name:", margin, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(doctorName || 'Unknown Doctor', margin + 50, yPosition);
      yPosition += 15;

      // Appointment Details Section
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
      doc.setTextColor(0, 151, 219);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("APPOINTMENT DETAILS", margin + 2, yPosition + 5);
      yPosition += 15;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      doc.setFont("helvetica", "bold");
      doc.text("Purpose of Visit:", margin, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(services || 'N/A', margin + 50, yPosition);
      yPosition += 8;

      doc.setFont("helvetica", "bold");
      doc.text("Date of Visit:", margin, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(startDate.toLocaleDateString(), margin + 50, yPosition);
      yPosition += 8;

      doc.setFont("helvetica", "bold");
      doc.text("Start Time:", margin, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(startTime instanceof Date ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A', margin + 50, yPosition);
      yPosition += 8;

      doc.setFont("helvetica", "bold");
      doc.text("End Time:", margin, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(endTime instanceof Date ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A', margin + 50, yPosition);
      yPosition += 8;

      doc.setFont("helvetica", "bold");
      doc.text("Status:", margin, yPosition);
      doc.setFont("helvetica", "normal");
      
      // Status with color
      if (status === 'Approved') {
        doc.setTextColor(0, 151, 219);
      } else if (status === 'Pending') {
        doc.setTextColor(255, 136, 0);
      } else if (status === 'Cancelled') {
        doc.setTextColor(220, 38, 38);
      }
      doc.text(status || 'N/A', margin + 50, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 8;

      doc.setFont("helvetica", "bold");
      doc.text("Created At:", margin, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(`${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, margin + 50, yPosition);
      yPosition += 15;

      // Description Section
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
      doc.setTextColor(0, 151, 219);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("DESCRIPTION", margin + 2, yPosition + 5);
      yPosition += 15;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const descriptionText = description || 'No description provided';
      const descLines = doc.splitTextToSize(descriptionText, pageWidth - 2 * margin - 4);
      doc.text(descLines, margin + 2, yPosition);
      yPosition += (descLines.length * 5) + 10;

      // Shared With Patient Section
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
      doc.setTextColor(0, 151, 219);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("SHARED WITH PATIENT VIA", margin + 2, yPosition + 5);
      yPosition += 15;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const sharedMethods = [];
      if (shares.email) sharedMethods.push('Email');
      if (shares.sms) sharedMethods.push('SMS');
      if (shares.whatsapp) sharedMethods.push('WhatsApp');
      doc.text(sharedMethods.length > 0 ? sharedMethods.join(', ') : 'None', margin + 2, yPosition);
      yPosition += 15;

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );

      // Save the PDF
      const fileName = `Appointment_${patientName?.replace(/\s+/g, '_') || 'Details'}_${startDate.toLocaleDateString().replace(/\//g, '-')}.pdf`;
      doc.save(fileName);

      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download PDF");
    }
  };

  return (
    <Modal
      closeModal={closeModal}
      isOpen={isOpen}
      title="Appointment Details"
      width={"max-w-3xl"}
    >
      <div className='flex-colo gap-6'>
        <div className='grid w-full items-center gap-4 sm:grid-cols-2'>
          <div className='flex w-full flex-col gap-2'>
            <p className='text-sm font-semibold text-black'>Patient Name</p>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
              <div className="w-8 h-8 rounded-md bg-gray-200 mr-3 flex items-center justify-center">
                <span className="text-xs text-gray-600 font-medium">
                  {patientName?.charAt(0)?.toUpperCase() || "P"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">
                  {patientName || "Unknown Patient"}
                </span>
              </div>
            </div>
          </div>
          <div className='flex w-full flex-col gap-2'>
            <p className='text-sm font-semibold text-black'>Doctor Name</p>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
              <div className="w-8 h-8 rounded-md bg-gray-200 mr-3 flex items-center justify-center">
                <span className="text-xs text-gray-600 font-medium">
                  {doctorName?.charAt(0)?.toUpperCase() || "D"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">
                  {doctorName || "Unknown Doctor"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='grid w-full gap-4 sm:grid-cols-2'>
          <div className='flex w-full flex-col gap-3'>
            <p className='text-sm text-black'>Purpose of visit</p>
            <div className='flex w-full items-center justify-between rounded-md border border-gray-300 p-4 text-base font-semibold'>
              {services} <BiChevronDown className='text-xl invisible' />
            </div>
          </div>
          <div className='flex w-full flex-col gap-3'>
            <p className='text-sm text-black'>Date of visit</p>
            <div className='flex w-full items-center justify-between rounded-md border border-gray-300 p-4 text-base'>
              {startDate.toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className='grid w-full gap-4 sm:grid-cols-2'>
          <div className='flex w-full flex-col gap-3'>
            <p className='text-sm text-black'>Start time</p>
            <div className='flex w-full items-center justify-between rounded-md border border-gray-300 p-4 text-base'>
              {startTime instanceof Date ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
            </div>
          </div>
          <div className='flex w-full flex-col gap-3'>
            <p className='text-sm text-black'>End time</p>
            <div className='flex w-full items-center justify-between rounded-md border border-gray-300 p-4 text-base'>
              {endTime instanceof Date ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
            </div>
          </div>
        </div>

        {/* status and created at */}
        <div className='grid w-full gap-4 sm:grid-cols-2'>
          <div className='flex w-full flex-col gap-3'>
            <p className='text-sm text-black'>Status</p>
            <div className='flex w-full items-center justify-between rounded-md border border-gray-300 p-4 text-base'>
              <span
                className={`px-4 py-1 ${
                  status === "Approved"
                    ? "bg-subMain text-subMain"
                    : status === "Pending"
                      ? "bg-orange-500 text-orange-500"
                      : status === "Cancelled" && "bg-red-600 text-red-600"
                } rounded-xl bg-opacity-10 text-xs`}
              >
                {status}
              </span>
            </div>
          </div>
          <div className='flex w-full flex-col gap-3'>
            <p className='text-sm text-black'>Created At</p>
            <div className='flex w-full items-center justify-between rounded-md border border-gray-300 p-4 text-base'>
              {createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* description */}
        <div className='flex w-full flex-col gap-3'>
          <p className='text-sm text-black'>Description</p>
          <div className='w-full rounded-md border border-gray-300 p-4 text-base min-h-[100px]'>
            {description}
          </div>
        </div>

        {/* share */}
        <div className='flex w-full flex-col gap-4'>
          <p className='text-sm text-black'>Shared with patient via</p>
          <div className='flex flex-wrap gap-4 sm:flex-nowrap'>
            {shares.email && (
              <div className='px-4 py-2 bg-gray-100 rounded-md text-sm'>Email</div>
            )}
            {shares.sms && (
              <div className='px-4 py-2 bg-gray-100 rounded-md text-sm'>SMS</div>
            )}
            {shares.whatsapp && (
              <div className='px-4 py-2 bg-gray-100 rounded-md text-sm'>WhatsApp</div>
            )}
            {!shares.email && !shares.sms && !shares.whatsapp && (
              <div className='px-4 py-2 bg-gray-100 rounded-md text-sm text-gray-500'>None</div>
            )}
          </div>
        </div>

        {/* buttons */}
        <div className='flex w-full gap-3'>
          <button
            onClick={handleDownloadPDF}
            className='flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 flex items-center justify-center gap-2'
          >
            <HiOutlineDownload className="text-lg" />
            Share
          </button>
          <button
            onClick={closeModal}
            className='flex-1 rounded-lg bg-subMain px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90'
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default AppointmentPreviewModal;