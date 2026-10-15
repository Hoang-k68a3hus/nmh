import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/motion.css';
import './styles/scroll-experience.css';
import './styles/garden-botanicals.css';
import './styles/story-botanicals.css';
import './styles/letter-stationery.css';
import { content as contentConfig } from './config/content.js';
import { prepareContent } from './utils/content-validation.js';
import { setText } from './utils/dom.js';
import { mountEnvelope } from './components/envelope.js';
import { mountGarden } from './components/garden.js';
import { mountWishes } from './components/wishes.js';
import { mountLetter } from './components/letter.js';
import { mountFinale } from './components/finale.js';
import { applyTheme } from './utils/theme.js';
import { threadMarkup } from './graphics/svg/illustrations.js';
import { mountGardenGraphics } from './graphics/three/scene-manager.js';
import { createPageState } from './services/page-state.js';
import { mountScrollScenes } from './motion/scroll-scenes.js';
import { mountStoryBotanicals } from './components/story-botanicals.js';

const cleanup = [];

function dispose() {
  cleanup.splice(0).reverse().forEach((fn) => fn());
}

function init() {
  const content = prepareContent(contentConfig);
  cleanup.push(applyTheme(content.theme));
  const pageState = createPageState();
  cleanup.push(() => pageState.dispose());
  cleanup.push(pageState.subscribe(({ reduced, hidden, activeSection }) => {
    const root = document.documentElement;
    root.dataset.motion = reduced ? 'reduced' : 'full';
    root.dataset.pageHidden = String(hidden); root.dataset.activeSection = activeSection;
  }));
  const envelope = mountEnvelope(content);
  cleanup.push(() => envelope.dispose());
  cleanup.push(mountGarden(content));
  const wishExperience = mountWishes(content.wishes, content.wishSection, { flower: content.theme.flower });
  cleanup.push(() => wishExperience.dispose());
  const letterExperience = mountLetter(content, { pageState });
  cleanup.push(() => letterExperience.dispose());
  const finaleExperience = mountFinale(content);
  cleanup.push(() => finaleExperience.dispose());
  const graphics = mountGardenGraphics(content, { pageState });
  cleanup.push(() => graphics.dispose());
  document.getElementById('wishes-thread').innerHTML = threadMarkup();
  document.getElementById('letter-thread').innerHTML = threadMarkup({ reverse: true });
  cleanup.push(mountStoryBotanicals());
  cleanup.push(mountScrollScenes({ pageState, envelope, wishes: wishExperience, graphics }));
}

try {
  init();
} catch (error) {
  console.error('Không thể khởi tạo website:', error);
  const notice = document.createElement('p');
  notice.className = 'setup-error shell';
  notice.textContent = 'Một phần lời nhắn chưa tải được. Bạn có thể tải lại trang để thử lại.';
  document.getElementById('main-content').prepend(notice);
}

if (import.meta.hot) import.meta.hot.dispose(dispose);
