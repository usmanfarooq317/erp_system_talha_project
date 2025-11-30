Mini ERP - Final v3
-------------------
Features:
- Products: add product (name + qty) -> available in invoice product dropdown
- Purchases: Vendor, rows (Product, Qty, Weight, Price/kg), Total, Amount Paid, Remaining, Mode
- Sales: Add Customer (name, location, previous pending), Invoice creation with previous pending auto-fill, add items, Calculate, Paid Now, Remaining updates customer's previous pending on save
- Language toggle EN/UR for UI labels
- Upload logo in Settings (stored in localStorage)

Run:
1) Backend:
   cd backend
   npm install
   npm start

2) Frontend:
   cd frontend
   npm install
   npm start

Backend: http://localhost:4000
Frontend: http://localhost:3000
