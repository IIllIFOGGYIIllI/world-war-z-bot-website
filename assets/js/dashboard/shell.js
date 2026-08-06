const sidebar = document.querySelector('[data-sidebar]');
const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
const sidebarScrim = document.querySelector('[data-sidebar-scrim]');
const viewButtons = [...document.querySelectorAll('[data-view]')];
const viewPanels = [...document.querySelectorAll('[data-view-panel]')];
const loginDialog = document.querySelector('[data-login-dialog]');
const workspaceLabel = document.querySelector('[data-workspace-label]');
const commandPalette = document.querySelector('[data-command-palette]');
const commandPaletteInput = document.querySelector('[data-dashboard-search]');
const commandPaletteResults = document.querySelector('[data-dashboard-search-results]');
const commandPaletteOpeners = [...document.querySelectorAll('[data-open-command-search]')];
const commandPaletteClosers = [...document.querySelectorAll('[data-close-command-search]')];
let dashboardAccessLevel = 'guest';
let activeDashboardSection = '';

const closeSidebar = () => {
  sidebar?.classList.remove('open');
  sidebarScrim?.classList.remove('open');
  sidebarToggle?.setAttribute('aria-expanded', 'false');
};

sidebarToggle?.addEventListener('click', () => {
  const willOpen = !sidebar?.classList.contains('open');
  sidebar?.classList.toggle('open', willOpen);
  sidebarScrim?.classList.toggle('open', willOpen);
  sidebarToggle.setAttribute('aria-expanded', String(willOpen));
});

sidebarScrim?.addEventListener('click', closeSidebar);

const availableViews = new Set(viewPanels.map((panel) => panel.dataset.viewPanel));

const canOpenView = (view) => {
  if (['staff', 'delivery'].includes(view)) return ['staff', 'owner'].includes(dashboardAccessLevel);
  if (['configuration', 'serverconfig', 'shopadmin'].includes(view)) return dashboardAccessLevel === 'owner';
  return true;
};

const parseNavigationKey = (value, explicitSection = '') => {
  const raw = String(value || '').replace(/^#/, '').trim();
  const [rawView = '', rawSection = ''] = raw.split('/', 2);
  return {
    view: rawView || 'overview',
    section: String(explicitSection || rawSection || '').trim()
  };
};

const defaultSectionForView = (view) =>
  viewButtons.find((button) => button.dataset.view === view && button.dataset.section)?.dataset.section || '';

const sectionTargetFor = (view, section) => {
  const panel = viewPanels.find((item) => item.dataset.viewPanel === view);
  if (!panel || !section) return null;
  return [...panel.querySelectorAll('[data-dashboard-section]')]
    .find((item) => item.dataset.dashboardSection === section) || null;
};

const navigationKey = (view, section = '') => section ? `${view}/${section}` : view;

const showView = (viewOrKey, updateHistory = true, explicitSection = '') => {
  const requested = parseNavigationKey(viewOrKey, explicitSection);
  const requestedView = availableViews.has(requested.view) ? requested.view : 'overview';
  const selectedView = canOpenView(requestedView) ? requestedView : 'overview';
  const requestedTarget = sectionTargetFor(selectedView, requested.section);
  const selectedSection = requestedTarget ? requested.section : defaultSectionForView(selectedView);
  const selectedTarget = sectionTargetFor(selectedView, selectedSection);

  viewPanels.forEach((panel) => {
    const active = panel.dataset.viewPanel === selectedView;
    panel.hidden = !active;
    panel.classList.toggle('active', active);
  });

  let activeButton = null;
  viewButtons.forEach((button) => {
    const active = button.dataset.view === selectedView && button.dataset.section === selectedSection;
    button.classList.toggle('active', active);
    if (active) {
      button.setAttribute('aria-current', 'page');
      activeButton = button;
    } else {
      button.removeAttribute('aria-current');
    }
  });

  activeDashboardSection = selectedSection;
  const activePanel = viewPanels.find((panel) => panel.dataset.viewPanel === selectedView);
  const breadcrumb = activePanel?.querySelector('.breadcrumb');
  const navLabel = activeButton?.dataset.navLabel || selectedView.replace(/[-_]/g, ' ');
  if (breadcrumb && navLabel) breadcrumb.textContent = `Dashboard / ${navLabel}`;
  if (workspaceLabel) workspaceLabel.textContent = navLabel;
  const activeGroup = activeButton?.closest('[data-nav-group]');
  if (activeGroup && 'open' in activeGroup) activeGroup.open = true;

  const key = navigationKey(selectedView, selectedSection);
  if (updateHistory) history.pushState({ view: selectedView, section: selectedSection }, '', `#${key}`);

  window.requestAnimationFrame(() => {
    const targetVisible = selectedTarget && selectedTarget.getClientRects().length > 0;
    const scrollTarget = targetVisible ? selectedTarget : activePanel?.querySelector('.view-heading') || activePanel;
    scrollTarget?.scrollIntoView({ block: 'start', behavior: updateHistory ? 'smooth' : 'auto' });
  });

  closeSidebar();
  window.dispatchEvent(new CustomEvent('wwz:viewchange', { detail: { view: selectedView, section: selectedSection } }));
};

viewButtons.forEach((button) => button.addEventListener('click', () => showView(button.dataset.view, true, button.dataset.section)));
document.querySelectorAll('[data-jump]').forEach((button) => button.addEventListener('click', () => showView(button.dataset.jump, true, button.dataset.jumpSection || '')));

let commandPaletteIndex = 0;
let commandPaletteMatches = [];

const isDashboardDestinationVisible = (button) => {
  if (!button || button.hidden || button.closest('[hidden]')) return false;
  if (button.dataset.staffOnly !== undefined && !['staff', 'owner'].includes(dashboardAccessLevel)) return false;
  if (button.dataset.ownerOnly !== undefined && dashboardAccessLevel !== 'owner') return false;
  return true;
};

const dashboardDestinationText = (button) => [
  button.dataset.navLabel,
  button.querySelector('strong')?.textContent,
  button.querySelector('small')?.textContent,
  button.closest('[data-nav-group]')?.querySelector('summary strong')?.textContent,
  button.dataset.view,
  button.dataset.section
].filter(Boolean).join(' ').toLowerCase();

const renderCommandPalette = (query = '') => {
  if (!commandPaletteResults) return;
  const needle = String(query || '').trim().toLowerCase();
  commandPaletteMatches = viewButtons
    .filter(isDashboardDestinationVisible)
    .filter((button) => !needle || dashboardDestinationText(button).includes(needle))
    .slice(0, 24);
  commandPaletteIndex = Math.min(commandPaletteIndex, Math.max(0, commandPaletteMatches.length - 1));
  commandPaletteResults.replaceChildren();
  if (!commandPaletteMatches.length) {
    const empty = document.createElement('p');
    empty.className = 'command-search-empty';
    empty.textContent = 'No matching dashboard tools were found.';
    commandPaletteResults.append(empty);
    return;
  }
  commandPaletteMatches.forEach((button, index) => {
    const result = document.createElement('button');
    result.type = 'button';
    result.className = 'command-search-result';
    result.classList.toggle('selected', index === commandPaletteIndex);
    const group = button.closest('[data-nav-group]')?.querySelector('summary strong')?.textContent || 'Dashboard';
    const label = button.dataset.navLabel || button.querySelector('strong')?.textContent || 'Dashboard tool';
    const description = button.querySelector('small')?.textContent || `${button.dataset.view || 'dashboard'} workspace`;
    const groupLabel = document.createElement('span');
    groupLabel.textContent = group;
    const copy = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = label;
    const small = document.createElement('small');
    small.textContent = description;
    copy.append(strong, small);
    const key = document.createElement('kbd');
    key.textContent = index === commandPaletteIndex ? 'Enter' : '↵';
    result.append(groupLabel, copy, key);
    result.addEventListener('mouseenter', () => {
      commandPaletteIndex = index;
      renderCommandPalette(commandPaletteInput?.value || '');
    });
    result.addEventListener('click', () => {
      commandPalette?.close?.();
      showView(button.dataset.view, true, button.dataset.section || '');
    });
    commandPaletteResults.append(result);
  });
};

const openCommandPalette = () => {
  if (!commandPalette) return;
  commandPaletteIndex = 0;
  if (commandPaletteInput) commandPaletteInput.value = '';
  renderCommandPalette('');
  commandPalette.showModal?.();
  window.requestAnimationFrame(() => commandPaletteInput?.focus());
};

commandPaletteOpeners.forEach((button) => button.addEventListener('click', openCommandPalette));
commandPaletteClosers.forEach((button) => button.addEventListener('click', () => commandPalette?.close?.()));
commandPalette?.addEventListener('click', (event) => {
  if (event.target === commandPalette) commandPalette.close?.();
});
commandPaletteInput?.addEventListener('input', () => {
  commandPaletteIndex = 0;
  renderCommandPalette(commandPaletteInput.value);
});
commandPaletteInput?.addEventListener('keydown', (event) => {
  if (!commandPaletteMatches.length) return;
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    commandPaletteIndex = (commandPaletteIndex + direction + commandPaletteMatches.length) % commandPaletteMatches.length;
    renderCommandPalette(commandPaletteInput.value);
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const button = commandPaletteMatches[commandPaletteIndex];
    commandPalette.close?.();
    showView(button.dataset.view, true, button.dataset.section || '');
  }
});

window.addEventListener('popstate', () => showView(location.hash.slice(1), false));

document.querySelectorAll('[data-open-login]').forEach((button) => {
  button.addEventListener('click', () => {
    handleAuthAction();
  });
});

loginDialog?.addEventListener('click', (event) => {
  if (event.target === loginDialog) loginDialog.close?.();
});

document.addEventListener('keydown', (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target?.isContentEditable;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openCommandPalette();
    return;
  }
  if (event.key === 'Escape') closeSidebar();
  if (!isTyping && event.key === '/' && !commandPalette?.open) {
    event.preventDefault();
    openCommandPalette();
  }
});

document.querySelectorAll('[data-year]').forEach((item) => {
  item.textContent = new Date().getFullYear();
});

