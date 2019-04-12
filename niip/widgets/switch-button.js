const {m, render} = Malevic;

export function switchButton({container, items, active}) {
    return render(container, (
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
