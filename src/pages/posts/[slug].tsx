import Content from "@/components/Content";
import type { NextPage, GetStaticProps, GetStaticPaths } from "next";
import DefaultErrorPage from "next/error";
import styles from "../../styles/Content.module.css";
import Image from "next/image";
import { useRouter } from "next/router";
import TestImage2 from "/public/img/test-2.jpeg";
import Author from "@/components/Author";
import { ChatIcon, HeartIcon, EyeIcon } from "@heroicons/react/solid";
import Related from "@/components/Related";
import { getAllPosts, getPostsBSlug, getPostsByCategory } from "hooks/usePost";
import { dehydrate, QueryClient } from "react-query";
import { useGetPostBySlugQuery } from "@customTypes/generated/graphql";
import { getClient } from "utils/client";
import DataWrapper from "@/components/DataWrapper";
import Markdown from "@/components/Markdown";

const PostPage: NextPage = (props) => {
  const router = useRouter();

  const { data, status, error } = useGetPostBySlugQuery(getClient(), {
    slug: String(router.query.slug),
  });

  if (router.isFallback || status === "loading") {
    return <DataWrapper status="loading" />;
  }
  if (data && data.posts?.data.length === 0) {
    // return error page
    return <DefaultErrorPage statusCode={404} />;
  }

  const post = data?.posts?.data;

  return (
    <Content classNames="overflow-y-hidden">
      <DataWrapper status={status}>
        {post ? (
          <div className={styles.container}>
            <section className={styles.contentContainer}>
              <div className={styles.titleContainer}>
                <h2 className={styles.contentTitle}>
                  {post[0].attributes?.title}
                </h2>
                {/* <p className="flex mt-2 text-gray-400">
                  <EyeIcon className="h-5 w-5 self-center" />
                  <span className="pl-2">100</span>
                </p> */}
              </div>

              <p className={styles.contentDescription}>
                {post[0].attributes?.description}
              </p>
              <div className={styles.contentCoverImage}>
                <Image
                  src={TestImage2}
                  alt="the featured image of the blog post. "
                  width={800}
                  height={665}
                />
              </div>
              <article className={styles.contentMain}>
                <Markdown content={post[0].attributes?.content ?? ``} />
              </article>
              <div className={styles.iconContainer}>
                <p className={styles.icon}>
                  <ChatIcon className="h-7 w-7" />
                  <span className={styles.iconText}>100</span>
                </p>
                <p className={styles.icon}>
                  <HeartIcon className="h-7 w-7 text-red-600 " />
                  <span className={styles.iconText}>100</span>
                </p>
                <p className={styles.icon}>
                  <span>👏</span>
                  <span className={styles.iconText}>100</span>
                </p>
              </div>
            </section>
            <aside className={styles.asideContainer}>
              <Author />
              <Related />
            </aside>
          </div>
        ) : (
          <p> No Post</p>
        )}
      </DataWrapper>
    </Content>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getAllPosts(1, 100);
  const postPaths = posts.data.map((post) => ({
    params: {
      slug: post.attributes.slug,
    },
  }));

  return {
    paths: [...postPaths],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const queryClient = new QueryClient();
  const { params } = ctx;
  await queryClient.prefetchQuery(
    ["getPostBySlug", { slug: params?.slug }],
    () => getPostsBSlug(String(params?.slug))
  );
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      params,
    },
    revalidate: 10,
  };
};

export default PostPage;
