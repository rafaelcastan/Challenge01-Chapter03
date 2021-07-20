import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Head from 'next/head';

import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { ReactElement } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header/index';
import PreviewButton from '../../components/PreviewButton/index';

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
  preview: boolean;
}

export default function Post({ post, preview }: PostProps): ReactElement {
  const router = useRouter();

  if (router.isFallback) {
    return <h2>Carregando...</h2>;
  }

  const totalWords = post.data.content.reduce((total, content) => {
    // eslint-disable-next-line no-param-reassign
    total += content.heading;
    // eslint-disable-next-line no-param-reassign
    total += RichText.asText(content.body);
    return total;
  }, '');

  const readAverage = Math.ceil(totalWords.split(' ').length / 200);

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>
      <Header />
      <main className={`${commonStyles.container} ${styles.container}`}>
        {post.data.banner.url !== null && (
          <img src={post.data.banner.url} alt="" />
        )}
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={styles.infos}>
            <div>
              <FiCalendar size={24} style={{ marginRight: '0.5rem' }} />
              <time>
                {format(new Date(post.first_publication_date), 'dd MMM u', {
                  locale: ptBR,
                })}
              </time>
            </div>
            <div>
              <FiUser size={24} style={{ marginRight: '0.5rem' }} />
              <p>{post.data.author}</p>
            </div>
            <div>
              <FiClock size={24} style={{ marginRight: '0.5rem' }} />
              <p>{readAverage} min</p>
            </div>
          </div>
          {post.data.content.map(content => (
            <article key={content.heading}>
              <strong>{content.heading}</strong>
              <div
                className={styles.postContent}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </article>
          ))}
        </article>
        {preview && <PreviewButton className={styles.PreviewButton} />}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref || null,
  });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url:
          response.data.banner.url !== undefined
            ? response.data.banner.url
            : null,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: {
      post,
      preview,
    },
    revalidate: 60 * 60,
  };
};
