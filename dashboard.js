const sidebar = document.querySelector('[data-sidebar]');
const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
const sidebarScrim = document.querySelector('[data-sidebar-scrim]');
const viewButtons = [...document.querySelectorAll('[data-view]')];
const viewPanels = [...document.querySelectorAll('[data-view-panel]')];
const loginDialog = document.querySelector('[data-login-dialog]');

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

const showView = (view, updateHistory = true) => {
  const selectedView = availableViews.has(view) ? view : 'overview';

  viewPanels.forEach((panel) => {
    const active = panel.dataset.viewPanel === selectedView;
    panel.hidden = !active;
    panel.classList.toggle('active', active);
  });

  viewButtons.forEach((button) => {
    const active = button.dataset.view === selectedView;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });

  if (updateHistory) history.pushState({ view: selectedView }, '', `#${selectedView}`);
  document.querySelector('#dashboard-content')?.scrollIntoView({ block: 'start' });
  closeSidebar();
};

viewButtons.forEach((button) => button.addEventListener('click', () => showView(button.dataset.view)));
document.querySelectorAll('[data-jump]').forEach((button) => button.addEventListener('click', () => showView(button.dataset.jump)));

window.addEventListener('popstate', () => showView(location.hash.slice(1), false));

document.querySelectorAll('[data-open-login]').forEach((button) => {
  button.addEventListener('click', () => {
    if (typeof loginDialog?.showModal === 'function') loginDialog.showModal();
    else loginDialog?.setAttribute('open', '');
  });
});

loginDialog?.addEventListener('click', (event) => {
  if (event.target === loginDialog) loginDialog.close();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeSidebar();
});

document.querySelectorAll('[data-year]').forEach((item) => {
  item.textContent = new Date().getFullYear();
});

const commands = [
  { name: 'bot', category: 'General', description: 'View bot information, status and help.', access: 'Everyone' },
  { name: 'server', category: 'Server', description: 'View current DayZ server information.', access: 'Everyone' },
  { name: 'account', category: 'Profiles', description: 'Manage your connected community account.', access: 'Member' },
  { name: 'profile', category: 'Profiles', description: 'View your linked community profile.', access: 'Member' },
  { name: 'link', category: 'Profiles', description: 'Link a Discord account with a PlayStation ID.', access: 'Member' },
  { name: 'unlink', category: 'Profiles', description: 'Remove a linked PlayStation ID safely.', access: 'Member' },
  { name: 'economy', category: 'Economy', description: 'Open the community economy command group.', access: 'Member' },
  { name: 'balance', category: 'Economy', description: 'View your current community balance.', access: 'Member' },
  { name: 'pay', category: 'Economy', description: 'Transfer community funds to another member.', access: 'Member' },
  { name: 'daily', category: 'Economy', description: 'Claim an available daily community reward.', access: 'Member' },
  { name: 'leaderboard', category: 'Economy', description: 'View the community economy leaderboard.', access: 'Everyone' },
  { name: 'slots', category: 'Games', description: 'Play the World War Z community slot machine.', access: 'Member' },
  { name: 'coinflip', category: 'Games', description: 'Make a simple heads-or-tails economy wager.', access: 'Member' },
  { name: 'bounty', category: 'Economy', description: 'View and manage community bounties.', access: 'Member' },
  { name: 'ticket', category: 'Support', description: 'Open a structured support request.', access: 'Member' },
  { name: 'player', category: 'Staff', description: 'Look up a connected community player.', access: 'Staff' },
  { name: 'warn', category: 'Staff', description: 'Record a formal player warning with a reason.', access: 'Staff' },
  { name: 'note', category: 'Staff', description: 'Add an internal administration note.', access: 'Staff' },
  { name: 'logs', category: 'Staff', description: 'View authorised administration records.', access: 'Staff' },
  { name: 'nitrado', category: 'Server', description: 'Access approved Nitrado server controls.', access: 'Owner' },
  { name: 'config', category: 'Configuration', description: 'Manage DayZ configuration operations.', access: 'Owner' },
  { name: 'loot', category: 'Configuration', description: 'Work with the server loot configuration.', access: 'Owner' },
  { name: 'eventconfig', category: 'Configuration', description: 'Review and manage event configuration.', access: 'Owner' },
  { name: 'eventpositions', category: 'Configuration', description: 'Manage configured event positions.', access: 'Owner' },
  { name: 'validation', category: 'Configuration', description: 'Validate configuration files before use.', access: 'Owner' }
];

const commandResults = document.querySelector('[data-command-results]');
const commandSearch = document.querySelector('[data-command-search]');
const commandFilters = document.querySelector('[data-command-filters]');
const commandCount = document.querySelector('[data-command-count]');
const commandEmpty = document.querySelector('[data-command-empty]');
const categories = ['All', ...new Set(commands.map((command) => command.category))];
let selectedCategory = 'All';

const renderFilters = () => {
  if (!commandFilters) return;
  commandFilters.replaceChildren();

  categories.forEach((category) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = category;
    button.classList.toggle('active', category === selectedCategory);
    button.setAttribute('aria-pressed', String(category === selectedCategory));
    button.addEventListener('click', () => {
      selectedCategory = category;
      renderFilters();
      renderCommands();
    });
    commandFilters.append(button);
  });
};

const renderCommands = () => {
  if (!commandResults) return;
  const searchValue = commandSearch?.value.trim().toLowerCase() ?? '';
  const visibleCommands = commands.filter((command) => {
    const matchesCategory = selectedCategory === 'All' || command.category === selectedCategory;
    const haystack = `${command.name} ${command.description} ${command.category} ${command.access}`.toLowerCase();
    return matchesCategory && haystack.includes(searchValue);
  });

  commandResults.replaceChildren();
  visibleCommands.forEach((command) => {
    const card = document.createElement('article');
    card.className = 'command-card';

    const heading = document.createElement('div');
    const code = document.createElement('code');
    const slash = document.createElement('span');
    slash.textContent = '/';
    code.append(slash, command.name);
    const category = document.createElement('small');
    category.textContent = command.category;
    heading.append(code, category);

    const description = document.createElement('p');
    description.textContent = command.description;
    const footer = document.createElement('footer');
    footer.textContent = `Access: ${command.access}`;
    card.append(heading, description, footer);
    commandResults.append(card);
  });

  if (commandCount) commandCount.textContent = visibleCommands.length;
  if (commandEmpty) commandEmpty.hidden = visibleCommands.length !== 0;
};

commandSearch?.addEventListener('input', renderCommands);
renderFilters();
renderCommands();
showView(location.hash.slice(1), false);
