/* OPERA ONE — camada exclusiva de interpretação IA.
   Não grava dados, não calcula indicadores e não altera regras do app. */
window.operaAIInterpret = async function(text) {
  const db = (() => { try { return JSON.parse(localStorage.getItem('assistente_operacional_v5') || '{}'); } catch { return {}; } })();
  const response = await fetch('/api/interpret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      clients: Array.isArray(db.clients) ? db.clients : [],
      vehicles: Array.isArray(db.vehicles) ? db.vehicles : []
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Não foi possível usar a IA.');
  return data;
};
