import Head from 'next/head';
import WordleGame from './components/WordleGame';

export default function Home() {
  return (
    <>
      <Head>
        <title>Wordle Clone with Next.js</title>
        <meta name="description" content="A Wordle clone built with Next.js and TypeScript" />
      </Head>
      <main>
        <WordleGame />
      </main>
    </>
  );
}