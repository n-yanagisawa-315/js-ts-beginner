import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect


BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")
RESULTS = Path(__file__).resolve().parent.parent / "test-results"


def v3_state():
    return {
        "version": 3,
        "lessons": {"js-run": {"score": 1, "total": 5}},
        "lessonEvents": [],
        "concepts": {
            "js:sequence": {
                "retainedAt": "2026-01-01T00:00:00.000Z",
                "transferredAt": None,
                "masteryStage": "retained",
                "lastAttemptAt": "2026-01-01T00:00:00.000Z",
            }
        },
        "questions": {
            "js-run:q1": {
                "attempts": 2,
                "correctAttempts": 2,
                "incorrectAttempts": 0,
                "firstTryCorrect": True,
                "hintUsed": False,
                "answerViewed": False,
                "lastAttemptAt": "2026-01-01T00:00:00.000Z",
                "lastCorrectAt": "2026-01-01T00:00:00.000Z",
                "streak": 2,
                "intervalDays": 3,
                "nextReviewAt": "2026-01-02T00:00:00.000Z",
                "hintUseCount": 0,
                "answerViewCount": 0,
                "lastAssistanceAt": None,
                "masteryStage": "retained",
                "retainedAt": "2026-01-01T00:00:00.000Z",
                "transferredAt": None,
                "attemptHistory": [
                    {
                        "id": "seed-1",
                        "attemptedAt": "2026-01-01T00:00:00.000Z",
                        "context": "review",
                        "correct": True,
                        "firstAttempt": True,
                        "supported": False,
                        "hintLevel": 0,
                        "answerViewed": False,
                        "responseTimeMs": 18000,
                        "confidence": 75,
                        "variantId": "js-run:q1:review-1",
                        "response": 'console.log("はじめます")',
                        "dueAt": "2025-12-31T00:00:00.000Z",
                        "advancedSchedule": True,
                    }
                ],
            }
        },
    }


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)

    page = browser.new_page(viewport={"width": 1280, "height": 820})
    page.goto(f"{BASE_URL}/lesson/js-run")
    page.wait_for_load_state("networkidle")
    expect(page.get_by_role("heading", name="説明を見る前に予想する")).to_be_visible()
    page.get_by_role("button", name="ここを質問").click()
    expect(page.get_by_role("heading", name="どこが分からない？")).to_be_visible()
    expect(page.get_by_role("button", name="端末内AIを準備する")).to_be_visible()
    expect(page.get_by_text("質問は外部APIへ送らず", exact=False)).to_be_visible()
    if not page.evaluate("'gpu' in navigator"):
        page.get_by_role("button", name="端末内AIを準備する").click()
        expect(page.get_by_text("この端末ではAIを動かせません")).to_be_visible()
    page.get_by_role("button", name="質問パネルを閉じる").click()
    page.get_by_role(
        "radio", name="まだ分からないので、説明で確かめたい"
    ).click()
    page.get_by_role("button", name="予想を残して説明を見る").click()
    expect(page.get_by_role("heading", name="今の自信はどのくらい？")).to_be_visible()
    expect(page.get_by_role("radio", name="まだ迷う 25%")).to_be_focused()
    page.keyboard.press("Escape")
    expect(page.get_by_role("heading", name="今の自信はどのくらい？")).to_have_count(0)
    page.get_by_role("button", name="予想を残して説明を見る").click()
    page.get_by_role("radio", name="かなり自信 75%").click()
    page.get_by_role("button", name="この自信で解答する").click()
    expect(page.locator(".story-ribbon")).to_be_visible()
    ribbon_text = page.locator(".story-ribbon p").inner_text()
    bubble_texts = page.locator(".talk-bubble").all_inner_texts()
    assert ribbon_text not in bubble_texts, "状況説明が会話へそのまま重複しています"
    saved_prediction = page.evaluate(
        "() => JSON.parse(localStorage.getItem('js-ts-beginner-learning-v3')).lessonEvents[0]"
    )
    assert saved_prediction["context"] == "prequestion"
    assert saved_prediction["response"]
    saw_semantic_highlight = (
        page.locator(".diagram-code-line.is-active").count() > 0
    )
    for _ in range(160):
        if page.get_by_text("演習", exact=True).count() > 0:
            break
        if page.locator(".diagram-code-line.is-active").count() > 0:
            saw_semantic_highlight = True
        continue_button = page.locator(
            ".slide-stage footer [data-slot='button']"
        )
        if continue_button.count() == 0:
            raise AssertionError("講義から演習へ進むボタンが見つかりません")
        continue_button.last.click()
    assert saw_semantic_highlight, "会話中のコード語と一致する行が強調されませんでした"
    expect(page.get_by_text("演習", exact=True)).to_be_visible()
    expect(page.get_by_text("完成例を手がかりに再現する", exact=True)).to_be_visible()
    expect(page.get_by_role("heading", name="注文台帳")).to_be_visible()
    page.locator(".monaco-editor:visible").last.click()
    page.keyboard.press("Meta+A")
    page.keyboard.insert_text("// わざと誤答する")
    page.get_by_role("button", name="ヒントを1段だけ見る").click()
    expect(page.get_by_role("button", name="次のヒントを見る")).to_be_visible()
    expect(page.get_by_role("button", name="できた！")).to_be_enabled()
    assistant_box = page.get_by_role("button", name="ここを質問").bounding_box()
    submit_box = page.get_by_role("button", name="できた！").bounding_box()
    assert assistant_box and submit_box
    overlaps = not (
        assistant_box["x"] + assistant_box["width"] <= submit_box["x"]
        or submit_box["x"] + submit_box["width"] <= assistant_box["x"]
        or assistant_box["y"] + assistant_box["height"] <= submit_box["y"]
        or submit_box["y"] + submit_box["height"] <= assistant_box["y"]
    )
    assert not overlaps, "「ここを質問」と「できた！」が重なっています"
    page.get_by_role("button", name="できた！").click()
    expect(page.get_by_role("heading", name="今の自信はどのくらい？")).to_be_visible()
    page.get_by_role("radio", name="半分くらい 50%").click()
    page.get_by_role("button", name="この自信で解答する").click()
    expect(page.get_by_role("radio", name="半分くらい 50%")).to_be_disabled()
    page.wait_for_timeout(300)
    guide_scroll = page.locator("aside").first.evaluate(
        "(node) => ({ top: node.scrollTop, height: node.clientHeight, full: node.scrollHeight })"
    )
    assert guide_scroll["full"] <= guide_scroll["height"] or guide_scroll["top"] > 0, (
        "不正解後の説明欄へスクロールできていません"
    )
    page.get_by_label("次へ進む前に、考え方の違いを1文で説明する").fill(
        "最初はコメントだけで表示されると思った。実際は表示命令が必要。"
    )
    expect(page.get_by_role("button", name="あとで解き直す")).to_be_visible()
    page.get_by_role("button", name="あとで解き直す").click()
    expect(page.locator(".slide-stage")).to_be_visible()

    mobile = browser.new_page(viewport={"width": 375, "height": 812})
    mobile.goto(f"{BASE_URL}/lesson/js-run")
    mobile.wait_for_load_state("networkidle")
    mobile.get_by_role("button", name="ここを質問").click()
    assistant_width = mobile.locator(".learning-assistant-panel").evaluate(
        "(node) => node.getBoundingClientRect().width"
    )
    assert assistant_width <= 375, "質問パネルがモバイル画面幅を超えています"
    mobile.get_by_role("button", name="質問パネルを閉じる").click()
    mobile.get_by_role(
        "radio", name="まだ分からないので、説明で確かめたい"
    ).click()
    mobile.get_by_role("button", name="予想を残して説明を見る").click()
    mobile.get_by_role("radio", name="まだ迷う 25%").click()
    mobile.get_by_role("button", name="この自信で解答する").click()
    expect(mobile.locator(".story-ribbon")).to_be_visible()
    overflow = mobile.evaluate(
        "() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1"
    )
    assert not overflow, "375px幅で横スクロールが発生しています"
    RESULTS.mkdir(exist_ok=True)
    mobile.screenshot(path=str(RESULTS / "learning-mobile.png"), full_page=True)

    dom = browser.new_page(viewport={"width": 1280, "height": 820})
    dom.goto(f"{BASE_URL}/lesson/js-dom-tree")
    dom.wait_for_load_state("networkidle")
    dom.get_by_role(
        "radio", name="まだ分からないので、説明で確かめたい"
    ).click()
    dom.get_by_role("button", name="予想を残して説明を見る").click()
    dom.get_by_role("radio", name="半分くらい 50%").click()
    dom.get_by_role("button", name="この自信で解答する").click()
    for _ in range(160):
        if dom.get_by_text("演習", exact=True).count() > 0:
            break
        continue_button = dom.locator(
            ".slide-stage footer [data-slot='button']"
        )
        if continue_button.count() == 0:
            raise AssertionError("DOM講義から演習へ進めません")
        continue_button.last.click()
    expect(dom.get_by_text("注文画面を作る:", exact=False)).to_be_visible()
    dom.locator(".monaco-editor:visible").last.click()
    dom.keyboard.press("Meta+A")
    dom.keyboard.insert_text(
        'const selected = document.querySelector("#order-list");\n'
        'const parentTag = selected.closest("main").tagName;'
    )
    dom.get_by_role("button", name="実行").click()
    expect(dom.get_by_title("注文管理画面の実行結果")).to_be_visible()
    dom.get_by_role("button", name="できた！").click()
    dom.get_by_role("radio", name="かなり自信 75%").click()
    dom.get_by_role("button", name="この自信で解答する").click()
    expect(dom.get_by_role("button", name="次のスライド")).to_be_visible()

    review = browser.new_page(viewport={"width": 1024, "height": 800})
    review.goto(BASE_URL)
    review.evaluate(
        "(state) => localStorage.setItem('js-ts-beginner-learning-v3', JSON.stringify(state))",
        v3_state(),
    )
    review.goto(f"{BASE_URL}/review")
    review.wait_for_load_state("networkidle")
    expect(review.get_by_text("期限到来", exact=True)).to_be_visible()
    expect(review.get_by_text("答える前の自信は？", exact=True)).to_have_count(0)

    review.goto(BASE_URL)
    review.wait_for_load_state("networkidle")
    expect(review.get_by_role("heading", name="注文台帳", exact=True)).to_be_visible()
    review.get_by_role("radio", name="未払い", exact=True).click()
    expect(review.get_by_text("Ren", exact=True)).to_be_visible()
    expect(review.get_by_text("Mio", exact=True)).to_be_visible()
    review.get_by_label("顧客名").fill("Sora")
    review.get_by_label("商品").fill("マウス")
    review.get_by_label("金額").fill("3200")
    review.get_by_role("button", name="未払い注文を追加").click()
    expect(review.get_by_text("Sora", exact=True)).to_be_visible()
    review.reload()
    review.wait_for_load_state("networkidle")
    expect(review.get_by_text("Sora", exact=True)).to_be_visible()
    api_response = review.request.get(f"{BASE_URL}/api/demo-orders")
    assert api_response.ok
    assert len(api_response.json()) == 3
    failed_api_response = review.request.get(
        f"{BASE_URL}/api/demo-orders?fail=1"
    )
    assert failed_api_response.status == 503
    expect(review.get_by_text("保持確認", exact=True)).to_be_visible()
    expect(review.get_by_text("初回答の自信差（小ほど良）", exact=True)).to_be_visible()
    expect(review.locator("dt:has-text('保持確認') + dd")).to_have_text("1")

    browser.close()

print("注文完成見本・DOM振る舞い採点・AI非重複・端末内AI導線・初回予想・形成的誤答・モバイル同期図解・期限復習・保持ダッシュボードを確認しました。")
