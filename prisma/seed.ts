import { PrismaClient, BodyRegion, MovementPattern, MuscleRole, AchievementTier } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ─── MUSCLE GROUPS ──────────────────────────────
  const muscleGroups: Record<string, string> = {};

  const topLevel = [
    "Chest",
    "Back",
    "Shoulders",
    "Arms",
    "Core",
    "Legs",
  ];

  for (const name of topLevel) {
    const mg = await prisma.muscleGroup.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    muscleGroups[name] = mg.id;
  }

  const children: Record<string, string[]> = {
    Back: ["Lats", "Upper Back", "Erectors"],
    Shoulders: ["Anterior Delt", "Lateral Delt", "Posterior Delt"],
    Arms: ["Biceps", "Triceps", "Forearms"],
    Core: ["Rectus Abdominis", "Obliques", "Transverse Abdominis"],
    Legs: ["Quadriceps", "Hamstrings", "Glutes", "Calves", "Hip Flexors", "Adductors"],
  };

  for (const [parent, kids] of Object.entries(children)) {
    for (const name of kids) {
      const mg = await prisma.muscleGroup.upsert({
        where: { name },
        update: {},
        create: { name, parentId: muscleGroups[parent] },
      });
      muscleGroups[name] = mg.id;
    }
  }

  console.log("✓ Muscle groups seeded");

  // ─── EQUIPMENT ──────────────────────────────────
  const equipmentNames = [
    "Dumbbell",
    "Barbell",
    "Kettlebell",
    "Machine",
    "Cable",
    "Bodyweight",
    "Resistance Band",
    "Bench",
    "TRX/Suspension",
  ];

  const equipment: Record<string, string> = {};
  for (const name of equipmentNames) {
    const eq = await prisma.equipment.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    equipment[name] = eq.id;
  }

  console.log("✓ Equipment seeded");

  // ─── EXERCISES ──────────────────────────────────
  interface ExerciseSeed {
    name: string;
    bodyRegion: BodyRegion;
    movementPattern: MovementPattern;
    isCompound: boolean;
    instructions?: string;
    muscles: Array<{ group: string; role: MuscleRole }>;
    equipment: string[];
  }

  const exercises: ExerciseSeed[] = [
    // Workout A Exercises
    {
      name: "World's Greatest Stretch",
      bodyRegion: "FULL_BODY",
      movementPattern: "STRETCH",
      isCompound: true,
      instructions: "Lunge forward, place both hands inside the front foot, rotate the torso and reach to the ceiling with the inside arm. Hold briefly, return, and switch sides.",
      muscles: [
        { group: "Hip Flexors", role: "PRIMARY" },
        { group: "Hamstrings", role: "PRIMARY" },
        { group: "Obliques", role: "SECONDARY" },
      ],
      equipment: ["Bodyweight"],
    },
    {
      name: "Banded Side Plank Clamshell",
      bodyRegion: "CORE",
      movementPattern: "ANTI_ROTATION",
      isCompound: true,
      instructions: "In a side plank position with a resistance band above the knees, open and close the top knee while maintaining hip position.",
      muscles: [
        { group: "Obliques", role: "PRIMARY" },
        { group: "Glutes", role: "PRIMARY" },
        { group: "Transverse Abdominis", role: "SECONDARY" },
      ],
      equipment: ["Resistance Band"],
    },
    {
      name: "Suitcase Carry",
      bodyRegion: "FULL_BODY",
      movementPattern: "CARRY",
      isCompound: true,
      instructions: "Hold a weight in one hand at your side, walk with tall posture keeping your torso from leaning. Switch sides.",
      muscles: [
        { group: "Obliques", role: "PRIMARY" },
        { group: "Forearms", role: "PRIMARY" },
        { group: "Transverse Abdominis", role: "SECONDARY" },
      ],
      equipment: ["Dumbbell", "Kettlebell"],
    },
    {
      name: "Goblet Squat",
      bodyRegion: "LOWER_BODY",
      movementPattern: "SQUAT",
      isCompound: true,
      instructions: "Hold a dumbbell or kettlebell at chest height. Squat down keeping your chest up and elbows inside your knees.",
      muscles: [
        { group: "Quadriceps", role: "PRIMARY" },
        { group: "Glutes", role: "PRIMARY" },
        { group: "Rectus Abdominis", role: "STABILIZER" },
      ],
      equipment: ["Dumbbell", "Kettlebell"],
    },
    {
      name: "Seated Row (Machine)",
      bodyRegion: "UPPER_BODY",
      movementPattern: "HORIZONTAL_PULL",
      isCompound: true,
      instructions: "Sit at the machine with chest against the pad. Pull handles toward your lower chest, squeezing shoulder blades together.",
      muscles: [
        { group: "Lats", role: "PRIMARY" },
        { group: "Upper Back", role: "PRIMARY" },
        { group: "Biceps", role: "SECONDARY" },
        { group: "Posterior Delt", role: "SECONDARY" },
      ],
      equipment: ["Machine"],
    },
    {
      name: "Dumbbell Split Squat",
      bodyRegion: "LOWER_BODY",
      movementPattern: "LUNGE",
      isCompound: true,
      instructions: "Stand in a split stance with dumbbells at your sides. Lower your back knee toward the floor while keeping your front knee over your ankle.",
      muscles: [
        { group: "Quadriceps", role: "PRIMARY" },
        { group: "Glutes", role: "PRIMARY" },
        { group: "Hamstrings", role: "SECONDARY" },
      ],
      equipment: ["Dumbbell"],
    },
    {
      name: "Dumbbell Bench Press",
      bodyRegion: "UPPER_BODY",
      movementPattern: "HORIZONTAL_PUSH",
      isCompound: true,
      instructions: "Lie on a flat bench with a dumbbell in each hand. Press up, then lower with control.",
      muscles: [
        { group: "Chest", role: "PRIMARY" },
        { group: "Anterior Delt", role: "SECONDARY" },
        { group: "Triceps", role: "SECONDARY" },
      ],
      equipment: ["Dumbbell", "Bench"],
    },
    {
      name: "Dumbbell Lateral Raise",
      bodyRegion: "UPPER_BODY",
      movementPattern: "ISOLATION",
      isCompound: false,
      instructions: "Stand with dumbbells at your sides. Raise arms out to the sides until parallel with the floor, then lower with control.",
      muscles: [
        { group: "Lateral Delt", role: "PRIMARY" },
      ],
      equipment: ["Dumbbell"],
    },
    {
      name: "Side Plank",
      bodyRegion: "CORE",
      movementPattern: "PLANK",
      isCompound: false,
      instructions: "Lie on your side, prop yourself up on your forearm. Hold your body in a straight line from head to feet.",
      muscles: [
        { group: "Obliques", role: "PRIMARY" },
        { group: "Transverse Abdominis", role: "SECONDARY" },
      ],
      equipment: ["Bodyweight"],
    },
    // Workout B Exercises
    {
      name: "Leg Press",
      bodyRegion: "LOWER_BODY",
      movementPattern: "SQUAT",
      isCompound: true,
      instructions: "Sit in the leg press machine with feet shoulder-width apart on the platform. Push through your heels to extend your legs.",
      muscles: [
        { group: "Quadriceps", role: "PRIMARY" },
        { group: "Glutes", role: "PRIMARY" },
        { group: "Hamstrings", role: "SECONDARY" },
      ],
      equipment: ["Machine"],
    },
    {
      name: "Romanian Deadlift (Dumbbell)",
      bodyRegion: "LOWER_BODY",
      movementPattern: "HIP_HINGE",
      isCompound: true,
      instructions: "Hold dumbbells in front of your thighs. Hinge at the hips, pushing your butt back while lowering the weights along your legs. Feel a stretch in your hamstrings.",
      muscles: [
        { group: "Hamstrings", role: "PRIMARY" },
        { group: "Glutes", role: "PRIMARY" },
        { group: "Erectors", role: "SECONDARY" },
      ],
      equipment: ["Dumbbell"],
    },
    {
      name: "Kneeling Dumbbell Shoulder Press",
      bodyRegion: "UPPER_BODY",
      movementPattern: "VERTICAL_PUSH",
      isCompound: true,
      instructions: "Kneel on both knees with dumbbells at shoulder height. Press overhead while maintaining a braced core and upright posture.",
      muscles: [
        { group: "Anterior Delt", role: "PRIMARY" },
        { group: "Lateral Delt", role: "SECONDARY" },
        { group: "Triceps", role: "SECONDARY" },
        { group: "Transverse Abdominis", role: "STABILIZER" },
      ],
      equipment: ["Dumbbell"],
    },
    {
      name: "Lat Pulldown",
      bodyRegion: "UPPER_BODY",
      movementPattern: "VERTICAL_PULL",
      isCompound: true,
      instructions: "Sit at the lat pulldown machine, grasp the bar with a wide grip. Pull the bar to your upper chest, squeezing your lats.",
      muscles: [
        { group: "Lats", role: "PRIMARY" },
        { group: "Biceps", role: "SECONDARY" },
        { group: "Upper Back", role: "SECONDARY" },
      ],
      equipment: ["Cable"],
    },
    {
      name: "Push Ups",
      bodyRegion: "UPPER_BODY",
      movementPattern: "HORIZONTAL_PUSH",
      isCompound: true,
      instructions: "Start in a plank position. Lower your chest to the floor with elbows at a 45-degree angle, then push back up.",
      muscles: [
        { group: "Chest", role: "PRIMARY" },
        { group: "Anterior Delt", role: "SECONDARY" },
        { group: "Triceps", role: "SECONDARY" },
        { group: "Rectus Abdominis", role: "STABILIZER" },
      ],
      equipment: ["Bodyweight"],
    },
    {
      name: "Front Plank",
      bodyRegion: "CORE",
      movementPattern: "PLANK",
      isCompound: false,
      instructions: "Support your body on your forearms and toes in a straight line. Brace your core and hold the position.",
      muscles: [
        { group: "Rectus Abdominis", role: "PRIMARY" },
        { group: "Transverse Abdominis", role: "PRIMARY" },
        { group: "Obliques", role: "SECONDARY" },
      ],
      equipment: ["Bodyweight"],
    },
    // Additional Common Exercises
    {
      name: "Barbell Back Squat",
      bodyRegion: "LOWER_BODY",
      movementPattern: "SQUAT",
      isCompound: true,
      instructions: "Place a barbell on your upper back. Squat down until thighs are parallel to the floor, then stand back up.",
      muscles: [
        { group: "Quadriceps", role: "PRIMARY" },
        { group: "Glutes", role: "PRIMARY" },
        { group: "Hamstrings", role: "SECONDARY" },
        { group: "Erectors", role: "STABILIZER" },
      ],
      equipment: ["Barbell"],
    },
    {
      name: "Barbell Deadlift",
      bodyRegion: "FULL_BODY",
      movementPattern: "HIP_HINGE",
      isCompound: true,
      instructions: "Stand with feet hip-width apart, barbell over midfoot. Hinge and grip the bar, then stand up by driving through the floor.",
      muscles: [
        { group: "Hamstrings", role: "PRIMARY" },
        { group: "Glutes", role: "PRIMARY" },
        { group: "Erectors", role: "PRIMARY" },
        { group: "Quadriceps", role: "SECONDARY" },
        { group: "Forearms", role: "SECONDARY" },
      ],
      equipment: ["Barbell"],
    },
    {
      name: "Barbell Bench Press",
      bodyRegion: "UPPER_BODY",
      movementPattern: "HORIZONTAL_PUSH",
      isCompound: true,
      instructions: "Lie on a flat bench, grip the barbell slightly wider than shoulder width. Lower to your chest, then press back up.",
      muscles: [
        { group: "Chest", role: "PRIMARY" },
        { group: "Anterior Delt", role: "SECONDARY" },
        { group: "Triceps", role: "SECONDARY" },
      ],
      equipment: ["Barbell", "Bench"],
    },
    {
      name: "Overhead Press",
      bodyRegion: "UPPER_BODY",
      movementPattern: "VERTICAL_PUSH",
      isCompound: true,
      instructions: "Stand with a barbell at shoulder height. Press the bar overhead until arms are fully extended.",
      muscles: [
        { group: "Anterior Delt", role: "PRIMARY" },
        { group: "Lateral Delt", role: "SECONDARY" },
        { group: "Triceps", role: "SECONDARY" },
      ],
      equipment: ["Barbell"],
    },
    {
      name: "Pull Ups",
      bodyRegion: "UPPER_BODY",
      movementPattern: "VERTICAL_PULL",
      isCompound: true,
      instructions: "Hang from a bar with an overhand grip. Pull yourself up until your chin clears the bar.",
      muscles: [
        { group: "Lats", role: "PRIMARY" },
        { group: "Biceps", role: "SECONDARY" },
        { group: "Upper Back", role: "SECONDARY" },
      ],
      equipment: ["Bodyweight"],
    },
    {
      name: "Chin Ups",
      bodyRegion: "UPPER_BODY",
      movementPattern: "VERTICAL_PULL",
      isCompound: true,
      instructions: "Hang from a bar with an underhand (supinated) grip. Pull yourself up until your chin clears the bar.",
      muscles: [
        { group: "Lats", role: "PRIMARY" },
        { group: "Biceps", role: "PRIMARY" },
        { group: "Upper Back", role: "SECONDARY" },
      ],
      equipment: ["Bodyweight"],
    },
    {
      name: "Barbell Bent Over Row",
      bodyRegion: "UPPER_BODY",
      movementPattern: "HORIZONTAL_PULL",
      isCompound: true,
      instructions: "Hinge at the hips holding a barbell. Row the bar to your lower chest, squeezing your shoulder blades.",
      muscles: [
        { group: "Lats", role: "PRIMARY" },
        { group: "Upper Back", role: "PRIMARY" },
        { group: "Biceps", role: "SECONDARY" },
        { group: "Erectors", role: "STABILIZER" },
      ],
      equipment: ["Barbell"],
    },
    {
      name: "Hip Thrust",
      bodyRegion: "LOWER_BODY",
      movementPattern: "HIP_HINGE",
      isCompound: true,
      instructions: "Sit with your upper back against a bench, barbell over your hips. Drive through your heels to lift your hips until fully extended.",
      muscles: [
        { group: "Glutes", role: "PRIMARY" },
        { group: "Hamstrings", role: "SECONDARY" },
      ],
      equipment: ["Barbell", "Bench"],
    },
    {
      name: "Leg Curl (Machine)",
      bodyRegion: "LOWER_BODY",
      movementPattern: "ISOLATION",
      isCompound: false,
      instructions: "Lie face down on the leg curl machine. Curl your heels toward your glutes, squeezing your hamstrings.",
      muscles: [
        { group: "Hamstrings", role: "PRIMARY" },
      ],
      equipment: ["Machine"],
    },
    {
      name: "Leg Extension (Machine)",
      bodyRegion: "LOWER_BODY",
      movementPattern: "ISOLATION",
      isCompound: false,
      instructions: "Sit in the leg extension machine. Extend your legs until straight, squeezing your quads at the top.",
      muscles: [
        { group: "Quadriceps", role: "PRIMARY" },
      ],
      equipment: ["Machine"],
    },
    {
      name: "Standing Calf Raise",
      bodyRegion: "LOWER_BODY",
      movementPattern: "ISOLATION",
      isCompound: false,
      instructions: "Stand on the edge of a step with heels hanging off. Rise up onto your toes, then lower below the step for a stretch.",
      muscles: [
        { group: "Calves", role: "PRIMARY" },
      ],
      equipment: ["Machine", "Bodyweight"],
    },
    {
      name: "Dumbbell Bicep Curl",
      bodyRegion: "UPPER_BODY",
      movementPattern: "ISOLATION",
      isCompound: false,
      instructions: "Stand with dumbbells at your sides, palms forward. Curl the weights to your shoulders, then lower with control.",
      muscles: [
        { group: "Biceps", role: "PRIMARY" },
        { group: "Forearms", role: "SECONDARY" },
      ],
      equipment: ["Dumbbell"],
    },
    {
      name: "Barbell Bicep Curl",
      bodyRegion: "UPPER_BODY",
      movementPattern: "ISOLATION",
      isCompound: false,
      instructions: "Stand holding a barbell with an underhand grip. Curl the bar to your shoulders, keeping your elbows stationary.",
      muscles: [
        { group: "Biceps", role: "PRIMARY" },
        { group: "Forearms", role: "SECONDARY" },
      ],
      equipment: ["Barbell"],
    },
    {
      name: "Tricep Rope Pushdown",
      bodyRegion: "UPPER_BODY",
      movementPattern: "ISOLATION",
      isCompound: false,
      instructions: "Stand at a cable machine with a rope attachment. Push the rope down by extending your elbows, spreading the rope at the bottom.",
      muscles: [
        { group: "Triceps", role: "PRIMARY" },
      ],
      equipment: ["Cable"],
    },
    {
      name: "Overhead Tricep Extension",
      bodyRegion: "UPPER_BODY",
      movementPattern: "ISOLATION",
      isCompound: false,
      instructions: "Hold a dumbbell overhead with both hands. Lower it behind your head by bending your elbows, then extend back up.",
      muscles: [
        { group: "Triceps", role: "PRIMARY" },
      ],
      equipment: ["Dumbbell"],
    },
    {
      name: "Face Pull",
      bodyRegion: "UPPER_BODY",
      movementPattern: "HORIZONTAL_PULL",
      isCompound: false,
      instructions: "Set a cable at face height with a rope. Pull toward your face, separating the rope ends and squeezing your rear delts.",
      muscles: [
        { group: "Posterior Delt", role: "PRIMARY" },
        { group: "Upper Back", role: "SECONDARY" },
      ],
      equipment: ["Cable"],
    },
    {
      name: "Cable Fly",
      bodyRegion: "UPPER_BODY",
      movementPattern: "ISOLATION",
      isCompound: false,
      instructions: "Stand between cable pulleys set at chest height. Bring handles together in front of your chest in a hugging motion.",
      muscles: [
        { group: "Chest", role: "PRIMARY" },
      ],
      equipment: ["Cable"],
    },
    {
      name: "Dumbbell Row",
      bodyRegion: "UPPER_BODY",
      movementPattern: "HORIZONTAL_PULL",
      isCompound: true,
      instructions: "Place one knee and hand on a bench, hold a dumbbell in the other hand. Row the weight to your hip.",
      muscles: [
        { group: "Lats", role: "PRIMARY" },
        { group: "Upper Back", role: "SECONDARY" },
        { group: "Biceps", role: "SECONDARY" },
      ],
      equipment: ["Dumbbell", "Bench"],
    },
    {
      name: "Bulgarian Split Squat",
      bodyRegion: "LOWER_BODY",
      movementPattern: "LUNGE",
      isCompound: true,
      instructions: "Stand with one foot elevated behind you on a bench. Lower into a lunge position, then drive back up.",
      muscles: [
        { group: "Quadriceps", role: "PRIMARY" },
        { group: "Glutes", role: "PRIMARY" },
        { group: "Hamstrings", role: "SECONDARY" },
      ],
      equipment: ["Dumbbell", "Bench"],
    },
    {
      name: "Farmers Walk",
      bodyRegion: "FULL_BODY",
      movementPattern: "CARRY",
      isCompound: true,
      instructions: "Hold heavy weights in both hands at your sides. Walk with tall posture, bracing your core.",
      muscles: [
        { group: "Forearms", role: "PRIMARY" },
        { group: "Transverse Abdominis", role: "PRIMARY" },
        { group: "Upper Back", role: "SECONDARY" },
      ],
      equipment: ["Dumbbell", "Kettlebell"],
    },
    {
      name: "Kettlebell Swing",
      bodyRegion: "FULL_BODY",
      movementPattern: "HIP_HINGE",
      isCompound: true,
      instructions: "Hinge at the hips and swing a kettlebell between your legs, then drive your hips forward to swing it to chest height.",
      muscles: [
        { group: "Glutes", role: "PRIMARY" },
        { group: "Hamstrings", role: "PRIMARY" },
        { group: "Erectors", role: "SECONDARY" },
        { group: "Anterior Delt", role: "STABILIZER" },
      ],
      equipment: ["Kettlebell"],
    },
    {
      name: "Turkish Get Up",
      bodyRegion: "FULL_BODY",
      movementPattern: "ROTATION",
      isCompound: true,
      instructions: "Lie on the floor holding a weight overhead. Stand up while keeping the weight overhead through a series of controlled positions.",
      muscles: [
        { group: "Anterior Delt", role: "PRIMARY" },
        { group: "Obliques", role: "PRIMARY" },
        { group: "Glutes", role: "SECONDARY" },
        { group: "Quadriceps", role: "SECONDARY" },
      ],
      equipment: ["Kettlebell", "Dumbbell"],
    },
    {
      name: "Cable Woodchop",
      bodyRegion: "CORE",
      movementPattern: "ROTATION",
      isCompound: true,
      instructions: "Set a cable at high position. Pull the handle diagonally across your body from high to low, rotating your torso.",
      muscles: [
        { group: "Obliques", role: "PRIMARY" },
        { group: "Rectus Abdominis", role: "SECONDARY" },
      ],
      equipment: ["Cable"],
    },
    {
      name: "Pallof Press",
      bodyRegion: "CORE",
      movementPattern: "ANTI_ROTATION",
      isCompound: false,
      instructions: "Stand perpendicular to a cable machine, hold the handle at chest height. Press out and hold, resisting rotation.",
      muscles: [
        { group: "Transverse Abdominis", role: "PRIMARY" },
        { group: "Obliques", role: "PRIMARY" },
      ],
      equipment: ["Cable"],
    },
    {
      name: "Incline Dumbbell Press",
      bodyRegion: "UPPER_BODY",
      movementPattern: "HORIZONTAL_PUSH",
      isCompound: true,
      instructions: "Lie on an incline bench (30-45 degrees) with dumbbells. Press up and lower with control.",
      muscles: [
        { group: "Chest", role: "PRIMARY" },
        { group: "Anterior Delt", role: "SECONDARY" },
        { group: "Triceps", role: "SECONDARY" },
      ],
      equipment: ["Dumbbell", "Bench"],
    },
    {
      name: "Seated Dumbbell Shoulder Press",
      bodyRegion: "UPPER_BODY",
      movementPattern: "VERTICAL_PUSH",
      isCompound: true,
      instructions: "Sit on a bench with back support, press dumbbells from shoulder height to overhead.",
      muscles: [
        { group: "Anterior Delt", role: "PRIMARY" },
        { group: "Lateral Delt", role: "SECONDARY" },
        { group: "Triceps", role: "SECONDARY" },
      ],
      equipment: ["Dumbbell", "Bench"],
    },
    {
      name: "Cable Row",
      bodyRegion: "UPPER_BODY",
      movementPattern: "HORIZONTAL_PULL",
      isCompound: true,
      instructions: "Sit at a low cable row station. Pull the handle to your lower chest, squeezing your shoulder blades together.",
      muscles: [
        { group: "Lats", role: "PRIMARY" },
        { group: "Upper Back", role: "PRIMARY" },
        { group: "Biceps", role: "SECONDARY" },
      ],
      equipment: ["Cable"],
    },
    {
      name: "Walking Lunge",
      bodyRegion: "LOWER_BODY",
      movementPattern: "LUNGE",
      isCompound: true,
      instructions: "Step forward into a lunge, then push off and step through into the next lunge. Alternate legs.",
      muscles: [
        { group: "Quadriceps", role: "PRIMARY" },
        { group: "Glutes", role: "PRIMARY" },
        { group: "Hamstrings", role: "SECONDARY" },
      ],
      equipment: ["Dumbbell", "Bodyweight"],
    },
    {
      name: "Hack Squat",
      bodyRegion: "LOWER_BODY",
      movementPattern: "SQUAT",
      isCompound: true,
      instructions: "Stand on the hack squat platform with your back against the pad. Squat down and push back up.",
      muscles: [
        { group: "Quadriceps", role: "PRIMARY" },
        { group: "Glutes", role: "SECONDARY" },
      ],
      equipment: ["Machine"],
    },
    {
      name: "Dumbbell Hammer Curl",
      bodyRegion: "UPPER_BODY",
      movementPattern: "ISOLATION",
      isCompound: false,
      instructions: "Stand with dumbbells at your sides, palms facing your body. Curl the weights up while keeping palms neutral.",
      muscles: [
        { group: "Biceps", role: "PRIMARY" },
        { group: "Forearms", role: "PRIMARY" },
      ],
      equipment: ["Dumbbell"],
    },
    {
      name: "Dips",
      bodyRegion: "UPPER_BODY",
      movementPattern: "VERTICAL_PUSH",
      isCompound: true,
      instructions: "Support yourself on parallel bars with arms extended. Lower your body by bending your elbows, then push back up.",
      muscles: [
        { group: "Chest", role: "PRIMARY" },
        { group: "Triceps", role: "PRIMARY" },
        { group: "Anterior Delt", role: "SECONDARY" },
      ],
      equipment: ["Bodyweight"],
    },
    {
      name: "Inverted Row",
      bodyRegion: "UPPER_BODY",
      movementPattern: "HORIZONTAL_PULL",
      isCompound: true,
      instructions: "Hang under a bar with feet on the ground. Pull your chest to the bar, squeezing your shoulder blades.",
      muscles: [
        { group: "Upper Back", role: "PRIMARY" },
        { group: "Lats", role: "SECONDARY" },
        { group: "Biceps", role: "SECONDARY" },
      ],
      equipment: ["Bodyweight"],
    },
    {
      name: "Glute Bridge",
      bodyRegion: "LOWER_BODY",
      movementPattern: "HIP_HINGE",
      isCompound: false,
      instructions: "Lie on your back with knees bent. Drive through your heels to lift your hips off the floor, squeezing your glutes at the top.",
      muscles: [
        { group: "Glutes", role: "PRIMARY" },
        { group: "Hamstrings", role: "SECONDARY" },
      ],
      equipment: ["Bodyweight"],
    },
    {
      name: "Dead Bug",
      bodyRegion: "CORE",
      movementPattern: "ANTI_ROTATION",
      isCompound: false,
      instructions: "Lie on your back with arms and legs raised. Slowly extend opposite arm and leg while keeping your lower back pressed to the floor.",
      muscles: [
        { group: "Rectus Abdominis", role: "PRIMARY" },
        { group: "Transverse Abdominis", role: "PRIMARY" },
      ],
      equipment: ["Bodyweight"],
    },
    {
      name: "Ab Wheel Rollout",
      bodyRegion: "CORE",
      movementPattern: "ANTI_ROTATION",
      isCompound: true,
      instructions: "Kneel and grip an ab wheel. Roll forward as far as you can control, then pull back using your core.",
      muscles: [
        { group: "Rectus Abdominis", role: "PRIMARY" },
        { group: "Obliques", role: "SECONDARY" },
        { group: "Lats", role: "STABILIZER" },
      ],
      equipment: ["Bodyweight"],
    },
    {
      name: "Chest Supported Dumbbell Row",
      bodyRegion: "UPPER_BODY",
      movementPattern: "HORIZONTAL_PULL",
      isCompound: true,
      instructions: "Lie face down on an incline bench. Row dumbbells to your hips, squeezing your shoulder blades together.",
      muscles: [
        { group: "Upper Back", role: "PRIMARY" },
        { group: "Lats", role: "PRIMARY" },
        { group: "Biceps", role: "SECONDARY" },
        { group: "Posterior Delt", role: "SECONDARY" },
      ],
      equipment: ["Dumbbell", "Bench"],
    },
  ];

  const exerciseIds: Record<string, string> = {};
  for (const ex of exercises) {
    const created = await prisma.exercise.create({
      data: {
        name: ex.name,
        bodyRegion: ex.bodyRegion,
        movementPattern: ex.movementPattern,
        isCompound: ex.isCompound,
        instructions: ex.instructions,
        isCustom: false,
        muscles: {
          create: ex.muscles.map((m) => ({
            muscleGroupId: muscleGroups[m.group],
            role: m.role,
          })),
        },
        equipment: {
          create: ex.equipment.map((e) => ({
            equipmentId: equipment[e],
          })),
        },
      },
    });
    exerciseIds[ex.name] = created.id;
  }

  console.log(`✓ ${exercises.length} exercises seeded`);

  // ─── ACHIEVEMENTS ───────────────────────────────
  const achievements = [
    // Consistency
    { name: "First Workout", description: "Complete your first workout", icon: "🎯", tier: "BRONZE" as AchievementTier, threshold: 1, category: "milestone" },
    { name: "Getting Started", description: "Complete 10 workouts", icon: "🌱", tier: "BRONZE" as AchievementTier, threshold: 10, category: "milestone" },
    { name: "Dedicated", description: "Complete 25 workouts", icon: "💪", tier: "SILVER" as AchievementTier, threshold: 25, category: "milestone" },
    { name: "Half Century", description: "Complete 50 workouts", icon: "🔥", tier: "GOLD" as AchievementTier, threshold: 50, category: "milestone" },
    { name: "Century Club", description: "Complete 100 workouts", icon: "💯", tier: "PLATINUM" as AchievementTier, threshold: 100, category: "milestone" },
    // Streaks
    { name: "Week Warrior", description: "Maintain a 4-week training streak", icon: "📅", tier: "BRONZE" as AchievementTier, threshold: 4, category: "consistency" },
    { name: "Month Master", description: "Maintain an 8-week training streak", icon: "🗓️", tier: "SILVER" as AchievementTier, threshold: 8, category: "consistency" },
    { name: "Quarter Legend", description: "Maintain a 12-week training streak", icon: "⚡", tier: "GOLD" as AchievementTier, threshold: 12, category: "consistency" },
    { name: "Half Year Hero", description: "Maintain a 26-week training streak", icon: "🏆", tier: "GOLD" as AchievementTier, threshold: 26, category: "consistency" },
    { name: "Year Champion", description: "Maintain a 52-week training streak", icon: "👑", tier: "PLATINUM" as AchievementTier, threshold: 52, category: "consistency" },
    // PRs
    { name: "First PR", description: "Set your first personal record", icon: "⭐", tier: "BRONZE" as AchievementTier, threshold: 1, category: "strength" },
    { name: "PR Machine", description: "Set 10 personal records", icon: "🎖️", tier: "SILVER" as AchievementTier, threshold: 10, category: "strength" },
    { name: "PR Legend", description: "Set 50 personal records", icon: "🏅", tier: "GOLD" as AchievementTier, threshold: 50, category: "strength" },
    // Volume
    { name: "10,000kg Club", description: "Accumulate 10,000kg total volume", icon: "🪨", tier: "BRONZE" as AchievementTier, threshold: 10000, category: "volume" },
    { name: "50,000kg Club", description: "Accumulate 50,000kg total volume", icon: "🏋️", tier: "SILVER" as AchievementTier, threshold: 50000, category: "volume" },
    { name: "100,000kg Club", description: "Accumulate 100,000kg total volume", icon: "💎", tier: "GOLD" as AchievementTier, threshold: 100000, category: "volume" },
    { name: "500,000kg Club", description: "Accumulate 500,000kg total volume", icon: "🌟", tier: "PLATINUM" as AchievementTier, threshold: 500000, category: "volume" },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { name: ach.name },
      update: {},
      create: ach,
    });
  }

  console.log(`✓ ${achievements.length} achievements seeded`);

  // ─── USERS ──────────────────────────────────────
  const trainerPassword = await bcrypt.hash("trainer123", 12);
  const clientPassword = await bcrypt.hash("client123", 12);

  const trainer = await prisma.user.upsert({
    where: { email: "info@cocoongym.com" },
    update: {},
    create: {
      name: "Paul Stribling",
      email: "info@cocoongym.com",
      passwordHash: trainerPassword,
      role: "TRAINER",
    },
  });

  const client = await prisma.user.upsert({
    where: { email: "yorkeoleary@gmail.com" },
    update: {},
    create: {
      name: "Yorke O'Leary",
      email: "yorkeoleary@gmail.com",
      passwordHash: clientPassword,
      role: "CLIENT",
      goal: "Build strength and muscle",
    },
  });

  // Link trainer and client
  await prisma.trainerClient.upsert({
    where: {
      trainerId_clientId: {
        trainerId: trainer.id,
        clientId: client.id,
      },
    },
    update: {},
    create: {
      trainerId: trainer.id,
      clientId: client.id,
    },
  });

  console.log("✓ Users seeded (Trainer: info@cocoongym.com / trainer123, Client: yorkeoleary@gmail.com / client123)");

  // ─── PROGRAM & TEMPLATES ────────────────────────
  const program = await prisma.program.create({
    data: {
      name: "Full Body Program - Yorke",
      description: "Full body training program focusing on compound movements with progressive overload",
      trainerId: trainer.id,
      weeks: 4,
      templates: {
        create: [
          {
            name: "Workout A - Full Body",
            order: 1,
            blocks: {
              create: [
                {
                  label: "WARM UP",
                  order: 0,
                  isSuperset: false,
                  exercises: {
                    create: [
                      {
                        exerciseId: exerciseIds["World's Greatest Stretch"],
                        position: "W1",
                        order: 0,
                        targetSets: 2,
                        targetReps: "5 each side",
                        restSeconds: 30,
                        notes: "Slow and controlled. Feel the stretch.",
                      },
                      {
                        exerciseId: exerciseIds["Banded Side Plank Clamshell"],
                        position: "W2",
                        order: 1,
                        targetSets: 2,
                        targetReps: "10 each side",
                        restSeconds: 30,
                        notes: "Keep hips stacked. Don't let top hip roll back.",
                      },
                      {
                        exerciseId: exerciseIds["Suitcase Carry"],
                        position: "W3",
                        order: 2,
                        targetSets: 2,
                        targetReps: "20-30s each side",
                        targetWeight: "16-20kg",
                        restSeconds: 30,
                        notes: "Tall posture. Don't lean to the side.",
                      },
                    ],
                  },
                },
                {
                  label: "A",
                  order: 1,
                  isSuperset: true,
                  exercises: {
                    create: [
                      {
                        exerciseId: exerciseIds["Goblet Squat"],
                        position: "A1",
                        order: 0,
                        targetSets: 3,
                        targetReps: "10",
                        targetWeight: "12-16kg",
                        tempo: "2111",
                        restSeconds: 60,
                        notes: "Chest up, elbows inside knees at the bottom.",
                      },
                      {
                        exerciseId: exerciseIds["Seated Row (Machine)"],
                        position: "A2",
                        order: 1,
                        targetSets: 3,
                        targetReps: "10",
                        tempo: "2111",
                        restSeconds: 90,
                        notes: "Squeeze shoulder blades together at the end of each rep.",
                      },
                    ],
                  },
                },
                {
                  label: "B",
                  order: 2,
                  isSuperset: true,
                  exercises: {
                    create: [
                      {
                        exerciseId: exerciseIds["Dumbbell Split Squat"],
                        position: "B1",
                        order: 0,
                        targetSets: 3,
                        targetReps: "10 each side",
                        tempo: "2111",
                        restSeconds: 60,
                        notes: "Keep front knee over ankle. Control the descent.",
                      },
                      {
                        exerciseId: exerciseIds["Dumbbell Bench Press"],
                        position: "B2",
                        order: 1,
                        targetSets: 3,
                        targetReps: "10",
                        targetWeight: "12-16kg",
                        tempo: "2111",
                        restSeconds: 90,
                        notes: "Lower with control, press explosively.",
                      },
                    ],
                  },
                },
                {
                  label: "C",
                  order: 3,
                  isSuperset: true,
                  exercises: {
                    create: [
                      {
                        exerciseId: exerciseIds["Dumbbell Lateral Raise"],
                        position: "C1",
                        order: 0,
                        targetSets: 2,
                        targetReps: "12",
                        tempo: "2010",
                        restSeconds: 30,
                        notes: "Light weight, control the movement. Don't swing.",
                      },
                      {
                        exerciseId: exerciseIds["Side Plank"],
                        position: "C2",
                        order: 1,
                        targetSets: 2,
                        targetReps: "20-30s each side",
                        restSeconds: 60,
                        notes: "Hips high. Straight line from head to feet.",
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "Workout B - Full Body",
            order: 2,
            blocks: {
              create: [
                {
                  label: "WARM UP",
                  order: 0,
                  isSuperset: false,
                  exercises: {
                    create: [
                      {
                        exerciseId: exerciseIds["World's Greatest Stretch"],
                        position: "W1",
                        order: 0,
                        targetSets: 2,
                        targetReps: "5 each side",
                        restSeconds: 30,
                      },
                      {
                        exerciseId: exerciseIds["Banded Side Plank Clamshell"],
                        position: "W2",
                        order: 1,
                        targetSets: 2,
                        targetReps: "10 each side",
                        restSeconds: 30,
                      },
                      {
                        exerciseId: exerciseIds["Suitcase Carry"],
                        position: "W3",
                        order: 2,
                        targetSets: 2,
                        targetReps: "20-30s each side",
                        targetWeight: "16-20kg",
                        restSeconds: 30,
                      },
                    ],
                  },
                },
                {
                  label: "A",
                  order: 1,
                  isSuperset: false,
                  exercises: {
                    create: [
                      {
                        exerciseId: exerciseIds["Leg Press"],
                        position: "A1",
                        order: 0,
                        targetSets: 3,
                        targetReps: "10",
                        tempo: "2111",
                        restSeconds: 90,
                        notes: "Feet shoulder width. Full range of motion.",
                      },
                    ],
                  },
                },
                {
                  label: "B",
                  order: 2,
                  isSuperset: true,
                  exercises: {
                    create: [
                      {
                        exerciseId: exerciseIds["Romanian Deadlift (Dumbbell)"],
                        position: "B1",
                        order: 0,
                        targetSets: 3,
                        targetReps: "10",
                        tempo: "2111",
                        restSeconds: 60,
                        notes: "Soft knees. Push hips back. Feel the hamstring stretch.",
                      },
                      {
                        exerciseId: exerciseIds["Kneeling Dumbbell Shoulder Press"],
                        position: "B2",
                        order: 1,
                        targetSets: 3,
                        targetReps: "10",
                        tempo: "2111",
                        restSeconds: 90,
                        notes: "Squeeze glutes. Brace core throughout.",
                      },
                    ],
                  },
                },
                {
                  label: "C",
                  order: 3,
                  isSuperset: true,
                  exercises: {
                    create: [
                      {
                        exerciseId: exerciseIds["Lat Pulldown"],
                        position: "C1",
                        order: 0,
                        targetSets: 3,
                        targetReps: "10",
                        tempo: "2111",
                        restSeconds: 60,
                        notes: "Wide grip. Pull to upper chest.",
                      },
                      {
                        exerciseId: exerciseIds["Push Ups"],
                        position: "C2",
                        order: 1,
                        targetSets: 3,
                        targetReps: "8-12",
                        tempo: "2111",
                        restSeconds: 90,
                        notes: "Full range of motion. Elbows at 45 degrees.",
                      },
                    ],
                  },
                },
                {
                  label: "D",
                  order: 4,
                  isSuperset: false,
                  exercises: {
                    create: [
                      {
                        exerciseId: exerciseIds["Front Plank"],
                        position: "D1",
                        order: 0,
                        targetSets: 2,
                        targetReps: "30-45s",
                        restSeconds: 60,
                        notes: "Keep body straight. Breathe steadily.",
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Assign program to client
  await prisma.programAssignment.create({
    data: {
      programId: program.id,
      clientId: client.id,
      startDate: new Date(),
      active: true,
    },
  });

  // Create streak for client
  await prisma.streak.create({
    data: {
      userId: client.id,
      currentStreak: 0,
      longestStreak: 0,
    },
  });

  console.log("✓ Program and templates seeded");
  console.log("\nSeeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
