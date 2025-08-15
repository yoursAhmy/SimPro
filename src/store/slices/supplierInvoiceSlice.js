import { createSlice } from "@reduxjs/toolkit";

const supplierInvoiceSlice = createSlice({
  name: "supplierInvoice",
  initialState: {
    supplierInvoice: [],
    supplierReceipts: [],
  },
  reducers: {
    setSupplierInvoice: (state, action) => {
      state.supplierInvoice = action.payload;
    },
    clearSupplierInvoice: (state) => {
      state.supplierInvoice = [];
    },
    setSupplierReceipts: (state, action) => {
      state.supplierReceipts = action.payload;
      state.selectedInvoiceId = action.payload.selectedId;
    },
    clearSupplierRecepients: (state) => {
      state.supplierReceipts = [];
      state.selectedInvoiceId = null;
    },
  },
});

export const {
  setSupplierInvoice,
  clearSupplierInvoice,
  clearSupplierRecepients,
  setSupplierReceipts,
} = supplierInvoiceSlice.actions;
export default supplierInvoiceSlice.reducer;
