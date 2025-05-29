import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User, updateProfile } from 'firebase/auth';
import { collection, doc, addDoc, getDoc, updateDoc, increment, Timestamp, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { app, auth, db, storage } from '../../firebaseConfig';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image,} from 'react-native';

type AppUser = {
  name: string; 
  photoUrl: string;
};

type Post ={
  id: string;
  text: string;
  likes: number;
  username: string;
  photoUrl: string;
};

type Comment = {
  id: string;
  text: string;
  username: string;
  photoUrl: string;
  likes: number;
  dislikes: number;
};

export const Post = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [postContent, setPostContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [commentText, setCommentText] = useState<{ [postId: string]: string }>({});
  const [comments, setComments] = useState<{ [key: number]: Comment[] }>({});
  const [isNewestFirst, setIsNewestFirst] = useState(true);

  
  // fetch user data 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              name: data.name || '',
              photoUrl: data.photoUrl || '',
            });
          } else {
            // console.warn('User profile not found');
            // no user info found 
            setUser({
              name: currentUser.displayName || '',
              photoUrl: currentUser.photoURL || '',
            });
          }
        } catch (error) {
          console.error('Failed to fetch user profile', error);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);


  // post with sort order
  useEffect(() => {
    const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', isNewestFirst ? 'desc' : 'asc'));
    
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, [isNewestFirst]);

  //comments 
  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    posts.forEach((post) => {
      const commentsRef = collection (db, 'posts', post.id, 'comments');
      const q = query(commentsRef, orderBy ('createdAt', 'asc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const commentsData: Comment[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          text: doc.data().text,
          username: doc.data().username,
          photoUrl: doc.data().photoUrl,
          likes: doc.data().likes || 0,
          dislikes: doc.data().dislikes || 0,
        }));
        setComments(prev => ({ ...prev, [post.id]: commentsData}));
      });
      
      unsubscribes.push(unsubscribe);
    });
    // cleanup all listeners when posts change 
    return () =>{
      unsubscribes.forEach(unsub =>unsub());
    };
  }, [posts]);
  
  // new post 
  const handleSubmitPost = async () => {
    if (!user) {
      alert("Please sign in to post.");
      return;
    }

    if (postContent.trim() === '') {
      setErrorMessage('Post cannot be empty!');
      return;
    }

    try{
      await addDoc(collection(db, 'posts'), {
        text: postContent,
        likes: 0,
        dislikes: 0,
        username: user.name,
        photoUrl: user.photoUrl,
        createdAt: Timestamp.now(),
      });
      setPostContent('');
      setErrorMessage('');
    } catch (error) {
      console.error('Error adding post:', error);
      setErrorMessage('Failed to submit the post');
    }
  };

    // add comments to post 
  const handleAddComment = async (postId: string, commentText: string, userId?: string) => {

    if (!user) {
      alert("Please sign in to comment.");
      return;
    }

    if (!userId) {
      console.warn("Cannot add comment without user ID");
      return;
    }
    try {
      // Get user info from Firestore
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef); 

      if (!userDoc.exists()) {
        console.error('User document not found!');
        return;
      }

      const userData = userDoc.data();

      const postRef = doc(db, 'posts', postId);

      await addDoc(collection(postRef, 'comments'), {
        text: commentText,
        userId,
        username: userData?.name || '',
        phone: userData?.phone || '',
        photoUrl: userData?.photoUrl || '',
        likes: 0,
        dislikes: 0,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
    setCommentText(prev => ({ ...prev, [postId]: ''}));
  };
  
  const toggleSortOrder = () => {
    setIsNewestFirst(!isNewestFirst);
  };

  // if (!user) {
  //   return (
  //     <View>
  //       <Text>Loading user info...</Text>
  //     </View>
  //   );
  // }

  // likes  - post 
  const handleLikePost = async (postId: string) => {

    if (!user) {
      alert("Please sign in to like the post.");
      return;
    }

    try{
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: increment(1),
      });
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  // dislike post 
  const handleDislikePost = async (postId: string) => {

    if (!user) {
      alert("Please sign in.");
      return;
    }

    try{
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        dislikes: increment(1),
      });
    } catch (error) {
      console.error('Failed to dislike post:', error);
    }
  };


  // likes  - comments  
  const handleLikeComment = async (postId: string, commentId: string) => {

    if (!user) {
      alert("Please sign in to like comment.");
      return;
    }

    try {
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      await updateDoc(commentRef, {
        likes: increment(1),
      });
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

    // dislikes  - comments  
  const handleDislikeComment = async (postId: string, commentId: string) => {

    if (!user) {
      alert("Please sign in.");
      return;
    }

    try {
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      await updateDoc(commentRef, {
        dislikes: increment(1),
      });
    } catch (error) {
      console.error('Failed to dislike comment:', error);
    }
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
        <Text style={styles.buttonText}> Submit Post</Text>
      </TouchableOpacity>

      <FlatList
        data={posts} 
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          
          <View style={styles.postItem}>
            <View style={styles.postHeader}>
              <Text style={[styles.photoUrl, { fontSize: 24, textAlign: 'center', lineHeight: 32 }]}>
                {item.photoUrl || ''}
              </Text>
              <Text style={styles.postUsername}>{item.username}</Text>
            </View>
            <Text style={styles.postText}>{item.text}</Text>

            <TouchableOpacity onPress={() => handleLikePost(item.id)}>
              <Text style={styles.likeText}>Likes {item.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleDislikePost(item.id)}>
              <Text style={styles.likeText}>Dislikes {item.dislikes || 0}</Text>
            </TouchableOpacity>

            <FlatList
              data={comments[item.id] || []}
              keyExtractor={(comment, index) => comment.text + index.toString()}
              renderItem={({ item: comment }) => (
                <View style={styles.commentItem}>
                  { item.photoUrl !== "" ?
                    <Image
                      source={{ uri: item.photoUrl }}
                      style={styles.photoUrl}
                    /> :
                    null
                  }
                  <View style={styles.commentTextContainer}>
                    <Text style={styles.commentUsername}>{item.username}</Text>

                    <Text style={styles.commentText}>{comment.text}</Text>
                      
                      <TouchableOpacity onPress={() => handleLikeComment(item.id, comment.id)}>
                        <Text style={{ color: '#984063' }}>Like {comment.likes}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => handleDislikeComment(item.id, comment.id)}>
                        <Text style={{ color: '#984063' }}>Dislike {comment.dislikes || 0}</Text>
                      </TouchableOpacity>



                  </View>
                </View>
              )}
            />

            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              value={commentText[item.id] || ''}
              onChangeText={text =>
                // setCommentText({ ...commentText, [item.id]: text })
                setCommentText((prev) => ({ ...prev, [item.id]: text }))
              }
            />

            <TouchableOpacity
              style={styles.commentButton}
              onPress={() => handleAddComment(item.id, commentText[item.id], auth.currentUser?.uid)}
            >
              <Text style={styles.buttonText}>Add Comment</Text>
            </TouchableOpacity>
          </View>
        )}
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
  photoUrl: {
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
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
},
  postUsername: {
    fontWeight: '600',
    fontSize: 16,
    color: '#41436A',
},
});
