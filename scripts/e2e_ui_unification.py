from playwright.sync_api import expect, sync_playwright

BASE_URL = "http://localhost:3000"


def no_horizontal_overflow(page):
    assert page.evaluate(
        "document.documentElement.scrollWidth <= document.documentElement.clientWidth"
    )


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)

    desktop = browser.new_page(viewport={"width": 1440, "height": 900})
    desktop.goto(BASE_URL)
    desktop.wait_for_load_state("networkidle")
    expect(desktop.locator("main")).to_have_count(1)
    no_horizontal_overflow(desktop)
    desktop.screenshot(path="/tmp/js-ts-ui-1440.png", full_page=True)

    tablet = browser.new_page(viewport={"width": 1024, "height": 768})
    tablet.goto(f"{BASE_URL}/track/js")
    tablet.wait_for_load_state("networkidle")
    expect(tablet.get_by_role("heading", name="JavaScript 入門", level=1)).to_be_visible()
    expect(tablet.locator("main")).to_have_count(1)
    no_horizontal_overflow(tablet)
    tablet.screenshot(path="/tmp/js-ts-ui-1024.png", full_page=True)

    mobile = browser.new_page(viewport={"width": 375, "height": 812})
    mobile.goto(f"{BASE_URL}/lesson/js-run")
    mobile.wait_for_load_state("networkidle")
    no_horizontal_overflow(mobile)

    assistant_trigger = mobile.get_by_role("button", name="ここを質問")
    assistant_trigger.click()
    expect(mobile.get_by_role("dialog")).to_be_visible()
    mobile.keyboard.press("Escape")
    expect(assistant_trigger).to_be_focused()

    mobile.get_by_role(
        "radio", name="まだ分からないので、説明で確かめたい"
    ).click()
    submit = mobile.get_by_role("button", name="予想を残して説明を見る")
    submit.click()
    expect(mobile.get_by_role("heading", name="今の自信はどのくらい？")).to_be_visible()
    expect(mobile.get_by_role("radio", name="まだ迷う 25%")).to_be_focused()
    mobile.keyboard.press("Escape")
    expect(submit).to_be_focused()
    mobile.screenshot(path="/tmp/js-ts-ui-375.png", full_page=True)

    landscape = browser.new_page(viewport={"width": 812, "height": 375})
    landscape.goto(f"{BASE_URL}/lesson/js-run")
    landscape.wait_for_load_state("networkidle")
    no_horizontal_overflow(landscape)
    landscape.screenshot(path="/tmp/js-ts-ui-landscape.png", full_page=True)

    reduced = browser.new_page(
        viewport={"width": 1024, "height": 768},
        reduced_motion="reduce",
    )
    reduced.goto(BASE_URL)
    reduced.wait_for_load_state("networkidle")
    transition = reduced.locator(".course-track-card").first.evaluate(
        "(element) => getComputedStyle(element).transitionDuration"
    )
    assert transition == "0s"
    reduced.screenshot(path="/tmp/js-ts-ui-reduced-motion.png", full_page=True)

    browser.close()

print(
    "1440px・1024px・375px・モバイル横向き・reduced-motionと、"
    "Sheet/Drawer・Dialogのフォーカス復帰を確認しました。"
)
