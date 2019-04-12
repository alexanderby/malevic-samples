const {m, sync} = Malevic;

let node = null;
const padding = 16;

export function tooltip({x, y, content}) {
    if (!node) {
        node = document.createElement('div');
        document.body.appendChild(node);
    }
    if (!content) {
        node.style.display = 'none';
        return;
    }
    sync(node, (
        m('div',
            {
                class: 'tooltip',
                style: {
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    transform: `translate(${x + padding}px, ${y + padding}px)`,
                },
            },
            content,
        )
    ));
    const rect = node.getBoundingClientRect();
    const flipX = rect.right > window.innerWidth;
    const flipY = rect.bottom > window.innerHeight;
    if (flipX || flipY) {
        const dx = flipX ? x - rect.width - padding : x + padding;
        const dy = flipY ? y - rect.height - padding : y + padding;
        node.style.transform = `translate(${dx}px, ${dy}px)`;
    }
}
