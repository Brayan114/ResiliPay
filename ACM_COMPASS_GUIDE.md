# 🎯 ACM COMPASS Submission Guide for ResiliPay

**Conference:** ACM SIGCAS Conference on Computing and Sustainable Societies (**ACM COMPASS**)  
**Official Website:** [https://compass.acm.org/](https://compass.acm.org/)  
**Proceedings:** Published in the **ACM Digital Library** (core international indexing).

---

## 1. Track & Scope Alignment

* **Primary Track:** **Systems, Networking, and Infrastructure for Sustainable Societies** / **Information and Communication Technologies for Development (ICTD)**.
* **Why ResiliPay is an Ideal Candidate:**
  * COMPASS explicitly seeks computing solutions that address infrastructural fragility, electrical grid failures, climate resilience, and economic sustainability in low-resource settings.
  * Your paper's focus on Sub-Saharan Africa, Nigeria's ₦100B downtime loss, agency banking networks, and low-cost hardware accessibility perfectly hits their core mission.

---

## 2. Formatting & Review Policy

### A. Template Requirements
* ACM COMPASS uses the standard **ACM primary article template** (`acmart.cls`) with the `sigconf` format.
* We have prepared a dedicated, fully formatted LaTeX file in:
  * **[paper/acm_compass/main.tex](file:///c:/Users/braya/Documents/Coding/ResiliPay/paper/acm_compass/main.tex)**
  * **[paper/acm_compass/references.bib](file:///c:/Users/braya/Documents/Coding/ResiliPay/paper/acm_compass/references.bib)**

### B. Double-Blind Review Policy (Crucial!)
ACM COMPASS typically enforces a **double-blind peer review process**:
* Reviewers must not see the author's name, institution, or acknowledgments.
* **How to switch to Double-Blind mode in Overleaf:**
  In `paper/acm_compass/main.tex`, simply change the first line:
  ```latex
  % From:
  \documentclass[sigconf]{acmart}

  % To:
  \documentclass[sigconf,review,anonymous]{acmart}
  ```
  This will automatically suppress the author block (`Brayan Osinaka`) and institution during review while retaining all paper content and page numbering!
* Once the paper is accepted, you switch back to `\documentclass[sigconf]{acmart}` for the final camera-ready version.

### C. Paper Categories & Length
* **Full Research Papers:** Typically up to **10–12 pages** (excluding references).
* **Short Research Papers:** Typically up to **4–6 pages** (excluding references).
* ResiliPay in its current form is ~5–6 pages of dense technical content, fitting naturally as a **Short Paper** or easily expandable into a **Full Paper** by expanding the Related Work and Deployment Case Studies.

---

## 3. Step-by-Step Submission Process

1. **Compile the PDF in Overleaf:**
   * Zip the `paper/acm_compass/` folder.
   * Upload to [Overleaf](https://www.overleaf.com) and select `main.tex`.
   * Compile and download `main.pdf`.
2. **Access HotCRP / EasyChair Submission Portal:**
   * Go to the current ACM COMPASS Call for Papers portal (usually via HotCRP or EasyChair linked on [compass.acm.org](https://compass.acm.org/)).
3. **Enter Paper Metadata:**
   * **Title:** `ResiliPay: A Fault-Tolerant, Dual-Channel Cryptographic Payment Protocol for Intermittently Connected Economies`
   * **Abstract:** Paste the abstract from `paper_preview.md`.
   * **Topics:** Systems & Infrastructure, Mobile Computing, Financial Inclusion, ICTD.
4. **Upload Anonymous PDF:**
   * Upload the compiled PDF with `anonymous` mode enabled.
5. **Zenodo Preprint Archiving:**
   * Note that ACM COMPASS explicitly allows preprints on repositories like Zenodo / arXiv provided the preprint is not cited in the anonymous submission to de-anonymize the author.
