import { GetStaticProps } from 'next';
import Head from 'next/head';

import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useState } from 'react';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { ReactElement } from 'react';
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
}

export default function Home({ postsPagination }: HomeProps): ReactElement {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  function LoadMorePosts(): void {
    fetch(nextPage).then(async function fetchResponse(response) {
      const responseResolved: ApiSearchResponse = await Promise.resolve(
        response.json()
      );
      const results = responseResolved.results.map(post => {
        return {
          uid: post.uid,
          first_publication_date: new Date(
            post.last_publication_date
          ).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          },
        };
      });
      const { next_page } = responseResolved;
      setPosts([...posts, ...results]);
      setNextPage(next_page);
    });
  }

  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>
      <main className={styles.container}>
        {posts.map(post => (
          <div className={styles.posts} key={post.uid}>
            <a href={`/posts/${post.uid}`}>
              <strong>{post.data.title}</strong>
            </a>
            <p>{post.data.subtitle}</p>
            <div className={styles.info}>
              <div>
                <FiCalendar style={{ marginRight: '0.5rem' }} />
                <time>{post.first_publication_date}</time>
              </div>
              <div>
                <FiUser style={{ marginRight: '0.5rem' }} />
                <p>{post.data.author}</p>
              </div>
            </div>
          </div>
        ))}
        {nextPage && (
          <button onClick={LoadMorePosts} type="button">
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author', 'posts.content'],
      pageSize: 2,
    }
  );
  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: new Date(
        post.last_publication_date
      ).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });
  const { next_page } = postsResponse;

  return {
    props: {
      postsPagination: { results, next_page },
    },
  };
};
