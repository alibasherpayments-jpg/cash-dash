/**
 * Utilities for extracting, formatting, and copying payout destination details
 * across the admin panel (Vodafone Cash, Binance Pay ID/UID, InstaPay, Crypto, etc.).
 */

export interface DestinationEntry {
  key: string;
  label: string;
  value: string;
}

export interface ParsedDestination {
  primaryWallet: string;
  walletType?: string;
  accountHolder?: string;
  entries: DestinationEntry[];
  summary: string;
}

const FIELD_LABEL_MAP: Record<string, string> = {
  recipientidentifier: 'Binance Pay ID / UID / Address',
  recipient_identifier: 'Binance Pay ID / UID / Address',
  transfermethod: 'Transfer Method',
  transfer_method: 'Transfer Method',
  walletnumber: 'Wallet Number',
  wallet_number: 'Wallet Number',
  accountholdername: 'Account Holder Name',
  account_holder_name: 'Account Holder Name',
  instapayaddress: 'InstaPay IPA / Number',
  instapay_address: 'InstaPay IPA / Number',
  walletaddress: 'Wallet Address',
  wallet_address: 'Wallet Address',
  phonenumber: 'Phone Number',
  phone_number: 'Phone Number',
  mobile: 'Mobile Number',
  phone: 'Phone',
  email: 'Email',
  binance_id: 'Binance ID',
  binance_pay_id: 'Binance Pay ID',
  pay_id: 'Pay ID',
  uid: 'UID',
  network: 'Network',
  accountnumber: 'Account Number',
  account_number: 'Account Number',
  iban: 'IBAN',
};

export function formatFieldLabel(key: string): string {
  const normalized = key.toLowerCase().replace(/[\s_-]+/g, '');
  if (FIELD_LABEL_MAP[normalized]) {
    return FIELD_LABEL_MAP[normalized];
  }
  // Convert camelCase or snake_case to Title Case
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/^./, (str) => str.toUpperCase());
}

/**
 * Extracts a normalized, copy-ready wallet identifier and human details from any destination payload.
 */
export function parseWithdrawalDestination(raw: any, methodName?: string): ParsedDestination {
  if (!raw) {
    return {
      primaryWallet: 'N/A',
      entries: [],
      summary: 'N/A',
    };
  }

  let obj: Record<string, any> = {};

  if (typeof raw === 'object') {
    obj = raw;
  } else if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        obj = JSON.parse(trimmed);
      } catch {
        // Not valid JSON, continue with string parsing
      }
    }

    if (Object.keys(obj).length === 0) {
      if (trimmed.includes(':') || trimmed.includes('|')) {
        const parts = trimmed.split('|').map((p) => p.trim());
        for (const part of parts) {
          const colonIdx = part.indexOf(':');
          if (colonIdx > -1) {
            const k = part.slice(0, colonIdx).trim();
            const v = part.slice(colonIdx + 1).trim();
            if (k && v) obj[k] = v;
          }
        }
      }

      if (Object.keys(obj).length === 0) {
        return {
          primaryWallet: trimmed || 'N/A',
          entries: [{ key: 'destination', label: methodName || 'Wallet', value: trimmed }],
          summary: trimmed,
        };
      }
    }
  }

  // Priority search for the primary payment target/wallet
  const priorityKeys = [
    'recipientidentifier',
    'recipient_identifier',
    'walletnumber',
    'wallet_number',
    'instapayaddress',
    'instapay_address',
    'phone',
    'mobile',
    'mobile_number',
    'phonenumber',
    'phone_number',
    'wallet',
    'walletaddress',
    'wallet_address',
    'address',
    'crypto_address',
    'binance_id',
    'binance_pay_id',
    'pay_id',
    'uid',
    'accountnumber',
    'account_number',
    'iban',
    'account',
    'email',
  ];

  let primaryWallet = '';

  // 1. Direct match on priority keys
  for (const pKey of priorityKeys) {
    for (const [k, v] of Object.entries(obj)) {
      const kl = k.toLowerCase().replace(/[\s_-]+/g, '');
      if (kl === pKey && v && String(v).trim()) {
        primaryWallet = String(v).trim();
        break;
      }
    }
    if (primaryWallet) break;
  }

  // 2. Fallback: inspect keys that don't represent transfer method or account holder
  if (!primaryWallet) {
    for (const [k, v] of Object.entries(obj)) {
      const kl = k.toLowerCase();
      if (
        !kl.includes('method') &&
        !kl.includes('transfer') &&
        !kl.includes('holder') &&
        !kl.includes('type') &&
        !kl.includes('network') &&
        !kl.includes('name') &&
        v
      ) {
        primaryWallet = String(v).trim();
        break;
      }
    }
  }

  // 3. Fallback: first non-empty value
  if (!primaryWallet) {
    const vals = Object.values(obj).filter(Boolean);
    primaryWallet = vals.length > 0 ? String(vals[0]).trim() : 'N/A';
  }

  // Extract type
  let walletType: string | undefined = undefined;
  for (const [k, v] of Object.entries(obj)) {
    const kl = k.toLowerCase();
    if (kl.includes('transfermethod') || kl.includes('method') || kl.includes('network') || kl.includes('type')) {
      walletType = String(v).trim();
      break;
    }
  }

  // Extract holder name
  let accountHolder: string | undefined = undefined;
  for (const [k, v] of Object.entries(obj)) {
    const kl = k.toLowerCase();
    if (kl.includes('holder') || (kl.includes('name') && !kl.includes('method') && !kl.includes('user'))) {
      accountHolder = String(v).trim();
      break;
    }
  }

  // Build entries list
  const entries: DestinationEntry[] = Object.entries(obj).map(([key, value]) => ({
    key,
    label: formatFieldLabel(key),
    value: String(value ?? ''),
  }));

  // Build human summary
  const summaryParts: string[] = [];
  if (primaryWallet && primaryWallet !== 'N/A') summaryParts.push(primaryWallet);
  if (walletType) summaryParts.push(`(${walletType})`);
  if (accountHolder) summaryParts.push(`— ${accountHolder}`);

  return {
    primaryWallet,
    walletType,
    accountHolder,
    entries,
    summary: summaryParts.join(' ') || primaryWallet,
  };
}
