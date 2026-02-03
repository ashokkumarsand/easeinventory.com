import React from 'react';

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'SoftwareApplication' | 'Article' | 'FAQPage';
  data?: Record<string, unknown>;
}

const organizationData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'EaseInventory',
  alternateName: 'EaseInventory Technologies Private Limited',
  url: 'https://easeinventory.com',
  logo: 'https://easeinventory.com/logo.png',
  description: 'India\'s most intuitive inventory and service management platform for SMBs.',
  foundingDate: '2024',
  founders: [
    {
      '@type': 'Person',
      name: 'Ashok Kumar Sand',
    },
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
  },
  sameAs: [
    'https://twitter.com/easeinventory',
    'https://linkedin.com/company/easeinventory',
    'https://instagram.com/easeinventory',
  ],
};

const websiteData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'EaseInventory',
  url: 'https://easeinventory.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://easeinventory.com/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

const softwareData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'EaseInventory',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, iOS, Android',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
    priceValidUntil: '2027-12-31',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250',
  },
  featureList: [
    'Inventory Management',
    'GST Invoicing',
    'Repair Tracking',
    'Multi-location Support',
    'Team Management',
    'Reports & Analytics',
  ],
};

export const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  let jsonLd: Record<string, unknown>;

  switch (type) {
    case 'Organization':
      jsonLd = organizationData;
      break;
    case 'WebSite':
      jsonLd = websiteData;
      break;
    case 'SoftwareApplication':
      jsonLd = softwareData;
      break;
    case 'Article':
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        ...data,
      };
      break;
    case 'FAQPage':
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        ...data,
      };
      break;
    default:
      jsonLd = {};
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export default StructuredData;
