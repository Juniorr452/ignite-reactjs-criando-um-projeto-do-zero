import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';

import { FaCalendar, FaUser, FaClock } from 'react-icons/fa';

import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import dateFormat from '../../utils/dateFormat';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  readingTime: number;
}

const Post: React.FC<PostProps> = ({ post, readingTime }) => {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <main className={`${styles.post} ${commonStyles.container}`}>
        <h2>Carregando...</h2>
      </main>
    );
  }

  return (
    <main>
      <Head>
        <title>{post.data.title} | spacetravelling</title>
      </Head>

      <div
        className={styles.cover}
        style={{ backgroundImage: `url(${post.data.banner.url})` }}
      />

      <div className={`${styles.post} ${commonStyles.container}`}>
        <h1>{post.data.title}</h1>

        <div className={styles.info}>
          <time>
            <FaCalendar />
            {dateFormat(post.first_publication_date)}
          </time>
          <span>
            <FaUser />
            {post.data.author}
          </span>
          <span>
            <FaClock />
            {`${readingTime} min`}
          </span>
        </div>

        <div className={styles.body}>
          {post.data.content.map(content => {
            return (
              <section className={styles.content} key={content.heading}>
                <h2>{content.heading}</h2>
                <div dangerouslySetInnerHTML={{ __html: content.body }} />
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default Post;

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    { fetch: 'posts.uid' }
  );

  console.log(posts);

  return {
    paths: posts.results.map(post => ({
      params: {
        slug: post.uid,
      },
    })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const { slug } = context.params;
  const response = await prismic.getByUID('posts', slug as string, {});

  const postWords = response.data.content.reduce(
    (acc, { body }) => acc + RichText.asText(body),
    ''
  );

  const wordsPerMinute = 200;
  const readingTime = Math.round(
    postWords.match(/[\w]+/g).length / wordsPerMinute
  );

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      ...response.data,
      content: response.data.content.map(({ heading, body }) => ({
        heading,
        body: RichText.asHtml(body),
      })),
    },
  };

  return {
    props: {
      post,
      readingTime,
    },
  };
};
