import { HomeTracks } from "@/components/home-tracks";
import { lessonsByTrack } from "@/lib/course";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="bg-desk px-5 py-12 sm:px-10 lg:px-14 lg:py-16">
        <p className="font-mono text-xs tracking-[0.18em] text-studio">
          しくみ講座 · JS / TS / NODE
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-[2.15rem] font-medium leading-[1.2] tracking-tight sm:text-5xl">
          値の動きを見てから、
          <br className="hidden sm:block" />
          型と実行環境へ進む。
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-mute">
          各講義は編に分かれていて、基礎から上級まで順に厚くなります。図と参考コードのスライドのあと、同じ内容の演習です。
        </p>
        <ol className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          <li className="neo-card p-5">
            <p className="font-mono text-xs tracking-widest text-studio">01 見る</p>
            <p className="mt-2 text-xl font-medium">図とコードのスライド</p>
            <p className="mt-2 text-sm leading-6 text-mute">
              仕組みを図で示し、すぐ横に動くコードを置く
            </p>
          </li>
          <li className="neo-card p-5">
            <p className="font-mono text-xs tracking-widest text-studio">02 書く</p>
            <p className="mt-2 text-xl font-medium">同じ内容の演習</p>
            <p className="mt-2 text-sm leading-6 text-mute">
              できた、と提出してから次のスライドへ進む
            </p>
          </li>
        </ol>
      </header>
      <HomeTracks
        js={lessonsByTrack("js")}
        ts={lessonsByTrack("ts")}
        node={lessonsByTrack("node")}
      />
    </div>
  );
}
