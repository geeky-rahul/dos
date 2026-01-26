import { View, TextInput, StyleSheet } from 'react-native';

export default function InputField({ placeholder, secureTextEntry }) {
  return (
    <View style={styles.wrapper}>
      <TextInput
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
});
