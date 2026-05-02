import React from 'react';
import LegalLayout from '../components/LegalLayout';

export const Privacy = () => (
  <LegalLayout title="Privacy Policy" lastUpdated="May 15, 2024">
    <section>
      <h2>1. Introduction</h2>
      <p>Welcome to Herald Sphere. We respect your privacy and are committed to protecting your personal data.</p>
      
      <h2>2. Data We Collect</h2>
      <ul>
        <li><strong>Identity Data:</strong> Name, username, and profile picture.</li>
        <li><strong>Contact Data:</strong> Email address for newsletter subscriptions.</li>
        <li><strong>Technical Data:</strong> IP address, browser type, and location.</li>
      </ul>

      <h2>3. How We Use Your Data</h2>
      <p>We use your data to provide our services, manage your account, and send you the Herald Sphere dispatch (if subscribed).</p>
    </section>
  </LegalLayout>
);
