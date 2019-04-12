// https://en.wikipedia.org/wiki/Net_international_investment_position

function getNIIPData() {
    const table = document.querySelector('.wikitable');
    const rows = Array.from(table.querySelector('tbody').children)
        .filter((tr) => {
            return !Array.from(tr.querySelectorAll('a')).some((a) => a.textContent === 'Eurozone');
        });
    const data = rows.map((tr) => {
        const icon = tr.querySelector('img').getAttribute('src');
        const name = tr.querySelector('td a').textContent;
        const gdp = parseInt(tr.children[2].textContent.replace(/,/g, ''));
        const niip = parseInt(tr.children[4].textContent.replace(/,/g, ''));
        return {name, gdp, niip, icon};
    });
    return JSON.stringify(data, null, 4);
}
