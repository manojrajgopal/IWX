// FAQ.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar/Navbar';
import HeroSection from '../components/HeroSection';
import { SupportCard } from '../components/Card';
import FAQAccordion from '../components/FAQAccordion';
import Table from '../components/Table';
import CTASection from '../components/CTASection';
import Container from '../layouts/Container';
import './FAQ.css';

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState('shipping');
  const [openQuestion, setOpenQuestion] = useState(null);

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  const faqCategories = {
    shipping: [
      {
        question: "How long does shipping take?",
        answer: "Standard shipping typically takes 3-5 business days within the continental US. International shipping times vary by destination but generally take 7-14 business days. Express shipping options are available at checkout for faster delivery."
      },
      {
        question: "Do you offer free shipping?",
        answer: "Yes, we offer free standard shipping on all orders over $150. For orders under this amount, a flat shipping rate of $7.99 applies within the continental US."
      },
      {
        question: "How can I track my order?",
        answer: "Once your order has been shipped, you will receive a confirmation email with a tracking number and link to track your package. You can also track your order by logging into your account on our website."
      },
      {
        question: "Do you ship internationally?",
        answer: "Yes, we ship to over 50 countries worldwide. International shipping costs are calculated at checkout based on the destination and package weight. Please note that customs duties and taxes may apply depending on your country's regulations."
      }
    ],
    returns: [
      {
        question: "What is your return policy?",
        answer: "We offer a 30-day return policy for all full-price items in their original condition with tags attached. Sale items can be returned within 14 days of receipt. Returns are free for US customers using our prepaid return label."
      },
      {
        question: "How do I initiate a return?",
        answer: "You can initiate a return by logging into your account and accessing your order history. Alternatively, you can contact our customer service team with your order number, and they will guide you through the process."
      },
      {
        question: "When will I receive my refund?",
        answer: "Once we receive your returned item, it takes 3-5 business days to process the return. Your refund will then be issued to your original payment method. Please allow additional time for the refund to appear in your account depending on your bank's processing times."
      },
      {
        question: "Can I exchange an item?",
        answer: "Yes, we offer exchanges for different sizes or colors of the same item. If you would like to exchange for a different item, we recommend returning the original purchase and placing a new order."
      }
    ],
    products: [
      {
        question: "How do I determine my size?",
        answer: "We provide detailed size charts for each product on the product page. We recommend measuring yourself and comparing your measurements to our size chart for the best fit. If you're between sizes, we suggest sizing up."
      },
      {
        question: "Are your products true to size?",
        answer: "Most of our customers find our products true to size. However, fit can vary slightly by style. We recommend reading the product description for specific fit information and checking customer reviews for additional sizing insights."
      },
      {
        question: "How do I care for my IWX products?",
        answer: "Care instructions are provided on the label of each garment. Generally, we recommend washing similar colors together in cold water, using mild detergent, and avoiding bleach. For specific care instructions, please refer to the product details page or the care label on your garment."
      },
      {
        question: "Where are your products made?",
        answer: "Our products are manufactured in various countries around the world, including Italy, Portugal, Japan, and the United States. We carefully select manufacturing partners who share our commitment to quality, ethical production, and sustainable practices."
      }
    ],
    account: [
      {
        question: "How do I create an account?",
        answer: "You can create an account by clicking on the 'Account' icon in the top navigation and selecting 'Register'. You'll need to provide your email address and create a password. Alternatively, you can create an account during the checkout process."
      },
      {
        question: "I forgot my password. How can I reset it?",
        answer: "Click on the 'Account' icon and select 'Login'. Then click on 'Forgot Password' and enter the email address associated with your account. You'll receive an email with instructions to reset your password."
      },
      {
        question: "How do I update my account information?",
        answer: "Once logged in, you can update your personal information, shipping addresses, and payment methods in the 'My Account' section. All changes are saved automatically."
      },
      {
        question: "How do I view my order history?",
        answer: "After logging into your account, click on 'Order History' to view all your past and current orders. You can track shipments, initiate returns, and view order details from this section."
      }
    ],
    payments: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, Google Pay, and IWX gift cards. All payments are processed securely through encrypted channels."
      },
      {
        question: "Is my payment information secure?",
        answer: "Yes, we use industry-standard SSL encryption to protect your personal and payment information. We do not store your complete payment details on our servers. For added security, we recommend using PayPal or Apple Pay for your transactions."
      },
      {
        question: "Do you offer installment payment options?",
        answer: "Yes, we offer installment payment options through Klarna and Afterpay. These options are available at checkout for qualifying orders. You can split your payment into 4 interest-free installments with either service."
      },
      {
        question: "Why was my payment declined?",
        answer: "Payment declinations can occur for various reasons, including insufficient funds, incorrect card information, or security measures by your bank. We recommend double-checking your information, ensuring you have sufficient funds, or contacting your bank for assistance."
      }
    ]
  };

  return (
    <div className="faq-container">
      <Navbar />

      {/* Hero Section */}
      <HeroSection
        title="Help Center"
        subtitle="Find answers to our most frequently asked questions"
        showSearch={true}
        searchPlaceholder="Search questions..."
      />

      {/* FAQ Categories */}
      <section className="faq-categories">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Browse by Category
          </motion.h2>
          <div className="category-tabs">
            {Object.keys(faqCategories).map((category) => (
              <button
                key={category}
                className={activeCategory === category ? 'active' : ''}
                onClick={() => setActiveCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="faq-list-section">
        <Container>
          <h3>{activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Questions</h3>
          <FAQAccordion
            faqs={faqCategories[activeCategory]}
            allowMultiple={false}
          />
        </Container>
      </section>

      {/* Support Options */}
      <section className="support-options">
        <Container>
          <h2>Still Need Help?</h2>
          <p className="section-subtitle">
            Our customer care team is here to assist you
          </p>

          <div className="support-cards">
            {[
              {
                icon: "📧",
                title: "Email Support",
                description: "Send us an email and we'll respond within 24 hours",
                link: "mailto:support@infinitewavex.com",
                linkText: "support@infinitewavex.com"
              },
              {
                icon: "💬",
                title: "Live Chat",
                description: "Chat with our support team in real-time",
                button: true,
                buttonText: "Start Chat",
                onClick: () => console.log('Start chat clicked')
              },
              {
                icon: "📞",
                title: "Phone Support",
                description: "Call us during business hours for immediate assistance",
                link: "tel:+15551234567",
                linkText: "+1 (555) 123-IWX"
              }
            ].map((support, index) => (
              <SupportCard
                key={index}
                support={support}
                animationDelay={index * 0.1}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* Order Tracking */}
      <section className="order-tracking">
        <div className="container">
          <motion.div 
            className="tracking-content"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2>Track Your Order</h2>
            <p>Enter your order number and email to check the status of your shipment</p>
            <div className="tracking-form">
              <input type="text" placeholder="Order Number" />
              <input type="email" placeholder="Email Address" />
              <button>Track Order</button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Size Guide */}
      <section className="size-guide">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Size Guide
          </motion.h2>
          <motion.p 
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Find your perfect fit with our comprehensive size guide
          </motion.p>

          <div className="size-tables">
            <div className="size-table">
              <h3>Women's Sizes</h3>
              <Table
                headers={['Size', 'Bust', 'Waist', 'Hips']}
                rows={[
                  ['XS', '32"', '25"', '35"'],
                  ['S', '34"', '27"', '37"'],
                  ['M', '36"', '29"', '39"'],
                  ['L', '38"', '31"', '41"'],
                  ['XL', '40"', '33"', '43"']
                ]}
              />
            </div>

            <div className="size-table">
              <h3>Men's Sizes</h3>
              <Table
                headers={['Size', 'Chest', 'Waist', 'Hips']}
                rows={[
                  ['S', '35"', '30"', '36"'],
                  ['M', '38"', '32"', '38"'],
                  ['L', '41"', '34"', '40"'],
                  ['XL', '44"', '36"', '42"'],
                  ['XXL', '47"', '39"', '44"']
                ]}
              />
            </div>
          </div>

          <motion.div 
            className="measurement-guide"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3>How to Measure</h3>
            <p>
              Use a soft measuring tape to take these measurements while wearing well-fitting undergarments.
              For the most accurate results, have someone help you with the measurements.
            </p>
            <ul>
              <li><strong>Bust/Chest:</strong> Measure around the fullest part of your bust/chest, keeping the tape level</li>
              <li><strong>Waist:</strong> Measure around the narrowest part of your natural waistline</li>
              <li><strong>Hips:</strong> Measure around the fullest part of your hips, about 8 inches below your waist</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Contact Prompt */}
      <CTASection
        title="Can't Find What You're Looking For?"
        subtitle="Our customer care team is ready to help you with any questions"
        primaryButton={{
          text: "Contact Us",
          onClick: () => console.log('Contact us clicked')
        }}
        secondaryButton={{
          text: "View Shipping Info",
          onClick: () => console.log('View shipping info clicked')
        }}
      />
    </div>
  );
};

export default FAQ;
