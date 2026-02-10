// import html2pdf from "html2pdf.js";

// /**
//  * Downloads the provided DOM node as a PDF and supports start/success callbacks.
//  * @param {HTMLElement} element - The DOM element to convert to PDF.
//  * @param {string} filename - The name for the downloaded PDF file.
//  * @param {function} onStart - Callback before download starts.
//  * @param {function} onComplete - Callback after download finishes.
//  */
// export const downloadInvoicePDF = async (element, filename, onStart, onComplete) => {
//   const safeFilename = filename?.trim() || `invoice_${Date.now()}.pdf`;

//   const opt = {
//     margin: 0.5,
//     filename: safeFilename,
//     image: { type: "jpeg", quality: 0.98 },
//     html2canvas: { scale: 2 },
//     jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
//   };

//   try {
//     if (typeof onStart === "function") onStart();

//     const worker = html2pdf().set(opt).from(element);
//     const pdfBlob = await worker.outputPdf('blob');

//     const blobUrl = URL.createObjectURL(pdfBlob);
//     const link = document.createElement("a");
//     link.href = blobUrl;
//     link.download = safeFilename;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(blobUrl);

//     if (typeof onComplete === "function") onComplete();
//   } catch (err) {
//     console.error("PDF download error:", err);
//   }
// };

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const downloadInvoicePDF = async (
  element,
  filename,
  onStart,
  onEnd
) => {
  if (!element) {
    console.error("Element for PDF generation not found.");
    if (onEnd) onEnd();
    return;
  }
  if (onStart) onStart();

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Using a higher scale for better quality.
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Calculate the ratio to fit the width of the PDF page.
    const ratio = pdfWidth / canvasWidth;
    const scaledCanvasHeight = canvasHeight * ratio;

    let heightLeft = scaledCanvasHeight;
    let position = 0;

    // Add the first page
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledCanvasHeight);
    heightLeft -= pdfHeight;

    // Add new pages if content is longer than one page
    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledCanvasHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
  } finally {
    if (onEnd) onEnd();
  }
};

export const generateInvoicePDFBlob = async (element) => {
  if (!element) {
    console.error("Element for PDF generation not found.");
    return null;
  }

  try {
    console.log("Starting PDF generation for element:", element);
    console.log("Element dimensions:", {
      width: element.offsetWidth,
      height: element.offsetHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight
    });

    const canvas = await html2canvas(element, {
      scale: 1.5, // medium resolution
      useCORS: true,
      logging: false,
      width: element.offsetWidth,
      height: element.offsetHeight,
      backgroundColor: '#ffffff'
    });

    console.log("Canvas created:", {
      width: canvas.width,
      height: canvas.height
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.8);
    console.log("Image data length:", imgData.length);
    
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const ratio = pdfWidth / canvasWidth;
    const scaledCanvasHeight = canvasHeight * ratio;

    let heightLeft = scaledCanvasHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, scaledCanvasHeight);
    heightLeft -= pdfHeight;

    // Add additional pages if content is long
    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, scaledCanvasHeight);
      heightLeft -= pdfHeight;
    }

    // Return Blob instead of saving
    const pdfBlob = pdf.output("blob");
    console.log("PDF blob created:", pdfBlob);
    return pdfBlob;
  } catch (error) {
    console.error("Error generating PDF Blob:", error);
    return null;
  }
};