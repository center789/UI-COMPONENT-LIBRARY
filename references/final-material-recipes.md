# 已确认的材质与状态配方

本文件描述用户确认的当前样式。实现新组件时先选下面的结构，再按产品尺寸适配。`assets/index.html` 是当前基准；`assets/gallery.html` 是早期探索，不能直接用其中的旧阴影和状态替换当前样式。

## 配方选择

按功能确定凹凸，不按组件颜色、大小或主次随意分配。页面是底板，卡片是浅凸外壳，动作按钮是凸起按压面，输入与轨道是凹槽。显示窗口承托信息，因此表格、图表、属性窗和仪表中心读数凹下；统计卡片的数字可以直接印在浅凸卡片上，不给每一个数字额外套框。

选择组固定为“承托槽不动、选中项升起”。未选中保留原来的低位凹面或透明面；选中使用圆帽材质。普通动作按钮的主次通过字重、强调与位置区分，两者都为凸面。复选/单选的标记槽保持凹面，用勾或灯表达状态；浮层菜单内容保持平面，用文字与标记表达选择。

| 部位 | 结构与状态 |
| --- | --- |
| 普通凸起按钮、主按钮、胶囊 | 外倒角 → 独立帽面；沿用开关圆帽的材质，按下缩短投影 |
| 选择按钮、页签、分段、分页 | 未选中保持既有凹面或透明面，选中采用圆帽凸面；分页另加主题色数字与短标记 |
| 圆形图标按钮 | 外圈 → 暗环槽 → 金属帽 → 图标面，颜色来自当前主题 |
| 开关、滑杆、范围、均衡器 | 共用 24px 外帽、80% 内帽面；网页用同一 DOM/CSS，原生输入负责命中与键盘 |
| 输入、上传、数据窗口 | 渐变槽缘 → 独立深凹核心 → 内容；输入自身不再绘制矩形焦点框 |
| 进度条 | 开关式外框 → 深凹内轨 → 槽内状态色 → 槽缘阴影覆盖层 |
| 环形仪表 | 套圈 → 暗环槽 → 有效弧 → 内凹读数窗 |
| 底部导航 | 轻巧实体底座，图标和标签正常排布，选中项使用独立凸面；不把全部入口做成大金属按键 |
| 下拉、工具、轻浮层 | 半透明背景、2px blur、上暗下亮内边；包括手机分类菜单 |
| 原始机械与音量旋钮 | 保留原几何、黑腔、多层投影、反光和固定外壳，见 material-depth.md |

## 主题来源

配色取自 `studio.css`、`recessed-controls.css` 和 `component-materials.css` 的同一组变量。使用冷灰蓝、银雾、石墨、机械银或牛油果绿中的一套，不为小按钮另开固定银灰配色。

- 底板与文字：`--bg`、`--ink`、`--muted`。
- 槽缘：`--recess-rim-dark`、`--recess-rim-light`。
- 凹槽：`--recess-core-shadow`、`--recess-top`、`--recess-bottom`。
- 金属帽：`--button-metal-top`、`--button-metal-bottom`。
- 选择与进度：`--accent`。开关和连接灯用 `--state-on-lamp` / `--state-off-lamp`，始终配状态文字。

## 开关圆帽作为凸面基准

外帽的渐变由底部向顶部变亮；独立内帽面采用反向、较窄的材质色变化，表达倒角和帽面之间的截面。小帽的实际配方：

```css
.cap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(0deg,
    var(--button-metal-bottom), var(--button-metal-top));
  box-shadow:
    0 2px 2px #00000080,
    0 4px 3px #0000003d,
    0 -2px 2px #ffffff80,
    inset 0 1px 1px #ffffffaa,
    inset 0 -1px 1px color-mix(in srgb, var(--shade) 75%, transparent);
}
.cap-face {
  width: 80%;
  height: 80%;
  border-radius: inherit;
  background: linear-gradient(180deg,
    color-mix(in srgb, var(--button-metal-bottom) 70%, var(--button-metal-top)),
    color-mix(in srgb, var(--button-metal-top) 70%, var(--button-metal-bottom)));
  box-shadow:
    inset 0 1px 1px color-mix(in srgb, var(--shade) 40%, transparent),
    inset 0 -1px 1px var(--recess-bottom);
}
```

方形和胶囊按钮改用相应圆角，外倒角约 3–4px，内面填充剩余空间；阴影按实际高度适配。不要把圆帽的 80% 宽度照搬到长按钮，否则会形成过厚的左右空边。文字与 SVG 在内面实际居中。

## 凹槽与进度色的合成次序

开关的小轨道使用独立渐变外框及如下核心阴影：

```css
background: var(--bg);
box-shadow:
  inset 0 0 6px var(--recess-core-shadow),
  inset 0 3px 3px var(--recess-top),
  inset 0 -3px 2px var(--recess-bottom);
```

Gemini 的大输入和上传槽保留 4px 框、12px 深影与 7px 底部反光，见 gemini-recess-and-menu.md。进度色作为轨道中的嵌入色层，保留上下空隙和两端槽缘；上层槽缘阴影压住颜色，颜色不替代倒角，也没有凸帽的远投影。0% 时颜色和辉光消失，100% 仍保留槽缘。

范围控件恰好相反：原生输入的轨道在下，圆帽在上，透明命中层和视觉帽分开；视觉帽设置 `pointer-events:none`。当前 CSS 中原生 input 的 z-index 为 2，圆帽为 3。不能让轨道横穿帽面。横向和纵向端点按原生 24px thumb 的可移动长度计算，不直接将帽中心设置为 0–100% 的容器宽度。

## 实现入口

网页按以下顺序加载，避免早期基础配方覆盖最终材质：

1. `studio.css`：布局、五套配色、字号与状态灯。
2. `materials.css`：原始旋钮的高保真结构与阴影。
3. `recessed-controls.css`：Gemini 输入槽和透明浮层。
4. `component-materials.css`：当前各组件与状态的最终材质。

`icons.js` 提供 SVG；`recessed-controls.js` 为按钮面、选择面、圆帽、仪表和进度条建立独立结构；`component-catalog.js` 保存组件示例；`studio.js` 提供本地交互。新产品可以复用其中的配方与组件结构，不复制展示页的业务文案或目录。

动态替换文字后保留内层结构，必要时使用 `frameButton` / `frameIconButton`。原 select 的 options 变化后调用 `refreshDropdown`，让视觉列表与原生表单值同步。小屏工具栏按可用空间换行或分组，不通过压缩标签、裁切和隐藏溢出来掩盖重叠。

## LVGL 对应

默认 LVGL 9.x、800×480。上述凹槽、帽面和槽内色分别映射为对象层或资源层，交互和数值仍由原生控件负责。多重内阴影和 blur 不属于通用的低成本原生效果；精细档使用预渲染层或状态资源，并在目标硬件核验。`tactile_theme.c` 是原生起点，浏览器预览不是 LVGL 运行时；详见 lvgl-design.md。
