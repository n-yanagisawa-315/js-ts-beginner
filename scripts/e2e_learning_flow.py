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
    page.get_by_role("button", name="まだ分からない").click()
    page.get_by_role("button", name="かなり自信 75%").click()
    page.get_by_role("button", name="予想を残して説明を見る").click()
    expect(page.locator(".story-ribbon")).to_be_visible()
    saved_prediction = page.evaluate(
        "() => JSON.parse(localStorage.getItem('js-ts-beginner-learning-v3')).lessonEvents[0]"
    )
    assert saved_prediction["context"] == "prequestion"
    assert saved_prediction["response"]
    expect(page.locator(".diagram-code-line.is-active")).to_have_count(0)

    saw_semantic_highlight = False
    for _ in range(160):
        if page.get_by_text("演習", exact=True).count() > 0:
            break
        if page.locator(".diagram-code-line.is-active").count() > 0:
            saw_semantic_highlight = True
        continue_button = page.locator("button.btn-studio")
        if continue_button.count() == 0:
            raise AssertionError("講義から演習へ進むボタンが見つかりません")
        continue_button.last.click()
    assert saw_semantic_highlight, "会話中のコード語と一致する行が強調されませんでした"
    expect(page.get_by_text("演習", exact=True)).to_be_visible()
    expect(page.get_by_text("完成例を追って理解する", exact=True)).to_be_visible()
    page.locator(".monaco-editor:visible").last.click()
    page.keyboard.press("Meta+A")
    page.keyboard.insert_text("// わざと誤答する")
    page.get_by_role("button", name="ヒントを1段だけ見る").click()
    expect(page.get_by_role("button", name="次のヒントを見る")).to_be_visible()
    expect(page.get_by_role("button", name="できた！")).to_be_disabled()
    page.get_by_role("button", name="半分くらい 50%").click()
    page.get_by_role("button", name="できた！").click()
    expect(page.get_by_role("button", name="半分くらい 50%")).to_be_disabled()
    page.get_by_label("次へ進む前に、考え方の違いを1文で説明する").fill(
        "最初はコメントだけで表示されると思った。実際は表示命令が必要。"
    )
    expect(page.get_by_role("button", name="あとで解き直す")).to_be_visible()
    page.get_by_role("button", name="あとで解き直す").click()
    expect(page.locator(".slide-stage")).to_be_visible()

    mobile = browser.new_page(viewport={"width": 375, "height": 812})
    mobile.goto(f"{BASE_URL}/lesson/js-run")
    mobile.wait_for_load_state("networkidle")
    mobile.get_by_role("button", name="まだ分からない").click()
    mobile.get_by_role("button", name="まだ迷う 25%").click()
    mobile.get_by_role("button", name="予想を残して説明を見る").click()
    expect(mobile.locator(".story-ribbon")).to_be_visible()
    overflow = mobile.evaluate(
        "() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1"
    )
    assert not overflow, "375px幅で横スクロールが発生しています"
    RESULTS.mkdir(exist_ok=True)
    mobile.screenshot(path=str(RESULTS / "learning-mobile.png"), full_page=True)

    review = browser.new_page(viewport={"width": 1024, "height": 800})
    review.goto(BASE_URL)
    review.evaluate(
        "(state) => localStorage.setItem('js-ts-beginner-learning-v3', JSON.stringify(state))",
        v3_state(),
    )
    review.goto(f"{BASE_URL}/review")
    review.wait_for_load_state("networkidle")
    expect(review.get_by_text("期限到来", exact=True)).to_be_visible()
    expect(review.get_by_text("答える前の自信は？", exact=True)).to_be_visible()

    review.goto(BASE_URL)
    review.wait_for_load_state("networkidle")
    expect(review.get_by_text("保持確認", exact=True)).to_be_visible()
    expect(review.get_by_text("初回答の自信差（小ほど良）", exact=True)).to_be_visible()
    expect(review.get_by_text("1 保持", exact=False).first).to_be_visible()

    browser.close()

print("初回予想・形成的誤答・モバイル同期図解・期限復習・保持ダッシュボードを確認しました。")
