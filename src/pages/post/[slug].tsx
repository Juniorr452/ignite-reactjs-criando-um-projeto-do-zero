import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client';

import { FaCalendar, FaUser, FaClock } from 'react-icons/fa';

import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import { useUtterances } from 'src/hooks/useUtterances';
import dateFormat from '../../utils/dateFormat';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  prevPost?: Post;
  nextPost?: Post;
  preview: boolean;
}

const Post: React.FC<PostProps> = ({ post, prevPost, nextPost, preview }) => {
  const router = useRouter();
  useUtterances('comments');

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

        {post.first_publication_date !== post.last_publication_date && (
          <div className={styles.editedInfo}>
            * editado em {dateFormat(post.last_publication_date)}
          </div>
        )}

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

        {(prevPost || nextPost) && <hr />}

        <div className={styles.otherPosts}>
          {prevPost && (
            <div className={styles.prevPost}>
              <h3>{prevPost.data.title}</h3>
              <a href={`/post/${prevPost.uid}`}>Post anterior</a>
            </div>
          )}

          {nextPost && (
            <div className={styles.nextPost}>
              <h3>{nextPost.data.title}</h3>
              <a href={`/post/${nextPost.uid}`}>Próximo post</a>
            </div>
          )}
        </div>

        <div id="comments" className={styles.comments} />

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

  const { preview = false, previewData } = context;

  const prismic = getPrismicClient();
  const post = await prismic.getByUID('posts', slug as string, {
    ref: previewData?.ref ?? null,
  });

  const prevPost =
    (
      await prismic.query(Prismic.Predicates.at('document.type', 'posts'), {
        pageSize: 1,
        after: `${post.id}`,
        orderings: '[document.first_publication_date desc]',
        ref: previewData?.ref ?? null,
      })
    ).results[0] || null;

  const nextPost =
    (
      await prismic.query(Prismic.Predicates.at('document.type', 'posts'), {
        pageSize: 1,
        after: `${post.id}`,
        orderings: '[document.first_publication_date]',
        ref: previewData?.ref ?? null,
      })
    ).results[0] || null;

  return {
    props: {
      post,
      prevPost,
      nextPost,
      preview,
    },
  };
};
