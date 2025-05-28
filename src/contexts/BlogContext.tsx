import React, { createContext, useContext, useState } from 'react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  image: string;
  author: string;
  date: string;
  category: string;
  likes: number;
}

interface BlogContextType {
  posts: BlogPost[];
  addPost: (post: Omit<BlogPost, 'id'>) => void;
  likePost: (id: string) => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: '1',
      title: 'Getting Started with Online Tutoring',
      content: 'Learn the basics of online tutoring and how to make the most of your virtual learning experience...Learn the basics of online tutoring and how to make the most of your virtual learning experience...Learn the basics of online tutoring and how to make the most of your virtual learning experience...Learn the basics of online tutoring and how to make the most of your virtual learning experience...Learn the basics of online tutoring and how to make the most of your virtual learning experience...Learn the basics of online tutoring and how to make the most of your virtual learning experience...Learn the basics of online tutoring and how to make the most of your virtual learning experience...Learn the basics of online tutoring and how to make the most of your virtual learning experience...Learn the basics of online tutoring and how to make the most of your virtual learning experience...Learn the basics of online tutoring and how to make the most of your virtual learning experience...Learn the basics of online tutoring and how to make the most of your virtual learning experience...Learn the basics of online tutoring and how to make the most of your virtual learning experience...Learn the basics of online tutoring and how to make the most of your virtual learning experience...Learn the basics of online tutoring and how to make the most of your virtual learning experience...',
      image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=500',
      author: 'John Doe',
      date: '2024-03-15',
      category: 'Education',
      likes: 42
    },
    {
      id: '2',
      title: 'Top 10 Study Tips for Success',
      content: 'Discover proven study techniques that will help you achieve better results in your academic journey...',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500',
      author: 'Jane Smith',
      date: '2024-03-14',
      category: 'Study Tips',
      likes: 38
    },
    {
      id: '3',
      title: 'The Future of Education',
      content: 'Explore how technology is shaping the future of education and what it means for students and teachers...',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500',
      author: 'Mike Johnson',
      date: '2024-03-13',
      category: 'Technology',
      likes: 56
    }
  ]);

  const addPost = (post: Omit<BlogPost, 'id'>) => {
    const newPost = {
      ...post,
      id: Date.now().toString(),
    };
    setPosts([newPost, ...posts]);
  };

  const likePost = (id: string) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  return (
    <BlogContext.Provider value={{ posts, addPost, likePost }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
}; 