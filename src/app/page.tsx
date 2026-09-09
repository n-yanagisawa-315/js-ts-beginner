import { HomeTracks } from "@/components/home-tracks";
import { OrderProjectPreview } from "@/components/order-project-preview";
import { Badge } from "@/components/ui/badge";
import { getHomePageDTO } from "@/lib/course/server";

export default function Home() {
  const course = getHomePageDTO();
  return (
    <div className="course-catalog-page">
      <header className="course-catalog-hero">
        <div>
          <Badge>基礎をしっかり</Badge>
          <p className="course-catalog-brand">しくみ講座 · CODE / DATA / TEAM</p>
          <h1>
            注文管理を作りながら、
            <br />
            プログラムの基礎を学ぶ。
          </h1>
          <p>
            JavaScript・TypeScript・Node.jsに加え、SQLとGitHubもブラウザ内で実際に操作します。
            読むだけでなく、すべての講義で手を動かします。
          </p>
          <a href="#course-catalog" className="course-catalog-jump">
            講座を選ぶ
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </header>

      <main id="main-content">
        <HomeTracks course={course} />

        <section className="course-project-showcase" aria-labelledby="project-title">
        <div className="course-section-heading">
          <div>
            <p className="course-section-kicker">5講座で作るもの</p>
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
          <li>
            <span>SQL</span>
            <strong>注文を保存して探す</strong>
            <p>検索・集計・更新を使い、注文データベースを整える</p>
          </li>
          <li>
            <span>GitHub</span>
            <strong>変更を安全に共有する</strong>
            <p>履歴・ブランチ・Pull Requestで共同開発を進める</p>
          </li>
        </ol>
        </section>
      </main>
    </div>
  );
}
