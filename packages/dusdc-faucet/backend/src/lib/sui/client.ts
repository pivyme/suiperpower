import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { SUI_RPC_URL } from '../../config/main-config.ts';

export const sui = new SuiClient({
  url: SUI_RPC_URL || getFullnodeUrl('testnet'),
});
