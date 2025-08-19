import * as supplierService from '../services/supplierService.js';

export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await supplierService.getAllSuppliers(req.user.id);
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving suppliers', error: error.message });
  }
};

export const getSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await supplierService.getSupplierById(req.user.id, id);

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving supplier', error: error.message });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const newSupplier = await supplierService.createSupplier(req.user.id, req.body);
    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(500).json({ message: 'Error creating supplier', error: error.message });
  }
};

export const createMultipleSuppliers = async (req, res) => {
  try {
    const suppliers = await supplierService.createMultipleSuppliers(req.user.id, req.body);
    res.status(201).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Error creating suppliers', error: error.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedSupplier = await supplierService.updateSupplier(req.user.id, id, updates);

    if (!updatedSupplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.status(200).json(updatedSupplier);
  } catch (error) {
    res.status(500).json({ message: 'Error updating supplier', error: error.message });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await supplierService.deleteSupplier(req.user.id, id);

    if (result === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.status(200).json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting supplier', error: error.message });
  }
};

export const getProductsBySupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await supplierService.getProductsBySupplier(req.user.id, id);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products for supplier', error: error.message });
  }
};
