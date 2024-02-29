import { Handler, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { accepts } from "$std/http/mod.ts";
import Post from "../../components/Post.tsx";
import { federation } from "../../federation/mod.ts";
import { Blog, getBlog } from "../../models/blog.ts";
import { getPost, type Post as PostModel, toNote } from "../../models/post.ts";

export interface PostPageData {
  domain: string;
  blog: Blog;
  post: PostModel;
}

export const handler: Handler<PostPageData> = async (req, ctx) => {
  const blog = await getBlog();
  if (blog == null) return await ctx.renderNotFound();
  const post = await getPost(ctx.params.uuid);
  if (post == null) return await ctx.renderNotFound();
  const accept = accepts(
    req,
    "application/ld+json",
    "application/json",
    "text/html",
    "application/xhtml+xml",
  );
  if (accept == "application/ld+json" || accept == "application/json") {
    const fedCtx = federation.createContext(req);
    const note = toNote(fedCtx, blog, post);
    const jsonLd = await note.toJsonLd(fedCtx);
    return new Response(JSON.stringify(jsonLd), {
      headers: {
        "Content-Type": "application/ld+json",
        Vary: "Accept",
      },
    });
  }
  const data: PostPageData = { blog, post, domain: ctx.url.host };
  return ctx.render(data);
};

export default function PostPage(
  { data: { domain, blog, post } }: PageProps<PostPageData>,
) {
  return (
    <>
      <Head>
        <title>{post.title} &mdash; {blog.title}</title>
      </Head>
      <header>
        <hgroup>
          <h1>
            <a href="/">{blog.title}</a>
          </h1>
          <p>
            <strong>@{blog.handle}@{domain}</strong> &middot; {blog.description}
          </p>
        </hgroup>
      </header>
      <Post post={post} />
    </>
  );
}
