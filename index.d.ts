/**
 * @azcon/agentkit-action-provider TypeScript Declarations
 */

export interface SimulateSolarParams {
  monthlyKwh?: number;
  monthlyBillBrl?: number;
  city?: string;
  uf?: string;
}

export interface EnrichCnpjParams {
  cnpj: string;
}

export interface GetAneelTariffsParams {
  concessionaria?: string;
  subgrupo?: string;
}

export interface AzconEnergyActionProvider {
  name: string;
  supportsNetwork: (network: any) => boolean;
  getActions: (walletProvider: any) => Promise<any[]>;
}

export declare function azconEnergyActionProvider(): AzconEnergyActionProvider;
