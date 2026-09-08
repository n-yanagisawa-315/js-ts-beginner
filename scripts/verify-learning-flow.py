import os

from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:3000")
LESSONS = [
    ("JavaScript", "js-run", False),
    ("TypeScript", "ts-seven", False),
    ("Node.js", "node-cli", True),
]


def enter_first_exercise(page, label: str, lesson_id: str, terminal: bool) -> None:
    print(f"{label}: 確認開始", flush=True)
    page.goto(
        f"{BASE_URL}/lesson/{lesson_id}",
        wait_until="domcontentloaded",
        timeout=10_000,
    )
    page.locator(".talk-line").first.wait_for()

    assert page.locator(".talk-line").count() > 0, f"{label}: 会話がありません"
    assert page.get_by_text("エンジニア", exact=True).count() > 0
    assert page.get_by_text("初心者", exact=True).count() > 0

    while page.get_by_role("button", name="会話を続ける").count():
        page.get_by_role("button", name="会話を続ける").click()

    page.get_by_role("button", name="この内容を演習する").click()
    page.locator(".lab-grid, article.relative").first.wait_for()

    if terminal:
        page.locator(".node-term").wait_for()
        assert "node app.js" not in page.locator("body").inner_text()
        assert page.get_by_text("ターミナル", exact=True).count() > 0
    elif page.locator(".editor-shell").count():
        page.locator(".editor-shell").wait_for()
    else:
        page.get_by_text("問題 01", exact=False).wait_for()
    print(f"{label}: OK", flush=True)


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True, channel="chrome")
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    page.set_default_timeout(10_000)
    errors: list[str] = []
    page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)

    for lesson in LESSONS:
        enter_first_exercise(page, *lesson)

    assert not errors, f"ブラウザコンソールエラー: {errors}"
    browser.close()

print("3トラック: 会話から演習までの表示を確認しました。")
