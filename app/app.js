const find = id => document.getElementById(id);
const trophies = catalog.trophies;
const byId = new Map(trophies.map(trophy => [trophy.id, trophy]));
const storageKey = 'trophy-field-guide-field-guide.v1';
const backupFormat = 'trophy-field-guide-field-guide';
const categories = ['All', 'Story', 'Missable', 'Collectibles', 'Activities', 'Side jobs', 'Finish'];
const gradeNames = ['platinum', 'gold', 'silver', 'bronze'];
const riskLabels = { confirmed: 'Confirmed missable', possible: 'Potentially missable' };
let earned = new Set();
let mask = true;
let category = 'All';
let selected = 1;
let stageIds = null;

function element(tag, name, content) {
  const node = document.createElement(tag);
  if (name) node.className = name;
  if (content !== undefined) node.textContent = t(content);
  return node;
}

function sourceLink(key) {
  const [label, url] = sources[key];
  const link = element('a', 'source', t(label) + ' ↗');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

function status(message) {
  find('status').textContent = t(message);
}

function validIds(ids) {
  return Array.isArray(ids) && ids.every(id => byId.has(id));
}

function save(message = '') {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ earned: [...earned], mask, completion: find('completion').value }));
    status(message);
  } catch {
    status('Browser storage is unavailable. Export a backup to keep this session’s progress.');
  }
}

function restore() {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey));
    if (validIds(data?.earned)) earned = new Set(data.earned);
    if (typeof data?.mask === 'boolean') mask = data.mask;
    if (['open', 'earned'].includes(data?.completion)) find('completion').value = data.completion;
  } catch {
    status('Saved progress could not be read. You can import a backup below.');
  }
}

function isMasked(trophy) {
  return mask && trophy.kind === 'Story' && !earned.has(trophy.id);
}

function label(trophy) {
  return isMasked(trophy) ? t('Hidden story trophy') : t(trophy.name);
}

function filterTrophies() {
  const query = find('search').value.trim().toLowerCase();
  const grade = find('grade').value;
  const completion = find('completion').value;
  return trophies.filter(trophy => {
    const matchesKind = category === 'All' || trophy.kind === category ||
      (category === 'Missable' && ['possible', 'confirmed'].includes(trophy.risk));
    const text = isMasked(trophy) ? label(trophy) : [trophy.name,t(trophy.name),trophy.description,t(trophy.description),trophy.guide,t(trophy.guide)].join(' ');
    return matchesKind && (!stageIds || stageIds.includes(trophy.id)) &&
      (!grade || trophy.grade === grade) && text.toLowerCase().includes(query) &&
      (!completion || earned.has(trophy.id) === (completion === 'earned'));
  }).sort((a, b) => stageIds ? stageIds.indexOf(a.id) - stageIds.indexOf(b.id) : a.id - b.id);
}

function updateProgress() {
  find('count').textContent = earned.size;
  find('total').textContent = trophies.length;
  find('progress').max = Math.max(1, trophies.length);
  find('progress').value = earned.size;
  find('grades').replaceChildren(...gradeNames.map(grade => {
    const rows = trophies.filter(trophy => trophy.grade === grade);
    return element('span', grade, rows.filter(trophy => earned.has(trophy.id)).length +
      '/' + rows.length + ' ' + t(grade));
  }));
}

function categoryButtons() {
  find('kinds').replaceChildren(...categories.map(kind => {
    const button = element('button', '', kind);
    button.setAttribute('aria-pressed', String(!stageIds && category === kind));
    button.addEventListener('click', () => {
      stageIds = null;
      category = kind;
      render();
      [...find('kinds').children].find(node => node.textContent === t(kind)).focus();
    });
    return button;
  }));
}

function trophyRow(trophy) {
  const row = element('article', 'row' + (trophy.id === selected ? ' selected' : ''));
  const button = element('button', 'row-guide');
  button.setAttribute('aria-pressed', String(trophy.id === selected));
  button.append(element('span', 'medal ' + trophy.grade, '◆'));
  const text = element('span', 'row-text');
  text.append(element('strong', '', label(trophy)),
    element('span', 'row-description', isMasked(trophy) ? 'Story details unlock when earned.' : trophy.description));
  button.append(text, element('span', 'grade-tag ' + trophy.grade, trophy.grade));
  button.addEventListener('click', () => {
    selected = trophy.id;
    render();
    find('row-' + trophy.id)?.querySelector('button').focus();
  });
  const checkbox = element('input');
  checkbox.type = 'checkbox';
  checkbox.checked = earned.has(trophy.id);
  checkbox.setAttribute('aria-label', t('Earned: ') + label(trophy) + ' #' + trophy.id);
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) earned.add(trophy.id);
    else earned.delete(trophy.id);
    save();
    render();
    (find('row-' + trophy.id)?.querySelector('input') ?? find('completion')).focus();
  });
  row.id = 'row-' + trophy.id;
  row.append(button, checkbox);
  return row;
}

function renderDetail(trophy) {
  const detail = find('detail');
  detail.replaceChildren();
  if (!trophy) {
    detail.append(element('p', '', 'Choose another filter to find a trophy.'));
    return;
  }
  detail.append(element('p', 'eyebrow', t(trophy.kind) + ' / ' + t(trophy.grade)),
    element('h2', '', label(trophy)));
  if (isMasked(trophy)) {
    detail.append(element('p', '', 'Mark this trophy earned or turn off spoiler masking to reveal its name, requirement and guide.'));
    return;
  }
  detail.append(element('p', 'requirement', trophy.description));
  if (riskLabels[trophy.risk]) detail.append(element('p', 'risk', riskLabels[trophy.risk]));
  detail.append(element('h3', '', 'How to unlock'), element('p', '', trophy.guide), sourceLink(trophy.source));
  if (trophy.kind === 'Story') detail.append(element('p', 'footnote', 'Automatic story progression.'));
}

function render() {
  updateProgress();
  categoryButtons();
  const rows = filterTrophies();
  if (!rows.some(trophy => trophy.id === selected)) selected = rows[0]?.id;
  find('results').textContent = (window.uiLanguage === 'zh' ? rows.length + ' / ' + trophies.length + ' 个奖杯' : rows.length + ' of ' + trophies.length + ' trophies') + (stageIds ? ' · ' + t('Roadmap selection') : '');
  find('rows').replaceChildren(...rows.map(trophyRow));
  if (!rows.length) find('rows').append(element('p', 'empty', 'No trophies match these filters.'));
  renderDetail(byId.get(selected));
}

function showView(view) {
  const roadmap = view === 'roadmap';
  find('tracker').hidden = roadmap;
  find('roadmap').hidden = !roadmap;
  find('tracker-tab').setAttribute('aria-pressed', String(!roadmap));
  find('roadmap-tab').setAttribute('aria-pressed', String(roadmap));
}

function openGroup(kind, ids, id) {
  category = kind;
  stageIds = ids;
  selected = id;
  showView('tracker');
  render();
  (find('row-' + selected)?.querySelector('button') ?? find('search')).focus();
}

function renderRoadmap() {
  find('stages').replaceChildren(...stages.map((stage, index) => {
    const card = element('article', 'stage');
    const body = element('div');
    body.append(element('h3', '', stage.title), element('p', '', stage.text));
    const links = element('div', 'stage-links');
    links.append(sourceLink(stage.source));
    if (stage.kind === 'Story') links.append(sourceLink('guide'));
    const button = element('button', '', stage.ids.length === 1 ? 'Open trophy →' : window.uiLanguage === 'zh' ? '打开 ' + stage.ids.length + ' 个奖杯 →' : 'Open ' + stage.ids.length + ' trophies →');
    button.addEventListener('click', () => openGroup('All', stage.ids, stage.ids[0]));
    links.append(button);
    body.append(links);
    card.append(element('span', 'stage-number', String(index + 1).padStart(2, '0')), body);
    return card;
  }));
}

function exportBackup() {
  const data = { format: backupFormat, version: 1, earned: [...earned].sort((a, b) => a - b) };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = element('a');
  link.href = url;
  link.download = 'trophy-field-guide-progress.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status('Backup exported.');
}

async function importBackup(event) {
  const file = event.target.files[0];
  event.target.value = '';
  if (!file) return;
  try {
    if (file.size > 16384) throw Error('Backup too large');
    const data = JSON.parse(await file.text());
    if (data?.format !== backupFormat || data.version !== 1 || !validIds(data.earned)) {
      throw Error('Invalid backup');
    }
    const before = earned.size;
    for (const id of data.earned) earned.add(id);
    save(window.uiLanguage === 'zh' ? '已导入备份，新增 ' + (earned.size - before) + ' 个已获得的奖杯。' : 'Backup imported. Added ' + (earned.size - before) + ' earned trophies.');
    render();
  } catch {
    status('Invalid trophy backup. Your progress was kept.');
  }
}

restore();
find('spoilers').checked = mask;
find('spoilers').addEventListener('change', event => {
  mask = event.target.checked;
  save();
  render();
});
find('watch').addEventListener('click', () => {
  for (const field of ['search', 'grade', 'completion']) find(field).value = '';
  save();
  openGroup('Missable', null, trophies.find(trophy => riskLabels[trophy.risk])?.id);
});
find('tracker-tab').addEventListener('click', () => showView('tracker'));
find('roadmap-tab').addEventListener('click', () => showView('roadmap'));
document.querySelector('.brand').addEventListener('click', () => showView('tracker'));
for (const id of ['search', 'grade']) find(id).addEventListener('input', render);
find('completion').addEventListener('input', () => {
  save();
  render();
});
find('export').addEventListener('click', exportBackup);
find('import').addEventListener('click', () => find('file').click());
find('file').addEventListener('change', importBackup);
addEventListener('ui-language-change',()=>{renderRoadmap();render();});
renderRoadmap();
showView('tracker');
render();
