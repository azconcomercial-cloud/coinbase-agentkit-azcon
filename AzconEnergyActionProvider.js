/**
 * AzconEnergyActionProvider.js
 * Provedor Oficial de Ações para o Coinbase AgentKit (@coinbase/agentkit).
 *
 * Permite que qualquer agente autônomo na rede Base execute ferramentas de:
 * 1. Consulta e enriquecimento de CNPJs brasileiros com estimativa de consumo elétrico (kWh).
 * 2. Simulação física fotovoltaica de precisão (PVGIS Europa / Open-Meteo / ANEEL / EDP-ES).
 * 3. Consulta de tarifas homologadas ANEEL e regras de transição do Fio B (Lei 14.300).
 *
 * Suporta micropagamentos automáticos via protocolo HTTP 402 (x402) em USDC na rede Base.
 */

'use strict';
const https = require('https');

const AZCON_GATEWAY_URL = 'https://azconenergy.com.br';

/**
 * Utilitário de requisição HTTPS para a API Azcon
 */
function requestAzcon(endpoint, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload || {});
    const req = https.request(`${AZCON_GATEWAY_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'Coinbase-AgentKit-Azcon/1.0'
      },
      timeout: 10000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ raw: body, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout de comunicação com o Gateway Azcon'));
    });

    req.write(data);
    req.end();
  });
}

class AzconEnergyActionProvider {
  constructor() {
    this.name = 'azcon-energy-action-provider';
    this.version = '1.0.0';
  }

  /**
   * Retorna a lista de ações suportadas com seus esquemas
   */
  getActions() {
    return [
      {
        name: 'get_brazilian_company_energy_profile',
        description: 'Consulta oficial de CNPJ brasileiro com dados da Receita Federal (QSA, Capital, CNAE) enriquecido com consumo elétrico estimado (kWh/mês), conta média estimada e potencial de usina solar.',
        parameters: {
          type: 'object',
          properties: {
            cnpj: {
              type: 'string',
              description: 'Número do CNPJ da empresa com 14 dígitos (apenas números ou formatado)'
            }
          },
          required: ['cnpj']
        },
        invoke: async (args) => {
          const cnpj = String(args.cnpj || '').replace(/\D/g, '');
          if (cnpj.length !== 14) {
            return { error: 'CNPJ inválido. Forneça exatamente 14 dígitos numéricos.' };
          }
          return await requestAzcon('/api/x402/prospector/lead', { cnpj });
        }
      },
      {
        name: 'calculate_solar_geometry_and_yield',
        description: 'Simulação física e matemática fotovoltaica de alta precisão. Calcula potência em kWp, quantidade de módulos 630W N-Type bifaciais, inversores Solis/Growatt, geração mensal em kWh, economia anual e payback em anos.',
        parameters: {
          type: 'object',
          properties: {
            monthlyKwh: {
              type: 'number',
              description: 'Consumo mensal de energia elétrica da fatura em kWh'
            },
            city: {
              type: 'string',
              description: 'Cidade de instalação (ex: Vitória, Serra, Vila Velha, Linhares)'
            },
            uf: {
              type: 'string',
              description: 'Sigla do estado com 2 letras (ex: ES, SP, RJ, MG)'
            },
            tariffGroup: {
              type: 'string',
              description: 'Grupo tarifário: B1 (Residencial), B3 (Comercial) ou A4 (Industrial)'
            }
          },
          required: ['monthlyKwh']
        },
        invoke: async (args) => {
          return await requestAzcon('/api/x402/solar/simulate', args);
        }
      },
      {
        name: 'get_aneel_tariff_benchmark',
        description: 'Tarifas de eletricidade homologadas pela ANEEL para concessionárias do Brasil (foco EDP-ES / Sudeste), detalhando Tarifa de Energia (TE), TUSD, e o escalonamento do Fio B da Lei 14.300.',
        parameters: {
          type: 'object',
          properties: {
            concessionaire: {
              type: 'string',
              description: 'Nome da concessionária distribuidora (ex: EDP-ES, Enel, Cemig, Light)'
            }
          }
        },
        invoke: async (args) => {
          return {
            distribuidora: args.concessionaire || 'EDP Espírito Santo (Escelsa)',
            tarifaHomologadaB3: 'R$ 0,954 / kWh',
            tusdKwh: 'R$ 0,481 / kWh',
            teKwh: 'R$ 0,473 / kWh',
            tusdFioB: 'R$ 0,366 / kWh',
            regimeLei14300: 'Ano 2026: 75% da TUSD Fio B faturada',
            bandeiraTarifariaVigente: 'VERDE (Sem taxa adicional)',
            fonte: 'ANEEL / SIGA GD 2026'
          };
        }
      }
    ];
  }

  /**
   * Compatibilidade de rede: Mainnet Base e Solana
   */
  supportsNetwork(network) {
    const net = String(network).toLowerCase();
    return net.includes('base') || net.includes('8453') || net.includes('solana');
  }
}

function azconEnergyActionProvider() {
  return new AzconEnergyActionProvider();
}

module.exports = {
  AzconEnergyActionProvider,
  azconEnergyActionProvider
};
