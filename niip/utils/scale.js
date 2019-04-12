function scale(x, inLow, inHigh, outLow, outHigh) {
    return (x - inLow) / (inHigh - inLow) * (outHigh - outLow) + outLow;
}

export function scaleLinear({domain, range}) {
    const scaleLinear = (x) => scale(x, domain[0], domain[1], range[0], range[1]);
    const invert = (x) => scale(x, range[0], range[1], domain[0], domain[1]);
    return Object.assign(scaleLinear, {
        invert,
    });
}

export function scaleBand({domain, range, padding = 0}) {
    const bandwidth = (range[1] - range[0]) / (domain.length + domain.length * padding - padding);
    const bands = new Map();
    domain.forEach((d, i) => bands.set(d, range[0] + i * bandwidth * (1 + padding)));
    const scaleBand = (x) => bands.get(x);
    const invert = (x) => domain.find((d, i) => i === domain.length - 1 ? d : (x < range[0] + bandwidth * (i + 1 + (i + 0.5) * padding)));
    return Object.assign(scaleBand, {
        invert,
        bandwidth: () => bandwidth,
    });
}
