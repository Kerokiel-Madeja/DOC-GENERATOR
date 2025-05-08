document.addEventListener("DOMContentLoaded", function () {
  const certificatesContainer = document.getElementById(
    "certificates-container"
  );
  const addButton = document.querySelector(".add-content");
  const printButton = document.querySelector(".print-page");
  const modal = document.getElementById("inputModal");
  const cancelBtn = document.querySelector(".cancel-btn");
  const form = document.getElementById("certificateForm");

  // Print button functionality
  printButton.addEventListener("click", function () {
    window.print();
  });

  // Add button shows modal
  addButton.addEventListener("click", function () {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  });

  // Hide modal functions
  function hideModal() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    form.reset();
  }

  // Cancel button
  cancelBtn.addEventListener("click", hideModal);

  // Close modal when clicking outside
  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      hideModal();
    }
  });

  // Handle form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Get form values
    const organizationType = document.getElementById("organizationType").value;
    const address = document.getElementById("address").value;
    const fullName = document.getElementById("fullName").value;
    const institutionName = document.getElementById("institutionName").value;
    const date = document.getElementById("date").value;
    const purpose = document.getElementById("purpose").value;

    // Format date
    const formattedDate = date
      ? new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "-";

    // Create new certificate HTML
    const certificateHTML = `
        <div class="page-container">
            <div class="page">
              <div class="organization-info">
                  <p>
                      Agency/Office/Company: <span class="organization-type">${
                        organizationType || "-"
                      }</span><br />
                      Address: <span class="address">${address || "-"}</span>
                  </p>
              </div>
              <div class="certificate-container">
                  <p class="cert-title">CERTIFICATE OF APPEARANCE</p>
                  <p class="cert-text">
                      This is to certify that <span class="fullName">${
                        fullName || "-"
                      }</span> of
                      <span class="institutionName">${
                        institutionName || "-"
                      }</span>
                      has personally appeared at this agency/ office/ company on
                      <span class="date">${formattedDate}</span>.
                  </p>
                  <p>Purpose: <span class="purpose">${purpose || "-"}</span></p>
              </div>
              <br />
              <div class="box">
                  <div class="line">
                      <div class="chk-box1"></div>
                      <p>Provided with meals _______________________/day x ___ days</p>
                  </div>
                  <p>Inclusive date/s: ________________________</p>
                  <div class="line">
                      <div class="chk-box1"></div>
                      <p>Provided with lodging ____________________/night x ___ nights</p>
                  </div>
                  <p>Inclusive date/s: ________________________</p>
                  <p>Certified by: ________________________ Date: ____________</p>
                  <p class="footer-label">Printed Name & Signature</p>
              </div>
              <br />
              <br />
              <div class="signature-field">
                  <div class="sig-content">
                      <span>_________________________________</span>
                      <p>Printed Name and Signature</p>
                      <span>_________________________________</span>
                      <p>Printed Name and Signature</p>
                  </div>
              </div>
            </div>
            <div class="page">
              <div class="organization-info">
                  <p>
                      Agency/Office/Company: <span class="organization-type">${
                        organizationType || "-"
                      }</span><br />
                      Address: <span class="address">${address || "-"}</span>
                  </p>
              </div>
              <div class="certificate-container">
                  <p class="cert-title">CERTIFICATE OF APPEARANCE</p>
                  <p class="cert-text">
                      This is to certify that <span class="fullName">${
                        fullName || "-"
                      }</span> of
                      <span class="institutionName">${
                        institutionName || "-"
                      }</span>
                      has personally appeared at this agency/ office/ company on
                      <span class="date">${formattedDate}</span>.
                  </p>
                  <p>Purpose: <span class="purpose">${purpose || "-"}</span></p>
              </div>
              <br />
              <div class="box">
                  <div class="line">
                      <div class="chk-box1"></div>
                      <p>Provided with meals _______________________/day x ___ days</p>
                  </div>
                  <p>Inclusive date/s: ________________________</p>
                  <div class="line">
                      <div class="chk-box1"></div>
                      <p>Provided with lodging ____________________/night x ___ nights</p>
                  </div>
                  <p>Inclusive date/s: ________________________</p>
                  <p>Certified by: ________________________ Date: ____________</p>
                  <p class="footer-label">Printed Name & Signature</p>
              </div>
              <br />
              <br />
              <div class="signature-field">
                  <div class="sig-content">
                      <span>_________________________________</span>
                      <p>Printed Name and Signature</p>
                      <span>_________________________________</span>
                      <p>Printed Name and Signature</p>
                  </div>
              </div>
            </div>
        </div>
        `;

    // Add new certificate to container
    certificatesContainer.insertAdjacentHTML("beforeend", certificateHTML);

    // Show container if it was hidden
    certificatesContainer.classList.add("has-certificates");

    // Hide modal
    hideModal();
  });

  // Close modal with Escape key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.style.display === "block") {
      hideModal();
    }
  });
});
