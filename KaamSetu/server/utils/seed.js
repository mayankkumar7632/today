// KaamSetu - Seed Data Script
// Run this script to create sample data for development
// Usage: node server/utils/seed.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const EmployerProfile = require('../models/EmployerProfile');
const Job = require('../models/Job');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await WorkerProfile.deleteMany({});
    await EmployerProfile.deleteMany({});
    await Job.deleteMany({});
    console.log('Cleared existing data');

    const salt = await bcrypt.genSalt(10);

    // Create Admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@kaamsetu.com',
      phone: '9999999999',
      password: await bcrypt.hash('admin123', salt),
      role: 'admin'
    });
    console.log('Admin created: admin@kaamsetu.com / admin123');

    // Create Sample Employers
    const employer1 = await User.create({
      name: 'Rajesh Construction',
      email: 'rajesh@example.com',
      phone: '9876543210',
      password: await bcrypt.hash('password123', salt),
      role: 'employer'
    });

    await EmployerProfile.create({
      user: employer1._id,
      businessName: 'Rajesh Construction Co.',
      ownerName: 'Rajesh Kumar',
      businessType: 'Construction',
      phone: '9876543210',
      description: 'Building construction and renovation company',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139],
        address: 'Connaught Place',
        city: 'Delhi'
      }
    });
    console.log('Employer 1 created: rajesh@example.com / password123');

    const employer2 = await User.create({
      name: 'Priya Events',
      email: 'priya@example.com',
      phone: '9876543211',
      password: await bcrypt.hash('password123', salt),
      role: 'employer'
    });

    await EmployerProfile.create({
      user: employer2._id,
      businessName: 'Priya Event Management',
      ownerName: 'Priya Sharma',
      businessType: 'Event Management',
      phone: '9876543211',
      description: 'Wedding and event decoration services',
      location: {
        type: 'Point',
        coordinates: [77.1025, 28.7041],
        address: 'Rohini',
        city: 'Delhi'
      }
    });
    console.log('Employer 2 created: priya@example.com / password123');

    // Create Sample Workers
    const workerSkills = [
      { name: 'Amit Painter', skills: ['Painting', 'Wall Preparation', 'Color Mixing'], exp: 5, wage: 700, city: 'Delhi' },
      { name: 'Suresh Plumber', skills: ['Plumbing', 'Pipe Fitting', 'Water Tank Repair'], exp: 8, wage: 800, city: 'Delhi' },
      { name: 'Vikram Electrician', skills: ['Electrical', 'Wiring', 'Switch Board Installation'], exp: 6, wage: 750, city: 'Delhi' },
      { name: 'Ravi Carpenter', skills: ['Carpentry', 'Furniture Making', 'Wood Polishing'], exp: 10, wage: 900, city: 'Delhi' },
      { name: 'Deepak Helper', skills: ['Construction', 'Loading', 'Cleaning'], exp: 2, wage: 500, city: 'Delhi' }
    ];

    for (let i = 0; i < workerSkills.length; i++) {
      const w = workerSkills[i];
      const worker = await User.create({
        name: w.name,
        email: `worker${i + 1}@example.com`,
        phone: `987654322${i}`,
        password: await bcrypt.hash('password123', salt),
        role: 'worker'
      });

      await WorkerProfile.create({
        user: worker._id,
        skills: w.skills,
        experience: `${w.exp} years of experience in ${w.skills[0].toLowerCase()}`,
        yearsOfExperience: w.exp,
        expectedWage: w.wage,
        availability: 'Monday to Saturday, 8 AM to 6 PM',
        bio: `Experienced ${w.skills[0].toLowerCase()} with ${w.exp} years of work history`,
        location: {
          type: 'Point',
          coordinates: [77.1 + (Math.random() * 0.2), 28.6 + (Math.random() * 0.2)],
          address: 'Local Area',
          city: w.city
        }
      });
      console.log(`Worker created: worker${i + 1}@example.com / password123`);
    }

    // Create Sample Jobs
    const jobs = [
      {
        employer: employer1._id,
        title: 'House Painting Required',
        description: 'Need a painter for 2BHK house painting. Internal walls only.',
        requiredSkills: ['Painting'],
        requiredExperience: 2,
        dailyWage: 700,
        location: { type: 'Point', coordinates: [77.22, 28.63], address: 'Lajpat Nagar', city: 'Delhi' },
        jobDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        workersRequired: 2
      },
      {
        employer: employer2._id,
        title: 'Wedding Decoration Work',
        description: 'Need helpers for wedding stage decoration. 2 day work.',
        requiredSkills: ['Decoration', 'Loading'],
        requiredExperience: 0,
        dailyWage: 600,
        location: { type: 'Point', coordinates: [77.11, 28.71], address: 'Rohini Sector 3', city: 'Delhi' },
        jobDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        workersRequired: 4
      },
      {
        employer: employer1._id,
        title: 'Plumbing Work in New Flat',
        description: 'Complete plumbing work for a new 3BHK flat including bathroom fittings.',
        requiredSkills: ['Plumbing', 'Pipe Fitting'],
        requiredExperience: 3,
        dailyWage: 900,
        location: { type: 'Point', coordinates: [77.19, 28.58], address: 'Saket', city: 'Delhi' },
        jobDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        workersRequired: 1
      }
    ];

    for (const jobData of jobs) {
      await Job.create(jobData);
    }
    console.log('Sample jobs created');

    console.log('\n========================================');
    console.log('SEED DATA CREATED SUCCESSFULLY!');
    console.log('========================================');
    console.log('Admin: admin@kaamsetu.com / admin123');
    console.log('Employer 1: rajesh@example.com / password123');
    console.log('Employer 2: priya@example.com / password123');
    console.log('Workers: worker1@example.com to worker5@example.com / password123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
