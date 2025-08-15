let customers = [
    { "id": 1, "name": "John Smith", "email": "john.smith@example.com", "phone": "555-1234", "address": "123 Main St, Anytown, USA" },
    { "id": 2, "name": "Jane Doe", "email": "jane.doe@example.com", "phone": "555-5678", "address": "456 Oak Ave, Othertown, USA" }
  ];

export const getAllCustomers = async () => {
    return customers;
    }

export const getCustomerById = async (id) => {
    return customers.find(customer => customer.id === parseInt(id));
    }

export const createCustomer = async (customer) => {
    const newCustomer = { id: customers.length + 1, ...customer };
    customers.push(newCustomer);
    return newCustomer;
    }

export const updateCustomer = async (id, customer) => {
    const index = customers.findIndex(c => c.id === parseInt(id));
    if (index === -1) {
        return null;
    }
    customers[index] = { ...customers[index], ...customer };
    return customers[index];
    }

export const deleteCustomer = async (id) => {
    const index = customers.findIndex(c => c.id === parseInt(id));
    if (index === -1) {
        return 0;
    }
    customers.splice(index, 1);
    return 1;
    }
