# LVGL 9.x · 800×480 设计与样式

用户确认的目标是 LVGL 9.x、800×480。新的项目参数优先。浏览器中的设备控制、系统设置、音频面板是排版与交互设计预览；不是把 LVGL 编译到浏览器，也不声称与芯片绘制效果完全一致。

## 可复用资源

- `assets/lvgl/tactile_theme.h`：五套颜色、三档绘制复杂度及按钮、滑杆、开关、弧形、输入区和面板的样式入口。
- `assets/lvgl/tactile_theme.c`：持久共享 `lv_style_t`、对象 part/state 映射，以及 800×480 控制页面起点。
- C 示例使用默认字体和英文标签，避免假定用户工程已包含中文字形。中文界面应接入项目字体，再替换文案。
- `assets/lvgl/materials/mechanical-{idle,up,right,left,down}-200.png`：从原始源码渲染导出的五个无损 200×200 状态，圆角外透明，可用于保持原始光影的嵌入式资源方案。根据项目转换为 LVGL 支持的 C/二进制图像；直接读取 PNG 时应启用相应解码器和文件系统，不假定默认已配置。
- C 控制页包含滑杆读数、音量弧形和保持型启动键事件；底部导航在这个单页起点中是静态标签，不声称提供三页业务路由。

```c
/* After lv_init() and project-owned display/input setup: */
tactile_theme_init(TACTILE_AVOCADO, TACTILE_STANDARD);
lv_obj_t * control_page = tactile_demo_create(lv_screen_active());
/* The application owns control_page and may delete it with its parent. */
```

共享样式具有程序生命周期，只在创建控件前初始化一次；不要在 UI 对象仍引用样式时重置或销毁。应用的显示驱动、输入驱动、线程模型与屏幕管理由项目负责。

## 网页到 LVGL 的实际映射

| 网页语义 | LVGL 9.x 起点 | 实现注意 |
| --- | --- | --- |
| 主按钮、图标按钮、保持键 | `lv_button` | `LV_PART_MAIN`；按下、选中、禁用与键盘焦点分开 |
| 分段与数字键盘 | `lv_buttonmatrix` / `lv_keyboard` | 单选、禁用与命中区域由状态控制 |
| 输入槽、描述、密码 | `lv_textarea` | 文本和光标样式；触控输入配键盘；搜索框避免额外方框 |
| 开关、复选框、选择项 | `lv_switch` / `lv_checkbox` | 二元状态绿开红关且文字同步；单选另加排他逻辑 |
| 滑杆、双端范围、均衡器 | `lv_slider` | MAIN / INDICATOR / KNOB；垂直方向与范围模式按任务配置 |
| 下拉、滚轮、步进、日期 | `lv_dropdown` / `lv_roller` / `lv_spinbox` / `lv_calendar` | 项目字体与控件尺寸需匹配 |
| 页签、菜单、列表、分页 | `lv_tabview` / `lv_menu` / `lv_list` / 组合按钮 | 根据触控、编码器或键盘配置焦点组 |
| 进度、仪表、图表、表格 | `lv_bar` / `lv_arc` / `lv_chart` / `lv_table` | 数值和读数来自同一状态源；不是 CSS 绘图直接移植 |
| 旋钮与刻度灯 | `lv_arc` + 分层 `lv_obj` / `lv_led` | 灯数、角度、标签同步；环境高光不随指针旋转 |
| 对话框、状态灯、加载 | `lv_msgbox` / `lv_led` / `lv_spinner` | 模态输入、状态文字、定时器清理由项目管理 |
| 卡片、树、弹层、分栏 | `lv_obj` 组合 + Flex / Grid | 没有独立原生控件时明确使用组合结构，不虚构 API |
| 上传与设备连接 | 页面控件 + 项目 IO | 文件系统与设备逻辑由应用接入，不等同于网页上传接口 |

## 800×480 页面约束

- 控制页：上方约 56px 状态栏，中央约 352px 两列控制区，下方约 68px 导航；主控件触控目标优先 44px 以上。
- 中文文案、数值单位和英文名称分别检查字体度量；标签设定宽度后用 `LV_TEXT_ALIGN_CENTER`，按钮子标签通过 `lv_obj_center` 居中。
- 不把网页侧边栏或 64 项图库塞进设备屏。设备页面减少信息密度，次要参数进设置页；800×480 是原始坐标，不依赖浏览器缩放实现嵌入式布局。
- 触屏重点检查按下和选中，不依赖 hover。编码器项目接入 `lv_group` 并测试焦点和编辑状态。

## 材质与性能

LVGL 样式能够共享背景、渐变、边框、圆角、外阴影以及 part/state。9.4 的官方属性列表提供一套 shadow 属性；不能假定它支持 CSS 的多重 `box-shadow`、`inset` 和 backdrop blur。

- BASIC：统一灰蓝或牛油果底色、清楚边框、红绿状态，关闭阴影。
- STANDARD：线性渐变、单层小阴影、双层套框，优先作为软件渲染起点。
- DETAILED：加强套框与阴影；需要更精细内槽、金属反光或扫光时用预渲染图像/分层对象，并在目标硬件上测帧率、内存和刷新开销。
- 用户明确要求原源码级别的真实感时，网页加载 materials.css；LVGL 优先选择以上原始材质资源，交互命中、标签、红绿状态和数值仍用原生控件负责。不能只加宽一个外阴影就声称保留了六层投影。
- 不无限执行装饰动画；值变化时只更新相应控件。对象或页面销毁时解除应用定时器与资源引用。

## 状态语义

凹凸按功能分配：底板与内容平，模块壳浅凸，普通动作按钮与移动圆帽凸，输入/轨道/数据窗口凹。选择组保持凹槽不动、选中项升起；主次按钮都保持凸面。原生 C 起点将 CHECKED 与 PRESSED 分开：选中保留渐变帽面与投影，按下只缩短投影；复杂凹影仍按硬件预算分层或预渲染。

详细材质档中，开关、横向滑杆、范围滑杆和均衡器共用金属圆帽资源或分层对象，标签与事件继续由原生控件驱动。进度条用外框和深凹轨道承托状态色，颜色位于槽内、槽缘阴影下，不表现成凸起胶条。底部导航保留轻巧的图标和标签，选中项使用独立凸面；分段项按槽宽等分，分页当前项增加主题边缘、字重和短标记。C 起点仍为原生基础样式，这些精细结构按项目硬件预算组合或预渲染。

开/连接正常/运行：绿色灯点并配“开 / 已连接 / 运行中”。关/断开/停止：红色灯点并配对应文字。警告琥珀、错误红色、禁用中性灰；标签选择和进度使用主题色。原生开关起点用红/绿 knob 边缘强化状态，若要求与网页圆点完全一致，组合额外 `lv_led` 和标签并用同一 `LV_EVENT_VALUE_CHANGED` 更新。

## 官方依据与验证边界

版本固定参考 LVGL 9.4 的 [样式、parts 与 states](https://lvgl.io/docs/open/9.4/details/common-widget-features/styles/overview)、[样式属性](https://lvgl.io/docs/open/9.4/details/common-widget-features/styles/style-properties.html) 和 [控件目录](https://lvgl.io/docs/open/9.4/details/widgets/index.html)。实际项目的小版本与启用模块需要再次核对。

浏览器验证只能证明原型的布局与交互。C 代码对真实 LVGL 头文件的语法/API 检查也不能代替目标硬件编译、字体接入、触摸校准与上机性能测试。按已完成的验证范围报告结果。
