import { GetStaticProps } from 'next';
import Head from 'next/head';

import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { ReactElement } from 'react';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import PreviewButton from '../components/PreviewButton/index';

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

export default function Home({
  postsPagination,
  preview,
}: HomeProps): ReactElement {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  function LoadMorePosts(): void {
    fetch(nextPage).then(async function fetchResponse(response) {
      const responseResolved: ApiSearchResponse = await Promise.resolve(
        response.json()
      );
      const { next_page, results } = responseResolved;

      const newPosts: Post[] = results.map(post => ({
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      }));
      setPosts([...posts, ...newPosts]);
      setNextPage(next_page);
    });
  }

  return (
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>
      <main className={`${commonStyles.container} ${styles.container}`}>
        <img src="logo.svg" alt="logo" />
        {posts.map(post => (
          <div className={styles.posts} key={post.uid}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.info}>
                  <div>
                    <FiCalendar size={24} style={{ marginRight: '0.5rem' }} />
                    {format(new Date(post.first_publication_date), 'dd MMM u', {
                      locale: ptBR,
                    })}
                  </div>
                  <div>
                    <FiUser style={{ marginRight: '0.5rem' }} />
                    <p>{post.data.author}</p>
                  </div>
                </div>
              </a>
            </Link>
          </div>
        ))}
        {nextPage && (
          <button
            className={styles.loadMore}
            style={{}}
            onClick={LoadMorePosts}
            type="button"
          >
            Carregar mais posts
          </button>
        )}
        {preview && <PreviewButton className={styles.PreviewButton} />}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 5,
      orderings: '[document.first_publication_date desc]',
      ref: previewData?.ref ?? null,
    }
  );

  const { next_page, results } = postResponse;

  const posts: Post[] = results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));

  const timeToRevalidate = 60 * 3;

  return {
    props: {
      postsPagination: {
        next_page,
        results: posts,
      },
      preview,
    },
    revalidate: timeToRevalidate,
  };
};
