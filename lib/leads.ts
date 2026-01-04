type Lead = { id: string; name: string; email: string }

export async function getMockLeads(userEmail: string): Promise<Lead[]> {
  // For MVP: return empty for most users, or a small sample.
  if (!userEmail) return []
  if (userEmail.endsWith('@example.com')) {
    return [
      { id: 'l1', name: 'Jane Prospect', email: 'jane.prospect@example.com' },
      { id: 'l2', name: 'Acme Corp', email: 'leads@acme.com' },
    ]
  }
  return []
}
