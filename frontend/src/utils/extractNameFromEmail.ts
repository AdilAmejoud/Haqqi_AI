export function extractNameFromEmail(email: string): string {
  const local = email.split('@')[0];           // "youssef.marakchi"
  const words = local.split(/[._\-]/);         // ["youssef", "marakchi"]
  return words
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');                                 // "Youssef Marakchi"
}
