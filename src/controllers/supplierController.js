import * as supplierService from '../services/supplierService.js';

export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await supplierService.getAllSuppliers();
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving suppliers', error: error.message });
  }
};

export const getSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await supplierService.getSupplierById(id);

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
    const { id, name, contact, email, products } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Supplier ID is required' });
    }

    const newSupplier = { id, name, contact, email, products };
    await supplierService.createSupplier(newSupplier);
    res.status(201).json({ message: 'Supplier created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating supplier', error: error.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedSupplier = await supplierService.updateSupplier(id, updates);

    if (!updatedSupplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.status(200).json({ message: 'Supplier updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating supplier', error: error.message });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await supplierService.deleteSupplier(id);

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
    const products = await supplierService.getProductsBySupplier(id);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products for supplier', error: error.message });
  }
};
