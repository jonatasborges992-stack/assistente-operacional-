export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'IA ainda não configurada no servidor.' });

  try {
    const { text, clients = [], vehicles = [] } = req.body || {};
    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'Texto de interpretação ausente.' });

    const compactClients = clients.slice(0, 200).map(c => ({ id: c.id, nome: c.nome, contato: c.contato || '' }));
    const compactVehicles = vehicles.slice(0, 200).map(v => ({ id: v.id, nome: v.nome, placa: v.placa || '' }));

    const schema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        client_id: { type: ['integer', 'null'] },
        vehicle_id: { type: ['integer', 'null'] },
        client_name: { type: ['string', 'null'] },
        vehicle_name: { type: ['string', 'null'] },
        origin: { type: 'string' },
        destination: { type: 'string' },
        freight_value: { type: 'number' },
        diesel: { type: 'number' },
        maintenance: { type: 'number' },
        toll: { type: 'number' },
        outsourcing: { type: 'number' },
        food: { type: 'number' },
        confidence: { type: 'number' },
        missing_fields: { type: 'array', items: { type: 'string' } }
      },
      required: ['client_id','vehicle_id','client_name','vehicle_name','origin','destination','freight_value','diesel','maintenance','toll','outsourcing','food','confidence','missing_fields']
    };

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        store: false,
        instructions: `Você é o interpretador do OPERA ONE. Sua única função é transformar texto em dados estruturados de um lançamento operacional. NÃO calcule lucro, NÃO grave dados, NÃO altere regras e NÃO invente informações. Use somente o que foi dito pelo usuário. Valores monetários devem ser números em reais. Entenda português brasileiro, números por extenso, abreviações e formas naturais de falar. Quando houver um cliente ou veículo cadastrado, prefira o ID correspondente. Se algo não estiver claro, deixe nulo/zero e coloque o campo em missing_fields. A lista de clientes e veículos é apenas contexto para reconhecimento.`,
        input: JSON.stringify({
          user_text: text,
          clients: compactClients,
          vehicles: compactVehicles
        }),
        text: {
          format: {
            type: 'json_schema',
            name: 'opera_launch_interpretation',
            strict: true,
            schema
          }
        }
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(502).json({ error: 'Falha ao interpretar com a IA.', detail: data?.error?.message || '' });

    const output = data.output_text;
    if (!output) return res.status(502).json({ error: 'A IA não retornou uma interpretação válida.' });

    return res.status(200).json(JSON.parse(output));
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno na interpretação.', detail: error?.message || '' });
  }
}
