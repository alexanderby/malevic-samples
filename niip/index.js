import {getNIIPData, getGDPData, getNIIPToGDPData} from './utils/data.js';
import {formatMUSD, formatPercent} from './utils/format.js';
import {niipChart} from './widgets/niip-chart.js';
import {switchButton} from './widgets/switch-button.js';

function renderChart({data, title, format}) {
    niipChart({
        container: document.getElementById('niip-chart'),
        width: 920,
        height: 480,
        data,
        title,
        format,
    });
}

function renderGDPChart() {
    const data = getGDPData(state.dataset);
    const title = 'GDP (millions USD)';
    const format = formatMUSD;
    renderChart({data, title, format});
}

function renderNIIPChart() {
    const data = getNIIPData(state.dataset);
    const title = 'Net International Investment Position';
    const format = formatMUSD;
    renderChart({data, title, format});
}

function renderNIIPToGDPChart() {
    const data = getNIIPToGDPData(state.dataset);
    const title = 'NIIP to GDP (%)';
    const format = formatPercent;
    renderChart({data, title, format});
}

const chartTypes = {
    GDP: 'GDP',
    NIIP: 'NIIP',
    NIIP_TO_GDP: 'NIIP to GDP',
};

const state = {
    activeChart: null,
    dataset: null,
};

function setState(newState) {
    Object.assign(state, newState);
    renderUI();
}

function renderUI() {
    const chartRenderer = {
        [chartTypes.GDP]: renderGDPChart,
        [chartTypes.NIIP]: renderNIIPChart,
        [chartTypes.NIIP_TO_GDP]: renderNIIPToGDPChart,
    }[state.activeChart];
    chartRenderer(state.dataset);

    switchButton({
        container: document.getElementById('chart-switch'),
        active: state.activeChart,
        items: {
            [chartTypes.NIIP]: () => setState({activeChart: chartTypes.NIIP}),
            [chartTypes.NIIP_TO_GDP]: () => setState({activeChart: chartTypes.NIIP_TO_GDP}),
            [chartTypes.GDP]: () => setState({activeChart: chartTypes.GDP}),
        },
    });
}

async function start() {
    const dataset = await (await fetch('./datasets/niip.json')).json();
    setState({
        activeChart: chartTypes.NIIP,
        dataset,
    });
}

window.addEventListener('load', () => start());
