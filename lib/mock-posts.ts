export function mockPosts(count = 20) {
  return Array.from({ length: count }).map((_, i) => {
    const w = 300 + Math.floor(Math.random() * 800); // 300–1100px
    const h = 300 + Math.floor(Math.random() * 800);
    const id = `${Date.now()}-${i}`;

    return {
      id,
      author_id: "mock-user",
      text: "Mock post " + i,
      images: [
        {
          id: `img-${id}`,
          path: `https://picsum.photos/${w}/${h}?random=${id}`,
          width: w,
          height: h,
          size_bytes: w * h * 3,
          mime: "image/jpeg",
          alt: `Random ${i}`,
        },
      ],
      like_count: Math.floor(Math.random() * 50),
      repost_count: Math.floor(Math.random() * 10),
      comment_count: Math.floor(Math.random() * 20),
      bookmark_count: Math.floor(Math.random() * 5),
      created_at: new Date().toISOString(),
    };
  });
}
