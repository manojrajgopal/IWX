import React from 'react';
import { motion } from 'framer-motion';
import './Card.css';

const Card = ({
  children,
  variant = 'default',
  hover = true,
  animation = true,
  animationDelay = 0,
  className = '',
  onClick,
  ...props
}) => {
  const cardContent = (
    <div
      className={`card card-${variant} ${className} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );

  if (animation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: animationDelay }}
        viewport={{ once: true }}
        whileHover={hover ? { y: -5 } : {}}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
};

// Specific card components
export const TeamCard = ({ member, ...props }) => (
  <Card variant="team" {...props}>
    <div className="card-image">
      <img src={member.image} alt={member.name} />
      <div className="card-overlay">
        <p>{member.bio}</p>
      </div>
    </div>
    <div className="card-info">
      <h4>{member.name}</h4>
      <p>{member.role}</p>
    </div>
  </Card>
);

export const MethodCard = ({ method, ...props }) => (
  <Card variant="method" {...props}>
    <div className="card-icon">{method.icon}</div>
    <h3>{method.title}</h3>
    <p className="card-details">{method.details}</p>
    <p className="card-description">{method.description}</p>
  </Card>
);

export const SupportCard = ({ support, ...props }) => (
  <Card variant="support" {...props}>
    <div className="card-icon">{support.icon}</div>
    <h3>{support.title}</h3>
    <p>{support.description}</p>
    {support.link && (
      <a href={support.link} className="card-link">
        {support.linkText || 'Learn More'}
      </a>
    )}
    {support.button && (
      <button className="card-button" onClick={support.onClick}>
        {support.buttonText}
      </button>
    )}
  </Card>
);

export const ValueCard = ({ value, ...props }) => (
  <Card variant="value" {...props}>
    <div className="card-icon">{value.icon}</div>
    <h4>{value.title}</h4>
    <p>{value.description}</p>
  </Card>
);

export const StoreCard = ({ store, ...props }) => (
  <Card variant="store" {...props}>
    <div className="card-image">
      <img src={store.image} alt={store.city} />
    </div>
    <div className="card-info">
      <h3>{store.city}</h3>
      <p className="card-address">{store.address}</p>
      <p className="card-hours">{store.hours}</p>
      <p className="card-phone">{store.phone}</p>
      <button className="card-button">Get Directions</button>
    </div>
  </Card>
);

export default Card;
