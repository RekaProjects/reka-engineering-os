import { createServerClient } from '@/lib/supabase/server'
import type { FxRate } from '@/types/database'

/** Get the latest FX rate for a currency pair */
export async function getLatestFxRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number | null> {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('fx_rates')
    .select('rate')
    .eq('from_currency', fromCurrency)
    .eq('to_currency', toCurrency)
    .order('effective_date', { ascending: false })
    .limit(1)
    .single()

  return data?.rate ?? null
}

/** Get all FX rates (for settings management) */
export async function getFxRates(): Promise<FxRate[]> {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('fx_rates')
    .select('*')
    .order('effective_date', { ascending: false })
    .limit(50)

  return data ?? []
}

/** Get current USD→IDR rate, fallback to 16400 */
export async function getUsdToIdrRate(): Promise<number> {
  const rate = await getLatestFxRate('USD', 'IDR')
  return rate ?? 16400
}
