const {m} = Malevic;
const {render} = Malevic.DOM;

export function switchButton({container, items, active}) {
    render(container, (
        m('span', {class: 'switch-button'},
            ...Object.entries(items).map(([name, onclick]) => {
                return m('span',
                    {
                        class: {
                            'switch-button__item': true,
                            'switch-button__item--active': name === active,
                        },
                        onclick,
                    },
                    name,
                );
            }),
        )
    ));
}
