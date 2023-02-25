// Math round function with fixed digits amount after decimal point
export function round(x: number, digits: number = 0): number {
    return Math.round((
        x + Number.EPSILON
    ) * 10 ** digits) / 10 ** digits
}
// Number abbreviation
export function numberPower(x: number, digits: number = 0): string {
    const symbols = {1000000000: 'B',  1000000: 'M', 1000: 'K'}
    for (const [value, symbol] of Object.entries(symbols).reverse())
        if (x >= parseInt(value))
            return `${round(x / parseInt(value), digits)}${symbol}`
    return String(round(x, digits))
}