import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaCopy } from 'react-icons/fa';
import { getCustomerOrderFormLink } from '../utils/customerOrderLink';
import './CustomerOrderLinkModal.css';

const CustomerOrderLinkModal = ({ show, onClose }) => {
  const [link, setLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const generateLink = async () => {
      try {
        const generatedLink = getCustomerOrderFormLink();
        if (generatedLink) {
          setLink(generatedLink);
        } else {
          setLink(`${window.location.origin}/user/public/customer-order`);
        }
      } catch (error) {
        console.error('Error generating order form link:', error);
        setLink(`${window.location.origin}/user/public/customer-order`);
      }
    };

    if (show) {
      generateLink();
    }
  }, [show]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy link: ', err);
      });
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      dialogClassName="customer-order-link-modal-container"
    >
      <Modal.Header closeButton className="customer-order-link-header">
        <Modal.Title>Customer Order Form Link</Modal.Title>
      </Modal.Header>
      <Modal.Body className="customer-order-link-body">
        {link ? (
          <div>
            <p>Use the following link to access the Customer Order Form:</p>
            <div className="customer-order-link-input-group">
              <input
                type="text"
                className="customer-order-link-input"
                value={link}
                readOnly
              />
              <Button
                variant="outline-secondary"
                className="customer-order-link-copy-button"
                onClick={copyToClipboard}
                title="Copy Link"
              >
                <FaCopy />
              </Button>
            </div>
            {copySuccess && (
              <p className="customer-order-link-copy-success">
                ✅ Link copied to clipboard!
              </p>
            )}
            <a href={link} target="_blank" rel="noopener noreferrer">
              <Button variant="primary" className="customer-order-link-button">
                Open Link
              </Button>
            </a>
          </div>
        ) : (
          <p className="text-danger customer-order-link-error">
            Failed to generate a user-specific link. Using public order form link instead.
          </p>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default CustomerOrderLinkModal;
