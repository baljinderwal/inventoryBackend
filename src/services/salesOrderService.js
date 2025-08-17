let salesOrders = [
    {
      "id": 1,
      "customerId": 1,
      "customerName": "John Smith",
      "createdAt": "2025-08-14T10:00:00Z",
      "status": "Completed",
      "items": [
        { "productId": 1, "productName": "Wireless Mouse", "quantity": 1, "price": 25.99 },
        { "productId": 2, "productName": "Mechanical Keyboard", "quantity": 1, "price": 120.00 }
      ],
      "total": 145.99
    },
    {
      "id": 2,
      "customerId": 2,
      "customerName": "Jane Doe",
      "createdAt": "2025-08-15T11:30:00Z",
      "status": "Pending",
      "items": [
        { "productId": 3, "productName": "USB-C Hub", "quantity": 2, "price": 45.50 }
      ],
      "total": 91.00
    }
  ];

export const getAllSalesOrders = async () => {
    return salesOrders;
    }

export const getSalesOrderById = async (id) => {
    return salesOrders.find(order => order.id === parseInt(id));
    }

export const createSalesOrder = async (order) => {
    const newOrder = { id: salesOrders.length + 1, ...order };
    salesOrders.push(newOrder);
    return newOrder;
    }

export const createMultipleSalesOrders = async (orders) => {
    const newOrders = [];
    let currentId = salesOrders.length;
    orders.forEach(order => {
        currentId++;
        const newOrder = { id: currentId, ...order };
        salesOrders.push(newOrder);
        newOrders.push(newOrder);
    });
    return newOrders;
    }

export const updateSalesOrder = async (id, order) => {
    const index = salesOrders.findIndex(o => o.id === parseInt(id));
    if (index === -1) {
        return null;
    }
    salesOrders[index] = { ...salesOrders[index], ...order };
    return salesOrders[index];
    }

export const deleteSalesOrder = async (id) => {
    const index = salesOrders.findIndex(o => o.id === parseInt(id));
    if (index === -1) {
        return 0;
    }
    salesOrders.splice(index, 1);
    return 1;
    }
