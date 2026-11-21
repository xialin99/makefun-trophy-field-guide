const messages = {
  "Trophy Field Guide": "奖杯指南",
  "TROPHY FIELD GUIDE": "奖杯指南",
  "Checklist": "清单",
  "Roadmap": "解锁路线",
  "Guide views": "指南视图",
  "Mask story spoilers": "隐藏剧情剧透",
  "Backup": "备份",
  "DEMO CHECKLIST": "示例清单",
  "Road to Platinum": "白金奖杯之路",
  "Track trophies, hide story spoilers and back up your progress.": "记录奖杯、隐藏剧透并备份进度。",
  "earned": "已获得",
  "Trophies earned": "已获得的奖杯",
  "Missable trophies": "可能错过的奖杯",
  "· Check which entries may become unavailable later.": "· 查看哪些奖杯之后可能无法获取。",
  "View warning →": "查看提醒 →",
  "Trophy checklist": "奖杯清单",
  "Search trophies…": "搜索奖杯…",
  "Search trophies": "搜索奖杯",
  "Trophy grade": "奖杯等级",
  "Trophy progress": "奖杯进度",
  "All grades": "全部等级",
  "All progress": "全部进度",
  "Unfinished only": "仅未获得",
  "Earned": "已获得",
  "Trophy categories": "奖杯类别",
  "Trophy list": "奖杯列表",
  "Selected trophy guide": "所选奖杯指南",
  "Platinum roadmap": "白金奖杯解锁路线",
  "Suggested order for the sample checklist.": "示例清单的推荐顺序。",
  "Progress backup": "进度备份",
  "Stored on this browser. Import adds earned trophies from a backup.": "进度保存在此浏览器中。导入时，将合并备份中已获得的奖杯。",
  "Export JSON": "导出 JSON",
  "Import JSON": "导入 JSON",
  "All": "全部",
  "Story": "剧情",
  "Missable": "可能错过",
  "Collectibles": "收集品",
  "Activities": "活动",
  "Side jobs": "支线",
  "Finish": "通关",
  "platinum": "白金",
  "gold": "金",
  "silver": "银",
  "bronze": "铜",
  "Confirmed missable": "确认可错过",
  "Potentially missable": "可能错过",
  "Hidden story trophy": "已隐藏的剧情奖杯",
  "Story details unlock when earned.": "获得后显示剧情奖杯详情。",
  "Earned: ": "已获得：",
  "Choose another filter to find a trophy.": "试试其他筛选条件。",
  "Mark this trophy earned or turn off spoiler masking to reveal its name, requirement and guide.": "标为已获得或关闭剧透隐藏，即可查看名称、要求和攻略。",
  "How to unlock": "解锁方法",
  "Automatic story progression.": "随剧情推进自动解锁。",
  "Roadmap selection": "已选择路线",
  "No trophies match these filters.": "没有符合筛选条件的奖杯。",
  "Open trophy →": "打开该奖杯 →",
  "Browser storage is unavailable. Export a backup to keep this session’s progress.": "浏览器存储不可用，请导出备份保存本次进度。",
  "Saved progress could not be read. You can import a backup below.": "无法读取已保存的进度，可以在下方导入备份。",
  "Backup exported.": "备份已导出。",
  "Invalid trophy backup. Your progress was kept.": "奖杯备份无效，现有进度已保留。",
  "Demo guide": "示例指南",
  "Start the expedition": "开始探险",
  "Begin the story and review the temporary exhibit before moving on.": "开始故事，继续前先查看临时展览。",
  "Finish the checklist": "完成清单",
  "Collect the expedition notes, then close out the checklist.": "收集探险笔记，然后完成清单。",
  "First Light": "第一缕光",
  "Start a new expedition.": "开启新的探险。",
  "Complete the first story objective to unlock the tracker entry.": "完成第一个剧情目标即可解锁。",
  "Museum Pass": "博物馆通行证",
  "Inspect the temporary exhibit.": "查看临时展览。",
  "Visit the east gallery before leaving the starting district.": "离开起始地区之前，访问东侧展厅。",
  "Field Notes": "野外笔记",
  "Collect three expedition notes.": "收集三份探险笔记。",
  "Search around the station, the gallery and the west trail.": "在车站、展厅和西侧小径附近搜寻。",
  "Expedition Complete": "探险结束",
  "Finish the checklist.": "完成清单。",
  "Complete all the other entries to earn this trophy.": "完成其他全部条目即可获得此奖杯。"
};
const localeStorageKey = "makefun-trophy-field-guide.language";
let currentLanguage = 'zh';
try { if (localStorage.getItem(localeStorageKey) === 'en') currentLanguage = 'en'; } catch {}
window.uiLanguage = currentLanguage;
window.t = text => window.uiLanguage === 'zh' && Object.hasOwn(messages, text) ? messages[text] : text;
const original = [];
const title = document.title;
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
for (let node; (node = walker.nextNode());) {
  if (node.parentElement.closest('script, style, #language')) continue;
  if (Object.hasOwn(messages, node.nodeValue.trim())) original.push([node, node.nodeValue]);
}
const attributes = [...document.querySelectorAll('[aria-label], [placeholder], [title]')].flatMap(el =>
  ['aria-label', 'placeholder', 'title'].filter(name => el.hasAttribute(name)).map(name => [el, name, el.getAttribute(name)]));
const language = document.getElementById('language');
function refresh() {
  document.documentElement.lang = window.uiLanguage === 'zh' ? 'zh-CN' : 'en';
  document.title = t(title);
  language.value = window.uiLanguage;
  for (const [node, text] of original) {
    node.nodeValue = text.replace(text.trim(), t(text.trim()));
  }
  for (const [el, name, value] of attributes) el.setAttribute(name, t(value));
}
language.addEventListener('change', () => {
  window.uiLanguage = language.value === 'en' ? 'en' : 'zh';
  try { localStorage.setItem(localeStorageKey, window.uiLanguage); } catch {}
  refresh();
  window.dispatchEvent(new Event('ui-language-change'));
});
refresh();
