/**
 * Centralized utility for formatting phone numbers consistently across the application.
 * Normalizes Indian phone numbers to the standard format: "+91 XXXXXXXXXX".
 *
 * Examples:
 *  - "9876500003"         -> "+91 9876500003"
 *  - "+919876500003"      -> "+91 9876500003"
 *  - "+91 9876500003"     -> "+91 9876500003"
 *  - "+91 +91 9876500003" -> "+91 9876500003"
 *  - "919876500003"       -> "+91 9876500003"
 *  - "09876500003"        -> "+91 9876500003"
 *  - "" or null           -> "-"
 */
export const formatPhoneNumber = (phone) => {
  if (!phone || (typeof phone !== 'string' && typeof phone !== 'number')) {
    return '-';
  }

  const str = String(phone).trim();
  if (!str || str === '-') {
    return '-';
  }

  // Extract pure digits
  let digits = str.replace(/\D/g, '');

  // Strip repeated country code prefixes (91) if followed by 10 digits
  while (digits.length > 10 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }

  // Strip leading 0 if 11 digits (e.g. 09876500003)
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Format standard 10-digit Indian phone number
  if (digits.length === 10) {
    return `+91 ${digits}`;
  }

  // Fallback for non-standard lengths: clean any repetitive +91 prefixes
  const cleaned = str.replace(/^(\+?91[\s-]*)+/g, '').trim();
  if (cleaned) {
    return `+91 ${cleaned}`;
  }

  return str;
};
