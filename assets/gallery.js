'use strict';
const byId = id => document.getElementById(id);
byId('create-button').addEventListener('click', () => {
  byId('action-status').textContent = '创作入口已选择 · 示例反馈';
});
byId('save-button').addEventListener('click', event => {
  const button = event.currentTarget;
  const saved = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(saved));
  button.setAttribute('aria-label', saved ? '取消收藏样式' : '收藏样式');
  button.textContent = saved ? '★' : '☆';
  byId('action-status').textContent = saved ? '样式已收藏 · 当前页面内保存' : '已取消收藏';
});
byId('search-form').addEventListener('submit', event => {
  event.preventDefault();
  const query = byId('query').value.trim();
  byId('search-status').textContent = query ? `已提交：${query} · 搜索输入演示` : '请输入搜索内容';
});
document.querySelectorAll('.segments button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.segments button').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    byId('mode-status').textContent = `当前模式：${button.textContent} / 槽内凸面`;
  });
});
byId('quiet-switch').addEventListener('click', event => {
  const button = event.currentTarget;
  const enabled = button.getAttribute('aria-checked') !== 'true';
  button.setAttribute('aria-checked', String(enabled));
  byId('quiet-status').textContent = `专注模式 · ${enabled ? '已开启' : '已关闭'}`;
});
function paintRange(input) {
  input.style.setProperty('--value', `${(input.value - input.min) / (input.max - input.min) * 100}%`);
}
byId('brightness').addEventListener('input', event => {
  paintRange(event.target);
  byId('brightness-value').value = `${event.target.value}%`;
});
const knob = document.querySelector('.knob');
const leds = Array.from({ length: 19 }, (_, index) => {
  const led = document.createElement('i');
  led.className = 'knob-led';
  led.style.setProperty('--tick', `${-112.5 + index * 225 / 18}deg`);
  knob.appendChild(led);
  return led;
});
function updateVolume() {
  const value = Number(byId('volume').value);
  knob.style.setProperty('--angle', `${-112.5 + value * 2.25}deg`);
  byId('volume-value').value = `${value}%`;
  leds.forEach((led, index) => led.classList.toggle('on', index < Math.round(value / 100 * leds.length)));
  paintRange(byId('volume'));
}
byId('volume').addEventListener('input', updateVolume);
updateVolume();
paintRange(byId('brightness'));
byId('launch-button').addEventListener('click', event => {
  const button = event.currentTarget;
  const running = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(running));
  byId('launch-label').textContent = running ? '运行中' : '启动';
  byId('launch-status').textContent = running ? '运行状态演示 / 环形扫光' : '待机 / 深色内腔';
});
const directionOffsets = { 上: 'translateY(-3px)', 左: 'translateX(-3px)', 右: 'translateX(3px)', 下: 'translateY(3px)' };
document.querySelectorAll('.dpad button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.dpad button').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    document.querySelector('.dpad-cap').style.transform = directionOffsets[button.dataset.direction];
    byId('direction-status').textContent = `已选择：向${button.dataset.direction} / 机械反馈`;
  });
});
let temperature = 24;
function changeTemperature(delta) {
  temperature = Math.min(30, Math.max(16, temperature + delta));
  byId('temperature-value').innerHTML = `${temperature}<small> °C</small>`;
  byId('temperature-down').disabled = temperature === 16;
  byId('temperature-up').disabled = temperature === 30;
}
byId('temperature-down').addEventListener('click', () => changeTemperature(-1));
byId('temperature-up').addEventListener('click', () => changeTemperature(1));
byId('connect-button').addEventListener('click', () => {
  const led = document.querySelector('.status-led');
  const disconnected = led.classList.toggle('off');
  byId('connection-status').textContent = disconnected ? '设备未连接 · 演示' : '设备已连接 · 演示';
  byId('connect-button').textContent = disconnected ? '连接' : '断开';
});
let elapsed = 0;
let startedAt = 0;
let timer = null;
function showTime() {
  const seconds = Math.floor((elapsed + (timer === null ? 0 : performance.now() - startedAt)) / 1000);
  byId('player-time').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
function stopTimer() {
  if (timer !== null) {
    elapsed += performance.now() - startedAt;
    clearInterval(timer);
    timer = null;
  }
  byId('play-button').setAttribute('aria-pressed', 'false');
  byId('play-button').setAttribute('aria-label', '开始计时');
  byId('play-button').textContent = '▶';
  byId('player-status').textContent = '计时已暂停';
  showTime();
}
byId('play-button').addEventListener('click', () => {
  if (timer !== null) { stopTimer(); return; }
  startedAt = performance.now();
  timer = setInterval(showTime, 250);
  byId('play-button').setAttribute('aria-pressed', 'true');
  byId('play-button').setAttribute('aria-label', '暂停计时');
  byId('play-button').textContent = 'Ⅱ';
  byId('player-status').textContent = '正在计时 · 演示';
});
byId('reset-button').addEventListener('click', () => {
  stopTimer();
  elapsed = 0;
  showTime();
  byId('player-status').textContent = '计时演示';
});
window.addEventListener('pagehide', stopTimer);
