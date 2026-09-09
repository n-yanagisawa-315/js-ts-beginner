import os
import re
from playwright.sync_api import sync_playwright, expect

BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:3000")


def role_is_visible(page, role, name):
    locator = page.get_by_role(role, name=name, exact=False)
    return locator.count() > 0 and locator.first.is_visible()


def advance_slides_until(page, role, name):
    for _ in range(40):
        if role_is_visible(page, role, name):
            return
        continue_button = page.get_by_role(
            "button",
            name=re.compile("会話を続ける|この内容を演習する|残りの演習へ|結果を見る"),
        )
        if continue_button.count() == 0:
            page.wait_for_timeout(50)
            continue
        continue_button.last.click()
    raise AssertionError(f"{name}へ移動できませんでした")


def enter_first_exercise(page, lesson_id, first_answer):
    page.goto(f"{BASE_URL}/lesson/{lesson_id}")
    page.wait_for_load_state("networkidle")
    page.get_by_role(
        "radio", name="まだ分からないので、説明で確かめたい"
    ).click()
    page.get_by_role("button", name="予想を残して説明を見る").click()
    page.get_by_role("radio", name="半分くらい 50%").click()
    page.get_by_role("button", name="この自信で解答する").click()
    expect(page.locator(".slide-stage")).to_be_visible()
    advance_slides_until(page, "radio", first_answer)


def answer_quiz(page, answer, choice=False, next_role=None, next_name=None):
    if choice:
        page.get_by_role("radio", name=answer, exact=False).click()
    else:
        page.get_by_label("答え").fill(answer)
    page.get_by_role("button", name="解答する").click()
    page.get_by_role("radio", name="半分くらい 50%").click()
    page.get_by_role("button", name="この自信で解答する").click()
    expect(page.get_by_text("正解。", exact=False).first).to_be_visible()
    page.get_by_role(
        "button", name=re.compile("次のスライド|結果を見る")
    ).last.click()
    if next_role and next_name:
        advance_slides_until(page, next_role, next_name)


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 820})
    page.set_default_timeout(8000)

    page.goto(BASE_URL)
    page.wait_for_load_state("networkidle")
    for name in ["JavaScript", "TypeScript", "Node.js", "SQL", "GitHub"]:
        expect(page.get_by_role("heading", name=name, exact=True)).to_be_visible()

    page.goto(f"{BASE_URL}/track/sql")
    expect(page.get_by_role("heading", name="SQL 入門")).to_be_visible()
    expect(page.get_by_text("SELECT入門編", exact=True)).to_be_visible()

    enter_first_exercise(page, "sql-table-first", "行")
    answer_quiz(page, "行", choice=True, next_role="textbox", next_name="答え")
    answer_quiz(page, "SELECT", next_role="button", next_name="SQLを実行")
    expect(page.get_by_text("SQLを実行すると、ここに結果が表示されます。")).to_be_visible()
    editor = page.locator(".monaco-editor:visible").last
    editor.click()
    page.keyboard.press("Meta+A")
    page.keyboard.insert_text("SELECT * FROM orders;")
    page.get_by_role("button", name="SQLを実行").click()
    expect(page.get_by_text("コーヒー", exact=True).first).to_be_visible(timeout=10000)
    editor.click()
    page.keyboard.press("Meta+A")
    page.keyboard.insert_text("ATTACH DATABASE 'other.db' AS other;")
    page.get_by_role("button", name="SQLを実行").click()
    expect(page.get_by_text("ATTACH はこのSQL演習では使用できません。")).to_be_visible()
    editor.click()
    page.keyboard.press("Meta+A")
    page.keyboard.insert_text("SELECT * FROM orders;")
    page.get_by_role("button", name="SQLを実行").click()
    expect(page.get_by_text("コーヒー", exact=True).first).to_be_visible(timeout=10000)
    page.get_by_role("button", name="できた！").click()
    page.get_by_role("radio", name="かなり自信 75%").click()
    page.get_by_role("button", name="この自信で解答する").click()
    expect(page.get_by_text("正解。", exact=False).first).to_be_visible(timeout=10000)

    git = browser.new_page(viewport={"width": 375, "height": 812})
    git.set_default_timeout(8000)
    enter_first_exercise(git, "github-repository-basics", "Git（手元の履歴管理）")
    answer_quiz(git, "Git（手元の履歴管理）", choice=True, next_role="textbox", next_name="答え")
    answer_quiz(git, ".git", next_role="heading", next_name="Git terminal")
    expect(git.get_by_role("heading", name="Git terminal")).to_be_visible()
    command = git.get_by_label("Gitコマンド")
    command.fill("git init -b main")
    command.press("Enter")
    expect(git.get_by_text("Initialized empty Git repository")).to_be_visible()
    git.get_by_role("button", name="できた！").click()
    git.get_by_role("radio", name="かなり自信 75%").click()
    git.get_by_role("button", name="この自信で解答する").click()
    expect(git.get_by_text("正解。", exact=False).first).to_be_visible()
    overflow = git.evaluate(
        "() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1"
    )
    assert not overflow, "375px幅で横スクロールが発生しています"

    browser.close()
    print("5トラック、SQLite結果、Git状態採点、375px表示を確認しました。")
