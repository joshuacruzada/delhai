import React from "react";
import { IconMapPinFilled, IconPhoneFilled, IconMailFilled } from "@tabler/icons-react";
import "./ContactInfo.css"; 

const ContactInfo = () => {
  return (
    <div className="landing-contact-page">
      <div className="landing-contact-container">
        <h2>Contact Us</h2>
        <p>Have questions? Our team is here to help you with any inquiries you may have. Get in touch today!</p>

        <div className="landing-contact-info">
          <div className="contact-item">
            <span><IconMapPinFilled /></span> #69 Kalusugan St. Brgy. Batasan Hills, Quezon City, Philippines
          </div>
          <div className="contact-item">
            <span><IconPhoneFilled /></span> 282424619
          </div>
          <div className="contact-item">
            <span><IconMailFilled /></span> delhaimedical@gmail.com
          </div>
        </div>
      </div>

    </div>
  
  );
};

export default ContactInfo;
