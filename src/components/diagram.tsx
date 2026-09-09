import type { ReactNode } from "react";
import { CodeHighlight } from "@/components/code-highlight";
import type { Listing } from "@/lib/course/diagram-listings";
import type { DiagramId } from "@/lib/course/types";

function Cell({
  label,
  value,
  tone = "plain",
}: {
  label: string;
  value: string;
  tone?: "plain" | "gone" | "mark";
}) {
  return (
    <div
      className={`figure-cell ${
        tone === "gone"
          ? "text-[var(--cream-mute)] line-through"
          : tone === "mark"
            ? "border-[#d4b45a]"
            : ""
      }`}
    >
      <p className="figure-k">{label}</p>
      <p className="figure-v">{value}</p>
    </div>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <p className="figure-arrow">
      <svg width="28" height="12" viewBox="0 0 28 12" aria-hidden="true">
        <path
          d="M0 6h22M18 2l6 4-6 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
      <span>{label}</span>
    </p>
  );
}

function Flow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 md:gap-4">{children}</div>
  );
}

function Rail({
  steps,
}: {
  steps: { title: string; note?: string }[];
}) {
  return (
    <ol className="rail">
      {steps.map((step, index) => (
        <li key={step.title} className="rail-step">
          <span className="rail-dot" aria-hidden="true" />
          <div>
            <p className="font-mono text-[11px] text-[var(--cream-mute)]">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-1 text-base">{step.title}</p>
            {step.note ? (
              <p className="mt-1 font-mono text-xs text-[var(--cream-mute)]">
                {step.note}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Pair({
  left,
  right,
}: {
  left: { k: string; v: string };
  right: { k: string; v: string };
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="figure-panel">
        <p className="figure-k">{left.k}</p>
        <p className="mt-2 text-base">{left.v}</p>
      </div>
      <div className="figure-panel border-[#d4b45a]">
        <p className="figure-k">{right.k}</p>
        <p className="mt-2 text-base">{right.v}</p>
      </div>
    </div>
  );
}

function DiagramContent({ id }: { id: DiagramId }) {
  switch (id) {
    case "sequence":
      return (
        <Rail
          steps={[
            { title: "1行目を実行して終わる", note: "console.log(\"いち\")" },
            { title: "2行目を実行して終わる", note: "console.log(\"に\")" },
            { title: "3行目へ進む", note: "前が終わるまで始まらない" },
          ]}
        />
      );
    case "values":
      return (
        <Flow>
          <Cell label="number" value="3" tone="mark" />
          <Cell label="string" value='"Aya"' />
          <Cell label="boolean" value="true" />
        </Flow>
      );
    case "label":
      return (
        <Flow>
          <Cell label="name" value='"Aya"' tone="mark" />
          <Arrow label="名前が値を指す" />
          <Cell label="age" value="20" />
        </Flow>
      );
    case "rewrite":
      return (
        <Flow>
          <Cell label="age" value="20" tone="gone" />
          <Arrow label="付け替え" />
          <Cell label="age" value="21" tone="mark" />
        </Flow>
      );
    case "calc":
      return (
        <Pair
          left={{ k: "number + number", v: "1 + 2 → 3" }}
          right={{ k: "string が混ざる", v: '1 + "2" → "12"' }}
        />
      );
    case "dynamic":
      return (
        <Flow>
          <Cell label="x いま number" value="1" />
          <Arrow label="同じ名前" />
          <Cell label="x いま string" value='"hello"' tone="mark" />
        </Flow>
      );
    case "fn-box":
      return (
        <div className="function-scene">
          <div className="function-call-node">
            <p>呼び出し元</p>
            <strong>関数名(引数)</strong>
            <small>() を付けた瞬間に開始</small>
          </div>
          <Arrow label="値を渡す" />
          <div className="function-frame">
            <header>呼び出しごとに作る実行領域</header>
            <ol>
              <li>
                <span>1</span>
                <p><strong>仮引数へ代入</strong><small>渡した値に一時的な名前を付ける</small></p>
              </li>
              <li>
                <span>2</span>
                <p><strong>本体を上から実行</strong><small>局所変数はこの呼び出しだけのもの</small></p>
              </li>
              <li>
                <span>3</span>
                <p><strong>returnで終了</strong><small>後ろの行は実行せず呼び出し元へ戻る</small></p>
              </li>
            </ol>
          </div>
          <Arrow label="結果を返す" />
          <div className="function-return-node">
            <p>呼び出し式の値</p>
            <strong>return の値</strong>
            <small>returnが無ければ undefined</small>
          </div>
        </div>
      );
    case "callback-flow":
      return (
        <div className="function-scene">
          <div className="function-call-node">
            <p>1 · 渡す側</p>
            <strong>関数を () なしで渡す</strong>
            <small>この時点ではまだ実行されない</small>
          </div>
          <Arrow label="関数そのものを渡す" />
          <div className="function-frame">
            <header>2 · 受け取る側が制御する</header>
            <ol>
              <li>
                <span>A</span>
                <p><strong>関数を仮引数で受け取る</strong><small>どんな処理かを値として保持する</small></p>
              </li>
              <li>
                <span>B</span>
                <p><strong>時刻・回数・材料を決める</strong><small>イベントや各要素など、実行条件を管理する</small></p>
              </li>
              <li>
                <span>C</span>
                <p><strong>受け取った関数に () を付ける</strong><small>ここで初めてコールバックの本体が動く</small></p>
              </li>
            </ol>
          </div>
          <Arrow label="引数を渡して呼ぶ" />
          <div className="function-return-node">
            <p>3 · コールバック</p>
            <strong>渡された材料で処理</strong>
            <small>呼ぶ主導権は受け取る側にある</small>
          </div>
        </div>
      );
    case "object":
      return (
        <div className="figure-panel">
          <p className="figure-k">user という1つの束</p>
          <div className="mt-3">
            <Flow>
              <Cell label="name" value='"Aya"' />
              <Cell label="age" value="20" />
            </Flow>
          </div>
        </div>
      );
    case "array":
      return (
        <Flow>
          <Cell label="[0] 先頭" value="80" tone="mark" />
          <Cell label="[1]" value="90" />
          <Cell label="[2] 末尾" value="70" />
        </Flow>
      );
    case "branch":
      return (
        <div className="flex flex-col gap-3">
          <div className="figure-panel">条件は true か false か</div>
          <div className="ml-4 grid gap-3 sm:grid-cols-2">
            <div className="figure-panel border-[#9be7b5]">true → if の中へ</div>
            <div className="figure-panel text-[var(--cream-mute)]">
              false → else へ
            </div>
          </div>
        </div>
      );
    case "loop":
      return (
        <Rail
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
        <div className="execution-model">
          <div className="execution-formula">
            <span>初期化<br /><strong>i = 0</strong></span>
            <b>→</b>
            <span>条件<br /><strong>i &lt; 3</strong></span>
            <b>→</b>
            <span>本体<br /><strong>log(i)</strong></span>
            <b>→</b>
            <span>更新<br /><strong>i++</strong></span>
          </div>
          <div className="execution-trace" role="table" aria-label="for文の実行順">
            <p role="row"><span role="cell">最初だけ</span><strong role="cell">i = 0</strong><small role="cell">カウンタを作る</small></p>
            <p role="row"><span role="cell">1周目</span><strong role="cell">0 &lt; 3 → true</strong><small role="cell">0を表示 → iは1</small></p>
            <p role="row"><span role="cell">2周目</span><strong role="cell">1 &lt; 3 → true</strong><small role="cell">1を表示 → iは2</small></p>
            <p role="row"><span role="cell">3周目</span><strong role="cell">2 &lt; 3 → true</strong><small role="cell">2を表示 → iは3</small></p>
            <p role="row"><span role="cell">終了判定</span><strong role="cell">3 &lt; 3 → false</strong><small role="cell">本体へ入らず次の行へ</small></p>
          </div>
        </div>
      );
    case "while-loop":
      return (
        <div className="execution-model">
          <div className="execution-formula">
            <span>条件を評価<br /><strong>fuel &gt; 0</strong></span>
            <b>→</b>
            <span>trueなら本体<br /><strong>log(fuel)</strong></span>
            <b>→</b>
            <span>状態を変更<br /><strong>fuel--</strong></span>
            <b>↩</b>
          </div>
          <div className="execution-trace" role="table" aria-label="while文の実行順">
            <p role="row"><span role="cell">fuel = 3</span><strong role="cell">3 &gt; 0 → true</strong><small role="cell">3を表示、2へ更新</small></p>
            <p role="row"><span role="cell">fuel = 2</span><strong role="cell">2 &gt; 0 → true</strong><small role="cell">2を表示、1へ更新</small></p>
            <p role="row"><span role="cell">fuel = 1</span><strong role="cell">1 &gt; 0 → true</strong><small role="cell">1を表示、0へ更新</small></p>
            <p role="row"><span role="cell">fuel = 0</span><strong role="cell">0 &gt; 0 → false</strong><small role="cell">本体へ入らず終了</small></p>
          </div>
          <div className="execution-note">
            <strong>条件は自動で変化しない</strong>
            <small>本体で条件に関係する状態を変えないと、同じtrueを繰り返す。</small>
          </div>
        </div>
      );
    case "loop-control":
      return (
        <div className="execution-model">
          <div className="execution-trace" role="table" aria-label="ループ制御後の移動先">
            <p role="row"><span role="cell">通常</span><strong role="cell">本体の末尾まで実行</strong><small role="cell">更新 → 次の条件</small></p>
            <p role="row"><span role="cell">continue</span><strong role="cell">今の周の残りを飛ばす</strong><small role="cell">更新 → 次の条件</small></p>
            <p role="row"><span role="cell">break</span><strong role="cell">ループ全体を終了</strong><small role="cell">ループの次の行</small></p>
          </div>
          <div className="execution-note">
            <strong>一番内側のループだけに作用</strong>
            <small>入れ子の外側まで自動で終了するわけではない。</small>
          </div>
        </div>
      );
    case "for-of-loop":
      return (
        <div className="execution-model">
          <div className="foreach-source">
            <span><small>次の値</small><strong>&quot;A&quot;</strong></span>
            <span><small>次の値</small><strong>&quot;B&quot;</strong></span>
          </div>
          <Arrow label="iteratorから順に受け取る" />
          <div className="function-frame">
            <header>値を受け取るたびに本体を実行</header>
            <ol>
              <li><span>1</span><p><strong>value = &quot;A&quot;</strong><small>本体を実行して次の値を要求</small></p></li>
              <li><span>2</span><p><strong>value = &quot;B&quot;</strong><small>値が尽きるかbreakで終了</small></p></li>
            </ol>
          </div>
          <div className="execution-note">
            <strong>forEachとの違い</strong>
            <small>コールバックではなくループ文なので、break・continue・awaitを使える。</small>
          </div>
        </div>
      );
    case "foreach-loop":
      return (
        <div className="execution-model">
          <div className="foreach-source">
            <span><small>[0]</small><strong>&quot;A&quot;</strong></span>
            <span><small>[1]</small><strong>&quot;B&quot;</strong></span>
          </div>
          <Arrow label="forEach側が先頭から1個ずつ呼ぶ" />
          <div className="function-frame">
            <header>要素ごとに新しいコールバック呼び出し</header>
            <ol>
              <li><span>1</span><p><strong>callback(&quot;A&quot;, 0, xs)</strong><small>value・index・arrayへ順番に入る</small></p></li>
              <li><span>2</span><p><strong>callback(&quot;B&quot;, 1, xs)</strong><small>前の呼び出しが終わってから次を呼ぶ</small></p></li>
            </ol>
          </div>
          <div className="execution-note">
            <strong>コールバックのreturn値は捨てる</strong>
            <small>forEach全体はundefined。breakは使えず、配列が空なら0回。</small>
          </div>
        </div>
      );
    case "scope":
      return (
        <div className="scope-scene">
          <div className="scope-room is-outer">
            <p>外側のスコープ</p>
            <strong>outer = 1</strong>
            <div className="scope-room is-call">
              <p>関数を呼ぶたびに作られるスコープ</p>
              <strong>引数・局所変数</strong>
              <small>内側から外側の名前は探せる</small>
            </div>
          </div>
          <div className="scope-lookup">
            <span>名前を探す順序</span>
            <p>現在地 → 1つ外側 → さらに外側</p>
            <small>外側から内側へは見えない。呼び出し終了後、局所領域は通常破棄される。</small>
          </div>
        </div>
      );
    case "var-hoist":
      return (
        <div className="execution-model">
          <div className="function-frame">
            <header>関数の実行領域を準備する段階</header>
            <ol>
              <li><span>1</span><p><strong>var value の名前を先に登録</strong><small>値はまだ代入されず undefined</small></p></li>
              <li><span>2</span><p><strong>ifの波括弧は新しいvar領域を作らない</strong><small>関数全体で同じvalueを共有</small></p></li>
              <li><span>3</span><p><strong>代入行で value = 1</strong><small>宣言文全体が上へ移動するわけではない</small></p></li>
            </ol>
          </div>
          <div className="execution-trace" role="table" aria-label="varの値の変化">
            <p role="row"><span role="cell">関数開始</span><strong role="cell">value → undefined</strong><small role="cell">名前だけ存在</small></p>
            <p role="row"><span role="cell">代入後</span><strong role="cell">value → 1</strong><small role="cell">同じ束縛の値が変わる</small></p>
            <p role="row"><span role="cell">関数終了</span><strong role="cell">領域を破棄</strong><small role="cell">外からは見えない</small></p>
          </div>
        </div>
      );
    case "ref":
      return (
        <div className="flex flex-wrap items-start gap-4">
          <Flow>
            <Cell label="a" value="同じ束へ" />
            <Cell label="b" value="同じ束へ" />
          </Flow>
          <Arrow label="指す先は1つ" />
          <div className="figure-panel border-[#d4b45a]">
            <p className="figure-k">オブジェクト</p>
            <p className="mt-1 font-mono text-lg">n: 5</p>
          </div>
        </div>
      );
    case "spread":
      return (
        <Flow>
          <div className="figure-panel font-mono">{`{ name, age }`}</div>
          <Arrow label="ほどく / 広げる" />
          <div className="figure-panel border-[#d4b45a]">name と age が並ぶ</div>
        </Flow>
      );
    case "map":
      return (
        <div className="grid gap-3 sm:grid-cols-3">
          {["[1, 2, 3]", "× 2 を各要素へ", "[2, 4, 6] 新しい列"].map(
            (text, index) => (
              <div
                key={text}
                className={`figure-panel text-center ${
                  index === 2 ? "border-[#d4b45a]" : ""
                }`}
              >
                {text}
              </div>
            ),
          )}
        </div>
      );
    case "closure":
      return (
        <div className="scope-scene">
          <div className="function-call-node">
            <p>1 · 外側の関数を呼ぶ</p>
            <strong>makeCounter()</strong>
            <small>countを置く実行領域が作られる</small>
          </div>
          <Arrow label="内側の関数をreturn" />
          <div className="scope-room is-call">
            <p>2 · 返された関数 + 生まれた環境</p>
            <strong>関数 → count = 0</strong>
            <small>関数がcountを参照するため、外側の呼び出し終了後も環境が残る</small>
          </div>
          <Arrow label="あとで呼ぶ" />
          <div className="function-return-node">
            <p>3 · 同じ環境を再利用</p>
            <strong>count: 0 → 1 → 2</strong>
            <small>別のcounterを作れば、別のcountを持つ</small>
          </div>
        </div>
      );
    case "this-call":
      return (
        <Pair
          left={{ k: "user.hello()", v: "this は user" }}
          right={{ k: "取り外して f()", v: "ドットの左が無い" }}
        />
      );
    case "class-instance":
      return (
        <Flow>
          <div className="figure-panel">
            class User
            <p className="mt-1 text-sm text-[var(--cream-mute)]">
              設計図 / prototype
            </p>
          </div>
          <Arrow label="new" />
          <Cell label="個体 a" value='name: "Aya"' tone="mark" />
        </Flow>
      );
    case "promise":
      return (
        <ol className="grid gap-3 sm:grid-cols-3">
          {["pending 待ち", "fulfilled 成功", "rejected 失敗"].map(
            (step, index) => (
              <li
                key={step}
                className={`figure-panel ${index === 1 ? "border-[#d4b45a]" : ""}`}
              >
                <p className="figure-k">{String(index + 1).padStart(2, "0")}</p>
                <p className="mt-1">{step}</p>
              </li>
            ),
          )}
        </ol>
      );
    case "async-await":
      return (
        <Rail
          steps={[
            { title: "await まで同期で走る" },
            { title: "Promise が決まるまでこの関数は止まる" },
            { title: "続きの行がマイクロタスクで再開" },
          ]}
        />
      );
    case "event-loop":
      return (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="figure-panel border-[#d4b45a]">
            <p className="figure-k">いま</p>
            <p className="mt-1">同期（スタック）</p>
          </div>
          <div className="figure-panel">
            <p className="figure-k">そのあと全部</p>
            <p className="mt-1">マイクロ（then）</p>
          </div>
          <div className="figure-panel">
            <p className="figure-k">さらにあと</p>
            <p className="mt-1">マクロ（timeout）</p>
          </div>
        </div>
      );
    case "modules":
      return (
        <Flow>
          <div className="figure-panel border-[#d4b45a]">
            math.js
            <p className="mt-1 font-mono text-sm">export add</p>
          </div>
          <Arrow label="import" />
          <div className="figure-panel">app.js</div>
        </Flow>
      );
    case "contract":
      return (
        <Pair
          left={{ k: "約束", v: "age: number" }}
          right={{ k: "検査", v: "二十 は number ではない" }}
        />
      );
    case "annotate":
      return (
        <p className="font-mono text-lg leading-9">
          <span className="text-[var(--cream-mute)]">let</span> n
          <span className="text-[#7ec8d4]">: number</span> = 1;
        </p>
      );
    case "shape":
      return (
        <div className="figure-panel border-[#7ec8d4] font-mono">
          <p className="text-lg">User</p>
          <p className="mt-2 text-[var(--cream-mute)]">name: string</p>
          <p className="text-[var(--cream-mute)]">age: number</p>
        </div>
      );
    case "union":
      return (
        <Flow>
          <span className="figure-cell font-mono">string</span>
          <span className="text-[var(--cream-mute)]">または</span>
          <span className="figure-cell border-[#7ec8d4] font-mono">number</span>
        </Flow>
      );
    case "fn-type":
      return (
        <div className="function-scene">
          <div className="function-call-node">
            <p>入力側の契約</p>
            <strong>(a: number, b: number)</strong>
            <small>個数・順番・それぞれの型を検査</small>
          </div>
          <Arrow label="呼び出せる関数の形" />
          <div className="function-frame">
            <header>実装も呼び出しも同じ契約を見る</header>
            <ol>
              <li>
                <span>1</span>
                <p><strong>実装を検査</strong><small>引数を別の型として扱っていないか</small></p>
              </li>
              <li>
                <span>2</span>
                <p><strong>呼び出しを検査</strong><small>契約どおりの値を渡しているか</small></p>
              </li>
            </ol>
          </div>
          <Arrow label="実行後に返す" />
          <div className="function-return-node">
            <p>出力側の契約</p>
            <strong>戻り値: number</strong>
            <small>returnする値と、利用側の型がつながる</small>
          </div>
        </div>
      );
    case "narrow":
      return (
        <Pair
          left={{ k: "if の前", v: "string | number" }}
          right={{ k: 'typeof === "string" の中', v: "string" }}
        />
      );
    case "unknown":
      return (
        <Pair
          left={{ k: "any", v: "何でも通る" }}
          right={{ k: "unknown", v: "絞るまで触れない" }}
        />
      );
    case "generic":
      return (
        <Flow>
          <div className="figure-panel font-mono">first&lt;T&gt;</div>
          <Arrow label="T が埋まる" />
          <Cell label="T" value="number" tone="mark" />
        </Flow>
      );
    case "utility":
      return (
        <Flow>
          <div className="figure-panel">User</div>
          <Arrow label="Partial" />
          <div className="figure-panel border-[#7ec8d4]">全部 ?</div>
        </Flow>
      );
    case "conditional":
      return (
        <p className="font-mono text-base leading-8">
          T extends U ? A : B
          <span className="mt-2 block font-sans text-sm text-[var(--cream-mute)]">
            型の if。合うなら A、否则 B
          </span>
        </p>
      );
    case "node-vs-browser":
      return (
        <Pair
          left={{ k: "ブラウザ", v: "window / DOM / CSS" }}
          right={{ k: "Node.js", v: "ファイル / プロセス / ネット" }}
        />
      );
    case "node-cli":
      return (
        <Rail
          steps={[
            { title: "node で REPL", note: "対話で試す" },
            { title: "node app.js でファイル" },
            { title: "待ちが無ければ終了" },
          ]}
        />
      );
    case "node-cjs-esm":
      return (
        <Pair
          left={{ k: "require", v: "module.exports / __dirname" }}
          right={{ k: "import", v: "export / import.meta.url" }}
        />
      );
    case "node-process":
      return (
        <div className="grid gap-3 sm:grid-cols-3">
          <Cell label="argv" value="起動の言葉" tone="mark" />
          <Cell label="env" value="環境の辞書" />
          <Cell label="cwd" value="作業フォルダ" />
        </div>
      );
    case "node-fs":
      return (
        <Flow>
          <div className="figure-panel">ディスク</div>
          <Arrow label="readFile / writeFile" />
          <div className="figure-panel border-[#9be7b5]">文字列か Buffer</div>
        </Flow>
      );
    case "node-path":
      return (
        <Flow>
          <span className="figure-cell">dir</span>
          <span className="figure-cell">file.txt</span>
          <Arrow label="path.join" />
          <span className="figure-cell border-[#9be7b5]">正しい区切り</span>
        </Flow>
      );
    case "node-http":
      return (
        <Flow>
          <div className="figure-panel">req</div>
          <Arrow label="ハンドラ" />
          <div className="figure-panel border-[#9be7b5]">res.end</div>
        </Flow>
      );
    case "node-npm":
      return (
        <ol className="grid gap-3 sm:grid-cols-3">
          {["package.json 宣言", "lock が再現", "node_modules 実体"].map(
            (step, index) => (
              <li key={step} className="figure-panel">
                <p className="figure-k">{String(index + 1).padStart(2, "0")}</p>
                <p className="mt-1">{step}</p>
              </li>
            ),
          )}
        </ol>
      );
    case "node-stream":
      return (
        <Flow>
          {["chunk", "chunk", "chunk"].map((chunk, index) => (
            <div key={`${chunk}-${index}`} className="figure-cell border-[#9be7b5]">
              {chunk}
            </div>
          ))}
          <span className="text-sm text-[var(--cream-mute)]">
            全部を一度に載せない
          </span>
        </Flow>
      );
    case "node-libuv":
      return (
        <Pair
          left={{ k: "JS スレッド", v: "依頼して次の行へ" }}
          right={{ k: "libuv / OS", v: "I/O が裏で進む" }}
        />
      );
    case "node-error":
      return (
        <Pair
          left={{ k: "業務の失敗", v: "応答や非0" }}
          right={{ k: "未捕捉", v: "プロセス終了" }}
        />
      );
    case "node-prod":
      return (
        <Rail
          steps={[
            { title: "SIGTERM を受ける" },
            { title: "listen を止めて新規を断る" },
            { title: "進行中を待ってから exit" },
          ]}
        />
      );
    case "dom-tree":
      return (
        <Rail
          steps={[
            { title: "document", note: "ページ全体の入口" },
            { title: "main", note: "注文管理のまとまり" },
            { title: "#order-list", note: "注文行を置く場所" },
          ]}
        />
      );
    case "dom-query":
      return (
        <Flow>
          <Cell label="CSS セレクター" value='"#order-count"' />
          <Arrow label="querySelector" />
          <Cell label="見つかった要素" value="<span>" tone="mark" />
        </Flow>
      );
    case "dom-update":
      return (
        <Flow>
          <Cell label="変更前" value="注文 0件" tone="gone" />
          <Arrow label="textContent" />
          <Cell label="変更後" value="注文 3件" tone="mark" />
        </Flow>
      );
    case "dom-create":
      return (
        <Rail
          steps={[
            { title: "createElement", note: "空の li を作る" },
            { title: "textContent", note: "注文内容を入れる" },
            { title: "append", note: "一覧へつなぐ" },
          ]}
        />
      );
    case "dom-event":
      return (
        <Flow>
          <Cell label="利用者" value="クリック" />
          <Arrow label="event" />
          <Cell label="listener" value="支払状態を更新" tone="mark" />
        </Flow>
      );
    case "dom-form":
      return (
        <Rail
          steps={[
            { title: "submit を受け取る" },
            { title: "preventDefault で再読込を止める" },
            { title: "FormData から注文を作る" },
          ]}
        />
      );
    case "dom-render":
      return (
        <Flow>
          <Cell label="state" value="orders + filter" />
          <Arrow label="render" />
          <Cell label="DOM" value="表示する注文だけ" tone="mark" />
        </Flow>
      );
    case "dom-storage":
      return (
        <Flow>
          <Cell label="配列" value="orders" />
          <Arrow label="JSON.stringify" />
          <Cell label="localStorage" value="文字列で保存" tone="mark" />
        </Flow>
      );
    case "dom-fetch":
      return (
        <Rail
          steps={[
            { title: "読込中を表示" },
            { title: "fetch で注文APIへ依頼" },
            { title: "成功は一覧、失敗は案内を表示" },
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
      <section className="diagram-code-window" aria-label={`${listing.label}のコード`}>
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
