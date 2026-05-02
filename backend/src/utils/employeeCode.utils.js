/**
 * src/utils/employeeCode.utils.js
 * Generates the unique employee code per the format:
 *   {CompanyCode:2}{FirstName:2}{LastName:2}{Year:4}{Serial:04d}
 *
 * Example:
 *   Company "OI", Employee "Priya Trivedi", joined 2024, 1st employee
 *   → "OIPRTR20240001"
 *
 * The serial number is determined by counting existing employees
 * in the same company for the same joining year.
 */

import { eq, and, like, count } from "drizzle-orm";
import db from "../db/connection.js";
import { employees } from "../db/schema/index.js";

/**
 * @param {string} companyCode   - 2-letter company code (e.g. "OI")
 * @param {string} firstName     - Employee's first name
 * @param {string} lastName      - Employee's last name
 * @param {string|Date} joinedAt - Date of joining
 * @returns {Promise<string>}    - Generated employee code
 */
export const generateEmployeeCode = async (
  companyCode,
  firstName,
  lastName,
  joinedAt
) => {
  const year = new Date(joinedAt).getFullYear();

  // Take first 2 chars of each name, uppercase, pad if shorter
  const namePart =
    (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase().padEnd(4, "X");

  const companyPart = companyCode.toUpperCase().padEnd(2, "X").substring(0, 2);

  // Pattern to match all codes for this company+year combination
  const pattern = `${companyPart}${namePart}${year}%`;

  // Count existing employees with matching company+year prefix to get the serial
  const result = await db
    .select({ count: count() })
    .from(employees)
    .where(like(employees.employeeCode, `${companyPart}____${year}%`));

  const serial = (Number(result[0]?.count) || 0) + 1;

  // Format: pad serial to 4 digits
  const serialPart = String(serial).padStart(4, "0");

  return `${companyPart}${namePart}${year}${serialPart}`;
};
