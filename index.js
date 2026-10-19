/**
 * KEROKIEL DOC_GEN — Universal Certificate & Document Generator
 * Features:
 * 1. Multi-Vector DOCX Parser (JSZip, Paragraph DOM Stitcher, Media Extractor)
 * 2. Universal PDF Engine (pdf-lib, AcroForm extraction, Vector Stamping)
 * 3. The 5 Guaranteed Solutions:
 *    - Solution 1: Inverted Coordinate Transform Formula
 *    - Solution 2: Dynamic Auto-Shrink Font Width Measurer & Multi-line Stamping
 *    - Solution 3: Font Baseline Alignment Calibration (+2.5pt)
 *    - Solution 4: Automatic Orientation & Dimension Sensor (Portrait vs Landscape)
 *    - Solution 5: Lightweight Offline Bundling & High-DPI Canvas Rendering
 * 4. Interactive Visual Field Pin Placer for Flat PDFs
 * 5. Dual Layout Modes: 2-Up (Symmetrical 50/50 Cut) and 1-Up (Full Page)
 * 6. Safe Date Formatting, Local Persistence, and Zero-Overflow Print Engine
 */

document.addEventListener("DOMContentLoaded", function () {
  const STORAGE_KEY_CERTS = "kerokiel_docgen_certs_v3";
  const STORAGE_KEY_TEMPLATES = "kerokiel_docgen_templates_v3";
  const STORAGE_KEY_LAYOUT = "kerokiel_docgen_layout_v3";
  const STORAGE_KEY_DONT_SHOW_WELCOME = "kerokiel_docgen_dont_show_welcome_v1";

  // PDF.js worker setup
  if (typeof pdfjsLib !== "undefined") {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "pdf.worker.min.js";
    } catch (e) {
      console.warn("PDF.js worker fallback:", e);
    }
  }

  // Core DOM Elements
  const certificatesContainer = document.getElementById("certificates-container");
  const emptyState = document.getElementById("emptyState");
  const sheetCountBadge = document.getElementById("sheetCount");
  const activeTemplateBadge = document.getElementById("activeTemplateBadge");
  const fieldsCountBadge = document.getElementById("fieldsCountBadge");
  const modal = document.getElementById("inputModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalSubtitle = document.getElementById("modalSubtitle");
  const form = document.getElementById("certificateForm");
  const dynamicFormFields = document.getElementById("dynamicFormFields");
  const toastContainer = document.getElementById("toastContainer");
  const templateSelector = document.getElementById("templateSelector");
  const docxFileInput = document.getElementById("docxFileInput");
  const dragDropOverlay = document.getElementById("dragDropOverlay");
  const adjustPinsBtn = document.getElementById("adjustPinsBtn");
  const guideBtn = document.getElementById("guideBtn");

  // Welcome Advisory Modal Elements
  const welcomeModal = document.getElementById("welcomeModal");
  const closeWelcomeBtn = document.getElementById("closeWelcomeBtn");
  const getStartedBtn = document.getElementById("getStartedBtn");
  const dontShowWelcomeAgain = document.getElementById("dontShowWelcomeAgain");

  // Control Buttons
  const addButtons = [
    document.getElementById("addCertificateBtn"),
    document.getElementById("emptyStateAddBtn"),
  ].filter(Boolean);
  const uploadDocxButtons = [
    document.getElementById("uploadDocxBtn"),
    document.getElementById("emptyStateUploadBtn"),
  ].filter(Boolean);
  const printButton = document.getElementById("printBtn");
  const clearAllButton = document.getElementById("clearAllBtn");
  const fillSampleButton = document.getElementById("fillSampleBtn");
  const cancelButtons = document.querySelectorAll(".cancel-btn");
  const layout2UpBtn = document.getElementById("layout2UpBtn");
  const layout1UpBtn = document.getElementById("layout1UpBtn");

  // Visual Pin Modal Elements
  const pinEditorModal = document.getElementById("pinEditorModal");
  const closePinModalBtn = document.getElementById("closePinModalBtn");
  const pinPlacerCanvas = document.getElementById("pinPlacerCanvas");
  const pinOverlayContainer = document.getElementById("pinOverlayContainer");
  const pinInspectorEmpty = document.getElementById("pinInspectorEmpty");
  const pinInspectorForm = document.getElementById("pinInspectorForm");
  const pinFieldLabel = document.getElementById("pinFieldLabel");
  const pinFieldType = document.getElementById("pinFieldType");
  const pinFontSize = document.getElementById("pinFontSize");
  const pinTextAlign = document.getElementById("pinTextAlign");
  const pinMaxWidth = document.getElementById("pinMaxWidth");
  const deletePinBtn = document.getElementById("deletePinBtn");
  const savePinLayoutBtn = document.getElementById("savePinLayoutBtn");

  // --------------------------------------------------------------------------
  // State Management
  // --------------------------------------------------------------------------
  let currentLayoutMode = localStorage.getItem(STORAGE_KEY_LAYOUT) || "2-up"; // "2-up" | "1-up"
  let templates = loadTemplates();
  let currentTemplateId = "default_appearance";
  let certificates = loadCertificates();

  // Pin editor state
  let currentEditingPins = [];
  let activePinIndex = -1;

  // Safe bootstrap will execute at the bottom of the script after all engines and listeners are registered

  // --------------------------------------------------------------------------
  // Built-in Default Template: Certificate of Appearance (HTML Engine)
  // --------------------------------------------------------------------------
  function getDefaultAppearanceTemplate() {
    return {
      id: "default_appearance",
      name: "Standard: Certificate of Appearance",
      type: "html",
      isDefault: true,
      fields: [
        { key: "organizationType", label: "Agency / Office / Company", type: "text", defaultVal: "Department of Education - Division of Leyte" },
        { key: "address", label: "Office Address", type: "text", defaultVal: "Candahug, Palo, Leyte" },
        { key: "fullName", label: "Full Name (Attendee / Visitor)", type: "text", defaultVal: "ENGR. KEROKIEL MADEJA" },
        { key: "institutionName", label: "Institution / Home Station", type: "text", defaultVal: "Provincial Engineering & Technology Division" },
        { key: "date", label: "Date of Appearance", type: "date", defaultVal: getTodayDateString() },
        { key: "purpose", label: "Purpose of Appearance", type: "textarea", defaultVal: "Official Coordination & System Architecture Evaluation" },
        { key: "signatory", label: "Authorized Signatory Name", type: "text", defaultVal: "DIR. FELIX CARLOS DE GUZMAN, PECE" },
        { key: "signatoryTitle", label: "Signatory Designation / Office", type: "text", defaultVal: "Regional Director / Head of Office" },
      ],
      renderHTML: function (data) {
        const formattedDate = formatDateSafe(data.date);
        const signatoryDisplay = data.signatory || "";
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
      },
    };
  }

  // --------------------------------------------------------------------------
  // DOCX Parser Engine (JSZip, Anti-Split-Run Stitcher, Media Extractor)
  // --------------------------------------------------------------------------
  const DOCXEngine = {
    async parse(file) {
      if (typeof JSZip === "undefined") {
        throw new Error("JSZip library is not loaded. Check jszip.min.js.");
      }

      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      // 1. Extract Embedded Images from word/media/
      const mediaMap = {};
      const imageFiles = Object.keys(zip.files).filter((p) => p.startsWith("word/media/"));
      for (const imgPath of imageFiles) {
        const fileExt = imgPath.split(".").pop().toLowerCase();
        const mimeType = fileExt === "png" ? "image/png" : fileExt === "jpg" || fileExt === "jpeg" ? "image/jpeg" : "image/png";
        const base64Data = await zip.files[imgPath].async("base64");
        mediaMap[imgPath.replace("word/", "")] = `data:${mimeType};base64,${base64Data}`;
      }

      // 2. Extract Relationship IDs from word/_rels/document.xml.rels
      const relsMap = {};
      if (zip.files["word/_rels/document.xml.rels"]) {
        const relsXml = await zip.files["word/_rels/document.xml.rels"].async("text");
        const relsDoc = new DOMParser().parseFromString(relsXml, "text/xml");
        const relNodes = relsDoc.getElementsByTagName("Relationship");
        for (let i = 0; i < relNodes.length; i++) {
          const rId = relNodes[i].getAttribute("Id");
          const target = relNodes[i].getAttribute("Target");
          if (rId && target) {
            relsMap[rId] = target;
          }
        }
      }

      // 3. Read word/document.xml
      if (!zip.files["word/document.xml"]) {
        throw new Error("Invalid .docx file: word/document.xml not found.");
      }
      const docXmlText = await zip.files["word/document.xml"].async("text");
      const docXml = new DOMParser().parseFromString(docXmlText, "text/xml");

      // 4. Stitch Paragraphs and Detect Fields
      const parseResult = this.extractParagraphsAndFields(docXml, relsMap, mediaMap, file.name);
      return parseResult;
    },

    extractParagraphsAndFields(docXml, relsMap, mediaMap, fileName) {
      const paragraphs = Array.from(docXml.getElementsByTagName("w:p"));
      const detectedFields = [];
      const fieldKeySet = new Set();
      const templateParagraphs = [];

      paragraphs.forEach((pNode, pIndex) => {
        // Collect Images inside this paragraph
        const imagesInP = [];
        const blipNodes = pNode.getElementsByTagName("a:blip");
        for (let b = 0; b < blipNodes.length; b++) {
          const rEmbed = blipNodes[b].getAttribute("r:embed");
          if (rEmbed && relsMap[rEmbed]) {
            const mediaPath = relsMap[rEmbed];
            if (mediaMap[mediaPath]) {
              imagesInP.push(mediaMap[mediaPath]);
            }
          }
        }

        // Paragraph DOM Stitcher: Concatenate inner runs to kill split-run bugs
        const runs = Array.from(pNode.getElementsByTagName("w:r"));
        let pFullText = "";
        runs.forEach((r) => {
          const tNodes = Array.from(r.getElementsByTagName("w:t"));
          tNodes.forEach((t) => {
            pFullText += t.textContent;
          });

          // Also detect runs formatted with underline (<w:u>) containing spaces or tabs
          const uNode = r.getElementsByTagName("w:u")[0];
          const hasTab = r.getElementsByTagName("w:tab").length > 0;
          if (uNode && (hasTab || /^\s{3,}$/.test(r.textContent))) {
            pFullText += " ________________________ ";
          }
        });

        const trimmedText = pFullText.trim();
        if (!trimmedText && imagesInP.length === 0) {
          return; // Skip empty spacer paragraph
        }

        // Alignment check
        const jcNode = pNode.getElementsByTagName("w:jc")[0];
        const alignVal = jcNode ? jcNode.getAttribute("w:val") : "left";
        const alignClass = alignVal === "center" ? "text-center" : alignVal === "right" ? "text-right" : "text-left";

        // Multi-Vector Regex: Detect templates ${var}, {{var}}, [VAR], or underscores ___+
        const BLANK_REGEX = /\$\{([a-zA-Z0-9_]+)\}|\{\{([a-zA-Z0-9_]+)\}\}|\[([a-zA-Z0-9_\s]{2,})\]|(_{3,})/g;
        let match;
        let pTemplateSegments = [];
        let lastIndex = 0;

        while ((match = BLANK_REGEX.exec(pFullText)) !== null) {
          const matchStart = match.index;
          const matchEnd = match.index + match[0].length;
          const varName = match[1] || match[2] || match[3] || "";

          // Text slice before the blank
          const textBefore = pFullText.substring(lastIndex, matchStart);
          pTemplateSegments.push({ type: "static", text: textBefore });

          // Bidirectional Context Labeler
          const precedingSnippet = pFullText.substring(Math.max(0, matchStart - 40), matchStart);
          const nextP = paragraphs[pIndex + 1];
          const nextPText = nextP ? nextP.textContent.trim() : "";

          const inferredInfo = this.inferFieldInfo(precedingSnippet, nextPText, varName, detectedFields.length);

          // Unique key
          let fieldKey = inferredInfo.key;
          if (fieldKeySet.has(fieldKey)) {
            fieldKey = fieldKey + "_" + (detectedFields.length + 1);
          }
          fieldKeySet.add(fieldKey);

          const fieldMeta = {
            id: "field_" + Date.now() + "_" + detectedFields.length,
            key: fieldKey,
            label: inferredInfo.label,
            type: inferredInfo.type,
            defaultVal: inferredInfo.defaultVal || "",
          };

          detectedFields.push(fieldMeta);
          pTemplateSegments.push({ type: "field", key: fieldKey, label: inferredInfo.label });
          lastIndex = matchEnd;
        }

        // Tail slice
        const tailText = pFullText.substring(lastIndex);
        if (tailText) {
          pTemplateSegments.push({ type: "static", text: tailText });
        }

        templateParagraphs.push({
          align: alignClass,
          images: imagesInP,
          segments: pTemplateSegments,
        });
      });

      // Assemble Template Object
      const cleanTitle = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      return {
        id: "template_" + Date.now(),
        name: cleanTitle,
        type: "docx",
        isDefault: false,
        fields: detectedFields,
        templateParagraphs: templateParagraphs,
        renderHTML: (data) => this.renderDocxHTML(templateParagraphs, data),
      };
    },

    inferFieldInfo(precedingText, followingText, varName, fieldIndex) {
      if (varName) {
        const cleanVar = varName.replace(/[_\s]+/g, " ").trim();
        const label = cleanVar.charAt(0).toUpperCase() + cleanVar.slice(1);
        const isDate = /date/i.test(cleanVar);
        return {
          key: cleanVar.toLowerCase().replace(/\s+/g, "_"),
          label: label,
          type: isDate ? "date" : "text",
          defaultVal: isDate ? getTodayDateString() : "",
        };
      }

      const lowerBefore = precedingText.toLowerCase();

      // Look Behind (Sentence Heuristics)
      if (/certify that/i.test(lowerBefore) || /mr\.|ms\.|mrs\.|dr\./i.test(lowerBefore)) {
        return { key: "full_name", label: "Full Name (Visitor / Attendee)", type: "text", defaultVal: "" };
      }
      if (/agency|office|company|station/i.test(lowerBefore)) {
        return { key: "agency_name", label: "Agency / Office / Company", type: "text", defaultVal: "" };
      }
      if (/address/i.test(lowerBefore)) {
        return { key: "office_address", label: "Office Address", type: "text", defaultVal: "" };
      }
      if (/date|appeared on|this\s+day\s+of/i.test(lowerBefore)) {
        return { key: "appearance_date", label: "Date of Appearance", type: "date", defaultVal: getTodayDateString() };
      }
      if (/purpose/i.test(lowerBefore)) {
        return { key: "purpose", label: "Purpose of Appearance", type: "textarea", defaultVal: "" };
      }
      if (/institution|university|school/i.test(lowerBefore)) {
        return { key: "institution_name", label: "Institution / Organization", type: "text", defaultVal: "" };
      }

      // Look Ahead (Signature Heuristics)
      if (followingText && followingText.length < 50 && !/_{3,}/.test(followingText)) {
        return {
          key: "signatory_" + fieldIndex,
          label: `Signatory (${followingText})`,
          type: "text",
          defaultVal: followingText,
        };
      }

      // Fallback
      return {
        key: "field_" + fieldIndex,
        label: `Field #${fieldIndex + 1}`,
        type: "text",
        defaultVal: "",
      };
    },

    renderDocxHTML(templateParagraphs, data) {
      let contentHtml = "";

      templateParagraphs.forEach((p) => {
        // Render Images
        if (p.images && p.images.length > 0) {
          contentHtml += `<div class="doc-image-wrapper">`;
          p.images.forEach((imgSrc) => {
            contentHtml += `<img src="${imgSrc}" class="agency-logo" alt="Document Logo" />`;
          });
          contentHtml += `</div>`;
        }

        // Render Paragraph Text with Fields
        let lineHtml = "";
        p.segments.forEach((seg) => {
          if (seg.type === "static") {
            lineHtml += escapeHTML(seg.text);
          } else if (seg.type === "field") {
            let val = data[seg.key];
            if (val && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
              val = formatDateSafe(val);
            }
            lineHtml += `<span class="sig-line-inline" style="font-weight:bold; text-decoration: underline; text-underline-offset: 2px;" contenteditable="true">${
              val || "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
            }</span>`;
          }
        });

        if (lineHtml.trim()) {
          const isTitle = /CERTIFICATE|DIPLOMA|CLEARANCE|APPEARANCE/i.test(lineHtml) && p.align === "text-center";
          if (isTitle) {
            contentHtml += `<div class="cert-header"><div class="cert-title">${lineHtml}</div></div>`;
          } else {
            contentHtml += `<p style="margin: 2mm 0; line-height: 1.45; text-align: ${
              p.align === "text-center" ? "center" : p.align === "text-right" ? "right" : "justify"
            }; font-size: 10.5pt;">${lineHtml}</p>`;
          }
        }
      });

      return `
        <div class="page">
          <div class="custom-docx-body" style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
            ${contentHtml}
          </div>
        </div>
      `;
    },
  };

  // --------------------------------------------------------------------------
  // Universal PDF Engine (pdf-lib, AcroForm extraction, Vector Stamping)
  // Implements The 5 Guaranteed Engineering Solutions
  // --------------------------------------------------------------------------
  const PDFEngine = {
    async parse(file) {
      if (typeof PDFLib === "undefined") {
        throw new Error("PDFLib library is not loaded. Please verify pdf-lib.min.js.");
      }

      const arrayBuffer = await file.arrayBuffer();
      const base64Pdf = arrayBufferToBase64(arrayBuffer);
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      if (pages.length === 0) {
        throw new Error("Uploaded PDF contains no pages.");
      }

      const firstPage = pages[0];
      const width = firstPage.getWidth();
      const height = firstPage.getHeight();
      // Solution 4: Orientation sensor
      const isLandscape = width > height;

      let detectedFields = [];
      let isAcroForm = false;

      try {
        const form = pdfDoc.getForm();
        const acroFields = form.getFields();
        if (acroFields && acroFields.length > 0) {
          isAcroForm = true;
          acroFields.forEach((af, idx) => {
            const name = af.getName();
            const cleanLabel = name.replace(/[_\s]+/g, " ").replace(/([A-Z])/g, " $1").trim();
            detectedFields.push({
              id: "pdf_field_" + idx,
              key: name.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
              name: name,
              label: cleanLabel.charAt(0).toUpperCase() + cleanLabel.slice(1),
              type: /date/i.test(name) ? "date" : "text",
              defaultVal: /date/i.test(name) ? getTodayDateString() : "",
              isAcro: true,
            });
          });
        }
      } catch (e) {
        // Flat PDF
      }

      // If flat PDF, automatically scan real blanks and underscores from the PDF text layer
      if (detectedFields.length === 0) {
        showToast("Scanning document for fillable lines and blanks...", "info");
        const scannedBlanks = await this.scanPdfBlanks(arrayBuffer, width, height);
        if (scannedBlanks && scannedBlanks.length > 0) {
          detectedFields = scannedBlanks;
        }
      }

      const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");

      return {
        id: "pdf_tpl_" + Date.now(),
        name: "[PDF] " + cleanTitle,
        type: "pdf",
        isDefault: false,
        isAcroForm: isAcroForm,
        isLandscape: isLandscape,
        pageWidth: width,
        pageHeight: height,
        base64Pdf: base64Pdf,
        fields: detectedFields,
      };
    },

    async scanPdfBlanks(arrayBuffer, width, height) {
      if (typeof pdfjsLib === "undefined") return [];

      try {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const tc = await page.getTextContent();

        const items = tc.items.filter((it) => it.str && it.str.trim().length > 0);
        const detected = [];
        const BLANK_REGEX = /_{2,}|\[\s*\]|\${[a-zA-Z0-9_]+}|{{[a-zA-Z0-9_]+}}/;

        items.forEach((item) => {
          const str = item.str.trim();
          const x = item.transform[4];
          const y = item.transform[5];
          const w = item.width;

          if (BLANK_REGEX.test(str)) {
            if (/^_{2,}$/.test(str)) {
              // Standalone blank line: search for label directly underneath (y below by 4-35pt)
              let closestLabel = "";
              let minDist = 999;
              items.forEach((other) => {
                if (other === item) return;
                const otherY = other.transform[5];
                const otherX = other.transform[4];
                const dy = y - otherY;
                const dx = Math.abs(x - otherX);
                if (dy > 4 && dy < 35 && dx < w + 50) {
                  const dist = dy * 2 + dx;
                  if (dist < minDist) {
                    minDist = dist;
                    closestLabel = other.str.trim();
                  }
                }
              });

              // If no label below, check label immediately above (y above by 4-25pt)
              if (!closestLabel) {
                items.forEach((other) => {
                  if (other === item) return;
                  const otherY = other.transform[5];
                  const otherX = other.transform[4];
                  const dy = otherY - y;
                  const dx = Math.abs(x - otherX);
                  if (dy > 4 && dy < 25 && dx < w + 50) {
                    const dist = dy * 2 + dx;
                    if (dist < minDist) {
                      minDist = dist;
                      closestLabel = other.str.trim();
                    }
                  }
                });
              }

              const label = closestLabel || ("Blank Line #" + (detected.length + 1));
              const key =
                label
                  .toLowerCase()
                  .replace(/[^a-z0-9_]/g, "_")
                  .replace(/_+/g, "_")
                  .replace(/^_|_$/g, "") || ("field_" + detected.length);
              const xPos = x + w / 2;

              detected.push({
                id: "pdf_blank_" + Date.now() + "_" + detected.length,
                key: key + "_" + (detected.length + 1),
                label: label,
                type: /date/i.test(label) ? "date" : "text",
                defaultVal: /date/i.test(label) ? getTodayDateString() : "",
                xRatio: xPos / width,
                yRatio: 1 - y / height,
                align: "center",
                maxWidthPercent: Math.min(80, Math.max(20, (w / width) * 100)),
                fontSize: 11,
                bold: true,
              });
            } else {
              // Inline blank: e.g. 'Itinerary of Travel No. _____' or 'dated _______________'
              const match = str.match(/(.*?)(_{2,}|\[\s*\]|\${[a-zA-Z0-9_]+}|{{[a-zA-Z0-9_]+}})/);
              if (match) {
                const rawPrefix = match[1].trim();
                let cleanLabel = rawPrefix
                  .replace(/^.*?authorized in the\s*/i, "")
                  .replace(/^.*?condition indicated\s*/i, "")
                  .replace(/^.*?refunded in\s*/i, "")
                  .replace(/^.*?amount of\s*/i, "Excess Amount")
                  .replace(/[:._\s]+$/, "")
                  .trim();
                if (!cleanLabel || cleanLabel.length < 2) cleanLabel = "Field #" + (detected.length + 1);
                const key = cleanLabel
                  .toLowerCase()
                  .replace(/[^a-z0-9_]/g, "_")
                  .replace(/_+/g, "_")
                  .replace(/^_|_$/g, "");
                const prefixRatio = match[1].length / item.str.length;
                const blankRatio = match[2].length / item.str.length;
                const blankStartPt = x + w * prefixRatio;
                const blankWidthPt = w * blankRatio;

                detected.push({
                  id: "pdf_blank_" + Date.now() + "_" + detected.length,
                  key: key + "_" + (detected.length + 1),
                  label: cleanLabel,
                  type: /date/i.test(cleanLabel) ? "date" : "text",
                  defaultVal: /date/i.test(cleanLabel) ? getTodayDateString() : "",
                  xRatio: blankStartPt / width,
                  yRatio: 1 - y / height,
                  align: "left",
                  maxWidthPercent: Math.min(80, Math.max(15, (blankWidthPt / width) * 100)),
                  fontSize: 10.5,
                  bold: false,
                });
              }
            }
          }
        });

        return detected;
      } catch (err) {
        console.warn("Scan PDF blanks error:", err);
        return [];
      }
    },

    async stampCertificate(template, data) {
      if (!template || !template.base64Pdf) {
        throw new Error("Missing template PDF data. Please re-upload this PDF template.");
      }
      const rawBytes = base64ToArrayBuffer(template.base64Pdf);
      const pdfDoc = await PDFLib.PDFDocument.load(rawBytes);
      const pages = pdfDoc.getPages();
      const page = pages[0];
      const pageWidth = page.getWidth();
      const pageHeight = page.getHeight();

      const fontRegular = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

      if (template.isAcroForm) {
        const form = pdfDoc.getForm();
        template.fields.forEach((field) => {
          let val = data[field.key] || "";
          if (val && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
            val = formatDateSafe(val);
          }
          try {
            const tf = form.getTextField(field.name);
            if (tf) tf.setText(val);
          } catch (e) {}
        });
        try {
          form.flatten();
        } catch (e) {}
      } else {
        // Solution 3: Font Baseline Alignment Calibration (+2.5 pt)
        const baselineOffset = 2.5;

        template.fields.forEach((field) => {
          let val = data[field.key] || field.defaultVal || "";
          if (!val) return;
          if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
            val = formatDateSafe(val);
          }

          // Solution 1: Inverted Coordinate Transform Formula
          const xRatio = field.xRatio !== undefined ? field.xRatio : 0.5;
          const yRatio = field.yRatio !== undefined ? field.yRatio : 0.5;
          const targetX = xRatio * pageWidth;
          const targetY = pageHeight - (yRatio * pageHeight) + baselineOffset;

          const font = (field.bold || field.key.includes("name") || field.key.includes("signatory")) ? fontBold : fontRegular;
          let fontSize = field.fontSize || 14;
          const minFontSize = 8;
          const maxWidth = (field.maxWidthPercent ? field.maxWidthPercent / 100 : 0.6) * pageWidth;

          // Multi-line wrapping for long text / citations
          if (field.type === "textarea" && val.length > 50) {
            const words = val.split(/\s+/);
            const lines = [];
            let currentLine = "";

            for (const w of words) {
              const testLine = currentLine ? currentLine + " " + w : w;
              if (font.widthOfTextAtSize(testLine, fontSize) > maxWidth) {
                if (currentLine) lines.push(currentLine);
                currentLine = w;
              } else {
                currentLine = testLine;
              }
            }
            if (currentLine) lines.push(currentLine);

            const lineHeight = fontSize * 1.35;
            lines.forEach((line, lineIdx) => {
              const textW = font.widthOfTextAtSize(line, fontSize);
              let lineX = targetX;
              if (field.align === "center") {
                lineX = targetX - textW / 2;
              } else if (field.align === "right") {
                lineX = targetX - textW;
              }

              page.drawText(line, {
                x: lineX,
                y: targetY - lineIdx * lineHeight,
                size: fontSize,
                font: font,
                color: PDFLib.rgb(0.08, 0.1, 0.15),
              });
            });
          } else {
            // Solution 2: Dynamic Auto-Shrink Font Width Measurer
            while (font.widthOfTextAtSize(val, fontSize) > maxWidth && fontSize > minFontSize) {
              fontSize -= 0.5;
            }

            const textW = font.widthOfTextAtSize(val, fontSize);
            let finalX = targetX;
            if (field.align === "center") {
              finalX = targetX - textW / 2;
            } else if (field.align === "right") {
              finalX = targetX - textW;
            }

            page.drawText(val, {
              x: finalX,
              y: targetY,
              size: fontSize,
              font: font,
              color: PDFLib.rgb(0.08, 0.1, 0.15),
            });
          }
        });
      }

      return await pdfDoc.save();
    },

    async renderPdfBytesToCanvas(pdfBytes, canvas, scale = 2.0) {
      if (typeof pdfjsLib === "undefined") {
        throw new Error("pdfjsLib is not loaded. Check pdf.min.js.");
      }
      const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: scale });

      const ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      return { width: viewport.width, height: viewport.height };
    },
  };

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

  // --------------------------------------------------------------------------
  // Welcome & Advisory Guide Modal Handlers
  // --------------------------------------------------------------------------
  function openWelcomeModal() {
    if (!welcomeModal) return;
    welcomeModal.classList.add("active");
    welcomeModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  function closeWelcomeModal() {
    if (!welcomeModal) return;
    if (dontShowWelcomeAgain && dontShowWelcomeAgain.checked) {
      try {
        localStorage.setItem(STORAGE_KEY_DONT_SHOW_WELCOME, "true");
      } catch (e) {}
    }
    welcomeModal.classList.remove("active");
    setTimeout(() => {
      welcomeModal.style.display = "none";
      document.body.style.overflow = "auto";
    }, 150);
  }

  if (guideBtn) {
    guideBtn.addEventListener("click", () => openWelcomeModal());
  }
  if (closeWelcomeBtn) {
    closeWelcomeBtn.addEventListener("click", () => closeWelcomeModal());
  }
  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", () => closeWelcomeModal());
  }
  if (welcomeModal) {
    welcomeModal.addEventListener("click", function (event) {
      if (event.target === welcomeModal) {
        closeWelcomeModal();
      }
    });
  }

  // Keyboard navigation (ESC to close any active modal)
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (modal.classList.contains("active")) closeModal();
      if (pinEditorModal && pinEditorModal.classList.contains("active")) closePinModal();
      if (welcomeModal && welcomeModal.classList.contains("active")) closeWelcomeModal();
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
    const activeTemplate = getActiveTemplate();
    const demoData = {
      id: "cert_" + Date.now(),
      templateId: activeTemplate.id,
      mealsChecked: false,
      lodgingChecked: false,
    };

    activeTemplate.fields.forEach((f) => {
      const lbl = (f.label || "").toLowerCase();
      if (lbl.includes("agency head") || lbl.includes("head of agency") || lbl.includes("head")) {
        demoData[f.key] = "DIR. FELIX CARLOS DE GUZMAN";
      } else if (lbl.includes("station") || lbl.includes("office") || lbl.includes("agency")) {
        demoData[f.key] = "DepEd Division of Leyte";
      } else if (lbl.includes("itinerary") || lbl.includes("travel no")) {
        demoData[f.key] = "IT-2026-0891";
      } else if (lbl.includes("employee") || lbl.includes("attendee") || lbl.includes("visitor") || lbl.includes("full name")) {
        demoData[f.key] = "ENGR. KEROKIEL MADEJA";
      } else if (lbl.includes("date") || f.type === "date") {
        demoData[f.key] = getTodayDateString();
      } else if (lbl.includes("amount")) {
        demoData[f.key] = "PHP 1,500.00";
      } else if (lbl.includes("o.r.") || lbl.includes("receipt")) {
        demoData[f.key] = "OR-948271";
      } else {
        demoData[f.key] = f.defaultVal || "Sample " + f.label;
      }
    });

    certificates.push(demoData);
    saveCertificates();
    renderCertificates();
    showToast(`Demo certificate created for ${activeTemplate.name}!`);
  });

  // Upload Template (DOCX / PDF) Triggers
  uploadDocxButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      docxFileInput.value = "";
      docxFileInput.click();
    });
  });

  // File Input Handler (Routes .docx and .pdf)
  docxFileInput.addEventListener("change", async function (e) {
    const file = e.target.files[0];
    if (file) {
      await handleFileUpload(file);
    }
  });

  // Drag and Drop Handlers
  window.addEventListener("dragover", function (e) {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.types && e.dataTransfer.types.includes("Files")) {
      dragDropOverlay.classList.add("active");
    }
  });

  window.addEventListener("dragleave", function (e) {
    if (e.clientX <= 0 || e.clientY <= 0) {
      dragDropOverlay.classList.remove("active");
    }
  });

  window.addEventListener("drop", async function (e) {
    e.preventDefault();
    dragDropOverlay.classList.remove("active");
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await handleFileUpload(file);
    }
  });

  // Template Selector Handler
  templateSelector.addEventListener("change", function () {
    currentTemplateId = templateSelector.value;
    updateStatusBadges();
    showToast(`Active template switched to: ${getActiveTemplate().name}`);
  });

  // Adjust Pins Button Trigger
  if (adjustPinsBtn) {
    adjustPinsBtn.addEventListener("click", () => {
      openPinEditorModal();
    });
  }

  // Layout Mode Toggles
  layout2UpBtn.addEventListener("click", () => setLayoutMode("2-up"));
  layout1UpBtn.addEventListener("click", () => setLayoutMode("1-up"));

  function setLayoutMode(mode) {
    currentLayoutMode = mode;
    localStorage.setItem(STORAGE_KEY_LAYOUT, mode);
    updateLayoutButtons();
    renderCertificates();
    showToast(`Switched to ${mode === "2-up" ? "2-Up (50/50 Dual Cut)" : "1-Up (Full Page)"} mode!`);
  }

  function updateLayoutButtons() {
    if (currentLayoutMode === "1-up") {
      layout1UpBtn.classList.add("active");
      layout2UpBtn.classList.remove("active");
    } else {
      layout2UpBtn.classList.add("active");
      layout1UpBtn.classList.remove("active");
    }
  }

  // --------------------------------------------------------------------------
  // Unified File Upload Router (.docx / .pdf)
  // --------------------------------------------------------------------------
  async function handleFileUpload(file) {
    const name = file.name.toLowerCase();
    if (name.endsWith(".docx")) {
      await handleDocxUpload(file);
    } else if (name.endsWith(".pdf")) {
      await handlePdfUpload(file);
    } else {
      showToast("Please select a valid .docx or .pdf certificate template.", "warning");
    }
  }

  async function handleDocxUpload(file) {
    try {
      showToast("Unpacking DOCX and scanning blanks...", "info");
      const parsedTemplate = await DOCXEngine.parse(file);

      templates[parsedTemplate.id] = parsedTemplate;
      currentTemplateId = parsedTemplate.id;
      saveTemplates();

      populateTemplateSelector();
      updateStatusBadges();

      showToast(`Success! Found ${parsedTemplate.fields.length} blanks in ${file.name}`);
      setTimeout(() => openModal(), 300);
    } catch (err) {
      console.error("DOCX Parse Error:", err);
      showToast("Error parsing DOCX: " + err.message, "warning");
    }
  }

  async function handlePdfUpload(file) {
    try {
      showToast("Scanning PDF text and fillable lines...", "info");
      const parsedTemplate = await PDFEngine.parse(file);

      templates[parsedTemplate.id] = parsedTemplate;
      currentTemplateId = parsedTemplate.id;
      saveTemplates();

      populateTemplateSelector();
      updateStatusBadges();

      if (parsedTemplate.fields.length > 0) {
        showToast(`Success! Detected ${parsedTemplate.fields.length} fillable blanks in ${file.name}`);
        setTimeout(() => openModal(), 400);
      } else {
        showToast("No text blanks detected. Opening Visual Pin Placer to mark fields...", "warning");
        setTimeout(() => openPinEditorModal(), 400);
      }
    } catch (err) {
      console.error("PDF Parse Error:", err);
      showToast("Error loading PDF: " + err.message, "warning");
    }
  }

  // --------------------------------------------------------------------------
  // Dynamic Modal Form Generator
  // --------------------------------------------------------------------------
  function openModal() {
    const activeTemplate = getActiveTemplate();
    modalTitle.textContent = activeTemplate.isDefault ? "Create Certificate of Appearance" : `Create ${activeTemplate.name}`;
    modalSubtitle.textContent = `Fill in the ${activeTemplate.fields.length} detected fields for this template`;

    dynamicFormFields.innerHTML = "";

    if (activeTemplate.fields.length === 0) {
      dynamicFormFields.innerHTML = `
        <div style="text-align: center; color: #94a3b8; padding: 1.5rem;">
          No blank fields detected in this document. You can generate a copy directly or edit text inline on screen.
        </div>
      `;
    } else {
      activeTemplate.fields.forEach((field, fIdx) => {
        const group = document.createElement("div");
        group.className = "form-group";
        group.id = `group_${field.key}`;

        const headerRow = document.createElement("div");
        headerRow.className = "field-header-row";

        const label = document.createElement("label");
        label.setAttribute("for", `input_${field.key}`);
        label.textContent = field.label + ":";

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "field-remove-btn";
        removeBtn.title = "Discard this field if it is a false positive";
        removeBtn.textContent = "× Dismiss";
        removeBtn.addEventListener("click", () => {
          activeTemplate.fields.splice(fIdx, 1);
          openModal();
        });

        headerRow.appendChild(label);
        headerRow.appendChild(removeBtn);
        group.appendChild(headerRow);

        let inputElem;
        if (field.type === "textarea") {
          inputElem = document.createElement("textarea");
          inputElem.rows = 2;
        } else {
          inputElem = document.createElement("input");
          inputElem.type = field.type || "text";
        }

        inputElem.id = `input_${field.key}`;
        inputElem.name = field.key;
        inputElem.value = field.defaultVal || "";
        inputElem.placeholder = `Enter ${field.label}...`;
        inputElem.required = true;

        group.appendChild(inputElem);
        dynamicFormFields.appendChild(group);
      });
    }

    modal.classList.add("active");
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    modal.scrollTop = 0;
    if (dynamicFormFields) dynamicFormFields.scrollTop = 0;

    setTimeout(() => {
      modal.scrollTop = 0;
      if (dynamicFormFields) dynamicFormFields.scrollTop = 0;
      const firstInput = dynamicFormFields.querySelector("input, textarea");
      if (firstInput) {
        try {
          firstInput.focus({ preventScroll: true });
        } catch (e) {
          firstInput.focus();
        }
      }
    }, 50);
  }

  function closeModal() {
    modal.classList.remove("active");
    setTimeout(() => {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
      form.reset();
    }, 150);
  }

  // Handle Form Submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const activeTemplate = getActiveTemplate();
    const newCertData = {
      id: "cert_" + Date.now(),
      templateId: activeTemplate.id,
      mealsChecked: false,
      lodgingChecked: false,
    };

    activeTemplate.fields.forEach((field) => {
      const input = document.getElementById(`input_${field.key}`);
      newCertData[field.key] = input ? input.value.trim() : "";
    });

    certificates.push(newCertData);
    saveCertificates();
    renderCertificates();
    closeModal();
    showToast("Certificate added to workspace!");

    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 100);
  });

  // --------------------------------------------------------------------------
  // Document Recomposition & Rendering (HTML / DOCX / PDF)
  // --------------------------------------------------------------------------
  function renderCertificates() {
    certificatesContainer.innerHTML = "";

    if (certificates.length === 0) {
      emptyState.style.display = "flex";
      sheetCountBadge.textContent = "0";
      return;
    }

    emptyState.style.display = "none";
    sheetCountBadge.textContent = certificates.length.toString();

    certificates.forEach((cert, index) => {
      const template = templates[cert.templateId] || getDefaultAppearanceTemplate();
      const sheetWrapper = document.createElement("div");
      sheetWrapper.className = "sheet-wrapper";
      sheetWrapper.id = cert.id;

      const displayName = cert.fullName || cert.full_name || cert.awardee_name || cert.agency_name || template.name;

      if (template.type === "pdf") {
        // Render PDF Certificate Sheet
        sheetWrapper.innerHTML = `
          <div class="sheet-header no-print">
            <div class="sheet-info">
              <span class="sheet-badge">Sheet #${index + 1}</span>
              <span class="sheet-meta">${escapeHTML(displayName)}</span>
            </div>
            <div class="sheet-actions">
              <button class="action-pill-btn download-pdf-btn" data-id="${cert.id}" title="Download stamped PDF directly">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download PDF
              </button>
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

          <div class="page-container pdf-page-container ${currentLayoutMode === "1-up" ? "layout-1up" : ""}">
            <div class="pdf-canvas-container" id="pdf_container_${cert.id}">
              <div class="pdf-loading-spinner">Rendering Stamped Certificate...</div>
              <canvas class="pdf-render-canvas" id="canvas_${cert.id}"></canvas>
            </div>
          </div>
        `;

        // Render PDF Canvas asynchronously
        PDFEngine.stampCertificate(template, cert)
          .then(async (pdfBytes) => {
            cert._stampedBytes = pdfBytes;
            const canvas = document.getElementById(`canvas_${cert.id}`);
            if (canvas) {
              await PDFEngine.renderPdfBytesToCanvas(pdfBytes, canvas, 2.0);
              const spinner = document.querySelector(`#pdf_container_${cert.id} .pdf-loading-spinner`);
              if (spinner) spinner.remove();
            }
          })
          .catch((err) => {
            console.error("PDF Render Error:", err);
            const spinner = document.querySelector(`#pdf_container_${cert.id} .pdf-loading-spinner`);
            if (spinner) {
              spinner.innerHTML = `<span style="color:#ef4444;">Error rendering PDF: ${escapeHTML(err.message)}</span>`;
            }
          });

        // Download Action
        sheetWrapper.querySelector(".download-pdf-btn").addEventListener("click", async () => {
          let bytes = cert._stampedBytes;
          if (!bytes) {
            bytes = await PDFEngine.stampCertificate(template, cert);
          }
          const safeName = (displayName || "Certificate").replace(/[^a-zA-Z0-9_-]/g, "_");
          downloadPdf(bytes, `${safeName}.pdf`);
          showToast(`Downloaded ${safeName}.pdf!`);
        });
      } else {
        // Render DOCX / Default HTML Sheet
        const copyHTML = template.renderHTML ? template.renderHTML(cert) : "";

        let sheetInnerMarkup = "";
        if (currentLayoutMode === "1-up") {
          sheetInnerMarkup = `
            <div class="page-container layout-1up">
              ${copyHTML}
            </div>
          `;
        } else {
          sheetInnerMarkup = `
            <div class="page-container">
              ${copyHTML}
              <div class="cut-divider"></div>
              ${copyHTML}
            </div>
          `;
        }

        sheetWrapper.innerHTML = `
          <div class="sheet-header no-print">
            <div class="sheet-info">
              <span class="sheet-badge">Sheet #${index + 1}</span>
              <span class="sheet-meta">${escapeHTML(displayName)}</span>
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

          ${sheetInnerMarkup}
        `;

        // Checkbox bindings for standard certificate
        const chkBoxes = sheetWrapper.querySelectorAll(".chk-box1");
        chkBoxes.forEach((chk) => {
          chk.addEventListener("click", () => {
            chk.classList.toggle("checked");
            const toggleType = chk.getAttribute("data-toggle");
            if (toggleType === "meals") cert.mealsChecked = chk.classList.contains("checked");
            if (toggleType === "lodging") cert.lodgingChecked = chk.classList.contains("checked");
            saveCertificates();
          });
        });
      }

      // Shared Actions (Delete and Duplicate)
      sheetWrapper.querySelector(".delete-sheet-btn").addEventListener("click", () => {
        if (confirm(`Delete Sheet #${index + 1}?`)) {
          certificates = certificates.filter((c) => c.id !== cert.id);
          saveCertificates();
          renderCertificates();
          showToast("Sheet deleted.");
        }
      });

      sheetWrapper.querySelector(".duplicate-sheet-btn").addEventListener("click", () => {
        const cloned = JSON.parse(JSON.stringify(cert));
        cloned.id = "cert_" + Date.now();
        certificates.splice(index + 1, 0, cloned);
        saveCertificates();
        renderCertificates();
        showToast("Sheet duplicated!");
      });

      certificatesContainer.appendChild(sheetWrapper);
    });
  }

  // --------------------------------------------------------------------------
  // Interactive Visual Field Pin Placer for Flat PDFs
  // --------------------------------------------------------------------------
  async function openPinEditorModal() {
    const activeTemplate = getActiveTemplate();
    if (activeTemplate.type !== "pdf") return;

    currentEditingPins = JSON.parse(JSON.stringify(activeTemplate.fields || []));
    activePinIndex = -1;

    pinInspectorForm.style.display = "none";
    pinInspectorEmpty.style.display = "block";

    pinEditorModal.classList.add("active");
    pinEditorModal.style.display = "flex";
    document.body.style.overflow = "hidden";

    // Render raw PDF page onto pinPlacerCanvas
    try {
      const rawBytes = base64ToArrayBuffer(activeTemplate.base64Pdf);
      const loadingTask = pdfjsLib.getDocument({ data: rawBytes });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      const scale = 1.35;
      const viewport = page.getViewport({ scale: scale });

      pinPlacerCanvas.width = viewport.width;
      pinPlacerCanvas.height = viewport.height;
      pinOverlayContainer.style.width = viewport.width + "px";
      pinOverlayContainer.style.height = viewport.height + "px";

      const ctx = pinPlacerCanvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;

      renderPinBadges();
    } catch (err) {
      console.error("Error loading pin editor canvas:", err);
      showToast("Could not preview PDF in pin editor: " + err.message, "warning");
    }
  }

  function closePinModal() {
    pinEditorModal.classList.remove("active");
    setTimeout(() => {
      pinEditorModal.style.display = "none";
      document.body.style.overflow = "auto";
    }, 150);
  }

  if (closePinModalBtn) {
    closePinModalBtn.addEventListener("click", closePinModal);
  }

  function renderPinBadges() {
    pinOverlayContainer.innerHTML = "";

    currentEditingPins.forEach((pin, idx) => {
      const badge = document.createElement("div");
      badge.className = `pdf-field-pin ${idx === activePinIndex ? "active" : ""}`;
      const xPercent = (pin.xRatio !== undefined ? pin.xRatio : 0.5) * 100;
      const yPercent = (pin.yRatio !== undefined ? pin.yRatio : 0.5) * 100;

      badge.style.left = `${xPercent}%`;
      badge.style.top = `${yPercent}%`;
      badge.innerHTML = `<span>${escapeHTML(pin.label || "Field")}</span>`;

      // Select pin on click
      badge.addEventListener("click", (e) => {
        e.stopPropagation();
        selectPin(idx);
      });

      // Drag to move
      let isDragging = false;
      badge.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        isDragging = true;
        selectPin(idx);

        const onMouseMove = (moveEvt) => {
          if (!isDragging) return;
          const rect = pinOverlayContainer.getBoundingClientRect();
          let newX = (moveEvt.clientX - rect.left) / rect.width;
          let newY = (moveEvt.clientY - rect.top) / rect.height;

          newX = Math.max(0.02, Math.min(0.98, newX));
          newY = Math.max(0.02, Math.min(0.98, newY));

          pin.xRatio = newX;
          pin.yRatio = newY;
          badge.style.left = `${newX * 100}%`;
          badge.style.top = `${newY * 100}%`;
        };

        const onMouseUp = () => {
          isDragging = false;
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("mouseup", onMouseUp);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
      });

      pinOverlayContainer.appendChild(badge);
    });
  }

  // Click on canvas to drop new pin
  if (pinPlacerCanvas) {
    pinPlacerCanvas.addEventListener("click", (e) => {
      const rect = pinPlacerCanvas.getBoundingClientRect();
      const clickXRatio = (e.clientX - rect.left) / rect.width;
      const clickYRatio = (e.clientY - rect.top) / rect.height;

      const newPin = {
        id: "pin_" + Date.now(),
        key: "field_" + (currentEditingPins.length + 1),
        label: "Field #" + (currentEditingPins.length + 1),
        type: "text",
        defaultVal: "",
        xRatio: Math.max(0.02, Math.min(0.98, clickXRatio)),
        yRatio: Math.max(0.02, Math.min(0.98, clickYRatio)),
        align: "center",
        fontSize: 14,
        maxWidthPercent: 60,
      };

      currentEditingPins.push(newPin);
      selectPin(currentEditingPins.length - 1);
    });
  }

  function selectPin(index) {
    activePinIndex = index;
    renderPinBadges();

    if (index >= 0 && index < currentEditingPins.length) {
      const pin = currentEditingPins[index];
      pinInspectorEmpty.style.display = "none";
      pinInspectorForm.style.display = "block";

      pinFieldLabel.value = pin.label || "";
      pinFieldType.value = pin.type || "text";
      pinFontSize.value = pin.fontSize || 14;
      pinTextAlign.value = pin.align || "center";
      pinMaxWidth.value = pin.maxWidthPercent || 60;
    } else {
      pinInspectorEmpty.style.display = "block";
      pinInspectorForm.style.display = "none";
    }
  }

  // Inspector Input Listeners
  if (pinFieldLabel) {
    pinFieldLabel.addEventListener("input", (e) => {
      if (activePinIndex >= 0) {
        currentEditingPins[activePinIndex].label = e.target.value;
        currentEditingPins[activePinIndex].key =
          e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") || ("field_" + activePinIndex);
        renderPinBadges();
      }
    });
  }
  if (pinFieldType) {
    pinFieldType.addEventListener("change", (e) => {
      if (activePinIndex >= 0) currentEditingPins[activePinIndex].type = e.target.value;
    });
  }
  if (pinFontSize) {
    pinFontSize.addEventListener("input", (e) => {
      if (activePinIndex >= 0) currentEditingPins[activePinIndex].fontSize = parseFloat(e.target.value) || 14;
    });
  }
  if (pinTextAlign) {
    pinTextAlign.addEventListener("change", (e) => {
      if (activePinIndex >= 0) currentEditingPins[activePinIndex].align = e.target.value;
    });
  }
  if (pinMaxWidth) {
    pinMaxWidth.addEventListener("input", (e) => {
      if (activePinIndex >= 0) currentEditingPins[activePinIndex].maxWidthPercent = parseFloat(e.target.value) || 60;
    });
  }
  if (deletePinBtn) {
    deletePinBtn.addEventListener("click", () => {
      if (activePinIndex >= 0) {
        currentEditingPins.splice(activePinIndex, 1);
        activePinIndex = -1;
        selectPin(-1);
      }
    });
  }
  const rescanPdfBlanksBtn = document.getElementById("rescanPdfBlanksBtn");
  if (rescanPdfBlanksBtn) {
    rescanPdfBlanksBtn.addEventListener("click", async () => {
      const activeTemplate = getActiveTemplate();
      if (activeTemplate.type !== "pdf" || !activeTemplate.base64Pdf) return;
      showToast("Re-scanning document text and blank lines...", "info");
      const rawBytes = base64ToArrayBuffer(activeTemplate.base64Pdf);
      const scanned = await PDFEngine.scanPdfBlanks(rawBytes, activeTemplate.pageWidth, activeTemplate.pageHeight);
      if (scanned && scanned.length > 0) {
        currentEditingPins = scanned;
        activePinIndex = -1;
        renderPinBadges();
        selectPin(-1);
        showToast(`Detected ${scanned.length} fillable lines on this document!`);
      } else {
        showToast("No text blanks detected. Click anywhere on the lines to drop pins.", "warning");
      }
    });
  }

  if (savePinLayoutBtn) {
    savePinLayoutBtn.addEventListener("click", () => {
      const activeTemplate = getActiveTemplate();
      activeTemplate.fields = currentEditingPins;
      saveTemplates();
      updateStatusBadges();
      renderCertificates();
      closePinModal();
      showToast("Field pin layout saved successfully!");
    });
  }

  // --------------------------------------------------------------------------
  // Helpers & Persistence
  // --------------------------------------------------------------------------
  function getActiveTemplate() {
    return templates[currentTemplateId] || getDefaultAppearanceTemplate();
  }

  function populateTemplateSelector() {
    templateSelector.innerHTML = "";
    Object.values(templates).forEach((tpl) => {
      const opt = document.createElement("option");
      opt.value = tpl.id;
      opt.textContent = tpl.name;
      if (tpl.id === currentTemplateId) opt.selected = true;
      templateSelector.appendChild(opt);
    });
  }

  function updateStatusBadges() {
    const active = getActiveTemplate();
    if (activeTemplateBadge) {
      activeTemplateBadge.textContent = "Template: " + active.name;
    }
    if (fieldsCountBadge) {
      fieldsCountBadge.textContent = `${active.fields.length} Fields`;
    }

    if (adjustPinsBtn) {
      adjustPinsBtn.style.display = active.type === "pdf" && !active.isAcroForm ? "inline-flex" : "none";
    }

    // Solution 4: Auto-Orientation Sensor
    updateOrientationStyle(active);
  }

  function updateOrientationStyle(template) {
    const styleTag = document.getElementById("printOrientationStyle");
    if (!styleTag) return;
    if (template && template.type === "pdf" && template.isLandscape) {
      styleTag.textContent = "@page { size: landscape; margin: 0; }";
    } else {
      styleTag.textContent = "@page { size: portrait; margin: 0; }";
    }
  }

  function getTodayDateString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatDateSafe(dateStr) {
    if (!dateStr) return "-";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return dateStr;
  }

  function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, (tag) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[tag] || tag));
  }

  function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  function base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function downloadPdf(pdfBytes, filename) {
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "Certificate.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function saveCertificates() {
    try {
      localStorage.setItem(STORAGE_KEY_CERTS, JSON.stringify(certificates));
    } catch (e) {
      console.warn("Unable to save certificates:", e);
    }
  }

  function loadCertificates() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CERTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  }

  function saveTemplates() {
    try {
      const serializable = {};
      Object.keys(templates).forEach((id) => {
        if (!templates[id].isDefault) {
          const tpl = templates[id];
          serializable[id] = {
            id: tpl.id,
            name: tpl.name,
            type: tpl.type || "docx",
            isLandscape: tpl.isLandscape || false,
            isAcroForm: tpl.isAcroForm || false,
            pageWidth: tpl.pageWidth,
            pageHeight: tpl.pageHeight,
            base64Pdf: tpl.base64Pdf,
            fields: tpl.fields,
            templateParagraphs: tpl.templateParagraphs,
          };
        }
      });
      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(serializable));
    } catch (e) {
      console.warn("Unable to save custom templates:", e);
    }
  }

  function loadTemplates() {
    const base = { default_appearance: getDefaultAppearanceTemplate() };
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TEMPLATES);
      if (raw) {
        const custom = JSON.parse(raw);
        Object.keys(custom).forEach((id) => {
          const item = custom[id];
          if (item.type === "pdf") {
            base[id] = item;
          } else {
            base[id] = {
              ...item,
              isDefault: false,
              renderHTML: (data) => DOCXEngine.renderDocxHTML(item.templateParagraphs, data),
            };
          }
        });
      }
    } catch (e) {}
    return base;
  }

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
      <span>${escapeHTML(message)}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  }

  // --------------------------------------------------------------------------
  // Safe Application Bootstrap (Executes after all engines & listeners are ready)
  // --------------------------------------------------------------------------
  try {
    updateLayoutButtons();
    populateTemplateSelector();
    updateStatusBadges();
    renderCertificates();

    // Welcome Advisory Modal (Shows automatically before first use unless opted out)
    const dontShow = localStorage.getItem(STORAGE_KEY_DONT_SHOW_WELCOME);
    if (dontShow !== "true") {
      setTimeout(() => {
        openWelcomeModal();
      }, 300);
    }
  } catch (initErr) {
    console.error("Initialization error in workspace:", initErr);
  }
});
