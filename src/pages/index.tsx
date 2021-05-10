import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client';

import { FaCalendar, FaUser } from 'react-icons/fa';

import dateFormat from 'src/utils/dateFormat';
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
  posts: Post[];
  postsPagination: PostPagination;
}

const Home: React.FC<HomeProps> = ({ posts, postsPagination }) => {
  return (
    <main className={commonStyles.container}>
      <Head>
        <title>Postagens | spacetravelling</title>
      </Head>
      <div className={styles.posts}>
        {posts.map(post => (
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
                {dateFormat(post.first_publication_date, 'P')}
              </time>
              <span>
                <FaUser />
                {post.data.author}
              </span>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    { orderings: '[my.posts.date desc]' }
  );

  return {
    props: {
      posts: postsResponse.results,
    },
  };
};

export default Home;
