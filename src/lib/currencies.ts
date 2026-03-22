export interface Currency {
    code: string
    name: string
    symbol: string
    flag: string
    country: string
}

export const CURRENCIES: Currency[] = [
    { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", country: "United States" },
    { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", country: "European Union" },
    { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", country: "United Kingdom" },
    { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", country: "Nigeria" },
    { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", flag: "🇬🇭", country: "Ghana" },
    { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪", country: "Kenya" },
    { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦", country: "South Africa" },
    { code: "CAD", name: "Canadian Dollar", symbol: "CA$", flag: "🇨🇦", country: "Canada" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", country: "Australia" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", country: "Japan" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳", country: "China" },
    { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", country: "India" },
    { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪", country: "UAE" },
    { code: "SAR", name: "Saudi Riyal", symbol: "﷼", flag: "🇸🇦", country: "Saudi Arabia" },
    { code: "CHF", name: "Swiss Franc", symbol: "Fr", flag: "🇨🇭", country: "Switzerland" },
    { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬", country: "Singapore" },
    { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾", country: "Malaysia" },
    { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷", country: "Brazil" },
    { code: "MXN", name: "Mexican Peso", symbol: "MX$", flag: "🇲🇽", country: "Mexico" },
    { code: "EGP", name: "Egyptian Pound", symbol: "E£", flag: "🇪🇬", country: "Egypt" },
    { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", flag: "🇹🇿", country: "Tanzania" },
    { code: "UGX", name: "Ugandan Shilling", symbol: "USh", flag: "🇺🇬", country: "Uganda" },
    { code: "XOF", name: "West African CFA", symbol: "CFA", flag: "🌍", country: "West Africa" },
    { code: "XAF", name: "Central African CFA", symbol: "FCFA", flag: "🌍", country: "Central Africa" },
    { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿", country: "New Zealand" },
    { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", flag: "🇭🇰", country: "Hong Kong" },
    { code: "SEK", name: "Swedish Krona", symbol: "kr", flag: "🇸🇪", country: "Sweden" },
    { code: "NOK", name: "Norwegian Krone", symbol: "kr", flag: "🇳🇴", country: "Norway" },
    { code: "DKK", name: "Danish Krone", symbol: "kr", flag: "🇩🇰", country: "Denmark" },
    { code: "PLN", name: "Polish Złoty", symbol: "zł", flag: "🇵🇱", country: "Poland" },
    { code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "🇹🇷", country: "Turkey" },
    { code: "RUB", name: "Russian Ruble", symbol: "₽", flag: "🇷🇺", country: "Russia" },
    { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭", country: "Thailand" },
    { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩", country: "Indonesia" },
    { code: "PHP", name: "Philippine Peso", symbol: "₱", flag: "🇵🇭", country: "Philippines" },
    { code: "PKR", name: "Pakistani Rupee", symbol: "₨", flag: "🇵🇰", country: "Pakistan" },
    { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", flag: "🇧🇩", country: "Bangladesh" },
]

export function getCurrency(code: string): Currency {
    return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0]
}

export function formatAmount(amount: number, currencyCode: string): string {
    const currency = getCurrency(currencyCode)
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount)
    } catch {
        // Fallback for currencies Intl doesn't support
        return `${currency.symbol}${amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`
    }
}
