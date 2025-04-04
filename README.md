# Automated Invoice Processing and Review System

## 📌 Overview
This system automates invoice handling by integrating **UiPath RPA, Supabase, Google Drive, OCR, and email notifications**. It streamlines invoice ingestion, validation, flagging, and review processes, ensuring efficient financial management.

---

## 🚀 Features

### 1️⃣ Invoice Ingestion via Email  
- UiPath RPA bot monitors an email inbox for new invoices.  
- If an email has **no attachment**, the sender is notified automatically.  
- If an email has **no subject**, it is ignored.  
- Valid invoices are **saved to Google Drive** for further processing.  

### 2️⃣ Data Extraction & Storage  
- OCR extracts invoice details (invoice number, vendor, amount, taxes, etc.).  
- Extracted data is **stored in a Supabase database** under the `invoices` table.  
- Each invoice is assigned a unique `invoice_id`.  

### 3️⃣ Automated Invoice Flagging  
- Invoices are **automatically flagged** based on predefined rules:  
  - Missing details  
  - Tax discrepancies  
  - Duplicate detection  
- Flagged invoices are inserted into the `flagged` table for review.  

### 4️⃣ Email Notification System  
- A Python script **checks for flagged invoices** in Supabase.  
- If a new invoice is flagged:  
  - It retrieves the appropriate **reviewer's email** based on `level`.  
  - Sends an **email notification** with invoice details.  

📧 **Example Email Notification**:  
Subject: New Flagged Invoice: INV-12345

🚨 A new invoice has been flagged for review:
-	•	Invoice ID: INV-12345
-	•	Order ID: ORD-67890
-	•	Vendor ID: VEND-001
-	•	Invoice Date: 2025-04-04
-	•	Reason: Tax Mismatch
### 5️⃣ Invoice Review & Approval  
- Reviewers access invoices via a **React-based dashboard**.  
- Actions available:  
  ✅ **Approve** – Moves the invoice to `accounts_payable`.  
  ❌ **Deny** – Reviewer must enter a reason; invoice is sent for correction.  

### 6️⃣ Accounts Payable & Payment Processing  
- Approved invoices are added to `accounts_payable`.  
- **Due date calculation** is based on urgency levels.  
- Once paid, invoices are marked **Settled**, and a `transaction_id` is generated.  

---

## ▶️ Running the Project

---

