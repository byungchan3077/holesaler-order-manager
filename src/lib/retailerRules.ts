export type RetailerFields = { company: string; contact: string; phone: string; address: string; consent: boolean };

/** Registration field rules, shared by sign-up and staff edits. */
export function validateRetailer(f: RetailerFields) {
  const errs: Partial<Record<keyof RetailerFields, string>> = {};
  const c = f.company.trim(), p = f.contact.trim(), a = f.address.trim(), ph = f.phone.trim();
  if (c.length < 1 || c.length > 100) errs.company = "Enter 1–100 characters.";
  if (p.length < 1 || p.length > 50) errs.contact = "Enter 1–50 characters.";
  if (!/^[0-9+\- ]{7,20}$/.test(ph)) errs.phone = "7–20 characters: digits, +, - or space.";
  if (a.length < 1 || a.length > 200) errs.address = "Enter 1–200 characters.";
  if (!f.consent) errs.consent = "Consent is required to register.";
  return errs;
}
