import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User, updateProfile } from 'firebase/auth';
import { collection, doc, addDoc, getDoc, updateDoc, increment, Timestamp, serverTimestamp, onSnapshot, query, orderBy, arrayUnion, arrayRemove } from 'firebase/firestore';
import { app, auth, db, storage } from '../../firebaseConfig';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image,} from 'react-native';

type AppUser = {
  id: string,
  name: string; 
  photoUrl: string;
};

type Post ={
  id: string;
  text: string;
  likes: number;
  dislikes: number;
  username: string;
  photoUrl: string;
  createdAt: any,
  createdBy: any,
  user_positive_points: any,
  user_negative_points: any
};

type Comment = {
  id: string;
  text: string;
  username: string;
  photoUrl: string;
  likes: number;
  dislikes: number;
  createdBy: any,
  createdAt: any,
  user_positive_points: any,
  user_negative_points: any,
  deleted?: boolean,
};

export const Post = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [postContent, setPostContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [commentText, setCommentText] = useState<{ [postId: string]: string }>({});
  const [comments, setComments] = useState<{ [key: number]: Comment[] }>({});
  const [editingComment, setEditingComment] = useState<{ [commentId: string]: string }>({});
  const [editingMode, setEditingMode] = useState<{ [commentId: string]: boolean }>({});
  const [isNewestFirst, setIsNewestFirst] = useState(true);
  const [update, pushUpdate] = useState<Boolean>(false);

  console.log("testing");
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
              id: currentUser.uid as string,
              name: data.name || '',
              photoUrl: data.photoUrl || '',
            });
          } else {
            // console.warn('User profile not found');
            // no user info found 
            setUser({
              id: currentUser.uid as string,
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
    
    const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdBy: doc.data().createdBy || "",
        photoUrl: doc.data().photoUrl || "🙂",
        createdAt: doc.data().createdAt.toDate().toLocaleString(),
        user_positive_points: 0,
        user_negative_points: 0
      }));
      for (let post of postsData) {
        if (post["createdBy"] !== "") {
          try {
            const userDocRef = doc(db, 'users', post["createdBy"]);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const data = userDoc.data();
              post["photoUrl"] = data.photoUrl;
              post["user_positive_points"] = data.positive_points_ranking;
              post["user_negative_points"] = data.negative_points_ranking;
            }
            if (post["photoUrl"] === "") {
              post["photoUrl"] = "🙂";
            }
          } catch (exception) {
            console.log(exception);
          }
        }
      }
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, [isNewestFirst, update]);

  //comments 
  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    posts.forEach((post) => {
      const commentsRef = collection (db, 'posts', post.id, 'comments');
      const q = query(commentsRef, orderBy ('createdAt', 'asc'));
      
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const commentsData: Comment[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          text: doc.data().text,
          username: doc.data().username,
          photoUrl: doc.data().photoUrl || "🙂",
          likes: doc.data().likes || 0,
          dislikes: doc.data().dislikes || 0,
          createdBy: doc.data().createdBy || "",
          createdAt: doc.data().createdAt.toDate().toLocaleString(),
          user_positive_points: 0,
          user_negative_points: 0
        }));
        for (let comment of commentsData) {
          if (comment["createdBy"] !== "") {
            try {
              const userDocRef = doc(db, 'users', comment["createdBy"]);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                const data = userDoc.data();
                comment["photoUrl"] = data.photoUrl;
                comment["user_positive_points"] = data.positive_points_ranking;
                comment["user_negative_points"] = data.negative_points_ranking;
              }
              if (comment["photoUrl"] === "") {
                comment["photoUrl"] = "🙂";
              }
            } catch (exception) {
              console.log(exception);
            }
          }
        }
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
        createdBy: user.id
      });
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        positive_points_ranking: increment(10)
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
        createdAt: serverTimestamp(),
        createdBy: userId as string
      });
      await updateDoc(userDocRef, {
        positive_points_ranking: increment(5)
      });
      pushUpdate(!update);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
    setCommentText(prev => ({ ...prev, [postId]: ''}));
  };
  
   // edit comments 
  
  const handleEditComment = async(postId: string, commentId: string) => {
    if (!user) {
      alert("cannot edit comment");
      return;
    }

    const newText = editingComment[commentId]?.trim();
    if(!newText)
      return;

    try{
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      const commentSnap = await getDoc(commentRef);

        if (!commentSnap.exists()) {
          alert("Comment not found.");
          return;
        }

        const commentData = commentSnap.data();

        if (commentData?.deleted) {
          alert("Cannot edit a deleted comment.");
          return;
        }
      
      await updateDoc( commentRef,{
        text: newText,
      }
      );
      
      setEditingMode(prev => ({ ...prev, [commentId]: false}));
      setEditingComment(prev => ({ ...prev, [commentId]: ''}));

    } catch (error) {
      console.error('Unable to edit comment:', error);
    }
  };

 // delete comments 
  
  const handleDeleteComment = async(postId: string, commentId: string) => {
    if (!user) {
      alert("cannot delete comment");
      return;
    }

    try{
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      await updateDoc( commentRef,{
        text: '[comment deleted by user]',
        deleted: true,
      }
      );
      
    } catch (error) {
      console.error('Unable to delete comment:', error);
    }
  };

  const toggleSortOrder = () => {
    setIsNewestFirst(!isNewestFirst);
  };

  // Liking a post 
  const handleLikePost = async (postId: string) => {

    if (!user) {
      alert("Please sign in to like the post.");
      return;
    }

    try{
      const postRef = doc(db, 'posts', postId);
      const postData = (await getDoc(postRef)).data();
      if (postData) {
        if (!postData["likedBy"] || !(postData["likedBy"].includes(user.id))) {
          if (postData["createdBy"]) {
            const userRef = doc(db, 'users', postData["createdBy"]);
            await updateDoc(userRef, {
              positive_points_ranking: increment(5)
            });
          }
          await updateDoc(postRef, {
            likes: increment(1),
            likedBy: arrayUnion(user.id)
          });
          if (postData["dislikedBy"] && postData["dislikedBy"].includes(user.id)) {
            await updateDoc(postRef, {
              dislikes: increment(-1),
              dislikedBy: arrayRemove(user.id)
            });
          }
        } else {
          alert("You have already liked the post.");
        }
      }
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
      const postData = (await getDoc(postRef)).data();
      if (postData) {
        if (!postData["dislikedBy"] || !(postData["dislikedBy"].includes(user.id))) {
          if (postData["createdBy"]) {
            const userRef = doc(db, 'users', postData["createdBy"]);
            await updateDoc(userRef, {
              negative_points_ranking: increment(5)
            });
          }
          await updateDoc(postRef, {
            dislikes: increment(1),
            dislikedBy: arrayUnion(user.id)
          });
          if (postData["likedBy"] && postData["likedBy"].includes(user.id)) {
            await updateDoc(postRef, {
              likes: increment(-1),
              likedBy: arrayRemove(user.id)
            });
          }
        } else {
          alert("You have already liked/disliked the post.");
        }
      }
    } catch (error) {
      console.error('Failed to dislike post:', error);
    }
  };


  // Liking a comment
  const handleLikeComment = async (postId: string, commentId: string) => {

    if (!user) {
      alert("Please sign in to like comment.");
      return;
    }

    try {
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      const commentData = (await getDoc(commentRef)).data();

      if (commentData) {

        if (commentData.deleted) {
          alert("The comment has been deleted, you cannot like it.");
          return;
        }

        if (!commentData["likedBy"] || !(commentData["likedBy"].includes(user.id))) {
          if (commentData["createdBy"]) {
            const userRef = doc(db, 'users', commentData["createdBy"]);
            await updateDoc(userRef, {
              positive_points_ranking: increment(1)
            });
          }
          await updateDoc(commentRef, {
            likes: increment(1),
            likedBy: arrayUnion(user.id)
          });
          if (commentData["dislikedBy"] && commentData["dislikedBy"].includes(user.id)) {
            await updateDoc(commentRef, {
              dislikes: increment(-1),
              dislikedBy: arrayRemove(user.id)
            });
          }
          pushUpdate(!update);
        } else {
          alert("You have already liked the comment.");
        }
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

    // Dislike a comment
  const handleDislikeComment = async (postId: string, commentId: string) => {

    if (!user) {
      alert("Please sign in.");
      return;
    }

    try {
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      const commentData = (await getDoc(commentRef)).data();
      if (commentData) {
        if (commentData.deleted) {
          alert("The comment has been deleted, you cannot dislike it.");
          return;
    }

        if (!commentData["dislikedBy"] || !(commentData["dislikedBy"].includes(user.id))) {
          if (commentData["createdBy"]) {
            const userRef = doc(db, 'users', commentData["createdBy"]);
            await updateDoc(userRef, {
              negative_points_ranking: increment(1)
            });
          }
          await updateDoc(commentRef, {
            dislikes: increment(1),
            dislikedBy: arrayUnion(user.id)
          });
          if (commentData["likedBy"] && commentData["likedBy"].includes(user.id)) {
            await updateDoc(commentRef, {
              likes: increment(-1),
              likedBy: arrayRemove(user.id)
            });
          }
          pushUpdate(!update);
        } else {
          alert("You have already liked/disliked the comment.");
        }

      }
    } catch (error) {
      console.error('Failed to dislike comment:', error);
    }
  };

  function calculate_ranking(positive_points_ranking: any, negative_points_ranking: any) {
    const points = positive_points_ranking - negative_points_ranking;
    let rank_name;
    let rank_emblem;
    if (points < 500) {
      rank_name = "Basis";
      rank_emblem = "🎉";
    } else if (points < 1000) {
      rank_name = "Bronze";
      rank_emblem = "🥉";
    } else if (points < 1500) {
      rank_name = "Silver";
      rank_emblem = "🥈";
    } else if (points < 2000) {
      rank_name = "Gold";
      rank_emblem = "🥇";
    } else {
      rank_name = "Diamond";
      rank_emblem = "💎";
    }
    return {
      points: points,
      rank_name: rank_name,
      rank_emblem: rank_emblem
    };
  }

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
              <View>
                <Text style={[ styles.postUsername, { flexDirection: "row" } ]}>{item.username}  <Text style = { { color: "gray", fontSize: 11 } }>{calculate_ranking(item.user_positive_points, item.user_negative_points)["points"] >= 0 ? "+" : ""}{calculate_ranking(item.user_positive_points, item.user_negative_points)["points"]} {calculate_ranking(item.user_positive_points, item.user_negative_points)["rank_emblem"]}</Text></Text>
                <Text style={[styles.postUsername, { fontSize: 15 }]}>{item.createdAt}</Text>
              </View>
            </View>
            <Text style={styles.postText}>{item.text}</Text>

            <TouchableOpacity onPress={() => handleLikePost(item.id)}>
              <Text style={styles.likeText}>Likes {item.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleDislikePost(item.id)}>
              <Text style={styles.likeText}>Dislikes {item.dislikes || 0}</Text>
            </TouchableOpacity>

            <FlatList
              data={(comments[item.id] || [])}
              keyExtractor={(comment, index) => comment.text + index.toString()}
              renderItem={({ item: comment }) => {
                const isAuthor = user?.id === comment.createdBy;
                const isEditing = editingMode[comment.id] && !comment.deleted;

                return(                      
                  <View style={styles.commentItem}>
                  <Text style={[styles.photoUrl, { fontSize: 24, textAlign: 'center', lineHeight: 32 }]}>
                    {comment.photoUrl || ''}
                  </Text>

                    <View style={styles.commentTextContainer}>
                      <Text style={[ styles.commentUsername, { flexDirection: "row" }]}>{comment.username}  
                        <Text style = { { color: "gray", fontSize: 11 } }>
                          {" "}
                          {calculate_ranking(comment.user_positive_points, comment.user_negative_points)["points"] >= 0 ? "+" : ""}
                          {calculate_ranking(comment.user_positive_points, comment.user_negative_points)["points"]} 
                          {" "}
                          {calculate_ranking(comment.user_positive_points, comment.user_negative_points)["rank_emblem"]}
                        </Text>
                      </Text>

                      <Text style={styles.commentUsername}>{comment.createdAt}</Text>
                        {isEditing ? (
                          <>
                          <TextInput 
                            style={[styles.commentText, {borderColor: '#ccc', borderWidth: 1, padding: 5}]}
                            value={editingComment[comment.id]}
                            onChangeText={(text) =>
                              setEditingComment((prev)=> ({ ...prev, [comment.id]: text}))
                            }
                          />
                        <View style={{ flexDirection: "row", marginTop: 4 }}>
                          <TouchableOpacity onPress={() => handleEditComment(item.id, comment.id)}>
                            <Text style={{ color: "#4caf50", marginRight: 10 }}> Save</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              setEditingMode((prev) => ({ ...prev, [comment.id]: false }))
                            }
                          >
                            <Text style={{ color: "#f44336" }}> Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <>

                      <Text style={styles.commentText}>{comment.text}</Text>

                        {isAuthor && !comment.deleted && (
                          <View style={{ flexDirection: "row", marginTop: 4 }}>
                            <TouchableOpacity
                              onPress={() => {
                                setEditingComment((prev) => ({ ...prev, [comment.id]: comment.text }));
                                setEditingMode((prev) => ({ ...prev, [comment.id]: true }));
                              }}
                            >
                              <Text style={{ color: "#2196f3", marginRight: 10 }}> Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteComment(item.id, comment.id)}>
                              <Text style={{ color: "#f44336" }}> delete</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </>
                    )}
                    { comment.text !== "[deleted]" && (
                      <>
                        <TouchableOpacity onPress={() => handleLikeComment(item.id, comment.id)}>
                          <Text style={{ color: '#984063' }}>Like {comment.likes}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleDislikeComment(item.id, comment.id)}>
                          <Text style={{ color: '#984063' }}>Dislike {comment.dislikes || 0}</Text>
                        </TouchableOpacity>
                      </>)}
                    </View>
                  </View>
              )}}
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
