import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, TextInput } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, storage } from '../../firebaseConfig';  
import { useRouter } from 'expo-router';

export default function Signup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSignUp = async () => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await saveUserToFirestore(user, name, phone);

      Alert.alert('Account created!');
      router.replace('./login');
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

    // save info to firestore 
  const saveUserToFirestore = async (user: any, name: string, phone: string) => {
    const userRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userRef);

    if (!existing.exists()) {
      await setDoc(userRef, {
        name: name.trim(),
        email: user.email,
        phone: phone.trim(),
        photoUrl: '',
        friends: [],
        createdAt: new Date(),
      });
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Create an Account</Text>

      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Signing up...' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.loginButton, { backgroundColor: '#6C63FF', marginTop: 12 }]}
        onPress={() => router.replace('./login')}
      >
        <Text style={styles.buttonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
     padding: 20, 
     flex: 1, 
     justifyContent: 'center', 
     alignItems: 'center' 
  },
  greeting: { 
    fontSize: 20, 
    fontWeight: '600', 
    textAlign: 'center', 
    marginBottom: 30, 
    color: '#984063' 
  },
  input: {
     borderWidth: 1, 
     borderColor: '#ccc', 
     width: '80%', 
     padding: 10, 
     marginBottom: 12, 
     borderRadius: 8, 
     fontSize: 16 
  },
  loginButton: { 
    backgroundColor: '#41436A', 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 25, 
    width: '80%', 
    alignItems: 'center' 
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});
