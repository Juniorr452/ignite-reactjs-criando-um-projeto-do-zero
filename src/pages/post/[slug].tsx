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
}

const Post: React.FC<PostProps> = ({ post }) => {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <main className={`${styles.post} ${commonStyles.container}`}>
        <h2>Carregando...</h2>
      </main>
    );
  }

  const postWords = post.data.content.reduce(
    (acc, { body }) => acc + RichText.asText(body),
    ''
  );

  const wordsPerMinute = 150;
  const readingTime = Math.round(
    postWords.match(/[\w]+/g).length / wordsPerMinute
  );

  const content = post.data.content.map(({ heading, body }) => ({
    heading,
    body: RichText.asHtml(body),
  }));

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
          {content.map(({ heading, body }) => {
            return (
              <section className={styles.content} key={heading}>
                <h2>{heading}</h2>
                <div dangerouslySetInnerHTML={{ __html: body }} />
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
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const post = await prismic.getByUID('posts', slug as string, {});

  return {
    props: {
      post,
    },
  };
};
