export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });
  const url = process.env.SUPABASE_URL || 'https://nxpmotmlisrdndikrluv.supabase.co';
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!publishableKey) return res.status(503).json({ error: 'Supabase ainda não configurado no servidor.' });
  return res.status(200).json({ url, publishableKey });
}
