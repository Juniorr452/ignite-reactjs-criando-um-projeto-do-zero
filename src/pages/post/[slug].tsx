import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import { FaCalendar, FaUser, FaClock } from 'react-icons/fa';

import { RichText } from 'prismic-dom';
import dateFormat from 'src/utils/dateFormat';
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
            {dateFormat(post.first_publication_date, 'P')}
          </time>
          <span>
            <FaUser />
            {post.data.author}
          </span>
          <span>
            <FaClock />
            {`${readingTime} min${readingTime > 1 ? 's' : ''}`}
          </span>
        </div>

        <div className={styles.body}>
          {post.data.content.map(content => {
            return (
              <section className={styles.content}>
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
  // const posts = await prismic.query(TODO);

  return {
    paths: [],
    fallback: 'blocking',
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
