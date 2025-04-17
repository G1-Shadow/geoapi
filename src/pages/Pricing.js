import React, { useState } from 'react';
import './Pricing.css';

const Plans = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const carrierPlans = [
    {
      carrier: 'Jio',
      logo: '🔵', // Replace with actual logo
      price: '₹299',
      validity: '28 days',
      data: '2GB/day',
      features: [
        'Unlimited Voice Calls',
        'Unlimited 5G Data',
        'JioTV, JioCinema',
        '100 SMS/day',
        'Apollo 24|7 Circle',
      ],
      color: '#0f3cc9',
      popular: true
    },
    {
      carrier: 'Airtel',
      logo: '🔴', // Replace with actual logo
      price: '₹299',
      validity: '28 days',
      data: '1.5GB/day',
      features: [
        'Unlimited Voice Calls',
        'Unlimited 5G Data',
        'Amazon Prime Mobile',
        'Apollo 24|7 Circle',
        '100 SMS/day',
      ],
      color: '#ff1f1f',
      popular: false
    },
    {
      carrier: 'VI',
      logo: '🟡', // Replace with actual logo
      price: '₹299',
      validity: '28 days',
      data: '1.5GB/day',
      features: [
        'Unlimited Voice Calls',
        'Unlimited Data from 12 AM to 6 AM',
        'Vi Movies & TV',
        'Weekend Data Rollover',
        '100 SMS/day',
      ],
      color: '#f70',
      popular: false
    },
    {
      carrier: 'BSNL',
      logo: '⚪', // Replace with actual logo
      price: '₹247',
      validity: '30 days',
      data: '1GB/day',
      features: [
        'Unlimited Voice Calls',
        'BSNL Tunes',
        'Eros Now Entertainment',
        'Free PRBT',
        '100 SMS/day',
      ],
      color: '#1f8f2f',
      popular: false
    }
  ];

  return (
    <div className="plans-container">
      <div className="plans-header">
        <h1>Compare Prepaid Plans</h1>
        <p>Find the best plan for your needs</p>
      </div>
      
      <div className="plans-grid">
        {carrierPlans.map((plan, index) => (
          <div 
            key={index}
            className={`plan-card ${plan.popular ? 'popular' : ''} ${selectedPlan === index ? 'selected' : ''}`}
            style={{'--accent-color': plan.color}}
            onClick={() => setSelectedPlan(index)}
          >
            {plan.popular && <div className="popular-tag">Most Popular</div>}
            
            <div className="plan-header">
              <div className="carrier-logo">{plan.logo}</div>
              <h2>{plan.carrier}</h2>
            </div>

            <div className="plan-price">
              <span className="amount">{plan.price}</span>
              <span className="validity">/{plan.validity}</span>
            </div>

            <div className="plan-data">
              <span className="data-amount">{plan.data}</span>
              <span className="data-label">Data</span>
            </div>

            <ul className="plan-features">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex}>
                  <span className="feature-icon">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              className="select-plan-button"
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  plan.carrier === 'Jio' ? 'https://www.jio.com/recharge' :
                  plan.carrier === 'Airtel' ? 'https://www.airtel.in/recharge' :
                  plan.carrier === 'VI' ? 'https://www.myvi.in/recharge' :
                  'https://portal.bsnl.in/myportal/quickrecharge.do',
                  '_blank'
                );
              }}
            >
              Recharge Now
            </button>
          </div>
        ))}
      </div>

      <div className="plans-footer">
        <p>* Plan details are subject to change. Please verify on the respective carrier's website.</p>
      </div>
    </div>
  );
};

export default Plans; 