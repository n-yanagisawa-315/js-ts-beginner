import type { ReactNode } from "react";
import { CodeHighlight } from "@/components/code-highlight";
import type { Listing } from "@/lib/course/diagram-listings";
import type { DiagramId } from "@/lib/course/types";

type NodeTone = "plain" | "main" | "accent" | "gone" | "negative";

function FigureNode({
  label,
  value,
  note,
  tone = "plain",
  children,
}: {
  label?: string;
  value?: string;
  note?: string;
  tone?: NodeTone;
  children?: ReactNode;
}) {
  return (
    <div
      className={`figure-node${
        tone === "plain" ? "" : ` is-${tone}`
      }`}
    >
      {label ? <p>{label}</p> : null}
      {value ? <strong>{value}</strong> : null}
      {note ? <small>{note}</small> : null}
      {children}
    </div>
  );
}

function FigureArrow({ label }: { label: string }) {
  return (
    <p className="figure-arrow">
      <svg width="28" height="10" viewBox="0 0 28 10" aria-hidden="true">
        <path
          d="M0 5h22M19 2l5 3-5 3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
      <span>{label}</span>
    </p>
  );
}

function FigureFlow({ children }: { children: ReactNode }) {
  return <div className="figure-flow">{children}</div>;
}

function FigureContrast({
  left,
  right,
  rightTone = "emphasis",
}: {
  left: { label: string; body: ReactNode };
  right: { label: string; body: ReactNode };
  rightTone?: "emphasis" | "negative";
}) {
  return (
    <div className="figure-contrast">
      <div className="figure-contrast-side">
        <p className="figure-contrast-label">{left.label}</p>
        {left.body}
      </div>
      <div className={`figure-contrast-side is-${rightTone}`}>
        <p className="figure-contrast-label">{right.label}</p>
        {right.body}
      </div>
    </div>
  );
}

function FigureNest({
  label,
  value,
  note,
  main = false,
  children,
}: {
  label: string;
  value?: string;
  note?: string;
  main?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`figure-nest${main ? " is-main" : ""}`}>
      <p className="figure-nest-title">{label}</p>
      {value ? <p className="figure-nest-value">{value}</p> : null}
      {note ? <p className="figure-nest-note">{note}</p> : null}
      {children}
    </div>
  );
}

function FigureTree({
  root,
  items,
}: {
  root: { label: string; value: string };
  items: Array<{ label: string; value: string; tone?: NodeTone }>;
}) {
  return (
    <div className="figure-tree">
      <FigureNode label={root.label} value={root.value} tone="main" />
      <div className="figure-tree-children">
        {items.map((child) => (
          <FigureNode
            key={`${child.label}-${child.value}`}
            label={child.label}
            value={child.value}
            tone={child.tone ?? "plain"}
          />
        ))}
      </div>
    </div>
  );
}

function FigureRail({
  steps,
  mainIndex = 0,
}: {
  steps: Array<{ title: string; note?: string }>;
  mainIndex?: number;
}) {
  return (
    <ol className="figure-rail">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className={`figure-rail-step${index === mainIndex ? " is-main" : ""}`}
        >
          <span className="figure-rail-index" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="figure-rail-copy">
            <strong>{step.title}</strong>
            {step.note ? <small>{step.note}</small> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function FigureNote({ title, body }: { title: string; body: string }) {
  return (
    <div className="figure-note">
      <strong>{title}</strong>
      <small>{body}</small>
    </div>
  );
}

function FigureTrace({
  rows,
  label,
}: {
  label: string;
  rows: Array<{ when: string; what: string; note: string }>;
}) {
  return (
    <div className="figure-trace" role="table" aria-label={label}>
      {rows.map((row) => (
        <p key={`${row.when}-${row.what}`} className="figure-trace-row" role="row">
          <span role="cell">{row.when}</span>
          <strong role="cell">{row.what}</strong>
          <small role="cell">{row.note}</small>
        </p>
      ))}
    </div>
  );
}

function FigureList({
  items,
}: {
  items: Array<{ code: string; note: string }>;
}) {
  return (
    <div className="figure-list">
      {items.map((item) => (
        <p key={item.code}>
          <strong>{item.code}</strong>
          <span>{item.note}</span>
        </p>
      ))}
    </div>
  );
}

function DiagramContent({ id }: { id: DiagramId }) {
  switch (id) {
    case "sequence":
      return (
        <FigureRail
          mainIndex={0}
          steps={[
            { title: "1行目を実行して終わる", note: 'console.log("いち")' },
            { title: "2行目を実行して終わる", note: 'console.log("に")' },
            { title: "3行目へ進む", note: "前が終わるまで始まらない" },
          ]}
        />
      );
    case "values":
      return (
        <FigureFlow>
          <FigureNode label="number" value="3" tone="main" />
          <FigureNode label="string" value={'"Aya"'} />
          <FigureNode label="boolean" value="true" />
        </FigureFlow>
      );
    case "label":
      return (
        <FigureFlow>
          <FigureNode label="name" value={'"Aya"'} tone="main" />
          <FigureArrow label="名前が値を指す" />
          <FigureNode label="age" value="20" />
        </FigureFlow>
      );
    case "rewrite":
      return (
        <FigureFlow>
          <FigureNode label="age" value="20" tone="gone" />
          <FigureArrow label="付け替え" />
          <FigureNode label="age" value="21" tone="main" />
        </FigureFlow>
      );
    case "calc":
      return (
        <FigureContrast
          left={{
            label: "number + number",
            body: <FigureNode value={'1 + 2 → 3'} />,
          }}
          right={{
            label: "string が混ざる",
            body: <FigureNode value={'1 + "2" → "12"'} tone="accent" />,
          }}
        />
      );
    case "dynamic":
      return (
        <FigureFlow>
          <FigureNode label="x いま number" value="1" />
          <FigureArrow label="同じ名前" />
          <FigureNode label="x いま string" value={'"hello"'} tone="main" />
        </FigureFlow>
      );
    case "fn-box":
      return (
        <div className="figure-stack">
          <FigureFlow>
            <FigureNode
              label="呼び出し元"
              value="関数名(引数)"
              note="() を付けた瞬間に開始"
            />
            <FigureArrow label="値を渡す" />
            <FigureNode
              label="実行領域"
              value="呼び出しごとに新しく作る"
              tone="main"
              note="仮引数 → 本体 → return"
            />
            <FigureArrow label="結果を返す" />
            <FigureNode
              label="呼び出し式の値"
              value="return の値"
              note="returnが無ければ undefined"
              tone="accent"
            />
          </FigureFlow>
        </div>
      );
    case "callback-flow":
      return (
        <div className="figure-stack">
          <FigureFlow>
            <FigureNode
              label="1 · 渡す側"
              value="関数を () なしで渡す"
              note="この時点ではまだ実行されない"
            />
            <FigureArrow label="関数そのものを渡す" />
            <FigureNode
              label="2 · 受け取る側"
              value="いつ・何回・何を渡すかを決める"
              tone="main"
              note="ここで初めて () を付ける"
            />
            <FigureArrow label="引数を渡して呼ぶ" />
            <FigureNode
              label="3 · コールバック"
              value="渡された材料で処理"
              note="主導権は受け取る側"
              tone="accent"
            />
          </FigureFlow>
        </div>
      );
    case "object":
      return (
        <FigureNest label="user という1つの束" main>
          <FigureFlow>
            <FigureNode label="name" value={'"Aya"'} />
            <FigureNode label="age" value="20" tone="accent" />
          </FigureFlow>
        </FigureNest>
      );
    case "array":
      return (
        <FigureFlow>
          <FigureNode label="[0] 先頭" value="80" tone="main" />
          <FigureNode label="[1]" value="90" />
          <FigureNode label="[2] 末尾" value="70" />
        </FigureFlow>
      );
    case "branch":
      return (
        <div className="figure-stack">
          <FigureNode label="条件" value="true か false か" tone="main" />
          <FigureContrast
            left={{
              label: "false",
              body: <FigureNode value="else へ" />,
            }}
            right={{
              label: "true",
              body: <FigureNode value="if の中へ" tone="main" />,
            }}
          />
        </div>
      );
    case "truthy":
      return (
        <div className="figure-stack">
          <FigureNote
            title="if (値) は true そのものかを見ない"
            body="オフに見える決まった値だけが falsy。残りは truthy。"
          />
          <FigureContrast
            rightTone="emphasis"
            left={{
              label: "falsy · オフ扱い（6つだけ）",
              body: (
                <FigureList
                  items={[
                    { code: "false", note: "スイッチそのものがオフ" },
                    { code: "0", note: "個数がゼロ" },
                    { code: '""', note: "空の札。文字が1個もない" },
                    { code: "null", note: "意図して空にした印" },
                    { code: "undefined", note: "まだ値を入れてない" },
                    { code: "NaN", note: "数の計算が壊れた印" },
                  ]}
                />
              ),
            }}
            right={{
              label: "truthy · オン扱い（まぎらわしい例）",
              body: (
                <FigureList
                  items={[
                    { code: '"0"', note: "ゼロという文字がある札" },
                    { code: '" "', note: "空白も1文字ある" },
                    { code: "[]", note: "中が空でも、列はある" },
                    { code: "{}", note: "中が空でも、部屋はある" },
                  ]}
                />
              ),
            }}
          />
        </div>
      );
    case "loop":
      return (
        <FigureRail
          mainIndex={2}
          steps={[
            { title: "始める", note: "i = 0" },
            { title: "条件を見る", note: "i < 3" },
            { title: "中を実行する", note: "console.log(i)" },
            { title: "増やしてもう一度", note: "i++" },
          ]}
        />
      );
    case "for-loop":
      return (
        <div className="figure-stack">
          <FigureFlow>
            <FigureNode label="初期化" value="i = 0" />
            <FigureArrow label="次へ" />
            <FigureNode label="条件" value="i < 3" tone="main" />
            <FigureArrow label="true" />
            <FigureNode label="本体" value="log(i)" />
            <FigureArrow label="更新" />
            <FigureNode label="更新" value="i++" tone="accent" />
          </FigureFlow>
          <FigureTrace
            label="for文の実行順"
            rows={[
              { when: "最初だけ", what: "i = 0", note: "カウンタを作る" },
              { when: "1周目", what: "0 < 3 → true", note: "0を表示 → iは1" },
              { when: "2周目", what: "1 < 3 → true", note: "1を表示 → iは2" },
              { when: "3周目", what: "2 < 3 → true", note: "2を表示 → iは3" },
              { when: "終了判定", what: "3 < 3 → false", note: "本体へ入らず次の行へ" },
            ]}
          />
        </div>
      );
    case "while-loop":
      return (
        <div className="figure-stack">
          <FigureFlow>
            <FigureNode label="条件" value="fuel > 0" tone="main" />
            <FigureArrow label="true" />
            <FigureNode label="本体" value="log(fuel)" />
            <FigureArrow label="更新して戻る" />
            <FigureNode label="状態" value="fuel--" tone="accent" />
          </FigureFlow>
          <FigureTrace
            label="while文の実行順"
            rows={[
              { when: "fuel = 3", what: "3 > 0 → true", note: "3を表示、2へ更新" },
              { when: "fuel = 2", what: "2 > 0 → true", note: "2を表示、1へ更新" },
              { when: "fuel = 1", what: "1 > 0 → true", note: "1を表示、0へ更新" },
              { when: "fuel = 0", what: "0 > 0 → false", note: "本体へ入らず終了" },
            ]}
          />
          <FigureNote
            title="条件は自動で変化しない"
            body="本体で条件に関係する状態を変えないと、同じ true を繰り返す。"
          />
        </div>
      );
    case "loop-control":
      return (
        <div className="figure-stack">
          <FigureTrace
            label="ループ制御後の移動先"
            rows={[
              { when: "通常", what: "本体の末尾まで実行", note: "更新 → 次の条件" },
              { when: "continue", what: "今の周の残りを飛ばす", note: "更新 → 次の条件" },
              { when: "break", what: "ループ全体を終了", note: "ループの次の行" },
            ]}
          />
          <FigureNote
            title="一番内側のループだけに作用"
            body="入れ子の外側まで自動で終了するわけではない。"
          />
        </div>
      );
    case "for-of-loop":
      return (
        <div className="figure-stack">
          <FigureFlow>
            <FigureNode label="次の値" value={'"A"'} />
            <FigureNode label="次の値" value={'"B"'} tone="accent" />
            <FigureArrow label="順に受け取る" />
            <FigureNode
              label="本体"
              value="value を受け取るたびに実行"
              tone="main"
              note="尽きるか break で終了"
            />
          </FigureFlow>
          <FigureNote
            title="forEachとの違い"
            body="コールバックではなくループ文なので、break・continue・awaitを使える。"
          />
        </div>
      );
    case "foreach-loop":
      return (
        <div className="figure-stack">
          <FigureFlow>
            <FigureNode label="[0]" value={'"A"'} />
            <FigureNode label="[1]" value={'"B"'} tone="accent" />
            <FigureArrow label="先頭から1個ずつ呼ぶ" />
            <FigureNode
              label="コールバック"
              value={'callback(value, index, array)'}
              tone="main"
              note="前が終わってから次を呼ぶ"
            />
          </FigureFlow>
          <FigureNote
            title="コールバックの return 値は捨てる"
            body="forEach全体は undefined。breakは使えず、配列が空なら0回。"
          />
        </div>
      );
    case "scope":
      return (
        <div className="figure-stack">
          <FigureNest label="外側のスコープ" value="outer = 1" main>
            <FigureNest
              label="関数を呼ぶたびに作られるスコープ"
              value="引数・局所変数"
              note="内側から外側の名前は探せる"
            />
          </FigureNest>
          <FigureNote
            title="名前を探す順序"
            body="現在地 → 1つ外側 → さらに外側。外側から内側へは見えない。"
          />
        </div>
      );
    case "var-hoist":
      return (
        <div className="figure-stack">
          <FigureRail
            mainIndex={0}
            steps={[
              {
                title: "var value の名前を先に登録",
                note: "値はまだ代入されず undefined",
              },
              {
                title: "ifの波括弧は新しいvar領域を作らない",
                note: "関数全体で同じ value を共有",
              },
              {
                title: "代入行で value = 1",
                note: "宣言文全体が上へ移動するわけではない",
              },
            ]}
          />
          <FigureTrace
            label="varの値の変化"
            rows={[
              { when: "関数開始", what: "value → undefined", note: "名前だけ存在" },
              { when: "代入後", what: "value → 1", note: "同じ束縛の値が変わる" },
              { when: "関数終了", what: "領域を破棄", note: "外からは見えない" },
            ]}
          />
        </div>
      );
    case "ref":
      return (
        <FigureFlow>
          <FigureNode label="a" value="同じ束へ" />
          <FigureNode label="b" value="同じ束へ" />
          <FigureArrow label="指す先は1つ" />
          <FigureNode label="オブジェクト" value="n: 5" tone="main" />
        </FigureFlow>
      );
    case "spread":
      return (
        <FigureFlow>
          <FigureNode value="{ name, age }" />
          <FigureArrow label="ほどく / 広げる" />
          <FigureNode value="name と age が並ぶ" tone="main" />
        </FigureFlow>
      );
    case "map":
      return (
        <FigureFlow>
          <FigureNode value="[1, 2, 3]" />
          <FigureArrow label="× 2 を各要素へ" />
          <FigureNode value="[2, 4, 6] 新しい列" tone="main" />
        </FigureFlow>
      );
    case "closure":
      return (
        <FigureFlow>
          <FigureNode
            label="1 · 外側の関数を呼ぶ"
            value="makeCounter()"
            note="countを置く実行領域が作られる"
          />
          <FigureArrow label="内側の関数をreturn" />
          <FigureNode
            label="2 · 返された関数 + 環境"
            value="関数 → count = 0"
            tone="main"
            note="外側の呼び出し終了後も環境が残る"
          />
          <FigureArrow label="あとで呼ぶ" />
          <FigureNode
            label="3 · 同じ環境を再利用"
            value="count: 0 → 1 → 2"
            tone="accent"
            note="別のcounterなら別のcount"
          />
        </FigureFlow>
      );
    case "this-call":
      return (
        <FigureContrast
          left={{
            label: "user.hello()",
            body: <FigureNode value="this は user" />,
          }}
          right={{
            label: "取り外して f()",
            body: <FigureNode value="ドットの左が無い" tone="accent" />,
          }}
        />
      );
    case "class-instance":
      return (
        <FigureFlow>
          <FigureNode label="設計図" value="class User" note="prototype" />
          <FigureArrow label="new" />
          <FigureNode label="個体 a" value={'name: "Aya"'} tone="main" />
        </FigureFlow>
      );
    case "promise":
      return (
        <FigureFlow>
          <FigureNode label="01" value="pending 待ち" />
          <FigureNode label="02" value="fulfilled 成功" tone="main" />
          <FigureNode label="03" value="rejected 失敗" tone="negative" />
        </FigureFlow>
      );
    case "async-await":
      return (
        <FigureRail
          mainIndex={1}
          steps={[
            { title: "await まで同期で走る" },
            { title: "Promise が決まるまでこの関数は止まる" },
            { title: "続きの行がマイクロタスクで再開" },
          ]}
        />
      );
    case "event-loop":
      return (
        <FigureFlow>
          <FigureNode label="いま" value="同期（スタック）" tone="main" />
          <FigureNode label="そのあと全部" value="マイクロ（then）" />
          <FigureNode label="さらにあと" value="マクロ（timeout）" />
        </FigureFlow>
      );
    case "modules":
      return (
        <FigureFlow>
          <FigureNode label="math.js" value="export add" tone="main" />
          <FigureArrow label="import" />
          <FigureNode value="app.js" />
        </FigureFlow>
      );
    case "contract":
      return (
        <FigureContrast
          left={{
            label: "約束",
            body: <FigureNode value="age: number" />,
          }}
          right={{
            label: "検査",
            body: <FigureNode value="二十 は number ではない" tone="accent" />,
          }}
        />
      );
    case "annotate":
      return (
        <FigureNode
          label="型注釈"
          value="let n: number = 1"
          note="名前の後ろに約束を書く"
          tone="main"
        />
      );
    case "shape":
      return (
        <FigureNest label="User" main>
          <FigureTree
            root={{ label: "形", value: "オブジェクト全体" }}
            items={[
              { label: "name", value: "string" },
              { label: "age", value: "number", tone: "accent" },
            ]}
          />
        </FigureNest>
      );
    case "union":
      return (
        <FigureFlow>
          <FigureNode value="string" />
          <FigureArrow label="または" />
          <FigureNode value="number" tone="main" />
        </FigureFlow>
      );
    case "fn-type":
      return (
        <FigureFlow>
          <FigureNode
            label="入力側の契約"
            value="(a: number, b: number)"
            note="個数・順番・型を検査"
          />
          <FigureArrow label="関数の形" />
          <FigureNode
            label="検査の対象"
            value="実装も呼び出しも同じ契約"
            tone="main"
          />
          <FigureArrow label="返す" />
          <FigureNode
            label="出力側の契約"
            value="戻り値: number"
            tone="accent"
          />
        </FigureFlow>
      );
    case "narrow":
      return (
        <FigureContrast
          left={{
            label: "if の前",
            body: <FigureNode value="string | number" />,
          }}
          right={{
            label: 'typeof === "string" の中',
            body: <FigureNode value="string" tone="main" />,
          }}
        />
      );
    case "unknown":
      return (
        <FigureContrast
          rightTone="emphasis"
          left={{
            label: "any",
            body: <FigureNode value="何でも通る" tone="negative" />,
          }}
          right={{
            label: "unknown",
            body: <FigureNode value="絞るまで触れない" tone="main" />,
          }}
        />
      );
    case "generic":
      return (
        <FigureFlow>
          <FigureNode value="first<T>" />
          <FigureArrow label="T が埋まる" />
          <FigureNode label="T" value="number" tone="main" />
        </FigureFlow>
      );
    case "utility":
      return (
        <FigureFlow>
          <FigureNode value="User" />
          <FigureArrow label="Partial" />
          <FigureNode value="全部 ?" tone="main" />
        </FigureFlow>
      );
    case "conditional":
      return (
        <FigureNode
          label="型の if"
          value="T extends U ? A : B"
          note="合うなら A、そうでなければ B"
          tone="main"
        />
      );
    case "node-vs-browser":
      return (
        <FigureContrast
          left={{
            label: "ブラウザ",
            body: <FigureNode value="window / DOM / CSS" />,
          }}
          right={{
            label: "Node.js",
            body: <FigureNode value="ファイル / プロセス / ネット" tone="main" />,
          }}
        />
      );
    case "node-cli":
      return (
        <FigureRail
          steps={[
            { title: "node で REPL", note: "対話で試す" },
            { title: "node app.js でファイル" },
            { title: "待ちが無ければ終了" },
          ]}
        />
      );
    case "node-cjs-esm":
      return (
        <FigureContrast
          left={{
            label: "require",
            body: <FigureNode value="module.exports / __dirname" />,
          }}
          right={{
            label: "import",
            body: <FigureNode value="export / import.meta.url" tone="main" />,
          }}
        />
      );
    case "node-process":
      return (
        <FigureFlow>
          <FigureNode label="argv" value="起動の言葉" tone="main" />
          <FigureNode label="env" value="環境の辞書" />
          <FigureNode label="cwd" value="作業フォルダ" />
        </FigureFlow>
      );
    case "node-fs":
      return (
        <FigureFlow>
          <FigureNode value="ディスク" />
          <FigureArrow label="readFile / writeFile" />
          <FigureNode value="文字列か Buffer" tone="main" />
        </FigureFlow>
      );
    case "node-path":
      return (
        <FigureFlow>
          <FigureNode value="dir" />
          <FigureNode value="file.txt" />
          <FigureArrow label="path.join" />
          <FigureNode value="正しい区切り" tone="main" />
        </FigureFlow>
      );
    case "node-http":
      return (
        <FigureFlow>
          <FigureNode value="req" />
          <FigureArrow label="ハンドラ" />
          <FigureNode value="res.end" tone="main" />
        </FigureFlow>
      );
    case "node-npm":
      return (
        <FigureRail
          steps={[
            { title: "package.json 宣言" },
            { title: "lock が再現" },
            { title: "node_modules 実体" },
          ]}
        />
      );
    case "node-stream":
      return (
        <FigureFlow>
          <FigureNode value="chunk" tone="accent" />
          <FigureNode value="chunk" tone="accent" />
          <FigureNode value="chunk" tone="main" />
          <FigureArrow label="全部を一度に載せない" />
        </FigureFlow>
      );
    case "node-libuv":
      return (
        <FigureContrast
          left={{
            label: "JS スレッド",
            body: <FigureNode value="依頼して次の行へ" />,
          }}
          right={{
            label: "libuv / OS",
            body: <FigureNode value="I/O が裏で進む" tone="main" />,
          }}
        />
      );
    case "node-error":
      return (
        <FigureContrast
          left={{
            label: "業務の失敗",
            body: <FigureNode value="応答や非0" />,
          }}
          right={{
            label: "未捕捉",
            body: <FigureNode value="プロセス終了" tone="negative" />,
          }}
          rightTone="negative"
        />
      );
    case "node-prod":
      return (
        <FigureRail
          mainIndex={1}
          steps={[
            { title: "SIGTERM を受ける" },
            { title: "listen を止めて新規を断る" },
            { title: "進行中を待ってから exit" },
          ]}
        />
      );
    case "dom-tree":
      return (
        <FigureTree
          root={{ label: "document", value: "ページ全体の入口" }}
          items={[
            { label: "main", value: "注文管理のまとまり" },
            { label: "#order-list", value: "注文行を置く場所", tone: "accent" },
          ]}
        />
      );
    case "dom-query":
      return (
        <FigureFlow>
          <FigureNode label="CSS セレクター" value='"#order-count"' />
          <FigureArrow label="querySelector" />
          <FigureNode label="見つかった要素" value="<span>" tone="main" />
        </FigureFlow>
      );
    case "dom-update":
      return (
        <FigureFlow>
          <FigureNode label="変更前" value="注文 0件" tone="gone" />
          <FigureArrow label="textContent" />
          <FigureNode label="変更後" value="注文 3件" tone="main" />
        </FigureFlow>
      );
    case "dom-create":
      return (
        <FigureRail
          steps={[
            { title: "createElement", note: "空の li を作る" },
            { title: "textContent", note: "注文内容を入れる" },
            { title: "append", note: "一覧へつなぐ" },
          ]}
        />
      );
    case "dom-event":
      return (
        <FigureFlow>
          <FigureNode label="利用者" value="クリック" />
          <FigureArrow label="event" />
          <FigureNode label="listener" value="支払状態を更新" tone="main" />
        </FigureFlow>
      );
    case "dom-form":
      return (
        <FigureRail
          mainIndex={1}
          steps={[
            { title: "submit を受け取る" },
            { title: "preventDefault で再読込を止める" },
            { title: "FormData から注文を作る" },
          ]}
        />
      );
    case "dom-render":
      return (
        <FigureFlow>
          <FigureNode label="state" value="orders + filter" />
          <FigureArrow label="render" />
          <FigureNode label="DOM" value="表示する注文だけ" tone="main" />
        </FigureFlow>
      );
    case "dom-storage":
      return (
        <FigureFlow>
          <FigureNode label="配列" value="orders" />
          <FigureArrow label="JSON.stringify" />
          <FigureNode label="localStorage" value="文字列で保存" tone="main" />
        </FigureFlow>
      );
    case "dom-fetch":
      return (
        <FigureRail
          mainIndex={1}
          steps={[
            { title: "読込中を表示" },
            { title: "fetch で注文APIへ依頼" },
            { title: "成功は一覧、失敗は案内を表示" },
          ]}
        />
      );
    case "sql-table":
      return (
        <FigureFlow>
          <FigureNode label="表" value="orders" />
          <FigureArrow label="SELECT" />
          <FigureNode label="結果" value="必要な列と行" tone="main" />
        </FigureFlow>
      );
    case "sql-filter":
      return (
        <FigureFlow>
          <FigureNode label="全注文" value="5行" />
          <FigureArrow label="WHERE" />
          <FigureNode label="対象" value="条件に合う行" tone="main" />
        </FigureFlow>
      );
    case "sql-sort":
      return (
        <FigureRail
          steps={[
            { title: "WHEREで絞る" },
            { title: "ORDER BYで並べる" },
            { title: "LIMITで件数を決める" },
          ]}
        />
      );
    case "sql-group":
      return (
        <FigureRail
          steps={[
            { title: "同じ値でグループ化" },
            { title: "COUNT・SUMで集計" },
            { title: "1グループを1行で返す" },
          ]}
        />
      );
    case "sql-join":
      return (
        <FigureFlow>
          <FigureNode label="orders" value="customer_id" />
          <FigureArrow label="JOIN ON id" />
          <FigureNode label="customers" value="name" tone="main" />
        </FigureFlow>
      );
    case "sql-write":
      return (
        <FigureRail
          mainIndex={1}
          steps={[
            { title: "WHEREで対象確認" },
            { title: "INSERT・UPDATE・DELETE" },
            { title: "SELECTで結果確認" },
          ]}
        />
      );
    case "sql-transaction":
      return (
        <FigureRail
          mainIndex={1}
          steps={[
            { title: "BEGIN" },
            { title: "複数の更新" },
            { title: "COMMIT または ROLLBACK" },
          ]}
        />
      );
    case "git-repository":
      return (
        <FigureFlow>
          <FigureNode label="作業場所" value="ファイル" />
          <FigureArrow label="git init" />
          <FigureNode label="repository" value="履歴を保存" tone="main" />
        </FigureFlow>
      );
    case "git-staging":
      return (
        <FigureRail
          mainIndex={1}
          steps={[
            { title: "working tree" },
            { title: "git add → stage" },
            { title: "git commit → 履歴" },
          ]}
        />
      );
    case "git-history":
      return (
        <FigureRail
          steps={[
            { title: "commit C" },
            { title: "commit B" },
            { title: "commit A" },
          ]}
        />
      );
    case "git-branch":
      return (
        <FigureFlow>
          <FigureNode label="main" value="安定版" />
          <FigureArrow label="switch -c" />
          <FigureNode label="feature" value="機能開発" tone="main" />
        </FigureFlow>
      );
    case "git-remote":
      return (
        <FigureFlow>
          <FigureNode label="local" value="手元の履歴" />
          <FigureArrow label="push / pull" />
          <FigureNode label="origin" value="共有する履歴" tone="main" />
        </FigureFlow>
      );
    case "git-pr":
      return (
        <FigureRail
          steps={[
            { title: "branchをpush" },
            { title: "Pull Request作成" },
            { title: "レビュー後merge" },
          ]}
        />
      );
    case "git-conflict":
      return (
        <FigureRail
          mainIndex={1}
          steps={[
            { title: "両方の変更を読む" },
            { title: "残す内容を編集" },
            { title: "addして解決を記録" },
          ]}
        />
      );
    case "git-actions":
      return (
        <FigureRail
          mainIndex={1}
          steps={[
            { title: "push / PR" },
            { title: "Actionsで検査" },
            { title: "保護ルールを満たしてmerge" },
          ]}
        />
      );
    default:
      return null;
  }
}

export function Diagram({
  id,
  listing,
  title,
  points = [],
  activePoint,
  activeStep,
  activeCodeLines,
}: {
  id: DiagramId;
  listing: Listing;
  title: string;
  points?: string[];
  activePoint?: number;
  activeStep?: number;
  activeCodeLines?: number[];
}) {
  const codeLines = listing.code.split("\n");
  const activeLineSet = new Set(activeCodeLines ?? []);
  return (
    <div className="diagram-visual" data-step={activeStep}>
      <section
        className="diagram-code-window"
        aria-label={`${listing.label}のコード`}
      >
        <header className="diagram-window-bar">
          <span className="diagram-window-tab">
            <span className="diagram-file-dot" aria-hidden="true" />
            {listing.label}
            <span className="diagram-tab-close" aria-hidden="true">
              ×
            </span>
          </span>
        </header>
        <pre className="diagram-code">
          {codeLines.map((line, index) => (
            <span
              key={`${index}-${line}`}
              className={`diagram-code-line${
                activeLineSet.size === 0
                  ? ""
                  : activeLineSet.has(index)
                    ? " is-active"
                    : " is-muted"
              }`}
            >
              <span className="diagram-line-number" aria-hidden="true">
                L{String(index + 1).padStart(2, "0")}
              </span>
              <code>
                <CodeHighlight code={line || " "} />
              </code>
            </span>
          ))}
        </pre>
      </section>

      <div className="diagram-connector" aria-hidden="true">
        <span />
        <svg viewBox="0 0 34 18">
          <path d="M1 9h27M23 3l7 6-7 6" />
        </svg>
      </div>

      <section className="diagram-concept-window" aria-label="コードの図解">
        <header className="diagram-window-bar">
          <span className="diagram-window-tab is-concept">動き・関係</span>
        </header>
        <div className="diagram-concept-body">
          <p className="diagram-topic">{title}</p>
          <DiagramContent id={id} />
          {points.length > 0 ? (
            <ol className="diagram-reading-list">
              {points.slice(0, 3).map((point, index) => (
                <li
                  key={point}
                  className={
                    activePoint === undefined
                      ? ""
                      : activePoint === index
                        ? "is-active"
                        : "is-muted"
                  }
                >
                  <span>P{String(index + 1).padStart(2, "0")}</span>
                  <p>{point}</p>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </section>
    </div>
  );
}
