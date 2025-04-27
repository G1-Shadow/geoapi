import React from 'react';
import './Pricing.css';
import jio from '../imgs/jio.svg';
import airtel from '../imgs/airtel.svg';
import vi from '../imgs/vi.svg';
import bsnl from '../imgs/bsnl.svg';
import arrow from '../imgs/Arrow.png';

const Pricing = () => {
  const onePlanData = [
    {
      logo: <img src={jio} alt="Jio" />,
      price: "₹249/28 days",
      description: "Get 1 GB/Day + Unlimited Calls + 100 SMS/Day valid for 28 Days. Post daily quota, data speed will be upto 64Kbps. Post daily SMS quota charges applicable at Rs 1/1.5 for Local/STD SMS.",
      rechargeUrl: "https://www.jio.com/recharge"
    },
    {
      logo: <img src={airtel} alt="Airtel" />,
      price: "₹299/28 days",
      description: "Get 1 GB/Day + Unlimited Calls + 100 SMS/Day valid for 28 Days. Post daily quota, data speed will be upto 64Kbps. Post daily SMS quota charges applicable at Rs 1/1.5 for Local/STD SMS.",
      rechargeUrl: "https://www.airtel.in/recharge"
    },
    {
      logo: <img src={vi} alt="VI" />,
      price: "₹299/28 days",
      description: "Get 1 GB/Day + Unlimited Calls + 100 SMS/Day valid for 28 Days. Post daily quota, data speed will be upto 64Kbps. Post daily SMS quota charges applicable at Rs 1/1.5 for Local/STD SMS.",
      rechargeUrl: "https://www.myvi.in/recharge"
    },
    {
      logo: <img src={bsnl} alt="BSNL" />,
      price: "₹185/28 days",
      description: "Get 1 GB/Day + Unlimited Calls + 100 SMS/Day valid for 28 Days. Post daily quota, data speed will be upto 80Kbps. Post daily SMS quota charges applicable at Rs 1/1.5 for Local/STD SMS.",
      rechargeUrl: "https://portal.bsnl.in/myportal/quickrecharge.do"
    }
  ];

  const onePointFivePlanData = [
    {
      logo: <img src={jio} alt="Jio" />,
      price: "₹299/28 days",
      description: "Jio Unlimited Offer: JioHotstar Mobile/TV subscription for 90 Days, Free 50 GB JioAICloud storage, JioHotstar subscription is a one time and limited period offer.Customers on Jio monthly plan need to recharge their plan within 48 hours of plan expiry to get their 2nd and 3rd month JioHotstar benefit. T&C apply.",
      rechargeUrl: "https://www.jio.com/recharge"
    },
    {
      logo: <img src={airtel} alt="Airtel" />,
      price: "₹349/28 days",
      description: "Get 1.5 GB/Day + Unlimited Calls + 100 SMS/Day valid for 28 Days.  2GB of backup Data every month at no extra Cost! Post daily quota, data speed will be upto 64Kbps. Post daily SMS quota charges applicable at Rs 1/1.5 for Local/STD SMS",
      rechargeUrl: "https://www.airtel.in/recharge"
    },
    {
      logo: <img src={vi} alt="VI" />,
      price: "₹349/28 days",
      description: "Get 1.5 GB/Day + Unlimited Calls + 100 SMS/Day valid for 28 Days. Enjoy unlimited Night data from 12am to 6am! Carry Mon-Fri unused data into Sat-Sun. 2GB of backup Data every month at no extra Cost! Post daily quota, data speed will be upto 64Kbps. Post daily SMS quota charges applicable at Rs 1/1.5 for Local/STD SMS",
      rechargeUrl: "https://www.myvi.in/recharge"
    },
    {
      logo: <img src={bsnl} alt="BSNL" />,
      price: "₹205/28 days",
      description: "Get 1.5 GB/Day + Unlimited Calls + 100 SMS/Day valid for 28 Days. Post daily quota, data speed will be upto 80Kbps. Post daily SMS quota charges applicable at Rs 1/1.5 for Local/STD SMS",
      rechargeUrl: "https://portal.bsnl.in/myportal/quickrecharge.do"
    }
  ];

  const renderPlanSection = (title, plans) => (
    <div className="plan-section">
      <div className="plan-category">
        <span>{title}</span>
        <img src={arrow} alt="Arrow" />
      </div>
      <div className="plans-slider">
        {plans.map((plan, index) => (
          <div key={index} className="plan-card">
            <div className="plan-logo">
              {plan.logo}
            </div>
            <div className="plan-price">{plan.price}</div>
            <p className="plan-description">{plan.description}</p>
            <button 
              className="recharge-button"
              onClick={() => window.open(plan.rechargeUrl, '_blank')}
            >
              Recharge Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h1>CURRENT PLANS OFFERED</h1>
        <h2>BY <span className="highlight">SERVICE PROVIDERS</span></h2>
      </div>
      
      {renderPlanSection("1 GB/DAY PLANS", onePlanData)}
      {renderPlanSection("1.5 GB/DAY PLANS", onePointFivePlanData)}
    </div>
  );
};

export default Pricing; 