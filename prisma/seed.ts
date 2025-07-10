import { PrismaClient, LandmarkType, Nightlord, BossCategory, NightfarerClassType, ShiftingEarthEventType, DamageType, StatusEffect } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed a Landmark
  const landmark = await prisma.landmark.create({
    data: {
      type: LandmarkType.Church,
      name: 'First Church of Limveld',
      x: 100.0,
      y: 200.0,
      icon: 'church.png',
      priority: 95,
      contents: ['Sacred Flask'],
      notes: 'High priority for flask upgrade.'
    }
  });

  // Seed a Boss
  const boss = await prisma.boss.create({
    data: {
      name: 'Gladius, Beast of Night',
      category: BossCategory.Nightlord,
      description: 'Three-headed dog Nightlord',
      expedition: 'Tricephalos',
      phases: 2,
      weaknesses: [DamageType.Holy, DamageType.Standard],
      statusWeaknesses: [StatusEffect.BloodLoss],
      notes: 'Splits into three in phase 2.',
      landmark: { connect: { id: landmark.id } }
    }
  });

  // Seed a NightfarerClass
  await prisma.nightfarerClass.create({
    data: {
      id: NightfarerClassType.Wylder,
      archetype: 'Balanced all-rounder',
      difficulty: 'Easy',
      relicSlots: ['Red', 'Red', 'Blue'],
      startingGear: ['Greatsword', 'Buckler'],
      abilities: {
        passive: 'Sixth Sense',
        skill: 'Clawshot',
        ultimate: 'Onslaught Stake'
      },
      notes: 'Beginner-friendly.'
    }
  });

  // Seed a ShiftingEarthEvent
  await prisma.shiftingEarthEvent.create({
    data: {
      id: ShiftingEarthEventType.Crater,
      name: 'The Crater',
      location: 'North',
      theme: 'Volcanic',
      environmentalChanges: 'Lava flows, underground temple',
      bosses: ['Magma Wyrm'],
      uniqueReward: 'Legendary Upgrade',
      notes: 'Best approached on Day 2.'
    }
  });

  // Seed a MapPattern
  const mapPattern = await prisma.mapPattern.create({
    data: {
      nightlord: Nightlord.Gladius,
      patternIndex: 0,
      seed: 123456,
      shiftingEarthEvents: [ShiftingEarthEventType.Crater],
      circleSequence: [
        { x: 100, y: 200, radius: 300 },
        { x: 150, y: 250, radius: 150 }
      ],
    }
  });

  // Connect Landmark to MapPattern via join table
  await prisma.mapPatternLandmark.create({
    data: {
      mapPatternId: mapPattern.id,
      landmarkId: landmark.id,
      order: 1
    }
  });

  // Seed a Route
  await prisma.route.create({
    data: {
      patternId: mapPattern.id,
      nightlord: Nightlord.Gladius,
      totalDistance: 500.0,
      estimatedTime: 600.0,
      priorities: { [landmark.id]: 95 },
      notes: 'Sample route for Gladius',
      routeLandmarks: {
        create: [{ landmarkId: landmark.id, order: 1 }]
      }
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 