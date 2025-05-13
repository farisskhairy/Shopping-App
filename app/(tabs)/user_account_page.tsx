import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { launchImageLibraryAsync, MediaType } from 'expo-image-picker';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../../firebaseConfig';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';

// profile information 
type Profile = {
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
};

type EditingState = {
  name: boolean;
  email: boolean;
  phone: boolean;
};

const firestore = getFirestore(app);
const storage = getStorage(app);


export const ProfilePage = () => {
  const [currentUser, setCurrentUser] = useState(() => getAuth().currentUser);
  const [profile, setProfile] = useState<Profile>({
    name: '',
    email: '',
    phone: '',
    photoUrl: '',
  });

  // to be implemented
  const [friends, setFriends] = useState([
    {
      name: 'Alice Smith',
      phone: '123-456-7890',
      photoUrl: 'https://hips.hearstapps.com/hmg-prod/images/05biggiesmalls1-1543610785.jpg?crop=1xw:1xh;center,top&resize=980:*',
    },
  ]);

  const [isEditing, setIsEditing] = useState<EditingState>({
    name: false,
    email: false,
    phone: false,
  });

  const loadProfileFromFirestore = async (user: any) => {
    const userRef = doc(firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const profileData = userSnap.exists() ? (userSnap.data() as Partial<Profile>) : {};

    setProfile({
      name: profileData.name || '',
      email: user.email || '',
      phone: profileData.phone || '',
      photoUrl: profileData.photoUrl || '',
    });
  };

  const saveProfileToFirestore = async (newProfile: Profile) => {
    if (!currentUser) return;
    const userRef = doc(firestore, 'users', currentUser.uid);
    await setDoc(userRef, newProfile, { merge: true });
  };


  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setCurrentUser(user);
      loadProfileFromFirestore(user);
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

  const toggleEdit = (field: keyof EditingState) => {
    if (isEditing[field]) {
      saveProfileToFirestore(profile);
    }
    setIsEditing({ ...isEditing, [field]: !isEditing[field] });
  };

  const handleSignOut = async () => {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleChangePhoto = async () => {
    try {
      const result = await launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.length) return;

        const image = result.assets[0];
        const uri = image.uri;

    if (!uri) throw new Error('Image URI is missing');

    // Convert image to blob using fetch
    const blob = await new Promise<Blob>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new Error('Blob conversion failed'));
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    if (!currentUser) throw new Error('User not authenticated');

    const storageRef = ref(storage, `profilePics/${currentUser.uid}.jpg`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    setProfile((prev) => ({ ...prev, photoUrl: downloadURL }));
    await saveProfileToFirestore({ ...profile, photoUrl: downloadURL });
  } catch (error: any) {
    console.error('Upload error:', error);
    Alert.alert('Upload Failed', error.message || 'Could not upload image');
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={{
            uri: profile.photoUrl || 'https://via.placeholder.com/120',
          }}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.editPhotoButton} onPress={handleChangePhoto}>
          <Text style={styles.editPhotoText}>Change Photo</Text>
        </TouchableOpacity>
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
            <Image source={{ uri: friend.photoUrl }} style={styles.friendAvatar} />
            <View>
              <Text style={styles.friendName}>{friend.name}</Text>
              <Text style={styles.friendPhone}>{friend.phone}</Text>
            </View>
          </View>
        ))}
      </View>

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
  editPhotoButton: {
    backgroundColor: '#41436A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  editPhotoText: {
    color: '#fff',
    fontSize: 14,
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
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
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
});

export default ProfilePage;
