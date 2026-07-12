const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Starting DB seed...");

  // Get first user as owner
  const { data: users, error: userError } = await supabase.from('users').select('id').limit(1);
  if (userError || users.length === 0) {
    console.error("No users found. Please register at least one user first.");
    process.exit(1);
  }
  const ownerId = users[0].id;

  const dummyProperties = [
    {
      owner_id: ownerId,
      name: "Kos Eksklusif Senayan",
      address: "Jl. Senayan Buntu No.1",
      city: "Jakarta Selatan",
      description: "Kos eksklusif dekat SCBD.",
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1502672260266-1c1de2d96674?auto=format&fit=crop&q=80&w=800"
      ]
    },
    {
      owner_id: ownerId,
      name: "Kosan Harmoni Kemanggisan",
      address: "Jl. Kemanggisan Raya No. 45",
      city: "Jakarta Barat",
      description: "Kos dekat kampus BINUS.",
      images: [
        "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80&w=800"
      ]
    }
  ];

  for (const p of dummyProperties) {
    const { data: prop, error: propError } = await supabase.from('properties').insert(p).select().single();
    if (propError) {
      console.error(`Error inserting property ${p.name}:`, propError);
      continue;
    }
    console.log(`Inserted property: ${prop.name}`);

    // Insert rooms
    const rooms = [
      {
        property_id: prop.id,
        room_number: "A-01",
        price_per_month: 2500000,
        is_available: true,
        facilities: ["WiFi", "AC", "Kasur"]
      },
      {
        property_id: prop.id,
        room_number: "A-02",
        price_per_month: 2500000,
        is_available: false,
        facilities: ["WiFi", "AC", "Kasur"]
      }
    ];

    const { error: roomError } = await supabase.from('rooms').insert(rooms);
    if (roomError) {
      console.error(`Error inserting rooms for ${p.name}:`, roomError);
    } else {
      console.log(`Inserted rooms for ${p.name}`);
    }
  }

  console.log("Seeding complete!");
}

seed();
