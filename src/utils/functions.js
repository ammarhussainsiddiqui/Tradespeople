
// Client-safe helpers. Anything that needs a secret lives in actions/serverTokens.js
// and is re-exported here as a server action, so existing imports keep working.
export { generateToken, deleteSubscription } from '../actions/serverTokens';

export const timeAgo = (createdAt) => {
    const now = Date.now();
    const difference = now - new Date(createdAt).getTime(); // time difference in milliseconds

    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d${days > 1 ? '' : ''} ago`;
    if (hours > 0) return `${hours}h${hours > 1 ? '' : ''} ago`;
    if (minutes > 0) return `${minutes}min${minutes > 1 ? '' : ''} ago`;
    return `${seconds}sec${seconds > 1 ? '' : ''} ago`;
  };


export const isValidUKPostalCode =(postalCode) => {
  // Normalize the postal code by removing any extra spaces
  postalCode = postalCode?.replace(/\s+/g, '').toUpperCase();

  // Insert a space before the last three characters
  if (postalCode?.length > 3) {
    postalCode = postalCode?.slice(0, -3) + ' ' + postalCode?.slice(-3);
  }

  const regex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
  return regex.test(postalCode);
}
