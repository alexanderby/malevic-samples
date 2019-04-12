function getData(dataset, getValue) {
    return dataset
        .map((d) => {
            return {
                id: d.name,
                value: getValue(d),
                icon: d.icon,
                label: d.name,
            };
        })
        .sort((a, b) => b.value - a.value);
}

export function getNIIPData(dataset) {
    return getData(dataset, (d) => d.niip);
}

export function getGDPData(dataset) {
    return getData(dataset, (d) => d.gdp);
}

export function getNIIPToGDPData(dataset) {
    return getData(dataset, (d) => d.niip / d.gdp);
}
