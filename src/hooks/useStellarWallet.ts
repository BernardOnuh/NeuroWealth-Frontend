'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  Horizon, 
  TransactionBuilder, 
  Operation, 
  Networks, 
  Asset,
  Memo,
  BASE_FEE
} from '@stellar/stellar-sdk';
import { ISupportedWallet } from "@creit.tech/stellar-wallets-kit";
import { getKit } from '../lib/stellar-wallet-kit';

const Server = Horizon.Server;

export interface Balance {
  balance: string;
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
}

export interface PaymentOptions {
  to: string;
  amount: string;
  asset?: 'XLM' | { code: string; issuer: string };
  memo?: string;
  secret?: string;
}

export interface StellarWalletState {
  connected: boolean;
  publicKey?: string;
  walletName?: string;
  balances: Balance[];
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalances: () => Promise<void>;
  sendPayment?: (opts: PaymentOptions) => Promise<Horizon.HorizonApi.SubmitTransactionResponse>;
}

export function useStellarWallet(
  horizonUrl: string = 'https://horizon-testnet.stellar.org',
  network: string = Networks.TESTNET
): StellarWalletState {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string>();
  const [walletName, setWalletName] = useState<string>();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [server] = useState(() => new Server(horizonUrl));

  const connect = useCallback(async () => {
    try {
      const kit = getKit();
      await kit.openModal({
        modalTitle: "Connect to your favorite wallet",
        onWalletSelected: async (option: ISupportedWallet) => {
          kit.setWallet(option.id);

          const { address } = await kit.getAddress();
          const { name } = option;

          setPublicKey(address);
          setWalletName(name);
          setConnected(true);
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('stellar_wallet_connected', 'true');
            localStorage.setItem('stellar_wallet_id', option.id);
            localStorage.setItem('stellar_wallet_address', address);
            localStorage.setItem('stellar_wallet_name', name);
          }
          
          try {
            const account = await server.accounts().accountId(address).call();
            setBalances(account.balances);
          } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error && (error as { response?: { status?: number } }).response?.status === 404) {
              console.log(`Account ${address} not found on testnet. Fund it with XLM to activate it.`);
              setBalances([]);
            } else {
              console.error('Failed to load balances:', error);
              setBalances([]);
            }
          }
        },
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }, [server]);

  const disconnect = useCallback(async () => {
    try {
      const kit = getKit();
      await kit.disconnect();
      setConnected(false);
      setPublicKey(undefined);
      setWalletName(undefined);
      setBalances([]);
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('stellar_wallet_connected');
        localStorage.removeItem('stellar_wallet_id');
        localStorage.removeItem('stellar_wallet_address');
        localStorage.removeItem('stellar_wallet_name');
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }, []);

  const refreshBalancesForKey = useCallback(async (key: string) => {
    try {
      const account = await server.accounts().accountId(key).call();
      setBalances(account.balances);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && (error as { response?: { status?: number } }).response?.status === 404) {
        console.log(`Account ${key} not found on testnet. Fund it with XLM to activate it.`);
        setBalances([]);
      } else {
        console.error('Failed to load balances:', error);
        setBalances([]);
      }
    }
  }, [server]);

  const refreshBalances = useCallback(async () => {
    if (!publicKey) return;
    await refreshBalancesForKey(publicKey);
  }, [publicKey, refreshBalancesForKey]);

  const sendPayment = useCallback(async (opts: PaymentOptions) => {
    if (!publicKey || !connected) {
      throw new Error('Wallet not connected');
    }

    try {
      const account = await server.loadAccount(publicKey);
      
      const asset = opts.asset === 'XLM' || !opts.asset 
        ? Asset.native() 
        : new Asset(opts.asset.code, opts.asset.issuer);

      const txBuilder = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: network,
      });

      txBuilder.addOperation(
        Operation.payment({
          destination: opts.to,
          asset: asset,
          amount: opts.amount,
        })
      );

      if (opts.memo) {
        txBuilder.addMemo(Memo.text(opts.memo));
      }

      txBuilder.setTimeout(30);
      const transaction = txBuilder.build();

      const kit = getKit();
      const { signedTxXdr } = await kit.signTransaction(transaction.toXDR(), {
        address: publicKey,
        networkPassphrase: network,
      });

      const signedTransaction = TransactionBuilder.fromXDR(signedTxXdr, network);
      const result = await server.submitTransaction(signedTransaction);
      
      await refreshBalances();
      return result;
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
    }
  }, [publicKey, connected, server, network, refreshBalances]);

  useEffect(() => {
    const autoReconnect = async () => {
      if (typeof window === 'undefined') return;
      
      const wasConnected = localStorage.getItem('stellar_wallet_connected');
      const savedWalletId = localStorage.getItem('stellar_wallet_id');
      const savedAddress = localStorage.getItem('stellar_wallet_address');
      const savedName = localStorage.getItem('stellar_wallet_name');
      
      if (wasConnected === 'true' && savedWalletId && savedAddress) {
        try {
          const kit = getKit();
          kit.setWallet(savedWalletId);
          const { address } = await kit.getAddress();
          
          if (address === savedAddress) {
            setPublicKey(address);
            setWalletName(savedName || 'Unknown');
            setConnected(true);
            
            try {
              const account = await server.accounts().accountId(address).call();
              setBalances(account.balances);
            } catch (error: unknown) {
              if (error && typeof error === 'object' && 'response' in error && (error as { response?: { status?: number } }).response?.status === 404) {
                console.log(`Account ${address} not found. Fund it to activate.`);
                setBalances([]);
              } else {
                setBalances([]);
              }
            }
          }
        } catch {
          console.log('Auto-reconnect failed');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('stellar_wallet_connected');
            localStorage.removeItem('stellar_wallet_id');
            localStorage.removeItem('stellar_wallet_address');
            localStorage.removeItem('stellar_wallet_name');
          }
        }
      }
    };
    
    autoReconnect();
  }, [server]);

  return {
    connected,
    publicKey,
    walletName,
    balances,
    connect,
    disconnect,
    refreshBalances,
    sendPayment: connected ? sendPayment : undefined,
  };
}