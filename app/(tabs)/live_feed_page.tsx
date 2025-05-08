
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';

type User = {
  name: string;
  photoUrl: string;
};

type PostProps = {
  user: User;
};

export const Post = ({ user }: PostProps) => {
  const [postContent, setPostContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [commentText, setCommentText] = useState<{ [key: number]: string }>({});
  const [comments, setComments] = useState<{ [key: number]: { text: string; username: string; avatarUrl: string }[] }>({});
  const [isNewestFirst, setIsNewestFirst] = useState(true);

  const handleSubmitPost = () => {
    if (postContent.trim() === '') {
      setErrorMessage('Post cannot be empty!');
      return;
    }

    const newPost = {
      id: posts.length + 1,
      text: postContent,
      likes: 0,
    };

    setPosts([...posts, newPost]);
    setPostContent('');
    setErrorMessage('');
  };

  const handleLikePost = (postId: number) => {
    const updatedPosts = posts.map(post =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    );
    setPosts(updatedPosts);
  };

  const handleAddComment = (postId: number) => {
    const text = commentText[postId];
    if (!text || text.trim() === '') return;

    const updatedComments = { ...comments };
    if (!updatedComments[postId]) updatedComments[postId] = [];

    const newComment = {
      text,
      username: user.name,
      avatarUrl: user.photoUrl,
    };

    updatedComments[postId].push(newComment);

    setComments(updatedComments);
    setCommentText({ ...commentText, [postId]: '' });
  };

  const toggleSortOrder = () => {
    setIsNewestFirst(!isNewestFirst);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>New Post</Text>
        <TouchableOpacity onPress={toggleSortOrder}>
          <Text style={styles.sortText}>
            {isNewestFirst ? 'Newest ↓' : 'Oldest ↑'}
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Write your post..."
        value={postContent}
        onChangeText={setPostContent}
      />

      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSubmitPost}>
        <Text style={styles.buttonText}>Submit Post</Text>
      </TouchableOpacity>

      <FlatList
        data={[...posts].sort((a, b) => isNewestFirst ? b.id - a.id : a.id - b.id)}
        renderItem={({ item }) => (
          <View style={styles.postItem}>
            <Text style={styles.postText}>{item.text}</Text>

            <TouchableOpacity onPress={() => handleLikePost(item.id)}>
              <Text style={styles.likeText}>Likes {item.likes}</Text>
            </TouchableOpacity>

            <FlatList
              data={comments[item.id] || []}
              keyExtractor={(comment, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Image
                    source={{ uri: item.avatarUrl }}
                    style={styles.avatar}
                  />
                  <View style={styles.commentTextContainer}>
                    <Text style={styles.commentUsername}>{item.username}</Text>
                    <Text style={styles.commentText}>{item.text}</Text>
                  </View>
                </View>
              )}
            />

            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              value={commentText[item.id] || ''}
              onChangeText={text =>
                setCommentText({ ...commentText, [item.id]: text })
              }
            />

            <TouchableOpacity
              style={styles.commentButton}
              onPress={() => handleAddComment(item.id)}
            >
              <Text style={styles.buttonText}>Add Comment</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

export default Post;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  headerRow: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    color: '#41436A',
  },
  sortText: { 
    fontSize: 14,
    color: '#984063',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#984063',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  postItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#41436A',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  postText: { fontSize: 16 },
  likeText: { color: '#984063', marginVertical: 4 },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 5,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentTextContainer: {
    flex: 1,
  },
  commentUsername: {
    fontWeight: 'bold',
    color: '#41436A',
  },
  commentText: {
    marginLeft: 0,
    color: '#333',
  },
  commentButton: {
    backgroundColor: '#41436A',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
});
