import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { app, auth } from 'firebaseConfig';
import { router } from 'expo-router';

// profile information 
type Profile = {
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
  positive_points_ranking: number,
  negative_points_ranking: number
};

type EditingState = {
  name: boolean;
  email: boolean;
  phone: boolean;
};

const firestore = getFirestore(app);

export const ProfilePage = () => {
  const [currentUser, setCurrentUser] = useState(() => getAuth().currentUser);
  const [profile, setProfile] = useState<Profile>({
    name: '',
    email: '',
    phone: '',
    photoUrl: '',
    positive_points_ranking: 0,
    negative_points_ranking: 0
  });

  // friend list 
  const [friends, setFriends] = useState<{ name: string; phone: string; photoUrl: string }[]>([]);

  // Edit 
  const [isEditing, setIsEditing] = useState<EditingState>({
    name: false,
    email: false,
    phone: false,
  });

  // change appearance 
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiOptions = ['😊', '😼', '😄', '😷', '🐰', '🐘', '🐶', '🐵', '🦊',  '🐸', '🐼', '🦁', '🐯', '🐻'];


  const loadProfileFromFirestore = async (user: any) => {
    const userRef = doc(firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const profileData = userSnap.exists() ? (userSnap.data() as Partial<Profile & { friends: typeof friends }>) : {};

    setProfile({
      name: profileData.name || '',
      email: user.email || '',
      phone: profileData.phone || '',
      photoUrl: profileData.photoUrl || '',
      positive_points_ranking: profileData.positive_points_ranking || 0,
      negative_points_ranking: profileData.negative_points_ranking || 0
    });

    setFriends(
      (profileData.friends || []).filter(
        (f) => f && (f.name || f.phone || f.photoUrl)
      )
    );
  };

  const saveProfileToFirestore = async (newProfile: Profile) => {
    if (!currentUser) return;
    const userRef = doc(firestore, 'users', currentUser.uid);
    await setDoc(userRef, newProfile, { merge: true });
  };

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {

    if (user) {
      setCurrentUser(user);
      loadProfileFromFirestore(user);
    } else {
      router.push("/auth/login");
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        loadProfileFromFirestore(user);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (field: keyof Profile, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const toggleEdit = async (field: keyof EditingState) => {
    const wasEditing = isEditing[field];

    if (wasEditing) {
      try {
        if (!currentUser) return;
        const userRef = doc(firestore, 'users', currentUser.uid);
        await setDoc(userRef, { [field]: profile[field] }, { merge: true });
      } catch (error) {
        console.error(`Error saving ${field}:`, error);
        Alert.alert('Save Failed', `Could not save ${field}`);
      }
    }

    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddFriendSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const q = query(
        collection(firestore, 'users'),
        where('phone', '==', searchQuery.trim())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('No user found with that phone number.');
        return;
      }

      const friendDoc = querySnapshot.docs[0];
      const friendData = friendDoc.data();

      // Avoid adding duplicate
      
      const alreadyAdded = friends.some(f => f.phone === friendData.phone);
      if (alreadyAdded) {
        Alert.alert('Friend already added.');
        return;
      }

      const newFriend = {
        name: friendData.name || '',
        phone: friendData.phone || '',
        photoUrl: friendData.photoUrl || '',
      };

      const updatedFriends = [...friends, newFriend];
      setFriends(updatedFriends);

      if (currentUser) {
        const userRef = doc(firestore, 'users', currentUser.uid);
        await setDoc(userRef, { friends: updatedFriends }, { merge: true });
      }

      setSearchQuery('');
      setShowSearchBar(false);
    } catch (error) {
      console.error('Error searching friend:', error);
      Alert.alert('Error searching friend');
    }
  };

  // option to remove friend 
  const handleRemoveFriend = async (phoneToRemove: string) => {
    const updatedFriends = friends.filter(friend => friend.phone !== phoneToRemove);
    setFriends(updatedFriends);
    if (currentUser) {
      try {
        const userRef = doc(firestore, 'users', currentUser.uid);
        await setDoc(userRef, { friends: updatedFriends }, { merge: true });
      } catch (error) {
        console.error('Error removing friend from Firestore:', error);
        Alert.alert('Error', 'Failed to remove friend');
      }
    }
  };


  const handleSignOut = async () => {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      signOut(auth);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleChangePhoto = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const handleSelectEmoji = async (emoji: string) => {
    setShowEmojiPicker(false);
    setProfile((prev) => ({ ...prev, photoUrl: emoji }));
    await saveProfileToFirestore({ ...profile, photoUrl: emoji });
  };

  function calculate_ranking() {
    const points = profile.positive_points_ranking - profile.negative_points_ranking;
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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.rank_area}>
        <Text style={styles.rank_text}>Ranking Points: { calculate_ranking()["points"] >= 0 ? "+" : "" }{calculate_ranking()["points"]}, {calculate_ranking()["rank_name"]} {calculate_ranking()["rank_emblem"]}</Text>
      </View>
      <View style={styles.profileHeader}>
        {profile.photoUrl?.startsWith('http') ? (
          <Image source={{ uri: profile.photoUrl }} style={styles.avatar} />
        ) : (
          <Text style={styles.emojiAvatar}>{profile.photoUrl || '🙂'}</Text>
        )}

        <TouchableOpacity style={styles.editProfileButton} onPress={handleChangePhoto}>
          <Text style={styles.editProfileText}> Your appearance </Text>
        </TouchableOpacity>

        {showEmojiPicker && (
          <View style={styles.emojiPicker}>
            {emojiOptions.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => handleSelectEmoji(emoji)}
                style={styles.emojiOption}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {(['name', 'email', 'phone'] as const).map((field) => (
        <View style={styles.inputGroup} key={field}>
          <Text style={styles.label}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
          <View style={styles.nameContainer}>
            {isEditing[field] ? (
              <TextInput
                style={styles.input}
                value={profile[field]}
                onChangeText={(text) => handleChange(field, text)}
                keyboardType={field === 'email' ? 'email-address' : field === 'phone' ? 'phone-pad' : 'default'}
              />
            ) : (
              <Text style={styles.username}>{profile[field]}</Text>
            )}
            <TouchableOpacity onPress={() => toggleEdit(field)} style={styles.editButton}>
              <Text style={styles.editButtonText}>{isEditing[field] ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}


    
      <View style={styles.friendsListContainer}>
        <Text style={styles.label}>Friends</Text>
        {friends.map((friend, index) => (
          <View key={index} style={styles.friendItem}>
            
            <Text style={[styles.friendAvatar, styles.emojiFriendAvatar]}>
              {friend.photoUrl || '🙂'}
            </Text>
            <View>
              <Text style={styles.friendName}>{friend.name}</Text>
              <Text style={styles.friendPhone}>{friend.phone}</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  'Remove Friend',
                  `Do you want to remove ${friend.name || friend.phone}?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Remove',
                      style: 'destructive',
                      onPress: () => handleRemoveFriend(friend.phone),
                    },
                  ]
                )
              }
              style={[styles.removeButton, { backgroundColor: '#984063' }]}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      

      <TouchableOpacity
        onPress={() => setShowSearchBar(!showSearchBar)}
        style={[styles.addFriendButton]}
      >
        <Text style={styles.editButtonText}>Add Friend</Text>
      </TouchableOpacity>

      {showSearchBar && (
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <TextInput
            placeholder="Enter phone number"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 10,
              marginRight: 10,
              backgroundColor: '#f9f9f9',
            }}
            keyboardType="phone-pad"
          />
          <TouchableOpacity onPress={handleAddFriendSearch} style={styles.editButton}>
            <Text style={styles.editButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      )}


      <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  emojiAvatar: {
    fontSize: 80,
    marginBottom: 10,
  },
  editProfileButton: {
    backgroundColor: '#41436A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addFriendButton: {
    backgroundColor: '#41436A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  editProfileText: {
    color: '#fff',
    fontSize: 14,
  },
  emojiPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  emojiOption: {
    padding: 10,
    margin: 5,
    backgroundColor: '#eee',
    borderRadius: 10,
  },
  emoji: {
    fontSize: 28,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    marginBottom: 6,
    color: '#41436A',
    fontWeight: 'bold',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 10,
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  editButton: {
    backgroundColor: '#41436A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
  },
    removeButton: {
    backgroundColor: '#41436A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 100,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  signOutButton: {
    marginTop: 30,
    backgroundColor: '#984063',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  friendsListContainer: {
    width: '100%',
    marginTop: 30,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  friendPhone: {
    fontSize: 14,
    color: '#666',
  },
  friendAvatar: {
  width: 50,
  height: 50,
  borderRadius: 25,
  marginRight: 12,
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
},
  emojiFriendAvatar: {
  fontSize: 28,
  lineHeight: 50, 
  backgroundColor: '#eee',
},
  rank_area: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: "3%",
  },
  rank_text: {
    color: '#41436A',
    fontWeight: 'bold'
  }
});

export default ProfilePage;
