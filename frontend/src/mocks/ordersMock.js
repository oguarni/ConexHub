export const mockOrderEndpoints = (apiService) => {
  if (!apiService.getUserOrders.toString().includes('mock')) {
    const originalGetUserOrders = apiService.getUserOrders;
    apiService.getUserOrders = async (filters) => {
      try {
        return await originalGetUserOrders(filters);
      } catch (error) {
        console.warn('Using mock data for getUserOrders');
        return [
          { id: 1, orderNumber: 'ORD-001', status: 'pending', total: 150.00 },
          { id: 2, orderNumber: 'ORD-002', status: 'completed', total: 299.99 }
        ];
      }
    };
  }
};