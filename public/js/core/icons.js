/**
 * @file NIRD Clicker - Bibliothèque d'icônes SVG
 * @description Jeu d'icônes vectorielles (trait 24x24) utilisé à la place des emoji.
 *              Usage : icon('penguin') -> chaîne <svg> prête à injecter dans le DOM.
 * @license MIT
 * @author GPT MEN'S - Nuit de l'Info 2025
 */

/**
 * Tracés des icônes (contenu interne d'un <svg viewBox="0 0 24 24">).
 * Style : contour 1.75px, extrémités arrondies, hérite de currentColor.
 * @type {Record<string, string>}
 */
const ICON_PATHS = {
    // --- Interface ---
    // Jeton « Point de Souveraineté » (monnaie du jeu)
    'token': '<path d="M12 2.2 20.5 7v10L12 21.8 3.5 17V7Z"/><path d="M14.6 9.3c-.4-.8-1.4-1.3-2.6-1.3-1.6 0-2.7.8-2.7 2s1 1.6 2.7 2 2.7.8 2.7 2-1.1 2-2.7 2c-1.3 0-2.3-.5-2.7-1.4"/>',
    'x':'<path d="M18 6 6 18M6 6l12 12"/>',
    'check': '<path d="M20 6 9 17l-5-5"/>',
    'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
    'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
    'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    'help': '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    'warning': '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
    'chart': '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
    'podium': '<path d="M2 21h20"/><path d="M3 21v-7h6v7M9 21V9h6v12M15 21v-5h6v5"/><path d="m12 3 .9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3Z"/>',
    'gear': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    'book': '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2Z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7Z"/>',
    'lightbulb': '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/>',
    'volume': '<path d="M11 5 6 9H2v6h4l5 4Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
    'upload': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
    'trash': '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    'save': '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    'gamepad': '<path d="M6 11h4M8 9v4M15 12h.01M18 10h.01"/><path d="M17.32 5H6.68a4 4 0 0 0-3.98 3.59l-.9 7.4A2.5 2.5 0 0 0 4.3 19c1 0 1.9-.5 2.4-1.3L8 16h8l1.3 1.7c.5.8 1.4 1.3 2.4 1.3a2.5 2.5 0 0 0 2.5-3l-.9-7.4A4 4 0 0 0 17.32 5Z"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'arrow-up': '<path d="M12 19V5M5 12l7-7 7 7"/>',
    'arrow-down': '<path d="M12 5v14M19 12l-7 7-7-7"/>',
    'arrow-left': '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    'arrow-right': '<path d="M5 12h14M12 5l7 7-7 7"/>',
    'hourglass': '<path d="M5 22h14M5 2h14M17 22v-4.2a2 2 0 0 0-.6-1.4L12 12l-4.4 4.4a2 2 0 0 0-.6 1.4V22M7 2v4.2a2 2 0 0 0 .6 1.4L12 12l4.4-4.4a2 2 0 0 0 .6-1.4V2"/>',
    'cursor': '<path d="M4 3 11 20l2.5-7.5L21 10Z"/>',
    'pointer': '<path d="M10 11V4.5a1.5 1.5 0 0 1 3 0V11"/><path d="M13 10.5V9a1.5 1.5 0 0 1 3 0v2"/><path d="M16 10.5a1.5 1.5 0 0 1 3 0V15a7 7 0 0 1-7 7h-1.2a6 6 0 0 1-4.6-2.2L3.6 16.4a1.6 1.6 0 0 1 2.3-2.2L8 16V8a1.5 1.5 0 0 1 3 0v3"/>',
    'cycle': '<path d="M3 12a9 9 0 0 1 15.4-6.4L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.4 6.4L3 16"/><path d="M3 21v-5h5"/>',
    'image': '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    'palette': '<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.12a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6.01 17.46 2 12 2Z"/>',
    'lock': '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'unlock': '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    'search': '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    'target': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    'flag': '<path d="M5 22V3"/><path d="M5 4h12l-3 4.5L17 13H5"/>',
    'newspaper': '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8Z"/>',

    // --- Production / Bâtiments ---
    'graduation': '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/><path d="M22 10v6"/>',
    'penguin': '<path d="M12 2.5c-2.8 0-4.4 2.3-4.4 5.2 0 1.5-.6 2.6-1.6 4.1-1.2 1.8-1.6 3.8-.6 5.7.9 1.9 3.1 3 6.6 3s5.7-1.1 6.6-3c1-1.9.6-3.9-.6-5.7-1-1.5-1.6-2.6-1.6-4.1 0-2.9-1.6-5.2-4.4-5.2Z"/><path d="M12 10.2c-1.6 0-2.6 1.3-2.6 3.3s1 4.3 2.6 4.3 2.6-2.3 2.6-4.3-1-3.3-2.6-3.3Z"/><path d="M10.4 6.6h.01M13.6 6.6h.01"/><path d="m11 8.3 1 .9 1-.9"/><path d="M8.5 21.5h2.2M13.3 21.5h2.2"/>',
    'wrench': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    'server': '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01M11 6.5h6M11 17.5h6"/>',
    'landmark': '<path d="M3 22h18M4 18h16"/><path d="M6 18v-7M10 18v-7M14 18v-7M18 18v-7"/><path d="M12 2.5 20.5 8h-17Z"/>',
    'recycle': '<path d="M7 19H4.8a1.8 1.8 0 0 1-1.6-2.7L7.4 9"/><path d="M11 19h8.2a1.8 1.8 0 0 0 1.6-2.7l-1.3-2.2"/><path d="m14 16-3 3 3 3"/><path d="M8.3 13.6 7.4 9 2.8 10.2"/><path d="m9.3 5.4 1.2-2a1.8 1.8 0 0 1 3.1 0l4.1 7"/><path d="m13.4 9.6 4.6 1.3 1.3-4.6"/>',
    'sprout': '<path d="M7 20h10"/><path d="M12 20v-8"/><path d="M12 12C12 8 9 6 4 6c0 4 3 6 8 6Z"/><path d="M12 10c0-3.5 2.5-6 8-6 0 4-3 6-8 6Z"/>',
    'leaf': '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.2-6"/>',
    'school': '<path d="M14 22v-4a2 2 0 1 0-4 0v4"/><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/><path d="M18 5v17M6 5v17"/><path d="m4 6 8-4 8 4"/><circle cx="12" cy="9" r="2"/>',
    'tower': '<path d="M8.5 22 12 10l3.5 12M9.6 18h4.8"/><circle cx="12" cy="8" r="2"/><path d="M7.8 4.8a6 6 0 0 0 0 6.4M16.2 4.8a6 6 0 0 1 0 6.4M4.9 2.9a10 10 0 0 0 0 10.2M19.1 2.9a10 10 0 0 1 0 10.2"/>',
    'building': '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
    'trophy': '<path d="M8 21h8M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0Z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    'stars': '', // généré plus bas (cercle d'étoiles)
    'globe': '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10Z"/>',
    'network': '<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M5 16v-3h14v3M12 8v5"/>',
    'satellite': '<path d="M13 7 9 3 5 7l4 4"/><path d="m17 11 4 4-4 4-4-4"/><path d="m8 12 4 4 6-6-4-4Z"/><path d="m16 8 3-3"/><path d="M9 21a6 6 0 0 0-6-6"/>',
    'ufo': '<ellipse cx="12" cy="13" rx="10" ry="3.5"/><path d="M7 11.2a5 5 0 0 1 10 0"/><path d="m8 18.5-1 2.5M16 18.5l1 2.5M12 17v3.5"/>',
    'moon': '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',
    'planet': '<circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="2"/><circle cx="15" cy="15" r="2.2"/><circle cx="15" cy="7.8" r=".9"/>',
    'clock': '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2"/><path d="M5 3 2 6M22 6l-3-3"/>',
    'spiral': '<path d="M10.5 12a1.5 1.5 0 0 1 3 0 3 3 0 0 1-6 0 4.5 4.5 0 0 1 9 0 6 6 0 0 1-12 0 7.5 7.5 0 0 1 15 0"/>',
    'sparkles': '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z"/><path d="M19 3v4M17 5h4M5 17v4M3 19h4"/>',
    'ringed': '<circle cx="12" cy="12" r="5.5"/><path d="M6.6 13.6C3.5 15.6 1.9 17.6 2.6 18.6c1 1.6 6.6-.4 12.3-4.4s9.3-8.6 8.4-10.1c-.6-1-2.8-.6-5.7.9"/>',
    'wand': '<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4M19 14v4M10 2v2M7 8H3M21 16h-4M11 3H9"/>',
    'burst': '<path d="m12 2 2 5.5 5-3-2.5 5.5L22 12l-5.5 2 3 5-5.5-2.5L12 22l-2-5.5-5 3 2.5-5.5L2 12l5.5-2-3-5 5.5 2.5Z"/>',
    'orbit': '<circle cx="12" cy="12" r="3"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><path d="M10.4 21.9a10 10 0 0 0 9.94-15.2M13.6 2.1a10 10 0 0 0-9.94 15.2"/>',
    'halo': '<ellipse cx="12" cy="3.8" rx="5" ry="1.8"/><circle cx="12" cy="11" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/>',
    'key': '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
    'terminal': '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m6 9 3 3-3 3M12 15h6"/>',
    'cpu': '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
    'houses': '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    'castle': '<path d="M3 21h18"/><path d="M5 21V6h2.5v2.5H10V6h4v2.5h2.5V6H19v15"/><path d="M10 21v-4a2 2 0 1 1 4 0v4"/>',
    'city': '<path d="M3 21h18"/><path d="M5 21V8l5-3v16"/><path d="M10 21V11h9v10"/><path d="M13 14h.01M16 14h.01M13 17h.01M16 17h.01M7 11h.01M7 14h.01M7 17h.01"/>',
    'rainbow': '<path d="M22 17a10 10 0 0 0-20 0"/><path d="M18 17a6 6 0 0 0-12 0"/><path d="M14 17a2 2 0 0 0-4 0"/>',
    'laptop': '<path d="M20 16V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10m16 0H4m16 0 1.28 2.55A1 1 0 0 1 20.38 20H3.62a1 1 0 0 1-.9-1.45L4 16"/>',
    'monitor': '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    'cloud': '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    'blackhole': '<circle cx="12" cy="12" r="2.5"/><path d="M12 5.5a6.5 6.5 0 0 1 6.5 6.5M12 18.5A6.5 6.5 0 0 1 5.5 12"/><path d="M12 2a10 10 0 0 1 10 10M12 22A10 10 0 0 1 2 12"/>',
    'grid': '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
    'code': '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
    'trending': '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',

    // --- Clic ---
    'mouse': '<rect x="6" y="3" width="12" height="18" rx="6"/><path d="M12 7v4"/>',
    'keyboard': '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M18 13h.01M10 13h4M7 16h10"/>',
    'trackball': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M10.5 10.5h.01"/>',
    'script': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="m10 13-2 2 2 2M14 13l2 2-2 2"/>',
    'repeat': '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
    'bot': '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 8V4M9 4h6"/><path d="M9 13v2M15 13v2"/><path d="M1 14h2M21 14h2"/>',
    'brain': '<path d="M12 6a3 3 0 0 0-5.5-1.6A3 3 0 0 0 4.2 9 3.2 3.2 0 0 0 4 14.6 3 3 0 0 0 8 19.4 3 3 0 0 0 12 19Z"/><path d="M12 6a3 3 0 0 1 5.5-1.6A3 3 0 0 1 19.8 9a3.2 3.2 0 0 1 .2 5.6 3 3 0 0 1-4 4.8A3 3 0 0 1 12 19"/><path d="M12 6v13"/><path d="M8.5 9.5a2.5 2.5 0 0 1 2 1.5M15.5 9.5a2.5 2.5 0 0 0-2 1.5M8 15a2.5 2.5 0 0 0 2.5-1M16 15a2.5 2.5 0 0 1-2.5-1"/>',
    'web': '<circle cx="5" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="m6.6 7.3 3.8 3.4M6.6 16.7l3.8-3.4M13.6 10.7l3.8-3.4M13.6 13.3l3.8 3.4"/>',
    'atom': '<circle cx="12" cy="12" r="1.2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>',
    'layers': '<path d="m12 2 10 5-10 5L2 7Z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/>',
    'coin': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><path d="M12 9.5v5"/>',
    'comet': '<path d="m15.5 2.5 1.4 2.9 3.2.5-2.3 2.2.5 3.2-2.8-1.5-2.8 1.5.5-3.2-2.3-2.2 3.2-.5Z"/><path d="m3 21 7-7M3 15.5l4-4M8.5 21l4-4"/>',
    'skull': '<path d="M12 2a8 8 0 0 0-8 8c0 3 1.5 5 3 6v3a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3c1.5-1 3-3 3-6a8 8 0 0 0-8-8Z"/><circle cx="9" cy="11" r="1.6"/><circle cx="15" cy="11" r="1.6"/><path d="M10 20v-2.5M14 20v-2.5"/>',

    // --- Prestige / Succès ---
    'zap': '<path d="M13 2 4 14h7l-1 8 9-12h-7Z"/>',
    'rocket': '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    'coins': '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>',
    'shield': '<path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z"/>',
    'shield-check': '<path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    'swords': '<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6M16 16l4 4M19 21l2-2"/><path d="M14.5 6.5 18 3h3v3l-3.5 3.5"/><path d="m5 14 4 4M7 17l-3 3M3 19l2 2"/>',
    'flame': '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    'dice': '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01"/>',
    'infinity': '<path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"/>',
    'star': '<path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9Z"/>',
    'gem': '<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>',
    'crown': '<path d="m2 7 4.5 5L12 5l5.5 7L22 7l-2 12H4Z"/>',
    'gift': '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',

    // --- Boss / Événements ---
    'window': '<rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M3 12h18M12 3v18"/>',
    'thumbs-up': '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
    'package': '<path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="m3 8 9 5 9-5M12 13v8"/><path d="m7.5 5.5 9 5"/>',
    'apple': '<path d="M12 7.5c-1.2 0-2.3-.8-3.6-.8C6 6.7 4 8.8 4 12.2 4 16.6 6.8 21 9 21c1.2 0 1.8-.7 3-.7s1.8.7 3 .7c2.2 0 5-4.4 5-8.8 0-3.4-2-5.5-4.4-5.5-1.3 0-2.4.8-3.6.8Z"/><path d="M12 7.5c0-2.5 1.3-4.5 3.5-5"/>',
    'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    'music': '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    'invader': '<path d="M5 8h2V6h2v2h6V6h2v2h2v3h2v5h-2v-2h-2v3h-2v2h-2v-2h-2v2H9v-2H7v-3H5v2H3v-5h2Z"/><path d="M9 11h.01M15 11h.01"/>',
    'eye-slit': '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><path d="M12 8c1.1 1.2 1.1 6.8 0 8-1.1-1.2-1.1-6.8 0-8Z"/>',
    'eye-triangle': '<path d="M12 3 22.5 20.5h-21Z"/><path d="M7.5 14.5s1.8-2.5 4.5-2.5 4.5 2.5 4.5 2.5-1.8 2.5-4.5 2.5-4.5-2.5-4.5-2.5Z"/><path d="M12 14.5h.01"/>',
    'eye': '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    'wifi-off': '<path d="m2 2 20 20"/><path d="M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5.2-2.8M19 13a10 10 0 0 0-2.4-1.6M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8A15 15 0 0 0 10.7 5M12 20h.01"/>',
    'bug': '<rect x="8" y="6" width="8" height="14" rx="4"/><path d="m19 7-3 2M5 7l3 2M19 19l-3-2M5 19l3-2M20 13h-4M4 13h4M10 4l1 2M14 4l-1 2"/>',
    'briefcase': '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    'megaphone': '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>'
};

// Cercle de 12 étoiles (Europe) généré programmatiquement
ICON_PATHS.stars = (() => {
    let s = '';
    for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const x = (12 + Math.cos(a) * 8).toFixed(2);
        const y = (12 + Math.sin(a) * 8).toFixed(2);
        s += `<circle cx="${x}" cy="${y}" r="1.3" fill="currentColor" stroke="none"/>`;
    }
    return s;
})();

/**
 * Retourne le markup SVG d'une icône.
 * @param {string} name - Nom de l'icône (clé de ICON_PATHS)
 * @param {string} [extraClass=''] - Classes CSS supplémentaires
 * @returns {string} Markup <svg>
 */
function icon(name, extraClass = '') {
    const paths = ICON_PATHS[name] || ICON_PATHS['help'];
    return `<svg class="ico ico-${name}${extraClass ? ' ' + extraClass : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;
}

/**
 * Indique si une icône existe
 * @param {string} name - Nom de l'icône
 * @returns {boolean} true si l'icône existe
 */
function hasIcon(name) {
    return Object.prototype.hasOwnProperty.call(ICON_PATHS, name);
}

window.ICON_PATHS = ICON_PATHS;
window.icon = icon;
window.hasIcon = hasIcon;
