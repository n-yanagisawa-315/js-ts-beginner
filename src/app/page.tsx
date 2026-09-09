import { HomeTracks } from "@/components/home-tracks";
import { OrderProjectPreview } from "@/components/order-project-preview";
import { Badge } from "@/components/ui/badge";
import { lessonsByTrack } from "@/lib/course";

export default function Home() {
  return (
    <div className="course-catalog-page">
      <header className="course-catalog-hero">
        <div>
          <Badge>基礎をしっかり</Badge>
          <p className="course-catalog-brand">しくみ講座 · JS / TS / NODE</p>
          <h1>
            注文管理を作りながら、
            <br />
            プログラムの基礎を学ぶ。
          </h1>
          <p>
            まずJavaScriptで値の動きを理解し、TypeScriptの型、
            Node.jsの実行環境へ進みます。読むだけでなく、すべての講義でコードを書きます。
          </p>
          <a href="#course-catalog" className="course-catalog-jump">
            講座を選ぶ
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </header>

      <main id="main-content">
        <HomeTracks
          js={lessonsByTrack("js")}
          ts={lessonsByTrack("ts")}
          node={lessonsByTrack("node")}
        />

        <section className="course-project-showcase" aria-labelledby="project-title">
        <div className="course-section-heading">
          <div>
            <p className="course-section-kicker">3講座で作るもの</p>
            <h2 id="project-title">注文台帳を、少しずつ完成させる</h2>
          </div>
          <p>
            先に完成形を触り、各講座でどの部分を作るか確認できます。
          </p>
        </div>
        <OrderProjectPreview />
        <ol className="project-roadmap" aria-label="注文管理システムの完成まで">
          <li>
            <span>JavaScript</span>
            <strong>画面を動かす</strong>
            <p>注文を並べ、追加と支払更新を操作できるようにする</p>
          </li>
          <li>
            <span>TypeScript</span>
            <strong>データを守る</strong>
            <p>注文番号・金額・状態の取り違えを実行前に見つける</p>
          </li>
          <li>
            <span>Node.js</span>
            <strong>APIへつなぐ</strong>
            <p>注文を読み書きし、安全に起動・停止できるようにする</p>
          </li>
        </ol>
        </section>
      </main>
    </div>
  );
}
