/**
 * js-dom.ts の定型 talk を、各スライド固有の会話へ置き換える。
 * 実行: node scripts/rewrite-dom-talks.mjs
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const COURSE_FILE = path.join(ROOT, "src/lib/course/js-dom.ts");

/** @type {Record<string, { beginner: string; engineer: string }[]>} */
const TALKS_BY_TITLE = {
  HTMLは親子の木になる: [
    {
      beginner: "注文画面のHTMLは、どうやってJavaScriptから触れる形になるんですか？",
      engineer:
        "ブラウザがHTMLを親子のDOMツリーに変換します。documentがその木の入口で、mainの下にフォームと注文一覧がぶら下がります。",
    },
    {
      beginner: "一覧のulと各注文のliは、どういう関係ですか？",
      engineer:
        "ulが親、liが子です。入れ子がそのまま親子関係になるので、枝をたどって表示を調べられます。",
    },
  ],
  querySelectorで一つ選ぶ: [
    {
      beginner: "注文件数の数字だけ取りたいとき、どう探せばいいですか？",
      engineer:
        "querySelectorにCSSセレクターを渡すと、最初に一致した要素を1つ返します。#order-countのように、役割が変わりにくいidが目印になります。",
    },
    {
      beginner: "見つからなかったら何が返りますか？ すぐ文字を書いて大丈夫？",
      engineer:
        "見つからないとnullです。選んだ要素は変数に保存し、使う前に存在を確かめてから更新します。",
    },
  ],
  querySelectorAllで複数選ぶ: [
    {
      beginner: "注文行が何行もあるときは、querySelectorでは足りないですか？",
      engineer:
        "最初の1つしか取れないので、複数ならquerySelectorAllを使います。戻り値はNodeListで、lengthで件数を見られます。",
    },
    {
      beginner: "各行の文字を順に確認するにはどうしますか？",
      engineer:
        "NodeListはforEachで回せます。各liのtextContentを順に読めば、一覧の中身を一件ずつ確認できます。",
    },
  ],
  選ぶ範囲を一覧の内側に絞る: [
    {
      beginner: "いつもdocumentから探せば十分ではないですか？",
      engineer:
        "画面の別場所に似た要素があると、意図しない枝を掴むことがあります。先に#order-listを取り、その要素からquerySelectorすると範囲を限定できます。",
    },
    {
      beginner: "親がnullのまま内側を探すとどうなりますか？",
      engineer:
        "親が無いのに子を探すと失敗します。list?.querySelectorのように、親の存在を先に確かめてから内側を探します。",
    },
  ],
  この講義の要点: [
    {
      beginner: "DOMを触るとき、最初に意識することは何ですか？",
      engineer:
        "HTMLから作られた部品の木だと捉えることです。安定したセレクターで枝を選び、一つか複数か、どこから探すかを決めます。",
    },
    {
      beginner: "querySelectorとquerySelectorAllの使い分けを確認させてください。",
      engineer:
        "最初の一つならquerySelector、一致する全部ならquerySelectorAllです。親から探せば、似た要素の取り違えを減らせます。",
    },
  ],
  textContentで文字を変える: [
    {
      beginner: "選んだ要素の表示文を変えるには、何を書き換えますか？",
      engineer:
        "textContentへ文字列を代入します。タグとして解釈せず、文字そのものが画面に出ます。",
    },
    {
      beginner: "注文件数は、画面の文字を手で数えればいいですか？",
      engineer:
        "いいえ。orders.lengthなどデータから作り、textContentへ入れ直します。再代入すると以前の表示は置き換わります。",
    },
  ],
  classListで状態を表す: [
    {
      beginner: "未払いの見た目を付けるとき、styleを直接書くべきですか？",
      engineer:
        "状態名をクラスに対応させる方が追いやすいです。classList.addでunpaidを付け、外すときはremoveを使います。",
    },
    {
      beginner: "真偽値に合わせて付け外しを一度にやる方法はありますか？",
      engineer:
        "toggleの第2引数に真偽を渡せます。trueなら付け、falseなら外す、と状態と見た目を揃えられます。",
    },
  ],
  属性で要素に情報を持たせる: [
    {
      beginner: "クリック後にどの注文か知るために、表示文字へidを埋め込みますか？",
      engineer:
        "表示と識別は分けます。data-order-idなどのdata属性に置き、あとからdataset.orderIdやgetAttributeで読みます。",
    },
    {
      beginner: "支払状態も同じように持てますか？",
      engineer:
        "data-statusへ保存できます。見た目の文字はtextContent、識別や状態は属性、と役割を分けると後の処理が楽です。",
    },
  ],
  値がない可能性を確かめる: [
    {
      beginner: "querySelectorの結果を、確認なしでtextContentへ書いていいですか？",
      engineer:
        "対象が無いとnullなので、そのまま書くと実行時エラーになります。ifで存在を確認してから更新します。",
    },
    {
      beginner: "見つからないとき、黙ってスキップするのが安全ですか？",
      engineer:
        "重要な要素なら、分かるエラーを早めに出した方が不具合を追えます。セレクターも、壊れにくいidを使うのが基本です。",
    },
  ],
  // update summary shares title "この講義の要点" — disambiguate by lesson via composite keys below
};

/** lessonId::title → talk pairs (overrides title-only for repeated 要点) */
const TALKS_BY_LESSON_TITLE = {
  "js-dom-tree::この講義の要点": TALKS_BY_TITLE["この講義の要点"],
  "js-dom-update::この講義の要点": [
    {
      beginner: "要素を更新するとき、何をどの道具で変えると整理しやすいですか？",
      engineer:
        "文字はtextContent、状態の見た目はclassList、注文idなどの識別情報はdata属性、と目的別に分けます。",
    },
    {
      beginner: "データと画面がずれたときは、どちらを正にしますか？",
      engineer:
        "配列などのデータを正にし、そこから表示を作り直します。要素が無い場合も考えて、nullのまま触らないようにします。",
    },
  ],
  "js-dom-create::createElementで部品を作る": [
    {
      beginner: "注文行のliは、最初からHTMLに書いておく必要がありますか？",
      engineer:
        "動的に増やすならcreateElementでメモリ上に作れます。タグ名から要素を作り、顧客名などはtextContentで入れます。",
    },
    {
      beginner: "createElementした瞬間に、画面へ出ますか？",
      engineer:
        "出ません。作っただけでは木に繋がっていないので、あとで親へ追加して初めて表示されます。",
    },
  ],
  "js-dom-create::appendで親へつなぐ": [
    {
      beginner: "作ったliを画面に出すには、何をすればいいですか？",
      engineer:
        "order-listなど親要素へappendします。子を親の末尾へ足すと、DOMツリーに反映されて表示されます。",
    },
    {
      beginner: "行の中の小さなspanも、同じ流れですか？",
      engineer:
        "はい。先にspanを行へappendし、最後に行を一覧へappendする、と内側から組み立てると追いやすいです。複数も一度に渡せます。",
    },
  ],
  "js-dom-create::renderは配列から画面を作る": [
    {
      beginner: "注文を足すたびに、古い行の横へつぎ足し続けるのが普通ですか？",
      engineer:
        "ずれやすいので、renderOrdersのように配列を正として一覧を作り直す方が整理しやすいです。",
    },
    {
      beginner: "作り直す前に、古い行はどうしますか？",
      engineer:
        "replaceChildrenで空にしてから、forEachで注文ごとに行を作ります。件数表示も同じ配列のlengthから更新します。",
    },
  ],
  "js-dom-create::innerHTMLを避けて文字を守る": [
    {
      beginner: "顧客名をinnerHTMLへ連結すれば、短く書けそうですが？",
      engineer:
        "外から入る文字がタグとして解釈される危険があります。要素はcreateElement、文字はtextContent、が安全です。",
    },
    {
      beginner: "textContentなら、尖ったカッコを含む名前も大丈夫ですか？",
      engineer:
        "文字として表示されるので、HTMLとして実行されません。利用者の値をHTML文字列へ連結しない、が要点です。",
    },
  ],
  "js-dom-create::この講義の要点": [
    {
      beginner: "注文行を画面へ出す手順を、短い順で確認したいです。",
      engineer:
        "createElementで作り、textContentで文字を入れ、appendで親へつなぎます。これをrenderにまとめれば、ordersから同じ画面を再現できます。",
    },
    {
      beginner: "なぜrenderにまとめる価値があるんですか？",
      engineer:
        "追加・削除・絞り込みのあとも、同じ関数で安全に描き直せるからです。画面をバラバラにいじるよりずれが減ります。",
    },
  ],
  "js-dom-event::addEventListenerでクリックを待つ": [
    {
      beginner: "ボタンを押した処理は、登録した瞬間に一度だけ動くんですか？",
      engineer:
        "いいえ。addEventListenerの第2引数はコールバックなので、登録時は実行せず、クリックのたびに呼ばれます。",
    },
    {
      beginner: "イベント名は自由に付けられますか？",
      engineer:
        "ブラウザが決めた名前を使います。押す操作ならclickです。関数そのものを渡す点は、これまで学んだコールバックと同じです。",
    },
  ],
  "js-dom-event::event.targetは操作された場所": [
    {
      beginner: "リスナーの中で、どの要素が押されたかはどう分かりますか？",
      engineer:
        "引数のeventに発生情報が入り、event.targetが最初に操作された要素です。",
    },
    {
      beginner: "targetをそのまま信用して、すぐにdatasetを読んでいいですか？",
      engineer:
        "内側の子要素のこともあるので、要素の型やmatchesで「意図したボタンか」を確かめてから使います。",
    },
  ],
  "js-dom-event::datasetで注文idを受け渡す": [
    {
      beginner: "押された注文を特定するために、ボタン文言へ番号を書きますか？",
      engineer:
        "表示文字に埋め込まなくても、data-order-idを付けておけばクリック時にdataset.orderIdから読めます。",
    },
    {
      beginner: "読んだidはどうやってordersと結び付けますか？",
      engineer:
        "datasetの値は文字列なので、findでordersから同じidの注文を探します。DOMに残る小さな識別情報、と考えるとよいです。",
    },
  ],
  "js-dom-event::currentTargetは登録した要素": [
    {
      beginner: "targetとcurrentTargetは、同じものだと思っていました。",
      engineer:
        "違うことがあります。targetは実際の発生元、currentTargetはリスナーを登録した要素です。",
    },
    {
      beginner: "ボタンのdatasetを読むなら、どちらが安定しますか？",
      engineer:
        "アイコンや文字がtargetになることがあるので、登録先のcurrentTargetから読む方が安定します。用途で読み分けます。",
    },
  ],
  "js-dom-event::この講義の要点": [
    {
      beginner: "イベント処理で忘れやすい点を整理したいです。",
      engineer:
        "リスナーには関数を渡し、操作が起きたときにコールバックが動きます。targetとcurrentTargetを区別し、datasetから注文idを読みます。",
    },
    {
      beginner: "表示文字と注文データのつなぎは、どこに置きますか？",
      engineer:
        "data属性です。画面の文言を解析するより、識別情報をDOMに持たせてordersと結び付ける方が安全です。",
    },
  ],
  "js-dom-form::submitイベントで送信をまとめる": [
    {
      beginner: "送信ボタンのclickだけ聞けば、フォーム入力は取れますか？",
      engineer:
        "Enterキー送信を取りこぼします。formへsubmitを登録すると、押し方に関係なく同じ入口になります。",
    },
    {
      beginner: "submitを受けると、ページが再読み込みされませんか？",
      engineer:
        "既定の送信を止めるためpreventDefaultを呼びます。止めたあとに、自分で入力の処理を続けます。",
    },
  ],
  "js-dom-form::FormDataで名前付き入力を読む": [
    {
      beginner: "入力欄を1つずつquerySelectorで拾う必要がありますか？",
      engineer:
        "FormDataへformを渡せば、name属性を鍵にして値を読めます。customer・item・totalなど、画面とデータで共通の名前にします。",
    },
    {
      beginner: "金額も文字列のまま足して大丈夫ですか？",
      engineer:
        "getの結果は文字列などなので、数値にしたい欄はNumberで変換します。名前が揃っていると読み取りが一か所にまとまります。",
    },
  ],
  "js-dom-form::空欄と金額を検証する": [
    {
      beginner: "入力をそのままordersへ足して、あとで直せばいいですか？",
      engineer:
        "追加前に検証します。顧客名と商品名はtrim後に空でないか、合計は正の数かを確かめ、不正なら配列を変えずにreturnします。",
    },
    {
      beginner: "失敗したことは、利用者にどう伝えますか？",
      engineer:
        "messageなどへ理由を表示します。Number.isFiniteで数値を確かめ、空白だけの入力もtrimで防ぎます。",
    },
  ],
  "js-dom-form::検証後にordersへ追加する": [
    {
      beginner: "検証を通ったあとの順番を確認したいです。",
      engineer:
        "注文オブジェクトを作り、ordersへ追加し、renderOrdersで再描画し、フォームをresetします。初期statusはunpaidに揃えます。",
    },
    {
      beginner: "注文の形がバラバラだと何が困りますか？",
      engineer:
        "描画や保存のたびに例外が出やすくなります。追加する形を一か所で揃えると、あとが安定します。",
    },
  ],
  "js-dom-form::この講義の要点": [
    {
      beginner: "フォームから注文を受け取る流れを短く言えますか？",
      engineer:
        "submitで受けてpreventDefaultし、FormDataでnameから読み、検証を通ったものだけ追加してrenderします。",
    },
    {
      beginner: "データ変更と画面更新のタイミングは？",
      engineer:
        "配列を先に変え、そのあと再描画します。検証に落ちたときは配列も画面の件数も変えません。",
    },
  ],
  "js-dom-filter::ordersを画面の元データにする": [
    {
      beginner: "支払済みにしたとき、DOMの文字だけ書き換えれば足りますか？",
      engineer:
        "DOMだけ直し続けると、再描画や保存とずれます。まずordersを変え、その結果をrenderへ渡すのが中心です。",
    },
    {
      beginner: "配列を正しい状態の置き場にする、とはどういう意味ですか？",
      engineer:
        "画面に見えているものが一時的でも、正はordersだという考え方です。変更後は必ずrenderを呼び、表示をデータに合わせます。",
    },
  ],
  "js-dom-filter::filterで表示対象を選ぶ": [
    {
      beginner: "未払いだけ見せるとき、ordersから未払い以外を消しますか？",
      engineer:
        "消すと元データが失われます。filterで表示用の新しい配列を作り、paid/unpaidを比較します。allなら元配列を使います。",
    },
    {
      beginner: "filterは元のordersを書き換えますか？",
      engineer:
        "書き換えません。選んだ結果の新しい配列が返り、元は残ります。表示と保存用の正本を分けられます。",
    },
  ],
  "js-dom-filter::changeのたびに再描画する": [
    {
      beginner: "絞り込みは、ページを読み直したときだけ実行すればいいですか？",
      engineer:
        "選択欄のchangeのたびに、現在のvalueで絞り込み、renderOrdersへ渡します。件数はfiltered.lengthに合わせます。",
    },
    {
      beginner: "selectの値はどう読みますか？",
      engineer:
        "select.valueが選択中の値です。それを条件にfilterし、見えている注文だけを描画します。",
    },
  ],
  "js-dom-filter::イベント委譲で作り直しに強くする": [
    {
      beginner: "各支払ボタンへ毎回addEventListenerすれば確実ですか？",
      engineer:
        "renderで行を作り直すと、古いボタンのリスナーは消えます。order-listなど親へ一つ登録し、closestでボタンを探す委譲が向きます。",
    },
    {
      beginner: "親で受けたあと、どの注文を更新しますか？",
      engineer:
        "見つかったボタンのdatasetのidでordersを更新し、もう一度renderします。新しい行も同じ親リスナーで処理できます。",
    },
  ],
  "js-dom-filter::この講義の要点": [
    {
      beginner: "絞り込み表示の正しい順番は何ですか？",
      engineer:
        "ordersを先に変更し、filterで表示対象を計算し、renderします。作り直される子のクリックは、親への委譲でまとめます。",
    },
    {
      beginner: "画面に見えている件数と、保存したい全件は同じ配列ですか？",
      engineer:
        "違うことがあります。正本はorders、画面はfilter後です。件数表示も、今見えている配列のlengthに合わせます。",
    },
  ],
  "js-dom-storage::JSONで配列を文字列にする": [
    {
      beginner: "orders配列を、そのままlocalStorageへ渡せますか？",
      engineer:
        "localStorageが保存できるのは文字列です。JSON.stringifyで文字列へ変換し、戻すときはJSON.parseを使います。",
    },
    {
      beginner: "stringifyとparseで、注文の形は保てますか？",
      engineer:
        "通常のオブジェクトや配列なら保てます。保存前後で同じ欄があるか確認し、表示や集計に使える形を維持します。",
    },
  ],
  "js-dom-storage::localStorageへ名前を付けて保存する": [
    {
      beginner: "保存する場所はどう決めますか？",
      engineer:
        "setItemの第1引数が鍵です。注文管理ではordersなど一貫した名前にJSON文字列を入れ、変更のたびに同じ鍵を更新します。",
    },
    {
      beginner: "いつsetItemを呼べばいいですか？",
      engineer:
        "注文の追加や状態変更など、ordersが変わった直後です。値は必ず文字列なので、先にstringifyします。",
    },
  ],
  "js-dom-storage::起動時に保存済み注文を戻す": [
    {
      beginner: "ページを開いた直後、いつも空の一覧から始まりますか？",
      engineer:
        "getItemで鍵を読めば、以前の注文を戻せます。値がなければnullなので、そのときは空配列を使います。",
    },
    {
      beginner: "復元したあとは何をしますか？",
      engineer:
        "値がある場合だけparseし、配列をordersへ入れたらrenderOrdersを呼びます。再読み込み後も同じ画面に戻せます。",
    },
  ],
  "js-dom-storage::壊れた保存値は空配列へ戻す": [
    {
      beginner: "保存文字列が壊れていたら、parseはそのまま成功しますか？",
      engineer:
        "壊れていると例外になります。try/catchで囲み、失敗時は案内を出して空配列へ戻します。",
    },
    {
      beginner: "parseできても配列でない値だったら？",
      engineer:
        "Array.isArrayで形を確認します。配列でなければ拒否し、安全な初期状態へ戻すのが基本です。",
    },
  ],
  "js-dom-storage::この講義の要点": [
    {
      beginner: "ブラウザ保存の流れを短くまとめてください。",
      engineer:
        "stringifyしてlocalStorageへ保存し、起動時はparseして復元します。未保存・壊れたJSON・配列でない値は、空配列へ代替します。",
    },
    {
      beginner: "失敗した読み込みを、黙って無視してよいですか？",
      engineer:
        "利用者へ案内を出し、空の一覧として再出発できる状態にした方が安全です。try/catchと形の確認がセットです。",
    },
  ],
  "js-dom-fetch::fetchで注文APIへ要求する": [
    {
      beginner: "fetchを呼んだ瞬間に、注文配列が返ってきますか？",
      engineer:
        "すぐには最終データは来ません。ResponseのPromiseが返るので、awaitでResponseを待ち、続けてresponse.jsonもawaitします。",
    },
    {
      beginner: "この講座のデモは、本当に外部サイトへ取りに行きますか？",
      engineer:
        "外部通信ではなく、同じアプリの/api/demo-ordersから取得する想定です。流れは本番のfetchと同じです。",
    },
  ],
  "js-dom-fetch::読み込み中を先に表示する": [
    {
      beginner: "通信が終わるまで、画面は何も変えなくていいですか？",
      engineer:
        "止まって見えるので、fetchより前にmessageを「読み込み中...」へ変えます。完了後に案内を更新します。",
    },
    {
      beginner: "成功と失敗で、別の要素を用意する必要がありますか？",
      engineer:
        "同じmessage要素を状態表示に使えば足ります。loading・成功・errorを、同じ場所の文言で切り替えます。",
    },
  ],
  "js-dom-fetch::HTTP失敗をokで確認する": [
    {
      beginner: "fetchが例外を投げなければ、中身は成功データですか？",
      engineer:
        "404や500でもResponseは返ることがあります。response.okがfalseなら成功として扱わず、throwしてcatchへ移します。",
    },
    {
      beginner: "失敗したとき、一覧はどうしますか？",
      engineer:
        "利用者向けの案内を出し、一覧は安全な状態（空や直前の正本）に保ちます。ok確認を飛ばさないのが要点です。",
    },
  ],
  "js-dom-fetch::取得したordersをrenderへ渡す": [
    {
      beginner: "APIのJSONを、その場でDOMへ直接書き込みますか？",
      engineer:
        "まずorders状態へ代入し、描画はrenderOrdersへ任せます。通信とDOM生成を分けると、保存済み注文にも同じrenderを使えます。",
    },
    {
      beginner: "成功と失敗でmessageはどう分けますか？",
      engineer:
        "成功なら件数や完了の案内、失敗なら理由です。どちらも、一覧更新の方針とセットで決めます。",
    },
  ],
  "js-dom-fetch::この講義の要点": [
    {
      beginner: "APIから注文を読む完成形の手順は？",
      engineer:
        "読み込み中を示し、fetchとjsonをawaitし、okで成否を確認し、成功したordersをrenderへ渡します。",
    },
    {
      beginner: "失敗しても画面を保つ、とは具体的に何ですか？",
      engineer:
        "理由をmessageへ出し、壊れたデータで描画を続けないことです。loading・成功・errorをはっきり切り替えます。",
    },
  ],
};

function talkLines(pairs) {
  return pairs.flatMap((pair) => [
    { speaker: "beginner", text: pair.beginner },
    { speaker: "engineer", text: pair.engineer },
  ]);
}

function resolveTalk(lessonId, title) {
  const key = `${lessonId}::${title}`;
  if (TALKS_BY_LESSON_TITLE[key]) return talkLines(TALKS_BY_LESSON_TITLE[key]);
  if (TALKS_BY_TITLE[title]) return talkLines(TALKS_BY_TITLE[title]);
  return null;
}

function nameOf(node) {
  return ts.isIdentifier(node) || ts.isStringLiteral(node) ? node.text : "";
}

function textOf(node) {
  return node &&
    (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    ? node.text
    : "";
}

function fieldsOf(node) {
  return new Map(
    node.properties
      .filter(ts.isPropertyAssignment)
      .map((property) => [nameOf(property.name), property.initializer]),
  );
}

function makeTalkArray(lines) {
  return ts.factory.createArrayLiteralExpression(
    lines.map((line) =>
      ts.factory.createObjectLiteralExpression([
        ts.factory.createPropertyAssignment(
          "speaker",
          ts.factory.createStringLiteral(line.speaker),
        ),
        ts.factory.createPropertyAssignment(
          "text",
          ts.factory.createStringLiteral(line.text),
        ),
      ]),
    ),
    true,
  );
}

const sourceText = fs.readFileSync(COURSE_FILE, "utf8");
const sourceFile = ts.createSourceFile(
  COURSE_FILE,
  sourceText,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
);

/** @type {{ start: number; end: number; text: string }[]} */
const replacements = [];
let currentLessonId = "";
let missing = [];

function visit(node) {
  if (ts.isObjectLiteralExpression(node)) {
    const fields = fieldsOf(node);
    const id = textOf(fields.get("id"));
    if (id.startsWith("js-dom-") && !id.includes("-q") && fields.has("slides")) {
      currentLessonId = id;
    }
    const title = textOf(fields.get("title"));
    const talk = fields.get("talk");
    if (
      title &&
      talk &&
      ts.isArrayLiteralExpression(talk) &&
      currentLessonId &&
      fields.has("lead")
    ) {
      const lines = resolveTalk(currentLessonId, title);
      if (!lines) {
        missing.push(`${currentLessonId}::${title}`);
      } else {
        const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
        const printed = printer.printNode(
          ts.EmitHint.Expression,
          makeTalkArray(lines),
          sourceFile,
        );
        replacements.push({
          start: talk.getStart(sourceFile),
          end: talk.getEnd(),
          text: printed,
        });
      }
    }
  }
  ts.forEachChild(node, visit);
}

visit(sourceFile);

if (missing.length) {
  console.error("talk未定義:", missing.join(", "));
  process.exit(1);
}

replacements.sort((a, b) => b.start - a.start);
let next = sourceText;
for (const item of replacements) {
  next = next.slice(0, item.start) + item.text + next.slice(item.end);
}

fs.writeFileSync(COURSE_FILE, next);
console.log(`DOM talk を ${replacements.length} 箇所書き換えました。`);
