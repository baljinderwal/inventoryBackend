import * as customerService from '../services/customerService.js';

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await customerService.getAllCustomers();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving customers', error: error.message });
  }
};

export const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await customerService.getCustomerById(id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving customer', error: error.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const newCustomer = await customerService.createCustomer(req.body);
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Error creating customer', error: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedCustomer = await customerService.updateCustomer(id, updates);

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({ message: 'Customer updated successfully' });
  } catch (error)
    {
    res.status(500).json({ message: 'Error updating customer', error: error.message });
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await customerService.deleteCustomer(id);

        if (result === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting customer', error: error.message });
    }
};
