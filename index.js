/**
 * KEROKIEL DOC_GEN — Document Generator & Print Engine
 * Provides reactive certificate generation, safe date formatting,
 * persistence, responsive previews, and clean zero-overflow printing.
 */

document.addEventListener("DOMContentLoaded", function () {
  const STORAGE_KEY = "kerokiel_docgen_certs_v2";

  // Core DOM Elements
  const certificatesContainer = document.getElementById("certificates-container");
  const emptyState = document.getElementById("emptyState");
  const sheetCountBadge = document.getElementById("sheetCount");
  const modal = document.getElementById("inputModal");
  const form = document.getElementById("certificateForm");
  const toastContainer = document.getElementById("toastContainer");

  // Control Buttons
  const addButtons = [
    document.getElementById("addCertificateBtn"),
    document.getElementById("emptyStateAddBtn"),
  ].filter(Boolean);
  const printButton = document.getElementById("printBtn");
  const clearAllButton = document.getElementById("clearAllBtn");
  const fillSampleButton = document.getElementById("fillSampleBtn");
  const cancelButtons = document.querySelectorAll(".cancel-btn");

  // In-memory certificates state
  let certificates = loadCertificates();

  // Initialize view
  renderCertificates();

  // Set today's date as default in date picker
  const dateInput = document.getElementById("date");
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  }

  // --------------------------------------------------------------------------
  // Event Listeners
  // --------------------------------------------------------------------------

  // Show Modal
  addButtons.forEach((btn) => {
    btn.addEventListener("click", () => openModal());
  });

  // Hide Modal
  cancelButtons.forEach((btn) => {
    btn.addEventListener("click", () => closeModal());
  });

  // Close modal when clicking backdrop
  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Keyboard navigation (ESC to close)
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });

  // Print Handler
  printButton.addEventListener("click", function () {
    if (certificates.length === 0) {
      showToast("Create at least one certificate before printing!", "warning");
      return;
    }
    window.print();
  });

  // Clear All Handler
  clearAllButton.addEventListener("click", function () {
    if (certificates.length === 0) return;
    if (confirm("Are you sure you want to clear all generated certificates?")) {
      certificates = [];
      saveCertificates();
      renderCertificates();
      showToast("All certificates cleared.");
    }
  });

  // Quick Demo Data Handler
  fillSampleButton.addEventListener("click", function () {
    const sampleData = {
      id: "cert_" + Date.now(),
      organizationType: "Department of Information and Communications Technology",
      address: "DICT Regional Office VIII, Government Center, Candahug, Palo, Leyte",
      fullName: "ENGR. KEROKIEL MADEJA",
      institutionName: "Provincial Engineering & Technology Division",
      date: new Date().toISOString().split("T")[0],
      purpose: "Official Coordination & System Architecture Evaluation for Digital Infrastructure Project",
      signatory: "DIR. FELIX CARLOS DE GUZMAN, PECE",
      signatoryTitle: "Regional Director / Head of Procuring Entity",
      mealsChecked: false,
      lodgingChecked: false,
    };

    certificates.push(sampleData);
    saveCertificates();
    renderCertificates();
    showToast("Demo certificate sheet loaded!");
  });

  // Form Submit Handler
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const certData = {
      id: "cert_" + Date.now(),
      organizationType: document.getElementById("organizationType").value.trim(),
      address: document.getElementById("address").value.trim(),
      fullName: document.getElementById("fullName").value.trim(),
      institutionName: document.getElementById("institutionName").value.trim(),
      date: document.getElementById("date").value,
      purpose: document.getElementById("purpose").value.trim(),
      signatory: document.getElementById("signatory").value.trim() || "",
      signatoryTitle: document.getElementById("signatoryTitle").value.trim() || "Printed Name and Signature",
      mealsChecked: false,
      lodgingChecked: false,
    };

    certificates.push(certData);
    saveCertificates();
    renderCertificates();
    closeModal();
    showToast("New certificate sheet added!");

    // Scroll smoothly to the newly added sheet
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  });

  // --------------------------------------------------------------------------
  // Modal Utilities
  // --------------------------------------------------------------------------
  function openModal() {
    modal.classList.add("active");
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      document.getElementById("organizationType")?.focus();
    }, 50);
  }

  function closeModal() {
    modal.classList.remove("active");
    setTimeout(() => {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
      form.reset();
      // Restore default today date
      if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        dateInput.value = `${yyyy}-${mm}-${dd}`;
      }
    }, 150);
  }

  // --------------------------------------------------------------------------
  // Certificate Formatting & Rendering
  // --------------------------------------------------------------------------

  /**
   * Safe date formatter without UTC midnight timezone offset bug
   */
  function formatDateSafe(dateStr) {
    if (!dateStr) return "-";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return dateStr;
  }

  /**
   * Generates single certificate copy markup
   */
  function buildCertificateCopyMarkup(data, copyType = "Original") {
    const formattedDate = formatDateSafe(data.date);
    let signatoryDisplay = data.signatory || "";
    if (signatoryDisplay.includes("___")) {
      signatoryDisplay = "";
    }
    const titleDisplay = data.signatoryTitle || "Printed Name and Signature";

    return `
      <div class="page">
        <div class="organization-info">
          <p>
            Agency/Office/Company: <span class="organization-type" contenteditable="true">${data.organizationType || "-"}</span><br />
            Address: <span class="address" contenteditable="true">${data.address || "-"}</span>
          </p>
        </div>

        <div class="cert-header">
          <div class="cert-title">CERTIFICATE OF APPEARANCE</div>
        </div>

        <div class="cert-text">
          This is to certify that <span class="fullName" contenteditable="true">${data.fullName || "-"}</span> of
          <span class="institutionName" contenteditable="true">${data.institutionName || "-"}</span>
          has personally appeared at this agency/office/company on
          <span class="date" contenteditable="true">${formattedDate}</span>.
        </div>

        <div class="purpose-line">
          Purpose: <span class="purpose" contenteditable="true">${data.purpose || "-"}</span>
        </div>

        <div class="cert-bottom-grid">
          <div class="box">
            <div class="box-row">
              <span class="chk-box1 ${data.mealsChecked ? "checked" : ""}" data-toggle="meals" title="Click to toggle check"></span>
              <p>Provided with meals _______________________/day x ___ days</p>
            </div>
            <p>Inclusive date/s: ________________________</p>
            <div class="box-row" style="margin-top: 3px;">
              <span class="chk-box1 ${data.lodgingChecked ? "checked" : ""}" data-toggle="lodging" title="Click to toggle check"></span>
              <p>Provided with lodging ____________________/night x ___ nights</p>
            </div>
            <p>Inclusive date/s: ________________________</p>
            <p style="margin-top: 2px;">Certified by: ________________________ Date: ____________</p>
            <p class="footer-label">Printed Name & Signature</p>
          </div>

          <div class="signature-field">
            <div class="sig-line" contenteditable="true">${signatoryDisplay}</div>
            <p class="sig-label" contenteditable="true">${titleDisplay}</p>
            <div class="sig-line" contenteditable="true"></div>
            <p class="sig-label" contenteditable="true">Witness / Noted by</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renders all certificate sheets
   */
  function renderCertificates() {
    certificatesContainer.innerHTML = "";

    // Toggle Empty State
    if (certificates.length === 0) {
      emptyState.style.display = "flex";
      sheetCountBadge.textContent = "0";
      return;
    }

    emptyState.style.display = "none";
    sheetCountBadge.textContent = certificates.length.toString();

    certificates.forEach((cert, index) => {
      const sheetElem = document.createElement("div");
      sheetElem.className = "sheet-wrapper";
      sheetElem.id = cert.id;

      sheetElem.innerHTML = `
        <!-- Dedicated Sheet Control Header on Screen (Hidden on Print) -->
        <div class="sheet-header no-print">
          <div class="sheet-info">
            <span class="sheet-badge">Sheet #${index + 1}</span>
            <span class="sheet-meta">${cert.fullName ? cert.fullName : "Certificate of Appearance"}</span>
          </div>
          <div class="sheet-actions">
            <button class="action-pill-btn duplicate-sheet-btn" data-id="${cert.id}" title="Duplicate this sheet">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Duplicate
            </button>
            <button class="action-pill-btn delete-btn delete-sheet-btn" data-id="${cert.id}" title="Remove this sheet">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
              </svg>
              Delete
            </button>
          </div>
        </div>

        <!-- Printable Paper Sheet -->
        <div class="page-container">
          <!-- Top Certificate Copy -->
          ${buildCertificateCopyMarkup(cert, "Original")}

          <!-- Clean dashed dividing line -->
          <div class="cut-divider"></div>

          <!-- Bottom Duplicate Copy -->
          ${buildCertificateCopyMarkup(cert, "Duplicate")}
        </div>
      `;

      // Interactive Checkboxes
      const checkboxes = sheetElem.querySelectorAll(".chk-box1");
      checkboxes.forEach((chk) => {
        chk.addEventListener("click", function () {
          chk.classList.toggle("checked");
          const toggleType = chk.getAttribute("data-toggle");
          if (toggleType === "meals") {
            cert.mealsChecked = chk.classList.contains("checked");
          } else if (toggleType === "lodging") {
            cert.lodgingChecked = chk.classList.contains("checked");
          }
          saveCertificates();
        });
      });

      // Sheet Actions Listeners
      const deleteBtn = sheetElem.querySelector(".delete-sheet-btn");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", function () {
          if (confirm(`Delete Sheet #${index + 1}?`)) {
            certificates = certificates.filter((c) => c.id !== cert.id);
            saveCertificates();
            renderCertificates();
            showToast("Sheet deleted.");
          }
        });
      }

      const duplicateBtn = sheetElem.querySelector(".duplicate-sheet-btn");
      if (duplicateBtn) {
        duplicateBtn.addEventListener("click", function () {
          const cloned = JSON.parse(JSON.stringify(cert));
          cloned.id = "cert_" + Date.now();
          certificates.splice(index + 1, 0, cloned);
          saveCertificates();
          renderCertificates();
          showToast("Sheet duplicated!");
        });
      }

      certificatesContainer.appendChild(sheetElem);
    });
  }

  // --------------------------------------------------------------------------
  // Persistence Utilities
  // --------------------------------------------------------------------------
  function saveCertificates() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(certificates));
    } catch (e) {
      console.warn("Unable to save certificates to localStorage:", e);
    }
  }

  function loadCertificates() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Unable to load certificates from localStorage:", e);
    }
    return [];
  }

  // --------------------------------------------------------------------------
  // Notification Toast Helper
  // --------------------------------------------------------------------------
  function showToast(message, type = "info") {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="${
        type === "warning" ? "#fbbf24" : "#38bdf8"
      }" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }
});
