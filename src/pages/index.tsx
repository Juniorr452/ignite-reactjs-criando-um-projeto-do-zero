import { GetStaticProps } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';

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
    <main>
      {posts.map(post => (
        <article key={post.uid}>
          <Link href={`/post/${post.uid}`}>
            <a>
              <h2>{post.data.title}</h2>
            </a>
          </Link>
          <p>{post.data.subtitle}</p>
          <span className="info">
            <time>{post.first_publication_date}</time>
            <span>{post.data.author}</span>
          </span>
        </article>
      ))}
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
