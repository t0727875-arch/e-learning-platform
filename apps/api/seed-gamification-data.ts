import { db } from './db';
import { userProfiles, userStreaks, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function seedGamificationData() {
  console.log('Starting gamification data seeding...');

  try {
    // Get all users
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users`);

    for (const user of allUsers) {
      // Check if user has a profile
      const [existingProfile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, user.id));
      
      if (existingProfile) {
        // Give baseline points if they have 0 points (simulate past activity)
        if (!existingProfile.points || existingProfile.points === 0) {
          const baselinePoints = Math.floor(Math.random() * 50) + 10; // 10-60 random points
          await db.update(userProfiles)
            .set({ points: baselinePoints })
            .where(eq(userProfiles.userId, user.id));
          console.log(`Awarded ${baselinePoints} baseline points to user ${user.username}`);
        } else {
          console.log(`User ${user.username} already has ${existingProfile.points} points`);
        }
      } else {
        // Create profile with baseline points
        const baselinePoints = Math.floor(Math.random() * 50) + 10;
        await db.insert(userProfiles).values({
          userId: user.id,
          points: baselinePoints,
        });
        console.log(`Created profile with ${baselinePoints} points for user ${user.username}`);
      }

      // Check if user has a streak
      const [existingStreak] = await db.select().from(userStreaks).where(eq(userStreaks.userId, user.id));
      
      if (!existingStreak) {
        // Create a streak record
        const streakDays = Math.floor(Math.random() * 7) + 1; // 1-7 day streak
        const longestStreak = Math.floor(Math.random() * 14) + streakDays; // longest >= current
        await db.insert(userStreaks).values({
          userId: user.id,
          currentStreak: streakDays,
          longestStreak: longestStreak,
          lastActivityDate: new Date(),
          streakFreezeCount: 0,
        });
        console.log(`Created ${streakDays}-day streak for user ${user.username}`);
      } else {
        console.log(`User ${user.username} already has a streak record`);
      }
    }

    console.log('Gamification data seeding completed!');
  } catch (error) {
    console.error('Error seeding gamification data:', error);
    throw error;
  }
}

seedGamificationData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
