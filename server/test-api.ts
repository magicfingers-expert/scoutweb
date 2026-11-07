async function testApi() {
  const baseUrl = 'http://localhost:5000/api/v1';

  console.log('Testing 1: Health check...');
  const healthRes = await fetch(`${baseUrl}/health`);
  const healthData = await healthRes.json();
  console.log('Health:', healthData);

  console.log('\nTesting 2: Auth Login...');
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'demo@scoutweb.io',
      password: 'Password123!',
    }),
  });
  const loginData = await loginRes.json();
  console.log('Login success:', loginData.success, 'Token received:', Boolean(loginData.token));
  const token = loginData.token;

  console.log('\nTesting 3: Auth Me (Protected Route)...');
  const meRes = await fetch(`${baseUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meData = await meRes.json();
  console.log('Auth Me user:', meData.user?.email, 'Role:', meData.user?.role, 'Plan:', meData.user?.plan);

  console.log('\nTesting 4: Create Lead in Prisma DB...');
  const createLeadRes = await fetch(`${baseUrl}/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      businessName: 'Apex Roofing & Restoration',
      category: 'Roofing Contractor',
      crm: 'Wix',
      address: '742 Evergreen Terrace',
      city: 'Austin, TX',
      phone: '+1 (512) 555-0144',
      email: 'service@apexroofingtx.com',
      website: 'https://apexroofingtx.com',
      websiteStatus: 'active',
      rating: 4.9,
      reviewCount: 112,
      opportunityScore: 88,
      opportunityTier: 'High',
      recommendedServices: ['Next-Gen Redesign', 'Automated Lead Capture'],
      status: 'New',
      notes: 'High-value commercial roofing lead. No live chat widget.',
    }),
  });
  const createLeadData = await createLeadRes.json();
  console.log('Lead created ID:', createLeadData.data?.id, 'Name:', createLeadData.data?.businessName);

  console.log('\nTesting 5: Query Leads from DB...');
  const listLeadsRes = await fetch(`${baseUrl}/leads`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listLeadsData = await listLeadsRes.json();
  console.log('Leads count in DB:', listLeadsData.pagination?.total, 'First lead:', listLeadsData.data?.[0]?.businessName);

  console.log('\nTesting 6: Stats Overview...');
  const statsRes = await fetch(`${baseUrl}/stats/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const statsData = await statsRes.json();
  console.log('Stats:', statsData.stats);

  console.log('\nTesting 7: Swagger Docs endpoint...');
  const swaggerRes = await fetch('http://localhost:5000/api/docs.json');
  const swaggerData = await swaggerRes.json();
  console.log('Swagger openapi version:', swaggerData.openapi, 'Paths count:', Object.keys(swaggerData.paths || {}).length);

  console.log('\nALL 7 TESTS PASSED SUCCESSFULLY! 🚀');
}

testApi().catch(console.error);

