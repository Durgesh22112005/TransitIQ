// =============================================================
// prisma/seed.js – TransitIQ Demo Seed
// Creates 5 drivers, buses, routes, and IN_PROGRESS trips
// Usage: npm run db:seed
// =============================================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ─── Coimbatore route definitions ─────────────────────────────
const ROUTES = [
  {
    name: 'Gandhipuram – Kuniyamuthur',
    routeNo: 'R-100',
    startLocation: 'Gandhipuram Town Bus Stand',
    endLocation: 'Kuniyamuthur',
    distance: 12,
    duration: 35,
    stops: [
      { name: 'Gandhipuram Town Bus Stand', sequence: 1, landmark: 'Main bus terminal' },
      { name: 'Town Hall', sequence: 2, landmark: 'City center' },
      { name: 'Saibaba Colony', sequence: 3, landmark: 'Residential area' },
      { name: 'Kuniyamuthur', sequence: 4, landmark: 'Bus terminus' },
    ],
    path: [
      [11.0168, 76.9558], [11.0130, 76.9570], [11.0100, 76.9585],
      [11.0060, 76.9600], [11.0100, 76.9620], [11.0200, 76.9635],
      [11.0300, 76.9640], [11.0400, 76.9645], [11.0493, 76.9644],
    ],
  },
  {
    name: 'RS Puram – Peelamedu',
    routeNo: 'R-101',
    startLocation: 'RS Puram',
    endLocation: 'Peelamedu Airport Road',
    distance: 14,
    duration: 40,
    stops: [
      { name: 'RS Puram', sequence: 1, landmark: 'Shopping district' },
      { name: 'Gandhipuram', sequence: 2, landmark: 'Central hub' },
      { name: 'Ram Nagar', sequence: 3, landmark: 'Commercial area' },
      { name: 'Peelamedu', sequence: 4, landmark: 'Airport road' },
    ],
    path: [
      [11.0026, 76.9537], [11.0060, 76.9545], [11.0100, 76.9550],
      [11.0168, 76.9558], [11.0200, 76.9600], [11.0230, 76.9700],
      [11.0300, 76.9780], [11.0380, 76.9870], [11.0444, 76.9950],
    ],
  },
  {
    name: 'Ukkadam – Saibaba Colony',
    routeNo: 'R-102',
    startLocation: 'Ukkadam Bus Stand',
    endLocation: 'Saibaba Colony',
    distance: 10,
    duration: 30,
    stops: [
      { name: 'Ukkadam Bus Stand', sequence: 1, landmark: 'South bus stand' },
      { name: 'Town Hall', sequence: 2, landmark: 'City center' },
      { name: 'RS Puram', sequence: 3, landmark: 'Shopping district' },
      { name: 'Saibaba Colony', sequence: 4, landmark: 'Residential area' },
    ],
    path: [
      [10.9947, 76.9528], [10.9980, 76.9540], [11.0010, 76.9550],
      [11.0060, 76.9600], [11.0080, 76.9570], [11.0150, 76.9560],
      [11.0250, 76.9580], [11.0350, 76.9620], [11.0447, 76.9647],
    ],
  },
  {
    name: 'Singanallur – Town Hall',
    routeNo: 'R-103',
    startLocation: 'Singanallur',
    endLocation: 'Town Hall',
    distance: 11,
    duration: 32,
    stops: [
      { name: 'Singanallur', sequence: 1, landmark: 'East Coimbatore' },
      { name: 'Ram Nagar', sequence: 2, landmark: 'Commercial area' },
      { name: 'Gandhipuram', sequence: 3, landmark: 'Central hub' },
      { name: 'Town Hall', sequence: 4, landmark: 'City center' },
    ],
    path: [
      [11.0168, 77.0000], [11.0180, 76.9900], [11.0200, 76.9800],
      [11.0230, 76.9700], [11.0210, 76.9630], [11.0168, 76.9558],
      [11.0120, 76.9570], [11.0060, 76.9600],
    ],
  },
  {
    name: 'Podanur – Foxhall',
    routeNo: 'R-104',
    startLocation: 'Podanur Junction',
    endLocation: 'Foxhall',
    distance: 13,
    duration: 38,
    stops: [
      { name: 'Podanur Junction', sequence: 1, landmark: 'Railway junction' },
      { name: 'Ukkadam', sequence: 2, landmark: 'South bus stand' },
      { name: 'Town Hall', sequence: 3, landmark: 'City center' },
      { name: 'Foxhall', sequence: 4, landmark: 'Central Coimbatore' },
    ],
    path: [
      [10.9600, 76.9300], [10.9700, 76.9380], [10.9800, 76.9450],
      [10.9947, 76.9528], [11.0000, 76.9560], [11.0060, 76.9600],
      [11.0100, 76.9650], [11.0150, 76.9700],
    ],
  },
];

// ─── Driver + bus data ────────────────────────────────────────
const DRIVERS = [
  { name: 'Ravi Kumar',   email: 'ravi@transitiq.com',   licenseNo: 'TN38-2018-001', experience: 8,  regNo: 'TN38-AB-1234', model: 'Tata Marcopolo',  capacity: 42 },
  { name: 'Suresh Babu',  email: 'suresh@transitiq.com',  licenseNo: 'TN38-2019-045', experience: 6,  regNo: 'TN38-CD-5678', model: 'Ashok Leyland',   capacity: 38 },
  { name: 'Karthik Raj',  email: 'karthik@transitiq.com', licenseNo: 'TN38-2020-078', experience: 4,  regNo: 'TN38-EF-9012', model: 'Tata Starbus',     capacity: 45 },
  { name: 'Muthu Selvan', email: 'muthu@transitiq.com',   licenseNo: 'TN38-2017-023', experience: 10, regNo: 'TN38-GH-3456', model: 'Eicher Skyline',   capacity: 40 },
  { name: 'Prakash Naik', email: 'prakash@transitiq.com', licenseNo: 'TN38-2021-091', experience: 3,  regNo: 'TN38-IJ-7890', model: 'Force Traveller',  capacity: 36 },
];

const PASSWORD = 'Password123!';

async function main() {
  console.log('🌱 Seeding TransitIQ database...\n');
  const hashedPassword = await bcrypt.hash(PASSWORD, 12);

  for (let i = 0; i < DRIVERS.length; i++) {
    const d = DRIVERS[i];
    const routeDef = ROUTES[i];

    // 1. User
    let user = await prisma.user.findUnique({ where: { email: d.email } });
    if (!user) {
      user = await prisma.user.create({
        data: { name: d.name, email: d.email, password: hashedPassword, role: 'DRIVER', phone: `+91-98765${String(43210 - i).padStart(5, '0')}` },
      });
      console.log(`  ✅ User: ${d.name} (${d.email})`);
    } else {
      console.log(`  ⏭️  User exists: ${d.email}`);
    }

    // 2. Bus
    let bus = await prisma.bus.findUnique({ where: { regNo: d.regNo } });
    if (!bus) {
      bus = await prisma.bus.create({
        data: { regNo: d.regNo, model: d.model, capacity: d.capacity, status: 'ACTIVE' },
      });
      console.log(`  ✅ Bus: ${d.regNo}`);
    } else {
      console.log(`  ⏭️  Bus exists: ${d.regNo}`);
    }

    // 3. Driver profile
    let driver = await prisma.driver.findUnique({ where: { userId: user.id } });
    if (!driver) {
      driver = await prisma.driver.create({
        data: { userId: user.id, licenseNo: d.licenseNo, experience: d.experience, status: 'ACTIVE', assignedBusId: bus.id },
      });
      console.log(`  ✅ Driver: ${d.licenseNo}`);
    } else {
      console.log(`  ⏭️  Driver exists: ${d.licenseNo}`);
    }

    // 4. Route
    let route = await prisma.route.findUnique({ where: { routeNo: routeDef.routeNo } });
    if (!route) {
      route = await prisma.route.create({
        data: {
          name: routeDef.name,
          routeNo: routeDef.routeNo,
          startLocation: routeDef.startLocation,
          endLocation: routeDef.endLocation,
          distance: routeDef.distance,
          duration: routeDef.duration,
          status: 'ACTIVE',
        },
      });
      await prisma.stop.createMany({
        data: routeDef.stops.map((s) => ({ ...s, routeId: route.id })),
      });
      console.log(`  ✅ Route: ${routeDef.routeNo} – ${routeDef.name}`);
    } else {
      console.log(`  ⏭️  Route exists: ${routeDef.routeNo}`);
    }

    // 5. Trip (IN_PROGRESS)
    let trip = await prisma.trip.findFirst({
      where: { driverId: driver.id, status: 'IN_PROGRESS' },
    });
    if (!trip) {
      trip = await prisma.trip.create({
        data: {
          routeId: route.id,
          driverId: driver.id,
          busId: bus.id,
          status: 'IN_PROGRESS',
          scheduledStart: new Date(Date.now() - 30 * 60 * 1000),
          actualStart: new Date(Date.now() - 30 * 60 * 1000),
        },
      });
      console.log(`  ✅ Trip: ${routeDef.routeNo} → IN_PROGRESS\n`);
    } else {
      console.log(`  ⏭️  Trip already IN_PROGRESS: ${routeDef.routeNo}\n`);
    }
  }

  // Save route paths for simulator
  const fs = require('fs');
  const path = require('path');
  const pathData = {};
  for (let i = 0; i < ROUTES.length; i++) {
    pathData[ROUTES[i].routeNo] = ROUTES[i].path;
  }
  const outPath = path.join(__dirname, '..', 'src', 'services', 'route-paths.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(pathData, null, 2));
  console.log('🗺️  Route paths saved to src/services/route-paths.json');

  console.log(`\n🎉 Seed complete!`);
  console.log(`   Login credentials: ${PASSWORD}`);
  console.log(`   Drivers: ${DRIVERS.map((d) => d.email).join(', ')}`);
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
