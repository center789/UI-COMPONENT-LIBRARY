#include "tactile_theme.h"
#include <stdbool.h>

typedef struct {
    uint32_t canvas, panel, face, cap, text, muted, line, high, shade, accent;
} palette_colors_t;

static const palette_colors_t palettes[] = {
    {0xE1E9F1,0xE5EDF4,0xEEF4F9,0xB8CCDC,0x172B3C,0x526677,0xB7C8D6,0xFFFFFF,0x8DA5B8,0x3376A7},
    {0xD5E1DF,0xDBE6E3,0xEDF2ED,0xAEC2C5,0x1E363D,0x516B70,0xB1C6C7,0xFFFFFF,0x8FA9AF,0x376F7E},
    {0x414449,0x4B4F55,0x636970,0x353B41,0xEDF3F8,0xC3CDD7,0x68717B,0x838B94,0x252B31,0xA2D1F1},
    {0xE2E4E5,0xE8EAEB,0xFAFCFC,0xB9C2C8,0x29373D,0x5C696F,0xBFC7CC,0xFFFFFF,0x929FA9,0x976330},
    {0xE3E8D6,0xE9EDDE,0xF5F8EC,0xC1CEA4,0x293B26,0x586746,0xBDCBA5,0xFCFFF4,0x92A476,0x607B36}
};
static palette_colors_t colors;
static tactile_quality_t selected_quality;
static bool initialized;
static lv_style_t panel, raised, selected, pressed, disabled, focused, well, track, indicator, knob;

static void ensure_initialized(void)
{
    if(!initialized) tactile_theme_init(TACTILE_BLUE, TACTILE_STANDARD);
}

void tactile_theme_init(tactile_palette_t palette, tactile_quality_t quality)
{
    if(initialized) return;
    if(palette < TACTILE_BLUE || palette > TACTILE_AVOCADO) palette = TACTILE_BLUE;
    if(quality < TACTILE_BASIC || quality > TACTILE_DETAILED) quality = TACTILE_STANDARD;
    colors = palettes[palette];
    selected_quality = quality;
    lv_style_t * styles[] = {&panel,&raised,&selected,&pressed,&disabled,&focused,&well,&track,&indicator,&knob};
    for(unsigned i = 0; i < sizeof(styles)/sizeof(styles[0]); ++i) lv_style_init(styles[i]);

    lv_style_set_bg_opa(&panel, LV_OPA_COVER);
    lv_style_set_bg_color(&panel, lv_color_hex(colors.panel));
    lv_style_set_text_color(&panel, lv_color_hex(colors.text));
    lv_style_set_border_color(&panel, lv_color_hex(colors.line));
    lv_style_set_border_width(&panel, 1);
    lv_style_set_radius(&panel, 20);
    lv_style_set_pad_all(&panel, 18);
    if(quality != TACTILE_BASIC) {
        lv_style_set_shadow_color(&panel, lv_color_hex(colors.shade));
        lv_style_set_shadow_opa(&panel, LV_OPA_20);
        lv_style_set_shadow_width(&panel, 6);
        lv_style_set_shadow_offset_y(&panel, 2);
    }

    lv_style_set_bg_opa(&raised, LV_OPA_COVER);
    lv_style_set_bg_color(&raised, lv_color_hex(colors.face));
    lv_style_set_bg_grad_color(&raised, lv_color_hex(colors.cap));
    lv_style_set_bg_grad_dir(&raised, quality == TACTILE_BASIC ? LV_GRAD_DIR_NONE : LV_GRAD_DIR_VER);
    lv_style_set_border_color(&raised, lv_color_hex(colors.line));
    lv_style_set_border_width(&raised, 1);
    lv_style_set_radius(&raised, 13);
    lv_style_set_text_color(&raised, lv_color_hex(colors.text));
    lv_style_set_pad_all(&raised, 10);
    if(quality != TACTILE_BASIC) {
        lv_style_set_shadow_color(&raised, lv_color_hex(colors.shade));
        lv_style_set_shadow_opa(&raised, LV_OPA_40);
        lv_style_set_shadow_width(&raised, quality == TACTILE_DETAILED ? 12 : 8);
        lv_style_set_shadow_offset_y(&raised, 4);
    }

    lv_style_set_border_color(&selected, lv_color_hex(colors.accent));
    lv_style_set_border_width(&selected, 2);
    /* A press shortens the cast shadow without replacing the raised face. */
    lv_style_set_shadow_width(&pressed, quality == TACTILE_BASIC ? 0 : 3);
    lv_style_set_shadow_offset_y(&pressed, 1);
    lv_style_set_border_color(&pressed, lv_color_hex(colors.shade));
    lv_style_set_opa(&disabled, LV_OPA_50);
    lv_style_set_outline_color(&focused, lv_color_hex(colors.accent));
    lv_style_set_outline_width(&focused, 2);
    lv_style_set_outline_pad(&focused, 3);

    lv_style_set_bg_opa(&well, LV_OPA_COVER);
    lv_style_set_bg_color(&well, lv_color_hex(colors.canvas));
    lv_style_set_text_color(&well, lv_color_hex(colors.text));
    lv_style_set_border_color(&well, lv_color_hex(colors.shade));
    lv_style_set_border_width(&well, 1);
    lv_style_set_radius(&well, 14);
    lv_style_set_pad_all(&well, 12);

    lv_style_set_bg_opa(&track, LV_OPA_COVER);
    lv_style_set_bg_color(&track, lv_color_hex(colors.cap));
    lv_style_set_border_width(&track, 0);
    lv_style_set_radius(&track, LV_RADIUS_CIRCLE);
    lv_style_set_pad_all(&track, 0);

    lv_style_set_bg_opa(&indicator, LV_OPA_COVER);
    lv_style_set_bg_color(&indicator, lv_color_hex(colors.accent));
    lv_style_set_radius(&indicator, LV_RADIUS_CIRCLE);
    lv_style_set_border_width(&indicator, 0);

    lv_style_set_bg_opa(&knob, LV_OPA_COVER);
    lv_style_set_bg_color(&knob, lv_color_hex(colors.face));
    lv_style_set_bg_grad_color(&knob, lv_color_hex(colors.cap));
    lv_style_set_bg_grad_dir(&knob, quality == TACTILE_BASIC ? LV_GRAD_DIR_NONE : LV_GRAD_DIR_VER);
    lv_style_set_border_color(&knob, lv_color_hex(colors.line));
    lv_style_set_border_width(&knob, 1);
    lv_style_set_radius(&knob, LV_RADIUS_CIRCLE);
    lv_style_set_pad_all(&knob, 7);
    if(quality != TACTILE_BASIC) {
        lv_style_set_shadow_color(&knob, lv_color_hex(colors.shade));
        lv_style_set_shadow_opa(&knob, LV_OPA_40);
        lv_style_set_shadow_width(&knob, 6);
        lv_style_set_shadow_offset_y(&knob, 2);
    }
    initialized = true;
}

void tactile_apply_panel(lv_obj_t * obj)
{
    ensure_initialized();
    lv_obj_remove_style_all(obj);
    lv_obj_add_style(obj, &panel, LV_PART_MAIN);
}

void tactile_apply_button(lv_obj_t * obj)
{
    ensure_initialized();
    lv_obj_remove_style_all(obj);
    lv_obj_add_style(obj, &raised, LV_PART_MAIN);
    lv_obj_add_style(obj, &pressed, LV_PART_MAIN | LV_STATE_PRESSED);
    lv_obj_add_style(obj, &selected, LV_PART_MAIN | LV_STATE_CHECKED);
    lv_obj_add_style(obj, &disabled, LV_PART_MAIN | LV_STATE_DISABLED);
    lv_obj_add_style(obj, &focused, LV_PART_MAIN | LV_STATE_FOCUS_KEY);
}

void tactile_apply_slider(lv_obj_t * obj)
{
    ensure_initialized();
    lv_obj_remove_style_all(obj);
    lv_obj_add_style(obj, &track, LV_PART_MAIN);
    lv_obj_add_style(obj, &indicator, LV_PART_INDICATOR);
    lv_obj_add_style(obj, &knob, LV_PART_KNOB);
    lv_obj_add_style(obj, &pressed, LV_PART_KNOB | LV_STATE_PRESSED);
    lv_obj_add_style(obj, &focused, LV_PART_MAIN | LV_STATE_FOCUS_KEY);
    lv_obj_add_style(obj, &disabled, LV_PART_MAIN | LV_STATE_DISABLED);
    lv_obj_set_height(obj, 10);
}

void tactile_apply_switch(lv_obj_t * obj)
{
    ensure_initialized();
    lv_obj_remove_style_all(obj);
    lv_obj_add_style(obj, &track, LV_PART_MAIN);
    lv_obj_add_style(obj, &indicator, LV_PART_INDICATOR | LV_STATE_CHECKED);
    lv_obj_add_style(obj, &knob, LV_PART_KNOB);
    lv_obj_add_style(obj, &focused, LV_PART_MAIN | LV_STATE_FOCUS_KEY);
    lv_obj_add_style(obj, &disabled, LV_PART_MAIN | LV_STATE_DISABLED);
    lv_obj_set_style_border_width(obj, 2, LV_PART_KNOB);
    lv_obj_set_style_border_color(obj, lv_color_hex(0xC55758), LV_PART_KNOB);
    lv_obj_set_style_border_color(obj, lv_color_hex(0x2B8B52), LV_PART_KNOB | LV_STATE_CHECKED);
    lv_obj_set_size(obj, 68, 36);
    lv_obj_set_style_pad_all(obj, 4, LV_PART_MAIN);
    lv_obj_set_style_pad_all(obj, -1, LV_PART_KNOB);
}

void tactile_apply_arc(lv_obj_t * obj)
{
    ensure_initialized();
    lv_obj_remove_style_all(obj);
    lv_obj_set_style_arc_width(obj, 8, LV_PART_MAIN);
    lv_obj_set_style_arc_color(obj, lv_color_hex(colors.cap), LV_PART_MAIN);
    lv_obj_set_style_arc_rounded(obj, true, LV_PART_MAIN);
    lv_obj_set_style_arc_width(obj, 8, LV_PART_INDICATOR);
    lv_obj_set_style_arc_color(obj, lv_color_hex(colors.accent), LV_PART_INDICATOR);
    lv_obj_set_style_arc_rounded(obj, true, LV_PART_INDICATOR);
    lv_obj_add_style(obj, &knob, LV_PART_KNOB);
    lv_obj_add_style(obj, &focused, LV_PART_MAIN | LV_STATE_FOCUS_KEY);
    lv_obj_set_style_pad_all(obj, 5, LV_PART_MAIN);
    lv_arc_set_rotation(obj, 135);
    lv_arc_set_bg_angles(obj, 0, 270);
    lv_arc_set_range(obj, 0, 100);
}

void tactile_apply_textarea(lv_obj_t * obj)
{
    ensure_initialized();
    lv_obj_remove_style_all(obj);
    lv_obj_add_style(obj, &well, LV_PART_MAIN);
    lv_obj_add_style(obj, &focused, LV_PART_MAIN | LV_STATE_FOCUS_KEY);
    lv_obj_add_style(obj, &disabled, LV_PART_MAIN | LV_STATE_DISABLED);
    lv_obj_set_style_text_color(obj, lv_color_hex(colors.muted), LV_PART_TEXTAREA_PLACEHOLDER);
    lv_obj_set_style_border_width(obj, 2, LV_PART_CURSOR);
    lv_obj_set_style_border_side(obj, LV_BORDER_SIDE_LEFT, LV_PART_CURSOR);
    lv_obj_set_style_border_color(obj, lv_color_hex(colors.accent), LV_PART_CURSOR);
}

lv_obj_t * tactile_well_create(lv_obj_t * parent, int32_t width, int32_t height)
{
    ensure_initialized();
    lv_obj_t * rim = lv_obj_create(parent);
    lv_obj_remove_style_all(rim);
    lv_obj_set_size(rim, width, height);
    lv_obj_remove_flag(rim, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_remove_flag(rim, LV_OBJ_FLAG_CLICKABLE);
    lv_obj_set_style_bg_opa(rim, LV_OPA_COVER, 0);
    lv_obj_set_style_bg_color(rim, lv_color_hex(colors.shade), 0);
    lv_obj_set_style_bg_grad_color(rim, lv_color_hex(colors.high), 0);
    lv_obj_set_style_bg_grad_dir(rim, LV_GRAD_DIR_VER, 0);
    lv_obj_set_style_radius(rim, 22, 0);
    lv_obj_t * inner = lv_obj_create(rim);
    tactile_apply_panel(inner);
    int32_t edge = selected_quality == TACTILE_DETAILED ? 4 : 3;
    lv_obj_set_size(inner, width - edge * 2, height - edge * 2);
    lv_obj_center(inner);
    lv_obj_remove_flag(inner, LV_OBJ_FLAG_SCROLLABLE);
    return inner;
}

static lv_obj_t * label_at(lv_obj_t * parent, const char * text, int32_t x, int32_t y)
{
    lv_obj_t * label = lv_label_create(parent);
    lv_label_set_text(label, text);
    lv_obj_set_pos(label, x, y);
    return label;
}

static void value_changed(lv_event_t * event)
{
    lv_obj_t * widget = (lv_obj_t *)lv_event_get_target(event);
    lv_obj_t * label = (lv_obj_t *)lv_event_get_user_data(event);
    lv_label_set_text_fmt(label, "%d%%", (int)lv_slider_get_value(widget));
}

static void arc_changed(lv_event_t * event)
{
    lv_obj_t * widget = (lv_obj_t *)lv_event_get_target(event);
    lv_obj_t * label = (lv_obj_t *)lv_event_get_user_data(event);
    lv_label_set_text_fmt(label, "%d%%", (int)lv_arc_get_value(widget));
    lv_obj_center(label);
}

static void run_clicked(lv_event_t * event)
{
    lv_obj_t * button = (lv_obj_t *)lv_event_get_target(event);
    lv_obj_t * label = (lv_obj_t *)lv_event_get_user_data(event);
    lv_label_set_text(label, lv_obj_has_state(button, LV_STATE_CHECKED) ? "Stop" : "Start");
    lv_obj_center(label);
}

lv_obj_t * tactile_demo_create(lv_obj_t * parent)
{
    ensure_initialized();
    lv_obj_t * root = lv_obj_create(parent);
    tactile_apply_panel(root);
    lv_obj_set_size(root, 800, 480);
    lv_obj_set_pos(root, 0, 0);
    lv_obj_set_style_pad_all(root, 0, 0);
    lv_obj_set_style_radius(root, 0, 0);
    lv_obj_set_style_border_width(root, 0, 0);
    lv_obj_set_style_bg_color(root, lv_color_hex(colors.canvas), 0);
    lv_obj_remove_flag(root, LV_OBJ_FLAG_SCROLLABLE);
    label_at(root, "Studio Control", 28, 20);
    label_at(root, "LVGL 9.x / 800 x 480", 575, 20);

    lv_obj_t * left = lv_obj_create(root);
    tactile_apply_panel(left);
    lv_obj_set_pos(left, 28, 72);
    lv_obj_set_size(left, 354, 312);
    lv_obj_remove_flag(left, LV_OBJ_FLAG_SCROLLABLE);
    label_at(left, "Environment", 0, 0);
    label_at(left, "Temperature: 24.5 C", 0, 48);
    label_at(left, "Screen brightness", 0, 107);
    lv_obj_t * brightness_value = label_at(left, "65%", 258, 107);
    lv_obj_t * brightness = lv_slider_create(left);
    tactile_apply_slider(brightness);
    lv_obj_set_width(brightness, 300);
    lv_obj_set_pos(brightness, 0, 150);
    lv_slider_set_range(brightness, 0, 100);
    lv_slider_set_value(brightness, 65, LV_ANIM_OFF);
    lv_obj_add_event_cb(brightness, value_changed, LV_EVENT_VALUE_CHANGED, brightness_value);
    label_at(left, "Auto adjust", 0, 215);
    lv_obj_t * auto_switch = lv_switch_create(left);
    tactile_apply_switch(auto_switch);
    lv_obj_set_pos(auto_switch, 237, 204);
    lv_obj_add_state(auto_switch, LV_STATE_CHECKED);

    lv_obj_t * right = tactile_well_create(root, 362, 312);
    lv_obj_set_pos(lv_obj_get_parent(right), 408, 72);
    label_at(right, "Volume and power", 0, 0);
    lv_obj_t * volume = lv_arc_create(right);
    tactile_apply_arc(volume);
    lv_obj_set_size(volume, 165, 165);
    lv_obj_set_pos(volume, 68, 48);
    lv_arc_set_value(volume, 60);
    lv_obj_t * volume_value = lv_label_create(volume);
    lv_label_set_text(volume_value, "60%");
    lv_obj_center(volume_value);
    lv_obj_remove_flag(volume_value, LV_OBJ_FLAG_CLICKABLE);
    lv_obj_add_event_cb(volume, arc_changed, LV_EVENT_VALUE_CHANGED, volume_value);
    lv_obj_t * run = lv_button_create(right);
    tactile_apply_button(run);
    lv_obj_set_size(run, 126, 44);
    lv_obj_set_pos(run, 186, 223);
    lv_obj_add_flag(run, LV_OBJ_FLAG_CHECKABLE);
    lv_obj_t * run_label = lv_label_create(run);
    lv_label_set_text(run_label, "Start");
    lv_obj_center(run_label);
    lv_obj_add_event_cb(run, run_clicked, LV_EVENT_CLICKED, run_label);
    label_at(right, "Local demo", 0, 236);

    /* Navigation labels are static in this single-page C starter. */
    label_at(root, "CONTROL", 145, 430);
    label_at(root, "SETTINGS", 365, 430);
    label_at(root, "AUDIO", 610, 430);
    return root;
}
