export async function getExchangeRate(from: string, to: string): Promise<number> {
  if (from === to) {
    return 1
  }

  const apiKey = process.env.EXCHANGE_RATE_API_KEY
  
  if (!apiKey) {
    throw new Error('Exchange rate API key not configured')
  }

  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}`,
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate')
    }

    const data = await response.json()

    if (data.result !== 'success') {
      throw new Error(data['error-type'] || 'Failed to get exchange rate')
    }

    return data.conversion_rate
  } catch (error) {
    throw new Error('Failed to fetch exchange rate. Please try again.')
  }
}

export async function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount
  }

  const rate = await getExchangeRate(fromCurrency, toCurrency)
  const converted = amount * rate
  return Number(converted.toFixed(2))
}

export async function previewConversion(
  amounts: number[],
  fromCurrency: string,
  toCurrency: string
): Promise<{ original: number; converted: number; rate: number }[]> {
  const rate = await getExchangeRate(fromCurrency, toCurrency)
  
  return amounts.map((amount) => ({
    original: amount,
    converted: Number((amount * rate).toFixed(2)),
    rate,
  }))
}

