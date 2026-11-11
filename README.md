# @azcon/agentkit-action-provider

> **Official Coinbase AgentKit Action Provider for Azcon Energy**  
> Brazilian Corporate Intelligence, Photovoltaic Physics & ANEEL / EDP-ES Electricity Tariffs.

Este pacote é um **Action Provider oficial** para o framework [Coinbase AgentKit](https://github.com/coinbase/agentkit). Ele permite que agentes autônomos de IA executando na rede **Base** (ou qualquer L2/EVM compatível) realizem consultas e análises de engenharia energética e corporativa com liquidação financeira instantânea em micropagamentos via protocolo **HTTP 402 (x402)** em USDC.

---

## ⚡ Recursos Disponíveis

1. **`simulate_photovoltaic_system`**:
   - Cálculos físicos de irradiação solar e geração mensal de energia (kWh).
   - Dados climáticos e de irradiação (PVGIS Europa / Open-Meteo) calibrados para coordenadas geográficas brasileiras (com ênfase no Espírito Santo / EDP-ES).
   - Dimensionamento de potência de pico ($kW_p$), área de telhado necessária e economia financeira estimada.

2. **`enrich_cnpj_energy_profile`**:
   - Consulta de dados cadastrais na Receita Federal brasileira.
   - Enriquecimento inteligente de consumo elétrico com base no CNAE principal e porte da empresa.
   - Detecção de enquadramento tarifário recomendado (Grupo A - Alta Tensão ou Grupo B - Baixa Tensão).

3. **`get_aneel_tariffs`**:
   - Dados de tarifas homologadas pela ANEEL e concessionárias (ex: EDP-ES, Enel, Cemig, Copel).
   - Cálculo de Fio B conforme marco legal da geração distribuída (Lei 14.300/2022).
   - Informações sobre bandeiras tarifárias vigentes.

---

## 📦 Instalação

```bash
npm install @azcon/agentkit-action-provider
```

---

## 🚀 Como Usar com Coinbase AgentKit & LangChain

```javascript
import { AgentKit, cdpWalletActionProvider } from '@coinbase/agentkit';
import { getLangChainTools } from '@coinbase/agentkit-langchain';
import { azconEnergyActionProvider } from '@azcon/agentkit-action-provider';

// 1. Inicializar o AgentKit com o Provedor de Ações da Azcon
const agentKit = await AgentKit.from({
  actionProviders: [
    cdpWalletActionProvider(),
    azconEnergyActionProvider()
  ]
});

// 2. Exportar as ferramentas para o LangChain / OpenAI / Claude
const tools = await getLangChainTools(agentKit);

// O seu agente agora tem acesso nativo a:
// - azcon_simulate_photovoltaic_system
// - azcon_enrich_cnpj_energy_profile
// - azcon_get_aneel_tariffs
```

---

## 💰 Micropagamentos Nativos (Protocolo x402)

Quando os agentes solicitam cálculos de engenharia de alta resolução ou dados avançados, a API Azcon responde de forma padronizada via **HTTP 402 Payment Required**:

- **Rede**: Base (Chain ID `8453`)
- **Token**: USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- **Carteira de Destino Azcon**: `0x9e3a1b9f6cbffaa122a7a460127a920634778007`
- **Custo por Chamada**: $0.05 a $0.15 USDC

Agentes equipados com carteiras CDP (Coinbase Developer Platform) liquidam a fatura automaticamente e recebem os dados sem atrito humano.

---

## 🌐 Endpoints Públicos da Azcon Energy

- **Gateway x402 Base URL**: `https://azconenergy.com.br/api/x402`
- **MCP Server (JSON-RPC 2.0)**: `https://azconenergy.com.br/api/x402/mcp`
- **Catálogo de Serviços**: `https://azconenergy.com.br/api/x402/catalog`
- **Health Check**: `https://azconenergy.com.br/api/x402/health`
- **Descriptor x402**: `https://azconenergy.com.br/.well-known/x402.json`

---

## 📄 Licença

MIT © [Azcon Energy](https://azconenergy.com.br)
