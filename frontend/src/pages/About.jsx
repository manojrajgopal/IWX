// About.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import HeroSection from '../components/HeroSection';
import BrandStory from '../components/BrandStory';
import SustainabilitySection from '../components/SustainabilitySection';
import { TeamCard, ValueCard, StoreCard } from '../components/Card';
import TabSystem from '../components/TabSystem';
import StatsDisplay from '../components/StatsDisplay';
import CTASection from '../components/CTASection';
import Container from '../layouts/Container';
import './About.css';

const About = () => {
  const [activeTab, setActiveTab] = useState('story');

  const teamMembers = [
    {
      name: "Elena Rodriguez",
      role: "Creative Director",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      bio: "With over 15 years in fashion design, Elena brings visionary creativity to the IWX brand."
    },
    {
      name: "Marcus Chen",
      role: "Head of Innovation",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      bio: "Marcus leads our sustainable materials research and technological integration."
    },
    {
      name: "Sophie Williams",
      role: "Production Director",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      bio: "Sophie ensures our ethical production standards are met across all facilities."
    },
    {
      name: "David Kim",
      role: "Retail Experience Director",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      bio: "David creates seamless customer experiences across our physical and digital stores."
    }
  ];

  const values = [
    {
      title: "Sustainability",
      description: "We're committed to reducing our environmental impact through ethical sourcing and production methods.",
      icon: "🌱"
    },
    {
      title: "Innovation",
      description: "Pushing boundaries in design and technology to create the future of fashion.",
      icon: "💡"
    },
    {
      title: "Quality",
      description: "Every piece is crafted with precision and attention to detail that stands the test of time.",
      icon: "✳️"
    },
    {
      title: "Inclusivity",
      description: "Designing for all bodies, identities, and expressions without compromise.",
      icon: "🌍"
    }
  ];

  const milestones = [
    { year: "2005", event: "Founded as a small boutique design studio" },
    { year: "2010", event: "Launched first international collection" },
    { year: "2015", event: "Opened flagship stores in Paris and Tokyo" },
    { year: "2018", event: "Introduced sustainable materials across all lines" },
    { year: "2020", event: "Launched e-commerce platform serving 30+ countries" },
    { year: "2023", event: "Achieved carbon neutral certification" },
    { year: "2025", event: "Opened innovative design hub in Copenhagen" }
  ];

  return (
    <div className="about-container">
      <Navbar />

      {/* Hero Section */}
      <HeroSection
        title="Our Story"
        subtitle="Designing Tomorrow, Today – Since 2005"
      />

      {/* Brand Intro */}
      <BrandStory
        description={
          <>
            <p>
              Founded in 2005, IWX emerged from a simple vision: to create clothing that transcends
              trends and becomes part of your life's story. Our designs blend innovative techniques
              with timeless aesthetics, creating pieces that feel both contemporary and eternal.
            </p>
            <p>
              Today, we're a global community of designers, artisans, and visionaries committed to
              redefining fashion through sustainable practices, inclusive design, and technological
              innovation.
            </p>
          </>
        }
        image="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
      />

      {/* Tabs Section */}
      <TabSystem
        title="Learn More About IWX"
        tabs={[
          {
            id: 'story',
            label: 'Our Story',
            content: (
              <div>
                <h3>Crafting the Future of Fashion</h3>
                <p>
                  IWX began as a small atelier in Milan with just three designers and a shared vision.
                  Today, we've grown into an international fashion house without losing our commitment
                  to artistry, innovation, and personal connection.
                </p>
                <p>
                  Our design philosophy centers on "timeless waves" – the idea that great design
                  moves through time like waves, with each collection building on the last while
                  introducing new innovations in form, function, and sustainability.
                </p>
                <StatsDisplay
                  stats={[
                    { value: '20', label: 'Years of Excellence' },
                    { value: '50+', label: 'Countries Served' },
                    { value: '200+', label: 'Team Members' },
                    { value: '100%', label: 'Carbon Neutral' }
                  ]}
                />
              </div>
            )
          },
          {
            id: 'values',
            label: 'Our Values',
            content: (
              <div>
                <h3>Our Guiding Principles</h3>
                <div className="values-grid">
                  {values.map((value, index) => (
                    <ValueCard key={index} value={value} animationDelay={index * 0.1} />
                  ))}
                </div>
              </div>
            )
          },
          {
            id: 'team',
            label: 'Our Team',
            content: (
              <div>
                <h3>Meet Our Leadership</h3>
                <div className="team-grid">
                  {teamMembers.map((member, index) => (
                    <TeamCard key={index} member={member} animationDelay={index * 0.1} />
                  ))}
                </div>
              </div>
            )
          },
          {
            id: 'journey',
            label: 'Our Journey',
            content: (
              <div>
                <h3>Our Journey Through Time</h3>
                <div className="timeline">
                  {milestones.map((milestone, index) => (
                    <div
                      key={index}
                      className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
                    >
                      <div className="timeline-content">
                        <h4>{milestone.year}</h4>
                        <p>{milestone.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Sustainability Section */}
      <SustainabilitySection
        description="We believe fashion should respect both people and planet. That's why we've implemented comprehensive sustainability initiatives across our entire supply chain."
        stats={[
          { value: '85%', label: 'of materials from sustainable sources' },
          { value: '100%', label: 'carbon neutral operations' },
          { value: '0', label: 'waste to landfill from our facilities' },
          { value: '2025', label: 'target for 100% circular production' }
        ]}
        ctaText="Learn About Our Initiatives"
        onCtaClick={() => console.log('Learn more clicked')}
      />

      {/* Global Presence */}
      <section className="global-presence">
        <Container>
          <h2>Global Presence, Local Impact</h2>
          <p className="section-subtitle">
            With flagship stores in fashion capitals worldwide and online shipping to over 50 countries
          </p>

          <div className="stores-grid">
            {[
              { city: "Mumbi", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" },
              { city: "Bangalore", image: "https://images.pexels.com/photos/4846221/pexels-photo-4846221.jpeg" },
              { city: "Delhi", image: "https://images.pexels.com/photos/33813525/pexels-photo-33813525.jpeg" },
              { city: "Hyderabad", image: "https://images.pexels.com/photos/13416375/pexels-photo-13416375.jpeg" },
              { city: "Chenni", image: "https://images.pexels.com/photos/34366231/pexels-photo-34366231.jpeg" },
              { city: "Goa", image: "https://images.pexels.com/photos/34322143/pexels-photo-34322143.jpeg" }
            ].map((store, index) => (
              <StoreCard
                key={index}
                store={store}
                animationDelay={index * 0.1}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Join Our Journey"
        subtitle="Be part of our story as we continue to shape the future of fashion"
        primaryButton={{
          text: "Explore Careers",
          onClick: () => console.log('Explore careers clicked')
        }}
        secondaryButton={{
          text: "View Collections",
          onClick: () => console.log('View collections clicked')
        }}
      />
    </div>
  );
};

export default About;
