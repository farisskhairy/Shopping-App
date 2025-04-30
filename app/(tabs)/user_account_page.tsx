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
    photoUrl: '/Users/bwang/Documents/Shopping-App-login_s/assets/images/shoppingApp.png',  
  });

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
});
