import { createReport } from "https://unpkg.com/docx-templates/lib/browser.js";

document.getElementById("certForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Format date
  const appearanceDate = new Date(document.getElementById("date").value);
  const formattedDate = appearanceDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Prepare data
  const formData = {
    companyName: document.getElementById("agency").value,
    Address: document.getElementById("address").value,
    fullName: document.getElementById("name").value,
    institutionName: document.getElementById("affiliation").value,
    date: formattedDate,
    purpose: document.getElementById("purpose").value,
  };

  try {
    // Load template
    const template = await fetch("./Agency.docx").then((response) =>
      response.arrayBuffer()
    );

    // Generate document
    const report = await createReport({
      template,
      data: formData,
      cmdDelimiter: ["${", "}"],
    });

    // Create download
    const blob = new Blob([report], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `Certificate_${formData.fullName.replace(
      /\s+/g,
      "_"
    )}.docx`;
    downloadLink.click();
    downloadLink.remove();
  } catch (error) {
    console.error("Error generating document:", error);
    alert(
      "Error generating certificate. Please check the console for details."
    );
  }
});
