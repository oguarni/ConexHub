import { 
  categories, 
  industrialSectors, 
  urgencyLevels, 
  quoteStatuses, 
  userRoles, 
  orderStatuses,
  calculateShipping 
} from '../utils/constants';

export const useConstants = () => {
  const getStatusColor = (status, type = 'quote') => {
    const statusMap = type === 'quote' ? quoteStatuses : orderStatuses;
    return statusMap[status]?.color || 'gray';
  };

  const getStatusLabel = (status, type = 'quote') => {
    const statusMap = type === 'quote' ? quoteStatuses : orderStatuses;
    return statusMap[status]?.label || status;
  };

  const getUrgencyInfo = (urgency) => {
    return urgencyLevels[urgency] || urgencyLevels.normal;
  };

  const getSectorLabel = (sector) => {
    const sectorObj = industrialSectors.find(s => s.value === sector);
    return sectorObj?.label || sector;
  };

  const getRoleInfo = (role) => {
    return userRoles[role] || userRoles.buyer;
  };

  const hasPermission = (userRole, permission) => {
    const roleInfo = getRoleInfo(userRole);
    return roleInfo.permissions.includes(permission);
  };

  return {
    // Constants
    categories,
    industrialSectors,
    urgencyLevels,
    quoteStatuses,
    userRoles,
    orderStatuses,
    
    // Helper functions
    getStatusColor,
    getStatusLabel,
    getUrgencyInfo,
    getSectorLabel,
    getRoleInfo,
    hasPermission,
    calculateShipping
  };
};