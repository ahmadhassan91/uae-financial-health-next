import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export interface PDFGeneratorOptions {
  elementId: string;
  fileName: string;
  onProgress?: (message: string) => void;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export async function generatePDFFromElement(
  options: PDFGeneratorOptions
): Promise<void> {
  const { elementId, fileName, onProgress, onSuccess, onError } = options;

  try {
    onProgress?.("Preparing document...");

    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    onProgress?.("Capturing content...");

    // Capture the element as canvas with high quality
    const canvas = await html2canvas(element, {
      scale: 3, // Higher quality (2x resolution)
      useCORS: true, // Allow cross-origin images
      logging: false, // Disable console logs
      backgroundColor: null, // avoid default white blending
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        // Ensure all images are loaded in the cloned document
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.display = "block";
        }
      },
    });

    onProgress?.("Creating PDF...");

    // Calculate PDF dimensions (A4 size)
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = 297; // A4 height in mm

    // Create PDF document
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const imgData = canvas.toDataURL("image/jpeg"); // Use JPEG for smaller file size

    // Add content to PDF (handle multiple pages if needed)
    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    onProgress?.("Saving PDF...");

    // Save the PDF
    pdf.save(fileName);

    onSuccess?.("PDF downloaded successfully!");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error generating PDF:", error);
    onError?.(errorMessage);
    throw error;
  }
}
