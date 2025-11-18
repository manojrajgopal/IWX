// Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import HeroSection from '../components/HeroSection';
import BrandStory from '../components/BrandStory';
import SustainabilitySection from '../components/SustainabilitySection';
import { productAPI } from '../api/productAPI';
import { slides, categories, products, testimonials, blogs } from '../constants/homeData';
import HeroSlider from '../components/sections/HeroSlider';
import CategoriesSection from '../components/sections/CategoriesSection';
import FeaturedProducts from '../components/sections/FeaturedProducts';
import NewArrivals from '../components/sections/NewArrivals';
import Testimonials from '../components/sections/Testimonials';
import BlogSection from '../components/sections/BlogSection';
import InstagramFeed from '../components/sections/InstagramFeed';
import Newsletter from '../components/Newsletter/Newsletter';
import Footer from '../components/Footer/Footer';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const [featured, trending, newArrivals] = await Promise.all([
          productAPI.getFeaturedProducts({ limit: 4 }),
          productAPI.getTrendingProducts({ limit: 4 }),
          productAPI.getNewArrivals({ limit: 4 })
        ]);

        setFeaturedProducts(featured);
        setTrendingProducts(trending);
        setNewArrivals(newArrivals);
      } catch (error) {
        console.error('Failed to load products:', error);
        // Fallback to mock data if API fails
        setFeaturedProducts(products.slice(0, 4));
        setTrendingProducts(products.slice(4, 8));
        setNewArrivals(products.slice(8, 12));
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);


  return (
    <div className="home-container">
      <Navbar />

      {/* Hero Slider */}
      <HeroSlider slides={slides} />

      {/* Brand Story Section */}
      <BrandStory
        description="At IWX, we believe in the power of design to transform not just spaces and products, but lives. Our mission is to create pieces that stand the test of time, blending innovative design with timeless elegance. Each creation tells a story of craftsmanship, passion, and vision for a better tomorrow."
        image="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
        stats={[
          { value: '15+', label: 'Years of Excellence' },
          { value: '500+', label: 'Design Collections' },
          { value: '2M+', label: 'Satisfied Clients' }
        ]}
      />

      {/* Categories */}
      <CategoriesSection categories={categories} />

      {/* Featured Products */}
      <FeaturedProducts products={featuredProducts} loading={loading} />

      {/* New Arrivals */}
      <NewArrivals products={newArrivals} loading={loading} />

      {/* Testimonials */}
      <Testimonials testimonials={testimonials} />

      {/* Blog Section */}
      <BlogSection blogs={blogs} />

      {/* Instagram Feed */}
      <InstagramFeed />

      {/* Newsletter */}
      <Newsletter />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
