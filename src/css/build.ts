export const SELECTORS: Record<string, [selector: string]> = {
    vars: ['&:root, &:host'],
    'dropdown-container': ['.dropdown-menu, #nav-popover-favourites-container .popover-region-container, .MathJax_Menu'],
    dropdown: [[
        '.dropdown-menu.show:not(#user-action-menu)',
        '#user-action-menu [role="menu"]:is(:not(.carousel-item), .active, .carousel-item-next, .carousel-item-prev):has(>.dropdown-item)',
        '#nav-popover-favourites-container .popover-region-content',
        '.MathJax_Menu',
        '.__uclearn-workspace-tools .dropdown-toggle:is(:hover, :focus-visible) + .dropdown-menu',
        '.__uclearn-workspace-tools .dropdown-menu:is(:hover, :focus-within)'].join()],
    'dropdown-item': ['.dropdown-item:not(.hidden), .MathJax_MenuItem'],
    'dropdown-divider': ['.dropdown-divider'],
};

export const CLASSES: Record<string, [selector: string]> = {
    hover: [':is(:hover, :focus-visible, :active)'],
    active: [':is(:active)'],
    checked: ['.dropdown-item[aria-current="true"], .dropdown-item[aria-selected="true"]'],
    'dropdown-item-with-icon': ['#user-action-menu .loggedinas ~ a, .__uclearn-help-button, .__uclearn-settings-button, .__uclearn-workspace-tools > .dropdown-toggle, .__uclearn-workspace-tools > .dropdown-menu > .dropdown-item'],
};

export function build(input: string) {
    return `:root:root:root:root:root:root:root:root{${input.replaceAll(/::-moomo-([a-zA-Z0-9_-]+)/g, (match, el) => {
        return SELECTORS[el] ? `:is(${SELECTORS[el][0]})` : match;
    }).replaceAll(/(?<!:):-moomo-([a-zA-Z0-9_-]+)/g, (match, el) => {
        return CLASSES[el] ? `:is(${CLASSES[el][0]})` : match;
    }).replaceAll(/\/\*.*?\*\//g, '').replaceAll(/\s+/g, ' ')}}`;
}
