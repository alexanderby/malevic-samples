export function formatBigNumber(value) {
    let chars = Array.from(value.toFixed(0));
    for (let i = chars.length - 3; i >= 1; i -= 3) {
        chars.splice(i, 0, ',');
    }
    return chars.join('');
}

export function formatMUSD(value) {
    return `${value > 0 ? '+' : value < 0 ? '-' : ''}$${formatBigNumber(Math.abs(value))}M`;
}

export function formatPercent(value) {
    return `${value > 0 ? '+' : value < 0 ? '-' : ''}${Math.round(Math.abs(value * 100))}%`;
}
