// components/SearchInput.js

import React from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function SearchInput({ query, results, onSearchChange, onSelectResult }) {
  return (
    <View style={{ zIndex: 100 }}>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={onSearchChange}
        placeholder="Enter destination..."
        placeholderTextColor="#999"
      />
      <FlatList
        data={results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => onSelectResult(item)}>
            <Text style={styles.itemText}>{item.display_name}</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        nestedScrollEnabled={true} // important if inside another scrollview
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#1E1E1E',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#1E1E1E',
  },
  itemText: {
    color: '#fff',
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: 'black',
    marginHorizontal: 12,
  },
});
