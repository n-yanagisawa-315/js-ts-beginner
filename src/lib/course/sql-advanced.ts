import type { Lesson } from "@/lib/course/types";

const shopSchema = `
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  area TEXT NOT NULL
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  item TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  status TEXT,
  ordered_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);`.trim();

const shopSeed = `
INSERT INTO customers (id, name, area) VALUES
  (1, '田中', '東京'),
  (2, '佐藤', '大阪'),
  (3, '鈴木', '東京'),
  (4, '高橋', '福岡');
INSERT INTO orders (id, customer_id, item, quantity, unit_price, status, ordered_at) VALUES
  (101, 1, 'コーヒー', 2, 500, '発送済み', '2026-09-01'),
  (102, 2, '紅茶', 1, 600, NULL, '2026-09-03'),
  (103, 1, 'マグカップ', 3, 800, '準備中', '2026-09-02'),
  (104, 3, 'コーヒー', 1, 500, '発送済み', '2026-09-04'),
  (105, 2, '紅茶', 4, 600, '準備中', '2026-09-05');`.trim();

export const sqlAdvanced: Lesson[] = [
  {
    id: "sql-group-by-item",
    track: "sql",
    level: "middle",
    chapter: "sql-group",
    order: 8,
    title: "商品ごとの売上をまとめる",
    summary: "GROUP BYで同じ商品を束ね、グループ単位で集計する",
    minutes: 25,
    story: {
      project: "仕入れ会議の売上レポート",
      incident: "全体の合計だけでは、人気商品が分からなかった",
      outcome: "商品ごとの販売数量を1行ずつ表示する",
    },
    objectives: [
      { id: "sql-group-by", label: "GROUP BYで分類ごとの集計ができる", conceptIds: ["group-by", "aggregate"] },
    ],
    slides: [
      {
        title: "全体をひとつにするだけでは足りない",
        lead: "SUM(quantity)だけなら、すべての商品の数量がひとつになります。仕入れ判断には、商品ごとの小計が必要です。",
        points: ["集計前は注文ごとの行", "同じitemをひとつの組にする", "各組でSUMを計算する"],
        diagram: "sql-group",
        storyBeat: "problem",
        talk: [
          { speaker: "beginner", text: "WHEREで商品を1つずつ検索しますか？" },
          { speaker: "engineer", text: "GROUP BYなら、すべての商品グループを一度に作れます。" },
        ],
      },
      {
        title: "GROUP BYは同じ値の箱を作る",
        lead: "GROUP BY itemは、itemが同じ行を箱へ集めます。SELECTには箱の名札itemと、その箱の集計を書くのが基本です。",
        points: ["itemが分類の基準", "SUMは各分類の中で動く", "結果は商品ごとに1行"],
        diagram: "sql-group",
        code: "SELECT item, SUM(quantity) AS total_quantity\nFROM orders\nGROUP BY item;",
        storyBeat: "trace",
      },
      {
        title: "表示順も必要なら最後に決める",
        lead: "GROUP BYは分類するだけで、結果の順番を保証しません。販売数の多い順ならORDER BYを追加します。",
        points: ["分類と並べ替えは別", "集計の別名をORDER BYで使える", "同数時の順番も追加できる"],
        diagram: "sql-group",
        code: "ORDER BY total_quantity DESC, item ASC",
        storyBeat: "transfer",
      },
    ],
    questions: [
      {
        id: "group-result",
        prompt: "GROUP BY itemを使ったとき、結果の基本単位はどれですか？",
        kind: "choice",
        options: ["注文ごと", "商品ごと", "列ごと"],
        answer: "商品ごと",
        explain: "同じitemの行がまとまり、商品ごとに集計されます。",
        hints: ["GROUP BYの後ろの列を見ます。", "同じ値をひとつの箱にします。", "itemが箱の名札です。"],
      },
      {
        id: "group-keyword",
        prompt: "同じ値の行をグループにする句を2語で入力してください。",
        kind: "input",
        answer: "GROUP BY",
        aliases: ["group by"],
        explain: "GROUP BYの後ろに分類の基準となる列を書きます。",
        hints: ["2語目はBYです。", "集計関数と一緒に使います。", "Gから始まる句です。"],
      },
      {
        id: "quantity-by-item",
        prompt: "商品ごとの販売数量を求め、itemの昇順で表示してください。合計列名はtotal_quantityにします。",
        kind: "sql",
        runtime: "sql",
        starter: `SELECT item, SUM(quantity) AS total_quantity
FROM orders
GROUP BY
ORDER BY item ASC;`,
        sqlSchema: shopSchema,
        sqlSeed: shopSeed,
        sqlExpectedRows: [
          { item: "コーヒー", total_quantity: 3 },
          { item: "マグカップ", total_quantity: 3 },
          { item: "紅茶", total_quantity: 5 },
        ],
        answer: "SELECT item, SUM(quantity) AS total_quantity FROM orders GROUP BY item ORDER BY item ASC;",
        explain: "itemで分類して各グループのquantityを合計します。",
        hints: ["SELECTに分類の名札はすでにあります。", "GROUP BYの後ろは同じ商品を見分ける列です。", "ORDER BYは完成しているので分類基準に集中します。"],
      },
    ],
  },
  {
    id: "sql-inner-join",
    track: "sql",
    level: "middle",
    chapter: "sql-join",
    order: 9,
    title: "注文にお客様名をつなぐ",
    summary: "INNER JOINとONで2つのテーブルを対応付ける",
    minutes: 26,
    story: {
      project: "発送担当への注文票",
      incident: "ordersにはcustomer_idしかなく、担当者が名前を調べ直していた",
      outcome: "注文と顧客をキーで結んだ一覧を作る",
    },
    objectives: [
      { id: "sql-inner-join", label: "主キーと外部キーをONで結べる", conceptIds: ["join", "foreign-key"] },
    ],
    slides: [
      {
        title: "情報を分けると重複を減らせる",
        lead: "顧客名を注文のたびに保存すると、改名時に何行も直します。ordersには顧客番号、customersには顧客情報を置きます。",
        points: ["customers.idが顧客の番号", "orders.customer_idが相手の番号", "番号を手がかりにつなぐ"],
        diagram: "sql-join",
        storyBeat: "problem",
        talk: [
          { speaker: "beginner", text: "同じ行番号同士をつなぎますか？" },
          { speaker: "engineer", text: "行の位置ではなく、値が一致するキーを使います。" },
        ],
      },
      {
        title: "ONがつなぐ条件",
        lead: "JOINで相手の表を指定し、ONでどの列同士が同じなら対応するかを書きます。",
        points: ["JOIN customersで相手を指定", "ONは対応条件", "テーブル名.列名で曖昧さをなくす"],
        diagram: "sql-join",
        code: "FROM orders\nJOIN customers\n  ON orders.customer_id = customers.id",
        storyBeat: "trace",
      },
      {
        title: "一致した組だけが結果になる",
        lead: "通常のJOINはINNER JOINの省略形です。ONの相手が見つかった注文だけを結果へ載せます。",
        points: ["一致する顧客を横につなぐ", "同名列はテーブル名を付ける", "必要な列だけSELECTする"],
        diagram: "sql-join",
        storyBeat: "resolution",
      },
    ],
    questions: [
      {
        id: "join-condition",
        prompt: "テーブル同士の対応条件を書くキーワードはどれですか？",
        kind: "choice",
        options: ["ON", "AS", "LIMIT"],
        answer: "ON",
        explain: "ONの後ろに、対応するキー同士の比較を書きます。",
        hints: ["JOINの直後で使います。", "列同士が一致する条件です。", "2文字のキーワードです。"],
      },
      {
        id: "customer-key",
        prompt: "orders側で顧客番号を持つ列名を入力してください。",
        kind: "input",
        answer: "customer_id",
        explain: "orders.customer_idがcustomers.idを参照します。",
        hints: ["customers側のidと対応します。", "顧客を表す英単語を含みます。", "末尾は_idです。"],
      },
      {
        id: "orders-with-name",
        prompt: "注文idと顧客名nameを注文idの昇順で読み出してください。",
        kind: "sql",
        runtime: "sql",
        starter: `SELECT orders.id, customers.name
FROM orders
JOIN customers
  ON
ORDER BY orders.id ASC;`,
        sqlSchema: shopSchema,
        sqlSeed: shopSeed,
        sqlExpectedRows: [
          { id: 101, name: "田中" },
          { id: 102, name: "佐藤" },
          { id: 103, name: "田中" },
          { id: 104, name: "鈴木" },
          { id: 105, name: "佐藤" },
        ],
        answer: "SELECT orders.id, customers.name FROM orders JOIN customers ON orders.customer_id = customers.id ORDER BY orders.id ASC;",
        explain: "注文のcustomer_idと顧客のidを一致条件にすると名前を取得できます。",
        hints: ["ONには左右のキーを書きます。", "orders側は顧客番号を持つ列です。", "customers側ではidが顧客を一意に表します。"],
      },
    ],
  },
  {
    id: "sql-left-join",
    track: "sql",
    level: "middle",
    chapter: "sql-join",
    order: 10,
    title: "注文のないお客様も一覧に残す",
    summary: "LEFT JOINで左側の行を失わずに結合する",
    minutes: 25,
    story: {
      project: "休眠顧客の確認",
      incident: "通常のJOINでは注文のない高橋さんが一覧から消えた",
      outcome: "全顧客を残し、注文がない人も発見する",
    },
    objectives: [
      { id: "sql-left-join", label: "INNER JOINとLEFT JOINを使い分けられる", conceptIds: ["left-join", "null"] },
    ],
    slides: [
      {
        title: "どちらを全員残したいか",
        lead: "JOINでは対応がない行は消えます。今回は「すべての顧客」が主役なので、customersを左側に置きます。",
        points: ["左側が基準の一覧", "注文なしの顧客も必要", "表の順番に意味がある"],
        diagram: "sql-join",
        storyBeat: "problem",
      },
      {
        title: "LEFT JOINは左を守る",
        lead: "対応する注文がなくても左側の顧客行は残り、右側の注文列はNULLになります。",
        points: ["customersの全行を残す", "一致すれば横につなぐ", "不一致の右側はNULL"],
        diagram: "sql-join",
        code: "FROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id",
        storyBeat: "trace",
        talk: [
          { speaker: "beginner", text: "LEFTは画面の左側という意味ですか？" },
          { speaker: "engineer", text: "SQLのFROMに先に書いたテーブル側を指します。" },
        ],
      },
      {
        title: "NULLを手がかりに未注文を探す",
        lead: "LEFT JOIN後にorders.idがNULLなら、対応する注文が見つからなかった顧客です。",
        points: ["結合後のNULLには意味がある", "WHERE orders.id IS NULL", "元の顧客情報は残る"],
        diagram: "sql-join",
        code: "WHERE orders.id IS NULL",
        storyBeat: "transfer",
      },
    ],
    questions: [
      {
        id: "left-keeps",
        prompt: "LEFT JOINで必ず残るのはどちらですか？",
        kind: "choice",
        options: ["左側テーブルの行", "右側テーブルの行", "一致しない行だけ"],
        answer: "左側テーブルの行",
        explain: "対応がなくても左側の行は残り、右側の列がNULLになります。",
        hints: ["JOIN名に方向があります。", "FROMに先に書く側です。", "基準にした一覧を守ります。"],
      },
      {
        id: "missing-right",
        prompt: "結合相手がないとき、右側の列に入る特別な状態を入力してください。",
        kind: "input",
        answer: "NULL",
        aliases: ["null"],
        explain: "対応する右側の行がない列はNULLになります。",
        hints: ["0や空文字ではありません。", "未設定を表す特別な状態です。", "4文字のSQL語です。"],
      },
      {
        id: "customers-without-orders",
        prompt: "注文が1件もない顧客のidとnameを読み出してください。",
        kind: "sql",
        runtime: "sql",
        starter: `SELECT customers.id, customers.name
FROM customers
LEFT JOIN orders
  ON customers.id = orders.customer_id
WHERE ;`,
        sqlSchema: shopSchema,
        sqlSeed: shopSeed,
        sqlExpectedRows: [{ id: 4, name: "高橋" }],
        answer: "SELECT customers.id, customers.name FROM customers LEFT JOIN orders ON customers.id = orders.customer_id WHERE orders.id IS NULL;",
        explain: "全顧客を残した後、対応するorders.idがない行だけに絞ります。",
        hints: ["対応の有無は右側の主キーで確認します。", "注文がなければorders.idに値がありません。", "WHEREでは未設定を判定する書き方を使います。"],
      },
    ],
  },
  {
    id: "sql-insert-update",
    track: "sql",
    level: "middle",
    chapter: "sql-write",
    order: 11,
    title: "新しい注文を登録して状態を直す",
    summary: "INSERTで行を追加し、UPDATEで対象行を更新する",
    minutes: 28,
    story: {
      project: "電話注文の受付",
      incident: "新規注文を登録後、発送準備へ状態を進める必要が出た",
      outcome: "列と値を対応させて追加し、1件だけ安全に更新する",
    },
    objectives: [
      { id: "sql-insert-update", label: "INSERTとWHERE付きUPDATEを実行できる", conceptIds: ["insert", "update"] },
    ],
    slides: [
      {
        title: "INSERTは新しい行を棚へ入れる",
        lead: "INSERT INTOの後ろに表と列、VALUESの後ろに同じ順番の値を書きます。列数と値数をそろえます。",
        points: ["列名と値は位置で対応", "文字は引用符で囲む", "NOT NULL列を忘れない"],
        diagram: "sql-write",
        code: "INSERT INTO orders (id, customer_id, item, quantity, unit_price, status, ordered_at)\nVALUES (106, 4, 'クッキー', 2, 300, '受付済み', '2026-09-06');",
        storyBeat: "trace",
      },
      {
        title: "UPDATEは既存行を書き換える",
        lead: "SETで新しい値を指定し、WHEREで対象を限定します。WHEREがなければ全注文が変わるので、先に対象を確認します。",
        points: ["UPDATEの後ろは表", "SETは変更内容", "WHEREは変更対象"],
        diagram: "sql-write",
        code: "UPDATE orders\nSET status = '準備中'\nWHERE id = 106;",
        storyBeat: "problem",
        watch: "更新前に同じWHEREをSELECTで試す習慣を付けます。",
        talk: [
          { speaker: "beginner", text: "WHEREを書き忘れるとエラーになりますか？" },
          { speaker: "engineer", text: "エラーにならず全行が更新され得るので、特に注意が必要です。" },
        ],
      },
      {
        title: "書いた後はSELECTで確かめる",
        lead: "変更命令が成功しても、意図した行かを確認します。追加・更新と確認をひとまとまりの作業にします。",
        points: ["対象件数を意識する", "主キーidで1件を指定", "SELECTで保存結果を確認"],
        diagram: "sql-write",
        storyBeat: "resolution",
      },
    ],
    questions: [
      {
        id: "update-danger",
        prompt: "UPDATEでWHEREを書かない場合に起こり得ることはどれですか？",
        kind: "choice",
        options: ["全行が更新される", "必ずエラーになる", "新しい表ができる"],
        answer: "全行が更新される",
        explain: "WHEREなしのUPDATEはテーブルの全行を対象にします。",
        hints: ["WHEREは対象行を絞ります。", "絞り込みがない状態を考えます。", "変更が1件に限定されません。"],
      },
      {
        id: "insert-values",
        prompt: "INSERTで、追加する値の並びの前に書くキーワードを入力してください。",
        kind: "input",
        answer: "VALUES",
        aliases: ["values"],
        explain: "VALUESの括弧内へ、列と同じ順番で値を書きます。",
        hints: ["複数の値という英単語です。", "INSERT INTOの列一覧に対応します。", "Vから始まる6文字です。"],
      },
      {
        id: "insert-order",
        prompt: "id 106、顧客4、クッキー2個、単価300、受付済み、日付2026-09-06の注文を追加し、最後にid 106の全列をSELECTしてください。",
        kind: "sql",
        runtime: "sql",
        starter: `INSERT INTO orders (id, customer_id, item, quantity, unit_price, status, ordered_at)
VALUES ();

SELECT * FROM orders WHERE id = 106;`,
        sqlSchema: shopSchema,
        sqlSeed: shopSeed,
        sqlExpectedRows: [
          { id: 106, customer_id: 4, item: "クッキー", quantity: 2, unit_price: 300, status: "受付済み", ordered_at: "2026-09-06" },
        ],
        sqlExpectedTable: "orders",
        answer: "INSERT INTO orders (id, customer_id, item, quantity, unit_price, status, ordered_at) VALUES (106, 4, 'クッキー', 2, 300, '受付済み', '2026-09-06'); SELECT * FROM orders WHERE id = 106;",
        explain: "列一覧とVALUESを同じ順序・同じ個数にすると、新しい注文を1行追加できます。",
        hints: ["starterの列名を左から読みます。", "数値は引用符なし、文字と日付は引用符で囲みます。", "7列それぞれに問題文の値を対応させます。"],
      },
    ],
  },
  {
    id: "sql-delete-safely",
    track: "sql",
    level: "middle",
    chapter: "sql-write",
    order: 12,
    title: "取り消し注文を安全に削除する",
    summary: "DELETEの対象をSELECTで確かめ、WHEREで限定する",
    minutes: 26,
    story: {
      project: "重複注文の修正",
      incident: "テスト登録した注文だけを削除する必要が出た",
      outcome: "同じ条件で事前確認し、対象1件だけを削除する",
    },
    objectives: [
      { id: "sql-delete", label: "WHERE付きDELETEを安全な手順で使える", conceptIds: ["delete", "safe-write"] },
    ],
    slides: [
      {
        title: "DELETEは行そのものを消す",
        lead: "値の一部を直すUPDATEと違い、DELETEは対象行をテーブルから削除します。元に戻せない環境もあります。",
        points: ["DELETE FROMの後ろは表", "WHEREが対象", "列だけを消す命令ではない"],
        diagram: "sql-write",
        storyBeat: "problem",
      },
      {
        title: "先にSELECTで対象を確認する",
        lead: "DELETEへ書くWHEREを、まずSELECTで実行します。件数と内容が意図どおりなら同じ条件を使います。",
        points: ["条件を使い回す", "0件なら原因を調べる", "多すぎたら条件を狭める"],
        diagram: "sql-write",
        code: "SELECT * FROM orders WHERE id = 105;\nDELETE FROM orders WHERE id = 105;",
        storyBeat: "trace",
        talk: [
          { speaker: "beginner", text: "DELETE * FROM ordersですか？" },
          { speaker: "engineer", text: "DELETEでは*を書かず、DELETE FROM ordersと書きます。" },
        ],
      },
      {
        title: "削除後も確認する",
        lead: "同じidをSELECTして0件なら削除できています。残る注文の一覧も必要に応じて確認します。",
        points: ["実行前と実行後に確認", "主キーは対象を一意にしやすい", "重要データはトランザクションも使う"],
        diagram: "sql-write",
        storyBeat: "resolution",
      },
    ],
    questions: [
      {
        id: "delete-star",
        prompt: "ordersから行を削除する命令の始まりはどれですか？",
        kind: "choice",
        options: ["DELETE FROM orders", "DELETE * FROM orders", "REMOVE FROM orders"],
        answer: "DELETE FROM orders",
        explain: "DELETEでは*を置かず、DELETE FROM テーブル名と書きます。",
        hints: ["SQLの削除命令はDELETEです。", "対象表の前にFROMを置きます。", "SELECTと違って*は不要です。"],
      },
      {
        id: "safe-first",
        prompt: "削除対象を事前確認するときに使う読み取り命令を入力してください。",
        kind: "input",
        answer: "SELECT",
        aliases: ["select"],
        explain: "同じWHEREをSELECTで試してからDELETEすると、誤削除を減らせます。",
        hints: ["データを変更しない命令です。", "対象行を一覧で見ます。", "Sから始まる読み取り命令です。"],
      },
      {
        id: "delete-one",
        prompt: "id 105の注文だけを削除し、残った注文のidを昇順でSELECTしてください。",
        kind: "sql",
        runtime: "sql",
        starter: `DELETE FROM orders
WHERE ;

SELECT id FROM orders ORDER BY id ASC;`,
        sqlSchema: shopSchema,
        sqlSeed: shopSeed,
        sqlExpectedRows: [{ id: 101 }, { id: 102 }, { id: 103 }, { id: 104 }],
        sqlExpectedTable: "orders",
        answer: "DELETE FROM orders WHERE id = 105; SELECT id FROM orders ORDER BY id ASC;",
        explain: "主キーidで対象を1件に限定すると、他の注文を残して削除できます。",
        hints: ["WHEREには一意な列を使います。", "対象の注文番号は問題文にあります。", "DELETE後のSELECTはすでに完成しています。"],
      },
    ],
  },
  {
    id: "sql-constraints-keys",
    track: "sql",
    level: "advanced",
    chapter: "sql-transaction",
    order: 13,
    title: "制約と主キーで不正データを防ぐ",
    summary: "PRIMARY KEY・NOT NULL・CHECK・外部キーの役割を学ぶ",
    minutes: 28,
    story: {
      project: "注文DBの品質点検",
      incident: "同じ注文番号や数量0のデータが入り、集計が信用できなくなった",
      outcome: "テーブル自身に守るルールを持たせる",
    },
    objectives: [
      { id: "sql-constraints", label: "主キーと代表的な制約の役割を説明できる", conceptIds: ["primary-key", "constraints"] },
    ],
    slides: [
      {
        title: "アプリの注意だけでは守り切れない",
        lead: "入力画面で検査しても、別のツールから不正な値が来ることがあります。最後の砦としてDBに制約を置きます。",
        points: ["NOT NULLは値を必須にする", "CHECKは値の条件を守る", "制約違反は保存を拒否する"],
        diagram: "sql-transaction",
        storyBeat: "problem",
      },
      {
        title: "主キーは行の名札",
        lead: "PRIMARY KEYは各行を一意に見分ける列です。同じ値を重ねられず、NULLにもできません。",
        points: ["注文idは重複しない", "1件を安全に指定できる", "他テーブルから参照できる"],
        diagram: "sql-transaction",
        code: "id INTEGER PRIMARY KEY",
        storyBeat: "trace",
        talk: [
          { speaker: "beginner", text: "名前を主キーにできますか？" },
          { speaker: "engineer", text: "重複や変更があり得る名前より、変わらないidが向いています。" },
        ],
      },
      {
        title: "外部キーは存在する相手を指す",
        lead: "orders.customer_idはcustomers.idを参照します。存在しない顧客番号の注文を防ぎ、表同士の関係を守ります。",
        points: ["FOREIGN KEYは参照側", "REFERENCESは参照先", "JOINの対応にも使う"],
        diagram: "sql-transaction",
        storyBeat: "transfer",
      },
    ],
    questions: [
      {
        id: "primary-key-role",
        prompt: "PRIMARY KEYの役割として最も適切なものはどれですか？",
        kind: "choice",
        options: ["各行を一意に見分ける", "行を並べ替える", "文字を合計する"],
        answer: "各行を一意に見分ける",
        explain: "主キーは重複しない値で各行を識別します。",
        hints: ["行の名札に相当します。", "同じ値を2行で使えません。", "特定の1件を指せる性質です。"],
      },
      {
        id: "required-constraint",
        prompt: "列を未設定にできなくする制約を入力してください。",
        kind: "input",
        answer: "NOT NULL",
        aliases: ["not null"],
        explain: "NOT NULLを付けた列にはNULLを保存できません。",
        hints: ["NULLを許さない意味です。", "2語の制約です。", "1語目は否定を表します。"],
      },
      {
        id: "valid-insert",
        prompt: "制約を守り、id 106、顧客4、クッキー1個、単価300、受付済み、日付2026-09-06の注文を追加して、そのidとquantityをSELECTしてください。",
        kind: "sql",
        runtime: "sql",
        starter: `INSERT INTO orders (id, customer_id, item, quantity, unit_price, status, ordered_at)
VALUES (106, 4, 'クッキー', , 300, '受付済み', '2026-09-06');

SELECT id, quantity FROM orders WHERE id = 106;`,
        sqlSchema: shopSchema,
        sqlSeed: shopSeed,
        sqlExpectedRows: [{ id: 106, quantity: 1 }],
        sqlExpectedTable: "orders",
        answer: "INSERT INTO orders (id, customer_id, item, quantity, unit_price, status, ordered_at) VALUES (106, 4, 'クッキー', 1, 300, '受付済み', '2026-09-06'); SELECT id, quantity FROM orders WHERE id = 106;",
        explain: "quantityを正の数にするとCHECK制約を満たし、注文を保存できます。",
        hints: ["空欄はquantityの位置です。", "CHECKはquantity > 0を要求します。", "問題文にある個数を数値で入れます。"],
      },
    ],
  },
  {
    id: "sql-transaction",
    track: "sql",
    level: "advanced",
    chapter: "sql-transaction",
    order: 14,
    title: "複数の変更をひとまとまりにする",
    summary: "BEGIN・COMMIT・ROLLBACKで全成功か全取消を選ぶ",
    minutes: 30,
    story: {
      project: "注文確定処理",
      incident: "注文状態だけ変わり、在庫処理が失敗して途中状態が残った",
      outcome: "複数操作をひとつの取引として確定・取消する",
    },
    objectives: [
      { id: "sql-transaction", label: "トランザクションの確定と取消を使い分けられる", conceptIds: ["transaction", "commit", "rollback"] },
    ],
    slides: [
      {
        title: "途中まで成功がいちばん困る",
        lead: "注文確定では複数の変更が連動します。片方だけ保存されると、画面と実態が食い違います。",
        points: ["関連する変更をひとまとまりにする", "全部成功なら確定", "失敗なら開始前へ戻す"],
        diagram: "sql-transaction",
        storyBeat: "problem",
        talk: [
          { speaker: "beginner", text: "成功した1行だけ残した方が得では？" },
          { speaker: "engineer", text: "一組の処理なら、半端な成功はデータの矛盾になります。" },
        ],
      },
      {
        title: "BEGINからCOMMITまでが1取引",
        lead: "BEGINで取引を始め、すべて確認できたらCOMMITします。COMMIT後は変更が確定します。",
        points: ["BEGINは開始", "途中で複数SQLを実行", "COMMITは確定"],
        diagram: "sql-transaction",
        code: "BEGIN;\nUPDATE orders SET status = '発送済み' WHERE id = 103;\nCOMMIT;",
        storyBeat: "trace",
      },
      {
        title: "問題があればROLLBACK",
        lead: "処理中に問題が分かったらROLLBACKで、そのトランザクション内の変更を取り消します。失敗を見つける検査とセットです。",
        points: ["ROLLBACKは取引内の変更を取消", "開始前の状態へ戻る", "接続やDB製品ごとの差も確認する"],
        diagram: "sql-transaction",
        code: "BEGIN;\nUPDATE orders SET status = '発送済み' WHERE id = 103;\nROLLBACK;",
        storyBeat: "resolution",
      },
    ],
    questions: [
      {
        id: "rollback-effect",
        prompt: "ROLLBACKの役割はどれですか？",
        kind: "choice",
        options: ["取引内の変更を取り消す", "変更を確定する", "表を並べ替える"],
        answer: "取引内の変更を取り消す",
        explain: "ROLLBACKはBEGIN後の未確定な変更を開始前へ戻します。",
        hints: ["失敗時に使います。", "COMMITとは反対の働きです。", "途中状態を残さないための操作です。"],
      },
      {
        id: "commit-word",
        prompt: "トランザクション内の変更を確定するキーワードを入力してください。",
        kind: "input",
        answer: "COMMIT",
        aliases: ["commit"],
        explain: "COMMITするとトランザクション内の変更が確定します。",
        hints: ["取消ではなく確定です。", "Cから始まります。", "Gitでも「記録する」意味で見かける語です。"],
      },
      {
        id: "commit-status",
        prompt: "トランザクションを開始し、id 103のstatusを発送済みに更新して確定し、最後にidとstatusをSELECTしてください。",
        kind: "sql",
        runtime: "sql",
        starter: `BEGIN;

UPDATE orders
SET status = '発送済み'
WHERE id = 103;

;

SELECT id, status FROM orders WHERE id = 103;`,
        sqlSchema: shopSchema,
        sqlSeed: shopSeed,
        sqlExpectedRows: [{ id: 103, status: "発送済み" }],
        sqlExpectedTable: "orders",
        answer: "BEGIN; UPDATE orders SET status = '発送済み' WHERE id = 103; COMMIT; SELECT id, status FROM orders WHERE id = 103;",
        explain: "BEGIN後の更新をCOMMITすると、変更がひとまとまりで確定します。",
        hints: ["空欄は更新後・SELECT前です。", "今回は取り消さず保存します。", "変更を確定する命令を1語で置きます。"],
      },
    ],
  },
];
