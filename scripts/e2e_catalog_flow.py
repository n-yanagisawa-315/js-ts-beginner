import os
import re
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")
RESULTS = Path(__file__).resolve().parent.parent / "test-results"


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    desktop = browser.new_page(viewport={"width": 1440, "height": 900})
    desktop.goto(BASE_URL)
    desktop.wait_for_load_state("networkidle")

    expect(
        desktop.get_by_role(
            "heading", name=re.compile(r"注文管理を作りながら、\s*プログラムの基礎を学ぶ。")
        )
    ).to_be_visible()
    expect(desktop.get_by_role("heading", name="3つの講座を、順番に進める")).to_be_visible()
    for name in ["JavaScript", "TypeScript", "Node.js"]:
        expect(desktop.get_by_role("heading", name=name, exact=True)).to_be_visible()
        expect(desktop.get_by_role("link", name=f"{name}講座を見る")).to_be_visible()

    desktop.get_by_role("link", name="JavaScript講座を見る").click()
    desktop.wait_for_url(f"{BASE_URL}/track/js")
    expect(desktop.get_by_role("heading", name="JavaScript 入門")).to_be_visible()
    expect(desktop.get_by_text("33講義", exact=True).first).to_be_visible()
    expect(desktop.get_by_role("navigation", name="JavaScriptの編一覧")).to_be_visible()
    expect(desktop.get_by_role("heading", name="基礎文法編")).to_be_visible()
    expect(desktop.get_by_role("link", name="この編を始める").first).to_be_visible()
    expect(desktop.get_by_role("button", name="この編で学ぶこと 0/5完了")).to_be_visible()
    expect(desktop.get_by_role("link", name="プログラムは上から1行ずつ動く")).to_be_visible()

    for track, heading in [
        ("ts", "TypeScript 入門"),
        ("node", "Node.js 入門"),
    ]:
        page = browser.new_page(viewport={"width": 1024, "height": 800})
        page.goto(f"{BASE_URL}/track/{track}")
        page.wait_for_load_state("networkidle")
        expect(page.get_by_role("heading", name=heading)).to_be_visible()
        page.close()

    mobile = browser.new_page(
        viewport={"width": 375, "height": 812},
        reduced_motion="reduce",
    )
    for path in ["/", "/track/js"]:
        mobile.goto(f"{BASE_URL}{path}")
        mobile.wait_for_load_state("networkidle")
        overflow = mobile.evaluate(
            "() => document.documentElement.scrollWidth > "
            "document.documentElement.clientWidth + 1"
        )
        assert not overflow, f"{path}で375px幅の横スクロールが発生しています"

    expect(mobile.get_by_role("link", name="講座一覧へ戻る")).to_be_visible()
    first_target = mobile.get_by_role("link", name="講座一覧へ戻る")
    first_target.focus()
    expect(first_target).to_be_focused()

    RESULTS.mkdir(exist_ok=True)
    mobile.screenshot(path=str(RESULTS / "track-catalog-mobile.png"))
    desktop.screenshot(path=str(RESULTS / "track-catalog-desktop.png"))
    browser.close()

print("講座カード、3トラック詳細、章ナビ、進捗、375px表示、キーボード焦点、reduced-motionを確認しました。")
