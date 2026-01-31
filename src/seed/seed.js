import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import User from '../models/User.model.js';
import HeroSlide from '../models/HeroSlide.model.js';
import Service from '../models/Service.model.js';
import Course from '../models/Course.model.js';
import Partner from '../models/Partner.model.js';
import PageContent from '../models/PageContent.model.js';
import ContactMessage from '../models/ContactMessage.model.js';
import bcrypt from 'bcrypt';

dotenv.config();

async function seed() {
  if (process.env.NODE_ENV !== 'development') {
    console.log('❌ Seed can only run in development mode');
    process.exit(1);
  }

  try {
    await connectDB();

    // Clear all collections
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await HeroSlide.deleteMany({});
    await Service.deleteMany({});
    await Course.deleteMany({});
    await Partner.deleteMany({});
    await PageContent.deleteMany({});
    await ContactMessage.deleteMany({});

    // Create admin user
    console.log('👤 Creating admin user...');
    const passwordHash = await bcrypt.hash('Admin@12345', 10);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@sctsinstitute.com',
      passwordHash,
      role: 'admin',
    });
    console.log(`✅ Admin user created: ${adminUser.email}`);

    // Create hero slides
    console.log('🖼️  Creating hero slides...');
    const heroSlides = await HeroSlide.insertMany([
      {
        type: 'video',
        title: 'Upgrade your clinical skills',
        subtitle: 'Interactive workshops led by certified medical instructors.',
        mediaUrl: 'https://example.com/videos/hero-video-1.mp4',
        buttonText: 'View Courses →',
        buttonLink: '/courses',
        order: 1,
        isActive: true,
      },
      {
        type: 'image',
        title: 'Advance Your Medical Career',
        subtitle: 'Comprehensive training programs designed for healthcare professionals.',
        mediaUrl: 'https://example.com/images/hero-image-1.jpg',
        buttonText: 'Explore Services',
        buttonLink: '/services',
        order: 2,
        isActive: true,
      },
      {
        type: 'image',
        title: 'Nationally Recognized Certifications',
        subtitle: 'Get certified with our accredited medical training programs.',
        mediaUrl: 'https://example.com/images/hero-image-2.jpg',
        buttonText: 'View Programs',
        buttonLink: '/courses',
        order: 3,
        isActive: true,
      },
    ]);
    console.log(`✅ Created ${heroSlides.length} hero slides`);

    // Create services
    console.log('📋 Creating services...');
    const services = await Service.insertMany([
      {
        title: 'Life Support Training',
        slug: 'life-support-training',
        shortDescription: 'Advance your skills in life-saving techniques with our specialized life support training courses.',
        fullDescription: 'Our comprehensive life support training programs are designed to equip healthcare professionals with essential life-saving skills.',
        cardImage: 'https://example.com/images/services/life-support-card.jpg',
        heroImage: 'https://example.com/images/services/life-support-hero.jpg',
        order: 1,
        isActive: true,
        sections: [
          {
            id: 'life-support-main',
            title: 'Life Support Training',
            description: 'Advance your skills in life-saving techniques with our specialized life support training courses.',
            featuredCourses: ['ACLS', 'BLS', 'First Aid & Heart Saver'],
            image: 'https://example.com/images/services/life-support-section.jpg',
          },
        ],
      },
      {
        title: 'Advanced Medical Training',
        slug: 'advanced-medical-training',
        shortDescription: 'Enhance your expertise in advanced medical procedures and protocols.',
        fullDescription: 'Our advanced medical training programs are designed for experienced healthcare professionals.',
        cardImage: 'https://example.com/images/services/advanced-medical-card.jpg',
        heroImage: 'https://example.com/images/services/advanced-medical-hero.jpg',
        order: 2,
        isActive: true,
        sections: [
          {
            id: 'advanced-medical-main',
            title: 'Advanced Medical Training',
            description: 'Enhance your expertise in advanced medical procedures and protocols.',
            featuredCourses: ['ATLS', 'PALS', 'NRP'],
            image: 'https://example.com/images/services/advanced-medical-section.jpg',
          },
        ],
      },
      {
        title: 'Professional Development',
        slug: 'professional-development',
        shortDescription: 'Stay ahead in your career with our professional development courses.',
        fullDescription: 'Our professional development programs help healthcare professionals stay current with industry best practices.',
        cardImage: 'https://example.com/images/services/professional-dev-card.jpg',
        heroImage: 'https://example.com/images/services/professional-dev-hero.jpg',
        order: 3,
        isActive: true,
        sections: [
          {
            id: 'professional-development-main',
            title: 'Professional Development',
            description: 'Stay ahead in your career with our professional development courses.',
            featuredCourses: ['Infection Control', 'Disaster Management', 'CME'],
            image: 'https://example.com/images/services/professional-dev-section.jpg',
          },
        ],
      },
    ]);
    console.log(`✅ Created ${services.length} services`);

    // Create courses
    console.log('📚 Creating courses...');
    const courses = await Course.insertMany([
      {
        category: 'Life Support',
        title: 'ACLS Certification',
        slug: 'acls-certification',
        description: 'Advanced Cardiovascular Life Support certification for healthcare providers.',
        image: 'https://example.com/images/courses/acls.jpg',
        level: 'Advanced',
        duration: '2 days',
        price: 500,
        tags: ['certification', 'cardiac', 'life support'],
        isActive: true,
      },
      {
        category: 'Life Support',
        title: 'BLS Provider Course',
        slug: 'bls-provider-course',
        description: 'Basic Life Support training for healthcare providers and first responders.',
        image: 'https://example.com/images/courses/bls.jpg',
        level: 'Beginner',
        duration: '4 hours',
        price: 150,
        tags: ['certification', 'CPR', 'basic life support'],
        isActive: true,
      },
      {
        category: 'Life Support',
        title: 'First Aid & Heart Saver',
        slug: 'first-aid-heart-saver',
        description: 'Essential first aid and heart saver training for the general public.',
        image: 'https://example.com/images/courses/first-aid.jpg',
        level: 'Beginner',
        duration: '3 hours',
        price: 100,
        tags: ['first aid', 'CPR', 'public training'],
        isActive: true,
      },
      {
        category: 'Advanced Medical',
        title: 'ATLS Provider Course',
        slug: 'atls-provider-course',
        description: 'Advanced Trauma Life Support certification for physicians.',
        image: 'https://example.com/images/courses/atls.jpg',
        level: 'Expert',
        duration: '2 days',
        price: 800,
        tags: ['trauma', 'ATLS', 'advanced'],
        isActive: true,
      },
      {
        category: 'Advanced Medical',
        title: 'PALS Provider Course',
        slug: 'pals-provider-course',
        description: 'Pediatric Advanced Life Support certification for healthcare providers.',
        image: 'https://example.com/images/courses/pals.jpg',
        level: 'Advanced',
        duration: '2 days',
        price: 600,
        tags: ['pediatric', 'PALS', 'advanced'],
        isActive: true,
      },
      {
        category: 'Professional Development',
        title: 'Example Course',
        slug: 'example-course',
        description: 'Comprehensive training on infection control practices and prevention strategies.',
        image: 'https://example.com/images/courses/infection-control.jpg',
        level: 'Intermediate',
        duration: '1 day',
        price: 250,
        tags: ['infection control', 'safety', 'CME'],
        isActive: true,
      },
    ]);
    console.log(`✅ Created ${courses.length} courses`);

    // Create partners
    console.log('🤝 Creating partners...');
    const partners = await Partner.insertMany([
      {
        name: 'American Heart Association',
        logoUrl: 'https://example.com/logos/aha-logo.png',
        websiteUrl: 'https://www.heart.org',
        order: 1,
        isActive: true,
      },
      {
        name: 'American Red Cross',
        logoUrl: 'https://example.com/logos/red-cross-logo.png',
        websiteUrl: 'https://www.redcross.org',
        order: 2,
        isActive: true,
      },
      {
        name: 'National Association of Emergency Medical Technicians',
        logoUrl: 'https://example.com/logos/naemt-logo.png',
        websiteUrl: 'https://www.naemt.org',
        order: 3,
        isActive: true,
      },
    ]);
    console.log(`✅ Created ${partners.length} partners`);

    // Create page content
    console.log('📄 Creating page content...');
    const pageContent = await PageContent.create({
      key: 'about',
      title: 'About Us',
      contentJson: {
        sections: [
          {
            type: 'text',
            title: 'Our Mission',
            body: 'To provide high-quality medical training and professional development opportunities.',
          },
        ],
      },
      isActive: true,
    });
    console.log(`✅ Created page content: ${pageContent.key}`);

    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();



