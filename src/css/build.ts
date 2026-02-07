const cards = [
    '.block-cards [data-region^="loading-placeholder"] .card-grid .card',
    '.course-card'];
const dropdownContainers = [
    '.dropdown-menu',
    '#nav-popover-favourites-container .popover-region-container',
    '.MathJax_Menu'];
const dropdownItems = ['.dropdown-item:not(.hidden)', '.MathJax_MenuItem'];

export const SELECTORS: Record<string, [selector: string]> = {
    vars: ['&:root, &:host'],
    'region-main': ['#page .main-inner > *:not(.drawer-toggles, .__moomo-background-host)'],
    drawer: ['.drawer'],
    overlay: [[...dropdownContainers, '.navbar.fixed-top'].join()],
    'dropdown-container': [dropdownContainers.join()],
    dropdown: [[
        '.dropdown-menu.show:not(#user-action-menu)',
        '#user-action-menu [role="menu"]:is(:not(.carousel-item), .active, .carousel-item-next, .carousel-item-prev):has(>.dropdown-item)',
        '#nav-popover-favourites-container .popover-region-content',
        '.MathJax_Menu',
        '.__moomo-workspace-tools .dropdown-toggle:is(:hover, :focus-visible) + .dropdown-menu',
        '.__moomo-workspace-tools .dropdown-menu:is(:hover, :focus-within)'].join()],
    'dropdown-item': [dropdownItems.join()],
    'dropdown-divider': ['.dropdown-divider'],
    cards: [cards.join()],
    'favourite-icon': ['.course-card [id^=favorite-icon] .text-primary'],
    loading: ['.bg-pulse-grey'],
    'loading-text': ['.bg-pulse-grey:not(.rounded-circle, .card-img-top)'],
    clickable: [[
        `:where(${cards.join()})`,
        ...dropdownItems,
        '.navbar-brand',
        '.nav-item:has(> .nav-link)',
        '.nav-link:not(.nav-item > *)',
        ':where(#usernavigation .editmode-switch-form) .input-group',
        '.btn'].join()],
};

export const CLASSES: Record<string, [selector: string]> = {
    hover: [':is(:hover, :focus-visible, :active)'],
    active: [':is(:active)'],
    checked: ['.dropdown-item[aria-current="true"], .dropdown-item[aria-selected="true"]'],
    'dropdown-item-with-icon': ['#user-action-menu .loggedinas ~ a, .__moomo-help-button, .__moomo-settings-button, .__moomo-workspace-tools > .dropdown-toggle, .__moomo-workspace-tools > .dropdown-menu > .dropdown-item'],
};

export function transform(input: string) {
    const transformed = input.replaceAll(/::-moomo-([a-zA-Z0-9_-]+)/g, (match, el) => {
        return el in SELECTORS ? `:is(${SELECTORS[el][0]})` : match;
    }).replaceAll(/(?<!:):-moomo-([a-zA-Z0-9_-]+)/g, (match, el) => {
        return CLASSES[el] ? `:is(${CLASSES[el][0]})` : match;
    });
    return transformed;
}
