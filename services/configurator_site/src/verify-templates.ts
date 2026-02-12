
import { previewService } from './services/preview.service';
import { SiteConfig } from './models/site-config.model';

const mockConfig: SiteConfig = {
  brand: {
    name: 'Test Brand',
    industry: 'Tech',
    logo: 'https://example.com/logo.png'
  },
  theme: {
    primaryColor: '#0070f3',
    secondaryColor: '#1a202c'
  },
  layout: {
    header: {
      showLogo: true,
      navigation: [
        { label: 'Home', href: '/', order: 1 },
        { label: 'About', href: '/about', order: 2 }
      ]
    },
    footer: {
      showBrand: true,
      copyright: '© 2024 Test Brand',
      links: []
    },
    sections: [
      {
        id: '1',
        type: 'hero',
        order: 1,
        visible: true,
        content: {
          title: 'Hero Title',
          subtitle: 'Hero Subtitle',
          ctaText: 'Get Started',
          ctaHref: '/start'
        }
      },
      {
        id: '2',
        type: 'services',
        order: 2,
        visible: true,
        content: {
          title: 'Our Services',
          items: [
            { title: 'Service 1', description: 'Desc 1' },
            { title: 'Service 2', description: 'Desc 2' }
          ]
        }
      }
    ]
  }
};

async function verify() {
  console.log('--- Verifying Templates ---');

  // Test Default Template
  console.log('\nTesting Default Template...');
  mockConfig.templateId = 'default';
  const defaultPreview = previewService.generatePreviewJson(mockConfig);
  
  if (defaultPreview.html.includes('class="service-item"')) {
    console.log('✅ Default template rendered correctly (found .service-item)');
  } else {
    console.error('❌ Default template failed verification');
  }

  // Test Modern Template
  console.log('\nTesting Modern Template...');
  mockConfig.templateId = 'modern';
  const modernPreview = previewService.generatePreviewJson(mockConfig);

  if (modernPreview.html.includes('class="service-card"')) {
    console.log('✅ Modern template rendered correctly (found .service-card)');
  } else {
    console.error('❌ Modern template failed verification');
    console.log('Snippet:', modernPreview.html.substring(0, 500));
  }
  
  if (modernPreview.html.includes('--container') || Object.keys(modernPreview.assets).length > 0) {
     console.log('✅ Modern template verification passed');
  } else {
     console.error('❌ Modern template verification failed');
  }
  
  if (defaultPreview.html !== modernPreview.html) {
      console.log('✅ Templates produce different output');
  } else {
      console.error('❌ Templates produce identical output');
  }
}

verify().catch(console.error);
