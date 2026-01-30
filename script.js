const root = document.documentElement;
const output = document.getElementById('output');
const input = document.getElementById('input');

const defaults = {
  date: '#b983ff',
  vocab: '#ff9f43',
  important: '#ffd166'
};

/* ---------- Color persistence ---------- */

function loadColors() {
  for (const key in defaults) {
    const value = localStorage.getItem(key) || defaults[key];
    root.style.setProperty(`--${key}-color`, value);
    document.getElementById(`${key}Color`).value = value;
  }
}

function bindColor(key) {
  document.getElementById(`${key}Color`).addEventListener('input', e => {
    root.style.setProperty(`--${key}-color`, e.target.value);
    localStorage.setItem(key, e.target.value);
  });
}

loadColors();
bindColor('date');
bindColor('vocab');
bindColor('important');

/* ---------- Security helpers ---------- */

// Escape ALL HTML
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Allow ONLY whitelisted pseudo-tags
function applyWhitelist(text) {
  return text
    .replace(/&lt;date&gt;(.*?)&lt;\/date&gt;/gi,
      '<span class="tag date">$1</span>')
    .replace(/&lt;vocab&gt;(.*?)&lt;\/vocab&gt;/gi,
      '<span class="tag vocab">$1</span>')
    .replace(/&lt;important&gt;(.*?)&lt;\/important&gt;/gi,
      '<span class="tag important">$1</span>');
}

/* ---------- Highlight pipeline ---------- */

function highlight(text) {
  let safe = escapeHTML(text);

  // Whitelisted intentional tags
  safe = applyWhitelist(safe);

  // Automatic highlights
  safe = safe
    .replace(/\b\d+(?:\.\d+)?\b/g,
      '<span class="tag important">$&</span>')
    .replace(/\b[a-zA-Z]{8,}\b/g,
      '<span class="tag vocab">$&</span>')
    .replace(/\b\d{4}\b/g,
      '<span class="tag date">$&</span>');

  return safe;
}

/* ---------- Summarizer ---------- */

document.getElementById('summarizeBtn').addEventListener('click', () => {
  if (!input.value.trim()) {
    output.textContent = 'Please paste some notes to summarize.';
    return;
  }

  const sentences =
    input.value.replace(/\n+/g, ' ')
      .match(/[^.!?]+[.!?]+/g) || [];

  const summary =
    sentences.length <= 2
      ? input.value
      : sentences.slice(0, Math.max(2, sentences.length * 0.3)).join(' ');

  output.innerHTML = highlight(summary);
});
