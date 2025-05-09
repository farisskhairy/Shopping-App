import React, { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';

type Profile = {
  name: string;
  email: string;
  phone: string;
  photoUrl: any;
};

type EditingState = {
  name: boolean;
  email: boolean;
  phone: boolean;
};

export const ProfilePage = () => {
  const [profile, setProfile] = useState<Profile>({
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    photoUrl: 'https://hips.hearstapps.com/wdy.h-cdn.co/assets/17/39/loulou-1742.jpg?crop=1.00xw:0.667xh;0,0.0409xh&resize=980:*',  
  });

  const [friends, setFriends] = useState([
    {
      name: 'Alice Smith',
      phone: '123-456-7890',
      photoUrl: 'https://hips.hearstapps.com/hmg-prod/images/05biggiesmalls1-1543610785.jpg?crop=1xw:1xh;center,top&resize=980:*',
    },
    {
      name: 'Bob Johnson',
      phone: '987-654-3210',
      photoUrl: 'https://hips.hearstapps.com/hmg-prod/images/08yuki2-1543611001.jpg?crop=1xw:0.9991319444444444xh;center,top&resize=980:*',
    },
  ]);

  const [isEditing, setIsEditing] = useState<EditingState>({
    name: false,
    email: false,
    phone: false,
  });

  const handleChange = (field: keyof Profile, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const toggleEdit = (field: keyof EditingState) => {
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: profile.photoUrl }} style={styles.avatar} /> 
        <TouchableOpacity style={styles.editPhotoButton}>
          <Text style={styles.editPhotoText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name</Text>
        <View style={styles.nameContainer}>
          {isEditing.name ? (
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={(text) => handleChange('name', text)}
            />
          ) : (
            <Text style={styles.username}>{profile.name}</Text>
          )}
          <TouchableOpacity
            onPress={() => toggleEdit('name')}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>{isEditing.name ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.nameContainer}> 
          {isEditing.email ? (
            <TextInput
              style={styles.input}
              value={profile.email}
              onChangeText={(text) => handleChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : (
            <Text style={styles.username}>{profile.email}</Text>
          )}
          <TouchableOpacity onPress={() => toggleEdit('email')} style={styles.editButton}>
            <Text style={styles.editButtonText}>{isEditing.email ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number</Text>
          <View style={styles.nameContainer}>
          {isEditing.phone ? (
            <TextInput
              style={styles.input}
              value={profile.phone}
              onChangeText={(text) => handleChange('phone', text)}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.username}>{profile.phone}</Text>
          )}
          <TouchableOpacity onPress={() => toggleEdit('phone')} style={styles.editButton}>
            <Text style={styles.editButtonText}>{isEditing.phone ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
      </View>

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

export default ProfilePage;

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
