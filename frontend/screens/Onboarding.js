import React, { useState, useRef } from 'react';
import {
  View, Text, ImageBackground, StyleSheet,
  Dimensions, TouchableOpacity, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    title: 'Compartido es mejor',
    description: 'Crea o únete a grupos cerrados dentro de tu comunidad, barrio o edificio. Todo es más fácil cuando compartimos.',
    image: require('../assets/slide1.png'),
  },
  {
    title: 'Organiza tus recursos',
    description: 'Gestiona herramientas, objetos y recursos de forma colaborativa. Administra reservas y califica usuarios.',
    image: require('../assets/slide2.png'),
  },
  {
    title: 'Ahorra dinero y tiempo',
    description: 'Encuentra lo que necesitas sin gastar de más. Busca en tu zona comunidades que usen LendIt.',
    image: require('../assets/slide3.png'),
  },
];

const Onboarding = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide, index) => (
          <ImageBackground
            key={index}
            source={slide.image}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{slides[currentIndex].title}</Text>
          <Text style={styles.description}>{slides[currentIndex].description}</Text>
          <View style={styles.indicators}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[styles.indicator, currentIndex === index && styles.indicatorActive]}
              />
            ))}
          </View>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.buttonPrimary} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.buttonText}>Inicia sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.buttonTextSecondary}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  backgroundImage: { width, height },
  content: { position: 'absolute', bottom: 0, width: '100%' },
  card: {
    width: '100%',
    height: height * 0.45,
    backgroundColor: '#F5E8DF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    justifyContent: 'space-between',
  },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  description: { fontSize: 16, color: '#6b7280', textAlign: 'center' },
  indicators: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10 },
  indicator: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ccc', marginHorizontal: 5 },
  indicatorActive: { backgroundColor: '#000' },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  buttonPrimary: { backgroundColor: '#1E293B', padding: 15, borderRadius: 10, flex: 1, marginRight: 10 },
  buttonSecondary: { backgroundColor: '#E5E7EB', padding: 15, borderRadius: 10, flex: 1, marginLeft: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  buttonTextSecondary: { color: '#1E293B', textAlign: 'center', fontWeight: 'bold' },
});

export default Onboarding;
