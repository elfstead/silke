import { signal, effect } from '@silke/core';

const HN_API = 'https://hacker-news.firebaseio.com/v0';

function Post(props: {post: any}) {
  return (
    <li>
      <a href={`https://news.ycombinator.com/item?id=${props.post.id}`} target="_blank">
        <a href={props.post.url} target="_blank">
          <h3>{props.post.title}</h3>
        </a>
        <p>{props.post.score} comments | by {props.post.by} | {(new Date(props.post.time * 1000)).toISOString()}</p>
      </a>
    </li>
  );
}

function App() {
  const posts = signal<any[]>([]);
  const loading = signal(false);
  const error = signal<string | null>(null);
  const fetchPosts = async () => {
    loading(true);
    error(null);
    try {
      const response = await fetch(`${HN_API}/topstories.json?limitToFirst=10&orderBy="$key"`);
      if (!response.ok) {
        throw new Error(`Failed to fetch /topstories: ${response.status}`);
      }
      const postIds = await response.json();
      const items = await Promise.all(postIds.map(async (postId: number) => {
        const response = await fetch(`${HN_API}/item/${postId}.json`);
        if (!response.ok) {
          throw new Error(`Failed to fetch /item: ${response.status}`);
        }
        return await response.json();
      }));
      posts(items);
      console.log(posts());
    } catch (e: any) {
      error(e.message);
    } finally {
      loading(false);
      console.log(loading());
    }
  };
  effect(fetchPosts);

  return (
    <div>
      <h1>Posts</h1>
      <button onClick={fetchPosts}>Refresh</button>
      {() => {
        if (loading()) {
          return <p>Loading...</p>;
        }

        if (error()) {
          return <p style="color: red;">Error: {error()}</p>;
        }

        return (
          <ul>
            {posts().map((post: any) => (
              <Post post={post}/>
            ))}
          </ul>
        );
      }}
    </div>
  );
}

const root = document.getElementById('app');

if (root) {
  root.appendChild(<App /> as Node);
}
