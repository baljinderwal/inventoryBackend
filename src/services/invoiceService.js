let invoices = [
    {
      "id": 1001,
      "salesOrderId": 1,
      "customerId": 1,
      "customerName": "John Smith",
      "invoiceDate": "2025-08-15T10:00:00Z",
      "dueDate": "2025-09-14T10:00:00Z",
      "status": "Paid",
      "items": [
        {
          "productId": 1,
          "productName": "Wireless Mouse",
          "quantity": 1,
          "price": 25.99
        },
        {
          "productId": 2,
          "productName": "Mechanical Keyboard",
          "quantity": 1,
          "price": 120
        }
      ],
      "total": 145.99
    }
  ];

export const getAllInvoices = async () => {
    return invoices;
    }

export const getInvoiceById = async (id) => {
    return invoices.find(invoice => invoice.id === parseInt(id));
    }

export const createInvoice = async (invoice) => {
    const newInvoice = { id: invoices.length + 1001, ...invoice };
    invoices.push(newInvoice);
    return newInvoice;
    }

export const createMultipleInvoices = async (newInvoices) => {
    const createdInvoices = [];
    let currentId = invoices.length + 1000;
    newInvoices.forEach(invoice => {
        currentId++;
        const newInvoice = { id: currentId, ...invoice };
        invoices.push(newInvoice);
        createdInvoices.push(newInvoice);
    });
    return createdInvoices;
    }

export const updateInvoice = async (id, invoice) => {
    const index = invoices.findIndex(i => i.id === parseInt(id));
    if (index === -1) {
        return null;
    }
    invoices[index] = { ...invoices[index], ...invoice };
    return invoices[index];
    }

export const deleteInvoice = async (id) => {
    const index = invoices.findIndex(i => i.id === parseInt(id));
    if (index === -1) {
        return 0;
    }
    invoices.splice(index, 1);
    return 1;
    }
