/**
 * Formats a timestamp into a readable date string
 * @param {number} timestamp - Timestamp in milliseconds
 * @param {string} format - Optional format (default is 'short')
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp, format = 'short') => {
  const date = new Date(timestamp);
  
  if (format === 'short') {
    return date.toLocaleDateString();
  } else if (format === 'long') {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else if (format === 'time') {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  } else if (format === 'full') {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return date.toLocaleDateString();
};

/**
 * Formats a timestamp to a relative time (e.g., "2 hours ago")
 * @param {number} timestamp - Timestamp in milliseconds
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  // Convert diff to appropriate units
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  } else if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (days < 7) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else if (weeks < 4) {
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  } else if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  } else {
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }
};

/**
 * Converts a date to a Unix timestamp in milliseconds
 * @param {Date} date - Date object
 * @returns {number} Unix timestamp in milliseconds
 */
export const dateToTimestamp = (date) => {
  return date.getTime();
};

/**
 * Gets the start of day timestamp for a given date
 * @param {Date} date - Date object (defaults to today)
 * @returns {number} Start of day timestamp in milliseconds
 */
export const startOfDay = (date = new Date()) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate.getTime();
};

/**
 * Gets the end of day timestamp for a given date
 * @param {Date} date - Date object (defaults to today)
 * @returns {number} End of day timestamp in milliseconds
 */
export const endOfDay = (date = new Date()) => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate.getTime();
};

/**
 * Gets timestamp from n days ago
 * @param {number} days - Number of days ago
 * @returns {number} Timestamp in milliseconds
 */
export const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.getTime();
};

/**
 * Formats a duration in seconds to a readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (seconds) => {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''}`;
}; 