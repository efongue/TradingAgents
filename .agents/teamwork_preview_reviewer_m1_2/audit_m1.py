import re
import math

def hex_to_rgb(hex_str):
    hex_str = hex_str.strip().lstrip('#')
    if len(hex_str) == 3:
        hex_str = ''.join(c*2 for c in hex_str)
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

def rel_luminance(rgb):
    def channel(c):
        v = c / 255.0
        return v / 12.92 if v <= 0.03928 else math.pow((v + 0.055) / 1.055, 2.4)
    r, g, b = [channel(c) for c in rgb]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast_ratio(hex1, hex2):
    l1 = rel_luminance(hex_to_rgb(hex1))
    l2 = rel_luminance(hex_to_rgb(hex2))
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

def blend_on_white(hex_fg, alpha, hex_bg="#ffffff"):
    fg = hex_to_rgb(hex_fg)
    bg = hex_to_rgb(hex_bg)
    blended = tuple(int(fg[i] * alpha + bg[i] * (1 - alpha)) for i in range(3))
    return blended

def contrast_ratio_blended(hex_text, hex_badge_bg, alpha, hex_base="#ffffff"):
    l_text = rel_luminance(hex_to_rgb(hex_text))
    l_bg = rel_luminance(blend_on_white(hex_badge_bg, alpha, hex_base))
    lighter = max(l_text, l_bg)
    darker = min(l_text, l_bg)
    return (lighter + 0.05) / (darker + 0.05)

colors_to_test = [
    # General typography
    ("Primary Text (--text)", "#0f172a", "#ffffff"),
    ("Primary Text on bg (--text on --bg)", "#0f172a", "#f8fafc"),
    ("Secondary Text (--text-secondary)", "#334155", "#ffffff"),
    ("Secondary Text on bg", "#334155", "#f8fafc"),
    ("Muted Text (--muted)", "#64748b", "#ffffff"),
    ("Muted Text on bg", "#64748b", "#f8fafc"),
    ("Dark Slate Nav Item", "#475569", "#ffffff"),
    ("Dark Slate Nav Item on f8fafc", "#475569", "#f8fafc"),
    
    # Financial Signals
    ("Bullish Text Ink", "#065f46", "#ffffff"),
    ("Neutral Text Ink", "#92400e", "#ffffff"),
    ("Bearish Text Ink", "#991b1b", "#ffffff"),
    
    # Decision Badges on White & Blended badge backgrounds
    ("Decision Positive Tier 3 (Strong)", "#065f46", "#ffffff"),
    ("Decision Positive Tier 2 (Strategic)", "#0f766e", "#ffffff"),
    ("Decision Positive Tier 1 (Moderate)", "#047857", "#ffffff"),
    ("Decision Negative Tier 3 (Strong)", "#991b1b", "#ffffff"),
    ("Decision Negative Tier 2 (Strategic)", "#be123c", "#ffffff"),
    ("Decision Negative Tier 1 (Moderate)", "#991b1b", "#ffffff"),
    ("Decision Neutral Tier", "#92400e", "#ffffff"),
    
    # Sparklines
    ("Sparkline Positive", "#065f46", "#ffffff"),
    ("Sparkline Negative", "#991b1b", "#ffffff"),
    ("Sparkline Neutral", "#92400e", "#ffffff"),
    
    # Stage Badges
    ("Stage Metric Duration", "#0369a1", "#ffffff"),
    ("Stage Metric Tokens", "#0f766e", "#ffffff"),
    ("Stage Status Complete", "#065f46", "#ffffff"),
    ("Stage Status Active", "#0284c7", "#ffffff"),
    ("Stage Status Error", "#991b1b", "#ffffff"),
    ("Stage Status Unverified", "#92400e", "#ffffff"),
    
    # Timing Badges
    ("Timing Immediate", "#065f46", "#ffffff"),
    ("Timing Breakout", "#0369a1", "#ffffff"),
    ("Timing Defensive", "#92400e", "#ffffff"),
    ("Timing Bearish", "#991b1b", "#ffffff"),
    ("Timing Hold", "#475569", "#ffffff"),
    
    # Popovers & Disclaimers
    ("Disclaimer Strong", "#92400e", "#ffffff"),
    ("Disclaimer Body", "#475569", "#ffffff"),
    ("Pipeline Guide Strong", "#0f172a", "#f8fafc"),
    ("Pipeline Guide Body", "#475569", "#f8fafc"),
    
    # Headings & Brand
    ("Brand Gradient Dark End", "#0f172a", "#ffffff"),
    ("Brand Gradient Teal End", "#0d9488", "#ffffff"),
    ("Heading Gradient Start", "#0f172a", "#ffffff"),
    ("Heading Gradient End", "#334155", "#ffffff"),
]

print(f"{'Element / Token':<45} | {'Text Hex':<9} | {'Surface':<9} | {'Ratio':<7} | {'WCAG AA':<7}")
print("-" * 85)

all_passed = True
for name, text_hex, bg_hex in colors_to_test:
    ratio = contrast_ratio(text_hex, bg_hex)
    passed = ratio >= 4.5
    if not passed:
        all_passed = False
    print(f"{name:<45} | {text_hex:<9} | {bg_hex:<9} | {ratio:>5.2f}:1 | {'PASS' if passed else 'FAIL'}")

print("\nBlended Badge Background Tests (Text vs Tinted Pill Background):")
print("-" * 85)
badge_blends = [
    ("Decision Positive Tier 3 in pill", "#065f46", "#059669", 0.12),
    ("Decision Positive Tier 2 in pill", "#0f766e", "#0d9488", 0.10),
    ("Decision Positive Tier 1 in pill", "#047857", "#10b981", 0.09),
    ("Decision Negative Tier 3 in pill", "#991b1b", "#dc2626", 0.12),
    ("Decision Negative Tier 2 in pill", "#be123c", "#e11d48", 0.10),
    ("Decision Negative Tier 1 in pill", "#991b1b", "#f43f5e", 0.09),
    ("Decision Neutral in pill", "#92400e", "#d97706", 0.12),
    ("Sparkline Positive in pill", "#065f46", "#059669", 0.12),
    ("Sparkline Negative in pill", "#991b1b", "#dc2626", 0.12),
    ("Sparkline Neutral in pill", "#92400e", "#d97706", 0.12),
]

for name, text_hex, bg_tint, alpha in badge_blends:
    ratio = contrast_ratio_blended(text_hex, bg_tint, alpha, "#ffffff")
    passed = ratio >= 4.5
    if not passed:
        all_passed = False
    print(f"{name:<45} | {text_hex:<9} | tint {alpha:.2f} | {ratio:>5.2f}:1 | {'PASS' if passed else 'FAIL'}")

print(f"\nAll WCAG AA Contrast Checks Passed: {all_passed}")
