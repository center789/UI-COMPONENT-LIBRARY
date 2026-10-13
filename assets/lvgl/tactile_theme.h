#ifndef TACTILE_THEME_H
#define TACTILE_THEME_H

#include "lvgl.h"

#if LVGL_VERSION_MAJOR != 9
#error "This style starter targets LVGL 9.x."
#endif

#ifdef __cplusplus
extern "C" {
#endif

typedef enum {
    TACTILE_BLUE, TACTILE_SILVER, TACTILE_GRAPHITE, TACTILE_MECHANICAL, TACTILE_AVOCADO
} tactile_palette_t;

typedef enum {
    TACTILE_BASIC, TACTILE_STANDARD, TACTILE_DETAILED
} tactile_quality_t;

/* Call once, before creating widgets. Shared styles have application lifetime.
 * Initialize LVGL and your display/input drivers separately.
 * BASIC: no shadows. STANDARD: gradients + a small shadow.
 * DETAILED: stronger rim and shadow; not a CSS multi-shadow renderer.
 */
void tactile_theme_init(tactile_palette_t palette, tactile_quality_t quality);
void tactile_apply_panel(lv_obj_t * obj);
void tactile_apply_button(lv_obj_t * obj);
void tactile_apply_slider(lv_obj_t * obj);
void tactile_apply_switch(lv_obj_t * obj);
void tactile_apply_arc(lv_obj_t * obj);
void tactile_apply_textarea(lv_obj_t * obj);

/* Returns the inner content object; its parent is the decorative rim. */
lv_obj_t * tactile_well_create(lv_obj_t * parent, int32_t width, int32_t height);

/* Creates an 800x480 control-page starter with working widget events.
 * Uses ASCII labels and LV_FONT_DEFAULT; provide your own Chinese font/text.
 * Enable LV_USE_LABEL/BUTTON/SLIDER/SWITCH/ARC/TEXTAREA in lv_conf.h.
 */
lv_obj_t * tactile_demo_create(lv_obj_t * parent);

#ifdef __cplusplus
}
#endif
#endif
