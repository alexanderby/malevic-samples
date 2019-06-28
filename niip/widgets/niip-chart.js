import {scaleBand, scaleLinear} from '../utils/scale.js';
import {tooltip} from './tooltip.js';
const {m} = Malevic;
const {render} = Malevic.DOM;
const {withAnimation, animate} = Malevic.Animation;

const isChrome = navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Chromium');

export function niipChart({container, width, height, data, title, format}) {
    render(container, m(Chart, {width, height, data, title, format}));
}

const Chart = withAnimation(({width, height, data, title: titleText, format}) => {
    const pad = 12;
    const titleSize = Math.max(24, Math.floor(height * 0.05));
    const iconRatio = 0.75;
    const iconPad = 12;
    const textPad = 4;
    const barPad = 0.2;
    const maxTextWidth = 64;
    const animationDuration = 750;

    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);

    const scaleX = scaleBand({
        range: [pad, width - pad],
        domain: Array.from({length: data.length}).map((d, i) => i),
        padding: barPad,
    });
    const barWidth = scaleX.bandwidth();
    const textSize = Math.floor(barWidth);

    const iconHeight = barWidth * iconRatio;
    const scaleY = scaleLinear({
        range: [
            pad + titleSize + pad + iconHeight + iconPad + (max < 0 ? maxTextWidth : 0),
            height - pad - iconHeight - iconPad - (min > 0 ? maxTextWidth : 0),
        ],
        domain: [max, min],
    });
    const zeroY = scaleY(0);

    let zeroIndex = 0;
    for (; zeroIndex < data.length - 1; zeroIndex++) {
        if (data[zeroIndex].value >= 0 && data[zeroIndex + 1].value <= 0) {
            break;
        }
    }

    function axis() {
        function tick(value) {
            const x1 = value > 0 ? scaleX(0) : scaleX(data.length - 1);
            const x2 = value > 0 ? scaleX(zeroIndex) : scaleX(zeroIndex + 1);
            return [
                m('line', {
                    x1,
                    x2,
                    y1: scaleY(value),
                    y2: scaleY(value),
                }),
                m('text', {
                    x: x2,
                    y: scaleY(value) - textPad,
                    'text-anchor': value > 0 ? 'end' : 'start',
                },
                    format(value),
                ),
            ];
        }

        return m('g', {class: 'axis'},
            max <= 0 ? null : tick(max),
            min >= 0 ? null : tick(min) ,
        );
    }

    function title() {
        return m('text',
            {
                class: 'title',
                x: width / 2,
                y: pad + titleSize / 2,
                'font-size': titleSize,
                'text-anchor': 'middle',
                'alignment-baseline': 'middle',
            },
            titleText,
        );
    }

    function bar(d, i) {
        const x = scaleX(i);
        const y = scaleY(d.value);
        const isNegative = d.value < 0;
        const tx = x + barWidth / 2;
        const ty = zeroY + (isNegative ? -textPad : textPad);

        return m('g',
            {
                key: d.id,
                attached: (node) => barNodes.set(d.id, node),
                updated: (node) => barNodes.set(d.id, node),
            },
            m('rect', {
                class: isNegative ? 'negative' : null,
                x,
                y: (isNegative ? zeroY : y),
                width: barWidth,
                height: (Math.abs(y - zeroY)),
            }),
            m('image', {
                x,
                y: (isNegative ?
                    (y + iconPad) :
                    (y - iconPad - iconHeight)),
                width: barWidth,
                height: iconHeight,
                href: d.icon,
            }),
            isChrome ? m('text',
                {
                    x: tx,
                    y: ty,
                    'text-anchor': isNegative ? 'start' : 'end',
                    'alignment-baseline': 'middle',
                    'transform': 'rotate(-90)',
                    'transform-origin': `${tx} ${ty}`,
                },
                d.label,
            ) : m('g', {transform: `translate(${tx}, ${ty})`},
                m('text',
                    {
                        x: 0,
                        y: 0,
                        'text-anchor': isNegative ? 'start' : 'end',
                        'dominant-baseline': 'middle',
                        'transform': 'rotate(-90)',
                    },
                    d.label,
                )
            ),
        );
    }

    function onMouseMove(e) {
        const x = e.clientX;
        const y = e.clientY;
        const d = getDataFromScreen(x, y);
        tooltip({
            x,
            y,
            content: d ? (
                m('div', {class: 'niip-chart-tooltip'},
                    m('div', {class: 'niip-chart-tooltip__label'},
                        m('span', {
                            class: 'niip-chart-tooltip__label__icon',
                            style: `background-image: url(${d.icon});`,
                        }),
                        d.label),
                    m('div', {class: 'niip-chart-tooltip__value'}, format(d.value)),
                )
            ) : null,
        });
        if (d) {
            highlightBarNode(d.id);
        }
    }

    function onMouseLeave(e) {
        if (e.target === svgNode) {
            highlighted && highlighted.classList.remove('highlight');
            tooltip({content: null});
        }
    }

    let svgNode = null;
    let highlighted = null;
    const barNodes = new Map();

    function highlightBarNode(id) {
        highlighted && highlighted.classList.remove('highlight');
        highlighted = barNodes.get(id);
        highlighted.classList.add('highlight');
    }

    function getDataFromScreen(cx, cy) {
        const threshold = 32;
        const rect = svgNode.getBoundingClientRect();
        const x = cx - rect.left;
        const y = cy - rect.top;
        const left = scaleX(0);
        const right = scaleX(data.length - 1);
        const i = Math.min(data.length - 1, Math.max(0, Math.floor((x - left) / (right - left) * (data.length - 1))));
        const maxLeft = scaleX(i) - threshold;
        const maxRight = scaleX(i) + barWidth + threshold;
        const maxTop = scaleY(max) - pad;
        const maxBottom = scaleY(min) + pad;
        if (x > maxLeft && x < maxRight && y > maxTop && y < maxBottom) {
            return data[i];
        }
        return null;
    }

    function animateSVGAttrs(spec) {
        if (Array.isArray(spec)) {
            spec.forEach((s) => animateSVGAttrs(s));
            return spec;
        }

        if (
            !isChrome ||
            !spec ||
            typeof spec !== 'object' ||
            typeof spec.type !== 'string'
        ) {
            return spec;
        }

        const attrs = ['x', 'y', 'x1', 'x2', 'y1', 'y2', 'width', 'height', 'transform-origin', 'transform'];
        attrs
            .filter((attr) => spec.props.hasOwnProperty(attr) && typeof spec.props[attr] !== 'object')
            .forEach((attr) =>
                spec.props[attr] = animate(spec.props[attr], {duration: animationDuration})
            );
        spec.children.forEach((s) => animateSVGAttrs(s));
        return spec;
    }

    return animateSVGAttrs(
        m('svg',
            {
                class: 'niip-chart',
                width,
                height,
                style: {
                    'font-size': `${textSize}px`,
                    opacity: animate(1).initial(0),
                },
                attached: (node) => svgNode = node,
                updated: (node) => svgNode = node,
                onmousemove: onMouseMove,
                onmouseleave: onMouseLeave,
            },
            title(),
            axis(),
            m('g', null,
                ...data.map((d, i) => bar(d, i))
            )
        )
    );
});
