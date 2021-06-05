import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client';

import { FaCalendar, FaUser } from 'react-icons/fa';

import { useState } from 'react';
import dateFormat from '../utils/dateFormat';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

const Home: React.FC<HomeProps> = ({ postsPagination, preview }) => {
  const [posts, setPosts] = useState(postsPagination);

  const handleLoadMorePosts = async (): Promise<void> => {
    const response = await fetch(posts.next_page);
    const data: PostPagination = await response.json();

    setPosts({
      next_page: data.next_page,
      results: [...posts.results, ...data.results],
    });
  };

  return (
    <main className={commonStyles.container}>
      <Head>
        <title>Postagens | spacetravelling</title>
      </Head>
      <div className={styles.posts}>
        {posts.results.map(post => (
          <article key={post.uid}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <h2>{post.data.title}</h2>
              </a>
            </Link>
            <p className={styles.excerpt}>{post.data.subtitle}</p>
            <div className={styles.info}>
              <time>
                <FaCalendar />
                {dateFormat(post.first_publication_date)}
              </time>
              <span>
                <FaUser />
                {post.data.author}
              </span>
            </div>
          </article>
        ))}

        {posts.next_page && (
          <button
            type="button"
            onClick={handleLoadMorePosts}
            className={styles.carregarMais}
          >
            Carregar mais posts
          </button>
        )}

        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a className="link-preview">Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </div>
    </main>
  );
};

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      orderings: '[my.posts.date desc]',
      pageSize: 1,
      ref: previewData?.ref ?? null,
    }
  );

  return {
    props: {
      postsPagination: postsResponse,
      preview,
    },
  };
};

export default Home;
