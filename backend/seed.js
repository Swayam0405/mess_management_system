const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB } = require('./config/db');
const User = require('./models/User');
const Subscription = require('./models/Subscription');
const Menu = require('./models/Menu');
const Payment = require('./models/Payment');
const Feedback = require('./models/Feedback');
const Announcement = require('./models/Announcement');
const MealAttendance = require('./models/MealAttendance');

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB for seeding...');
    await connectDB();

    console.log('Clearing old data...');
    await User.deleteMany();
    await Subscription.deleteMany();
    await Menu.deleteMany();
    await Payment.deleteMany();
    await Feedback.deleteMany();
    await Announcement.deleteMany();
    await MealAttendance.deleteMany();

    console.log('Creating Admin Account...');
    const admin = await User.create({
      name: 'Dr. Rajesh Sharma (Chief Warden)',
      email: 'admin@college.edu',
      password: 'AdminPassword@123',
      role: 'admin',
      phone: '+91 98765 43210',
      hostelBlock: 'Administration Block',
      roomNumber: 'Warden Office 101',
      department: 'Hostel Administration',
      status: 'active'
    });

    console.log('Creating 12 Demo Students...');
    const studentData = [
      {
        name: 'Rahul Verma',
        email: 'rahul.verma@college.edu',
        password: 'Student@123',
        role: 'student',
        rollNumber: '22CS101',
        roomNumber: 'A-204',
        hostelBlock: 'Aryabhatta Hall (Block A)',
        phone: '+91 98111 22331',
        department: 'Computer Science & Engineering',
        year: 3,
        dietaryPreference: 'Veg'
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya.iyer@college.edu',
        password: 'Student@123',
        role: 'student',
        rollNumber: '22EC204',
        roomNumber: 'G-112',
        hostelBlock: 'Gargi Hall (Block C)',
        phone: '+91 98222 33442',
        department: 'Electronics & Communication',
        year: 3,
        dietaryPreference: 'Special Jain'
      },
      {
        name: 'Vikramaditya Rathore',
        email: 'vikram.rathore@college.edu',
        password: 'Student@123',
        role: 'student',
        rollNumber: '21ME305',
        roomNumber: 'B-310',
        hostelBlock: 'Bhaskara Hall (Block B)',
        phone: '+91 98333 44553',
        department: 'Mechanical Engineering',
        year: 4,
        dietaryPreference: 'Non-Veg'
      },
      {
        name: 'Sneha Kulkarni',
        email: 'sneha.k@college.edu',
        password: 'Student@123',
        role: 'student',
        rollNumber: '23IT118',
        roomNumber: 'G-208',
        hostelBlock: 'Gargi Hall (Block C)',
        phone: '+91 98444 55664',
        department: 'Information Technology',
        year: 2,
        dietaryPreference: 'Veg'
      },
      {
        name: 'Arjun Nair',
        email: 'arjun.nair@college.edu',
        password: 'Student@123',
        role: 'student',
        rollNumber: '22EE402',
        roomNumber: 'A-105',
        hostelBlock: 'Aryabhatta Hall (Block A)',
        phone: '+91 98555 66775',
        department: 'Electrical Engineering',
        year: 3,
        dietaryPreference: 'Non-Veg'
      },
      {
        name: 'Pooja Mehta',
        email: 'pooja.mehta@college.edu',
        password: 'Student@123',
        role: 'student',
        rollNumber: '24AI012',
        roomNumber: 'G-305',
        hostelBlock: 'Gargi Hall (Block C)',
        phone: '+91 98666 77886',
        department: 'Artificial Intelligence & Data Science',
        year: 1,
        dietaryPreference: 'Special Jain'
      },
      {
        name: 'Rohan Gupta',
        email: 'rohan.gupta@college.edu',
        password: 'Student@123',
        role: 'student',
        rollNumber: '22CE509',
        roomNumber: 'B-114',
        hostelBlock: 'Bhaskara Hall (Block B)',
        phone: '+91 98777 88997',
        department: 'Civil Engineering',
        year: 3,
        dietaryPreference: 'Veg'
      },
      {
        name: 'Kavya Reddy',
        email: 'kavya.reddy@college.edu',
        password: 'Student@123',
        role: 'student',
        rollNumber: '23CS145',
        roomNumber: 'G-102',
        hostelBlock: 'Gargi Hall (Block C)',
        phone: '+91 98888 99008',
        department: 'Computer Science & Engineering',
        year: 2,
        dietaryPreference: 'Non-Veg'
      },
      {
        name: 'Tanmay Joshi',
        email: 'tanmay.joshi@college.edu',
        password: 'Student@123',
        role: 'student',
        rollNumber: '21CH201',
        roomNumber: 'A-312',
        hostelBlock: 'Aryabhatta Hall (Block A)',
        phone: '+91 98999 00119',
        department: 'Chemical Engineering',
        year: 4,
        dietaryPreference: 'Veg'
      },
      {
        name: 'Meera Deshmukh',
        email: 'meera.d@college.edu',
        password: 'Student@123',
        role: 'student',
        rollNumber: '23EC178',
        roomNumber: 'G-214',
        hostelBlock: 'Gargi Hall (Block C)',
        phone: '+91 97111 12340',
        department: 'Electronics & Communication',
        year: 2,
        dietaryPreference: 'Veg'
      },
      {
        name: 'Devendra Patel',
        email: 'dev.patel@college.edu',
        password: 'Student@123',
        role: 'student',
        rollNumber: '22BT023',
        roomNumber: 'B-205',
        hostelBlock: 'Bhaskara Hall (Block B)',
        phone: '+91 97222 23451',
        department: 'Biotechnology',
        year: 3,
        dietaryPreference: 'Special Jain'
      },
      {
        name: 'Siddharth Sen',
        email: 'sid.sen@college.edu',
        password: 'Student@123',
        role: 'student',
        rollNumber: '21CS099',
        roomNumber: 'A-401',
        hostelBlock: 'Aryabhatta Hall (Block A)',
        phone: '+91 97333 34562',
        department: 'Computer Science & Engineering',
        year: 4,
        dietaryPreference: 'Non-Veg'
      }
    ];

    const students = await User.create(studentData);
    console.log(` Inserted ${students.length} demo students.`);

    console.log('Creating Subscriptions & Payments...');
    const currentMonthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevMonthStr = prevMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      // Create Subscription
      await Subscription.create({
        student: student._id,
        planName: 'Standard Monthly All-Meals',
        monthlyFee: 4200,
        status: i === 10 ? 'paused' : 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      // Previous month payment (all paid)
      await Payment.create({
        student: student._id,
        transactionId: `TXN-${prevMonthDate.getFullYear()}${(prevMonthDate.getMonth() + 1).toString().padStart(2, '0')}-${1000 + i}`,
        amount: 4200,
        month: prevMonthStr,
        paymentDate: prevMonthDate,
        paymentMethod: i % 2 === 0 ? 'UPI' : 'Net Banking',
        status: 'Paid',
        remarks: 'Previous month mess fee settled'
      });

      // Current month payment (some Paid, some Pending)
      const isPaid = i < 8; // first 8 paid, remaining 4 pending
      await Payment.create({
        student: student._id,
        transactionId: `TXN-CMS-${Date.now().toString().slice(-4)}-${2000 + i}`,
        amount: 4200,
        month: currentMonthStr,
        paymentDate: isPaid ? new Date() : null,
        paymentMethod: isPaid ? (i % 3 === 0 ? 'UPI' : 'Debit Card') : 'UPI',
        status: isPaid ? 'Paid' : 'Pending',
        remarks: isPaid ? 'Current month subscription' : 'Fee due for current month'
      });
    }

    console.log('Creating Weekly 7-Day Meal Menu (28 meals)...');
    const weeklyMenuData = [
      // MONDAY
      {
        day: 'Monday',
        mealType: 'breakfast',
        items: ['Idli Sambar', 'Coconut & Tomato Chutney', 'Boiled Eggs / Banana', 'Hot Tea & Filter Coffee'],
        timing: '07:30 AM - 09:30 AM',
        caloriesEstimate: 420,
        specialDietNote: 'Jain sambar without onion/garlic available'
      },
      {
        day: 'Monday',
        mealType: 'lunch',
        items: ['Jeera Rice', 'Tawa Roti', 'Dal Tadka', 'Aloo Gobi Matar', 'Fresh Boondi Raita', 'Green Salad'],
        timing: '12:30 PM - 02:30 PM',
        caloriesEstimate: 680,
        specialDietNote: 'Unlimited chapati & rice'
      },
      {
        day: 'Monday',
        mealType: 'snacks',
        items: ['Veg Samosa (2 pcs)', 'Mint Chutney', 'Ginger Masala Chai', 'Bournvita Milk'],
        timing: '05:00 PM - 06:15 PM',
        caloriesEstimate: 310,
        specialDietNote: 'Fried in fresh groundnut oil'
      },
      {
        day: 'Monday',
        mealType: 'dinner',
        items: ['Steam Basmati Rice', 'Phulka', 'Paneer Butter Masala (Veg)', 'Egg Curry (Non-Veg)', 'Moong Dal', 'Gulab Jamun'],
        timing: '07:45 PM - 09:45 PM',
        caloriesEstimate: 720,
        specialDietNote: 'Egg curry for non-veg students, Paneer for veg/jain'
      },

      // TUESDAY
      {
        day: 'Tuesday',
        mealType: 'breakfast',
        items: ['Poha with Roasted Peanuts', 'Sev & Lemon', 'Upma with Chutney', 'Tea & Coffee'],
        timing: '07:30 AM - 09:30 AM',
        caloriesEstimate: 390,
        specialDietNote: 'Light and wholesome'
      },
      {
        day: 'Tuesday',
        mealType: 'lunch',
        items: ['Steamed Rice', 'Butter Roti', 'Rajma Masala (Punjabi style)', 'Bhindi Fry', 'Curd', 'Papad & Pickle'],
        timing: '12:30 PM - 02:30 PM',
        caloriesEstimate: 650,
        specialDietNote: 'Rich protein rajma'
      },
      {
        day: 'Tuesday',
        mealType: 'snacks',
        items: ['Pav Bhaji / Bun Maska', 'Chopped Onions & Lemon', 'Tea / Lemon Tea'],
        timing: '05:00 PM - 06:15 PM',
        caloriesEstimate: 340,
        specialDietNote: 'Amul butter pav'
      },
      {
        day: 'Tuesday',
        mealType: 'dinner',
        items: ['Veg Pulao', 'Plain Roti', 'Mix Veg Korma', 'Yellow Dal Fry', 'Crispy Papad', 'Fruit Custard'],
        timing: '07:45 PM - 09:45 PM',
        caloriesEstimate: 690,
        specialDietNote: 'Special fruit custard dessert'
      },

      // WEDNESDAY
      {
        day: 'Wednesday',
        mealType: 'breakfast',
        items: ['Crispy Masala Dosa', 'Mysore Chutney', 'Piping Hot Sambar', 'Filter Coffee & Tea'],
        timing: '07:30 AM - 09:30 AM',
        caloriesEstimate: 450,
        specialDietNote: 'Made to order hot dosas'
      },
      {
        day: 'Wednesday',
        mealType: 'lunch',
        items: ['Rice', 'Chapati', 'Chole Peshawari', 'Bhature (1 pc)', 'Kadhi Pakoda', 'Cucumber Salad'],
        timing: '12:30 PM - 02:30 PM',
        caloriesEstimate: 740,
        specialDietNote: 'Delhi style chole bhature special'
      },
      {
        day: 'Wednesday',
        mealType: 'snacks',
        items: ['Bread Pakoda with Green & Sweet Chutney', 'Cardamom Tea', 'Hot Milk'],
        timing: '05:00 PM - 06:15 PM',
        caloriesEstimate: 320,
        specialDietNote: 'Potato stuffing with roasted spices'
      },
      {
        day: 'Wednesday',
        mealType: 'dinner',
        items: ['Chicken Curry (Non-Veg)', 'Kadai Paneer (Veg)', 'Laccha Paratha', 'Jeera Pulao', 'Dal Makhani', 'Ice Cream Cup'],
        timing: '07:45 PM - 09:45 PM',
        caloriesEstimate: 780,
        specialDietNote: 'Wednesday Non-Veg Special Chicken Feast'
      },

      // THURSDAY
      {
        day: 'Thursday',
        mealType: 'breakfast',
        items: ['Aloo Paratha with White Butter', 'Curd & Mixed Pickle', 'Sweet Lassi', 'Hot Tea'],
        timing: '07:30 AM - 09:30 AM',
        caloriesEstimate: 460,
        specialDietNote: 'Fresh whole wheat stuffed parathas'
      },
      {
        day: 'Thursday',
        mealType: 'lunch',
        items: ['Basmati Rice', 'Tandoori Roti', 'Dal Palak (Healthy Greens)', 'Baingan Bharta / Aloo Baingan', 'Roasted Papad'],
        timing: '12:30 PM - 02:30 PM',
        caloriesEstimate: 610,
        specialDietNote: 'Rich in iron and dietary fiber'
      },
      {
        day: 'Thursday',
        mealType: 'snacks',
        items: ['Bhel Puri / Sev Puri', 'Fried Green Chillies', 'Masala Chai', 'Cold Coffee'],
        timing: '05:00 PM - 06:15 PM',
        caloriesEstimate: 290,
        specialDietNote: 'Crunchy savory street food snack'
      },
      {
        day: 'Thursday',
        mealType: 'dinner',
        items: ['Veg Dum Biryani', 'Mirchi Ka Salan', 'Burani Raita', 'Phulka', 'Tadka Dal', 'Kheer (Rice Pudding)'],
        timing: '07:45 PM - 09:45 PM',
        caloriesEstimate: 710,
        specialDietNote: 'Fragrant dum biryani cooked in pure ghee'
      },

      // FRIDAY
      {
        day: 'Friday',
        mealType: 'breakfast',
        items: ['Uttapam (Onion/Tomato)', 'Coconut & Coriander Chutney', 'Meduvada (1 pc)', 'Sambar', 'Tea / Milk'],
        timing: '07:30 AM - 09:30 AM',
        caloriesEstimate: 430,
        specialDietNote: 'Crisp hot meduvada'
      },
      {
        day: 'Friday',
        mealType: 'lunch',
        items: ['Steam Rice', 'Phulka', 'Dal Fry', 'Malai Kofta (Veg)', 'Jeera Aloo', 'Boondi Raita'],
        timing: '12:30 PM - 02:30 PM',
        caloriesEstimate: 660,
        specialDietNote: 'Creamy cashew malai gravy'
      },
      {
        day: 'Friday',
        mealType: 'snacks',
        items: ['Grilled Veg Cheese Sandwich', 'Potato Chips', 'Tomato Ketchup', 'Cutting Chai'],
        timing: '05:00 PM - 06:15 PM',
        caloriesEstimate: 330,
        specialDietNote: 'Toasted golden with cheddar'
      },
      {
        day: 'Friday',
        mealType: 'dinner',
        items: ['Fried Rice', 'Veg Manchurian Gravy', 'Chilli Chicken Gravy (Non-Veg)', 'Hot & Sour Soup', 'Spring Roll (1 pc)'],
        timing: '07:45 PM - 09:45 PM',
        caloriesEstimate: 730,
        specialDietNote: 'Indo-Chinese Friday Special Banquet'
      },

      // SATURDAY
      {
        day: 'Saturday',
        mealType: 'breakfast',
        items: ['Bedmi Puri with Aloo Sabzi', 'Methi Chutney', 'Jalebi (2 pcs)', 'Hot Masala Milk / Tea'],
        timing: '07:30 AM - 09:30 AM',
        caloriesEstimate: 510,
        specialDietNote: 'Weekend festive breakfast'
      },
      {
        day: 'Saturday',
        mealType: 'lunch',
        items: ['Curd Rice with Pomegranate', 'Sambar Rice', 'Potato Roast', 'Appalam / Papad', 'Tomato Rasam'],
        timing: '12:30 PM - 02:30 PM',
        caloriesEstimate: 600,
        specialDietNote: 'Cooling South Indian lunch spread'
      },
      {
        day: 'Saturday',
        mealType: 'snacks',
        items: ['Dhokla with Green Chillies & Mustard Tadka', 'Tamarind Chutney', 'Ginger Tea'],
        timing: '05:00 PM - 06:15 PM',
        caloriesEstimate: 270,
        specialDietNote: 'Steamed, low oil healthy snack'
      },
      {
        day: 'Saturday',
        mealType: 'dinner',
        items: ['Tawa Paratha', 'Dal Makhani (Slow Cooked)', 'Shahi Paneer', 'Fish Curry / Egg Bhurji (Non-Veg)', 'Rice', 'Rasgulla'],
        timing: '07:45 PM - 09:45 PM',
        caloriesEstimate: 750,
        specialDietNote: 'Weekend special sweet treat'
      },

      // SUNDAY
      {
        day: 'Sunday',
        mealType: 'breakfast',
        items: ['Chole Bhature (Freshly Puffed)', 'Spicy Pickle & Sirka Onion', 'Sweet Mango Lassi', 'Tea & Coffee'],
        timing: '08:00 AM - 10:00 AM',
        caloriesEstimate: 540,
        specialDietNote: 'Sunday extended breakfast timings'
      },
      {
        day: 'Sunday',
        mealType: 'lunch',
        items: ['Hyderabadi Mutton/Chicken Biryani (Non-Veg)', 'Paneer Tikka Biryani (Veg)', 'Mirchi Salan', 'Onion Raita', 'Gulab Jamun with Ice Cream'],
        timing: '12:30 PM - 03:00 PM',
        caloriesEstimate: 820,
        specialDietNote: 'Grand Sunday Feast with Chef Special Dum Biryani'
      },
      {
        day: 'Sunday',
        mealType: 'snacks',
        items: ['Kachori with Aloo Jhol', 'Cardamom Tea', 'Bournvita Hot Milk'],
        timing: '05:00 PM - 06:15 PM',
        caloriesEstimate: 310,
        specialDietNote: 'Traditional Khasta Kachori'
      },
      {
        day: 'Sunday',
        mealType: 'dinner',
        items: ['Light Moong Dal Khichdi', 'Papad', 'Dahi (Yogurt)', 'Phulka Roti', 'Aloo Palak', 'Kheer'],
        timing: '07:45 PM - 09:30 PM',
        caloriesEstimate: 580,
        specialDietNote: 'Comforting, light Sunday night dinner'
      }
    ];

    for (const item of weeklyMenuData) {
      await Menu.create({
        ...item,
        updatedBy: admin._id
      });
    }
    console.log(` Inserted ${weeklyMenuData.length} weekly menu entries (all 7 days).`);

    console.log('Creating Announcements...');
    const announcementsData = [
      {
        title: 'Grand Diwali & Semester Cultural Feast Announced!',
        content: 'We are pleased to inform all hostel residents that the Annual Semester Grand Feast will be hosted this coming Friday evening at 7:30 PM. Special menu includes Paneer Lababdar, Mughlai Dum Biryani, and Kaju Katli dessert. Attendance is complimentary.',
        category: 'Holiday / Special Feast',
        priority: 'high',
        author: admin._id,
        isActive: true
      },
      {
        title: 'Monthly Mess Bill Settlement Deadline - November 2026',
        content: 'All students are requested to clear their pending mess subscription fees on or before November 15, 2026 through the online portal or warden office counter to ensure uninterrupted meal services.',
        category: 'Fee Notice',
        priority: 'urgent',
        author: admin._id,
        isActive: true
      },
      {
        title: 'New Salad & Healthy Juices Counter Added',
        content: 'Based on student council feedback, a fresh fruit salad and lemon-mint water dispenser has been permanently introduced in the dining hall during lunch hours.',
        category: 'Menu Update',
        priority: 'medium',
        author: admin._id,
        isActive: true
      },
      {
        title: 'Routine Kitchen Sanitization & Deep Cleaning This Saturday',
        content: 'The mess dining hall will undergo routine pest control and steam sanitization between 02:30 PM and 04:30 PM this Saturday. Evening snacks will be served in the outdoor gazebo.',
        category: 'Maintenance',
        priority: 'low',
        author: admin._id,
        isActive: true
      }
    ];
    await Announcement.create(announcementsData);
    console.log(' Inserted announcements.');

    console.log('Creating Sample Student Feedback...');
    const feedbackData = [
      {
        student: students[0]._id, // Rahul
        category: 'Food Quality',
        mealType: 'dinner',
        rating: 5,
        comment: 'Wednesday night chicken curry and paneer butter masala were exceptionally delicious! Great quality improvement by the kitchen team.',
        status: 'Reviewed',
        adminResponse: 'Thank you Rahul! The culinary staff appreciates your encouraging feedback.'
      },
      {
        student: students[1]._id, // Ananya
        category: 'Cleanliness & Hygiene',
        mealType: 'lunch',
        rating: 4,
        comment: 'Dining tables and stainless steel cutlery are consistently kept neat and sanitized. Please keep extra water glasses during peak lunch hours.',
        status: 'Resolved',
        adminResponse: 'Noted Ananya, 50 additional sanitized tumblers have been added to the self-service counter.'
      },
      {
        student: students[2]._id, // Vikram
        category: 'Timing & Punctuality',
        mealType: 'breakfast',
        rating: 4,
        comment: 'Dosa counter gets crowded around 8:45 AM before 9 AM lectures. Can we deploy an extra tawa during that half hour?',
        status: 'Reviewed',
        adminResponse: 'We have instructed the morning shift cook to operate both tawas between 8:30 and 9:15 AM.'
      },
      {
        student: students[3]._id, // Sneha
        category: 'Variety',
        mealType: 'snacks',
        rating: 5,
        comment: 'Loved the grilled cheese sandwiches on Friday! The mint chutney was fresh and spicy.',
        status: 'Pending',
        adminResponse: ''
      }
    ];
    await Feedback.create(feedbackData);
    console.log(' Inserted feedback records.');

    console.log('Creating Today & Past Attendance records...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 8; i++) {
      const student = students[i];
      // Breakfast today
      await MealAttendance.create({
        student: student._id,
        date: today,
        mealType: 'breakfast',
        status: 'Consumed',
        checkInTime: new Date(Date.now() - 6 * 3600 * 1000)
      });
      // Lunch today
      await MealAttendance.create({
        student: student._id,
        date: today,
        mealType: 'lunch',
        status: 'Consumed',
        checkInTime: new Date(Date.now() - 2 * 3600 * 1000)
      });
      // Snacks today (for 5 students)
      if (i < 5) {
        await MealAttendance.create({
          student: student._id,
          date: today,
          mealType: 'snacks',
          status: 'Consumed',
          checkInTime: new Date()
        });
      }
    }
    console.log(' Inserted sample attendance logs.');

    console.log('\n=============================================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=============================================================');
    console.log(' DEMO CREDENTIALS FOR TESTING & EVALUATION:');
    console.log('-------------------------------------------------------------');
    console.log(' 1. ADMIN ACCOUNT:');
    console.log('    Email:    admin@college.edu');
    console.log('    Password: AdminPassword@123');
    console.log('    Role:     Administrator (Full access to all controls)');
    console.log('-------------------------------------------------------------');
    console.log(' 2. STUDENT ACCOUNT (Primary Demo):');
    console.log('    Email:    rahul.verma@college.edu');
    console.log('    Password: Student@123');
    console.log('    Roll No:  22CS101 (Computer Science, 3rd Year)');
    console.log('-------------------------------------------------------------');
    console.log(' 3. OTHER DEMO STUDENTS (Password: Student@123):');
    console.log('    - ananya.iyer@college.edu   (Jain Diet, Block C)');
    console.log('    - vikram.rathore@college.edu (Non-Veg, Block B)');
    console.log('    - sneha.k@college.edu        (Veg, Block C)');
    console.log('=============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

seedDatabase();
