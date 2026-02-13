import { db } from "./db";
import { paths, courses, contentNodes, quizzes, questions } from "@shared/schema";

export async function seedContentData(adminUserId: string) {
  console.log("Seeding content data with proper hierarchy...");

  await db.delete(questions);
  await db.delete(quizzes);
  await db.delete(contentNodes);
  await db.delete(courses);
  await db.delete(paths);

  const pathsData = [
    {
      id: "path-1",
      createdBy: adminUserId,
      titleEn: "Fundamentals of Islam",
      titleAr: "أساسيات الإسلام",
      titleFr: "Les Fondamentaux de l'Islam",
      descriptionEn: "Learn the core pillars and beliefs of Islam",
      descriptionAr: "تعلم أركان الإسلام والعقائد الأساسية",
      descriptionFr: "Apprenez les piliers fondamentaux et les croyances de l'Islam",
      isPublished: true,
      order: 1,
    },
    {
      id: "path-2",
      createdBy: adminUserId,
      titleEn: "Quran Studies",
      titleAr: "دراسات قرآنية",
      titleFr: "Études Coraniques",
      descriptionEn: "Deep dive into Quranic sciences and tafsir",
      descriptionAr: "الغوص العميق في العلوم القرآنية والتفسير",
      descriptionFr: "Plongée approfondie dans les sciences coraniques et le tafsir",
      isPublished: true,
      order: 2,
    },
    {
      id: "path-3",
      createdBy: adminUserId,
      titleEn: "Islamic History",
      titleAr: "التاريخ الإسلامي",
      titleFr: "Histoire Islamique",
      descriptionEn: "Explore the rich history of Islamic civilization",
      descriptionAr: "استكشف التاريخ الغني للحضارة الإسلامية",
      descriptionFr: "Explorez la riche histoire de la civilisation islamique",
      isPublished: true,
      order: 3,
    },
  ];

  const coursesData = [
    {
      id: "course-1",
      pathId: "path-1",
      createdBy: adminUserId,
      titleEn: "The Five Pillars of Islam",
      titleAr: "أركان الإسلام الخمسة",
      titleFr: "Les Cinq Piliers de l'Islam",
      descriptionEn: "Learn about Shahada, Salah, Zakat, Sawm, and Hajj",
      descriptionAr: "تعلم عن الشهادة، الصلاة، الزكاة، الصوم، والحج",
      descriptionFr: "Apprenez la Shahada, Salah, Zakat, Sawm et le Hajj",
      isPublished: true,
      order: 1,
    },
    {
      id: "course-2",
      pathId: "path-2",
      createdBy: adminUserId,
      titleEn: "Introduction to Tajweed",
      titleAr: "مقدمة في التجويد",
      titleFr: "Introduction au Tajweed",
      descriptionEn: "Learn the rules of proper Quran recitation",
      descriptionAr: "تعلم قواعد التلاوة الصحيحة للقرآن",
      descriptionFr: "Apprenez les règles de la récitation correcte du Coran",
      isPublished: true,
      order: 1,
    },
  ];

  const lessonsData = [
    {
      id: "lesson-1",
      courseId: "course-1",
      parentId: null,
      createdBy: adminUserId,
      nodeType: "lesson",
      depth: 0,
      titleEn: "Understanding the Shahada",
      titleAr: "فهم الشهادة",
      titleFr: "Comprendre la Shahada",
      isPublished: true,
      order: 1,
    },
    {
      id: "lesson-2",
      courseId: "course-1",
      parentId: null,
      createdBy: adminUserId,
      nodeType: "lesson",
      depth: 0,
      titleEn: "The Prayer (Salah)",
      titleAr: "الصلاة",
      titleFr: "La Prière (Salah)",
      isPublished: true,
      order: 2,
    },
    {
      id: "lesson-3",
      courseId: "course-2",
      parentId: null,
      createdBy: adminUserId,
      nodeType: "lesson",
      depth: 0,
      titleEn: "Basics of Tajweed",
      titleAr: "أساسيات التجويد",
      titleFr: "Les Bases du Tajweed",
      isPublished: true,
      order: 1,
    },
  ];

  const chaptersData = [
    {
      id: "chapter-1-1",
      courseId: "course-1",
      parentId: "lesson-1",
      createdBy: adminUserId,
      nodeType: "chapter",
      depth: 1,
      titleEn: "The Meaning of Shahada",
      titleAr: "معنى الشهادة",
      titleFr: "La Signification de la Shahada",
      isPublished: true,
      order: 1,
    },
    {
      id: "chapter-1-2",
      courseId: "course-1",
      parentId: "lesson-1",
      createdBy: adminUserId,
      nodeType: "chapter",
      depth: 1,
      titleEn: "Conditions of the Shahada",
      titleAr: "شروط الشهادة",
      titleFr: "Les Conditions de la Shahada",
      isPublished: true,
      order: 2,
    },
    {
      id: "chapter-2-1",
      courseId: "course-1",
      parentId: "lesson-2",
      createdBy: adminUserId,
      nodeType: "chapter",
      depth: 1,
      titleEn: "The Five Daily Prayers",
      titleAr: "الصلوات الخمس اليومية",
      titleFr: "Les Cinq Prières Quotidiennes",
      isPublished: true,
      order: 1,
    },
    {
      id: "chapter-3-1",
      courseId: "course-2",
      parentId: "lesson-3",
      createdBy: adminUserId,
      nodeType: "chapter",
      depth: 1,
      titleEn: "Introduction to Arabic Letters",
      titleAr: "مقدمة في الحروف العربية",
      titleFr: "Introduction aux Lettres Arabes",
      isPublished: true,
      order: 1,
    },
  ];

  const chapterContentsData = [
    {
      id: "content-1-1-1",
      courseId: "course-1",
      parentId: "chapter-1-1",
      createdBy: adminUserId,
      nodeType: "chapter_content",
      depth: 2,
      titleEn: "What is the Shahada?",
      titleAr: "ما هي الشهادة؟",
      titleFr: "Qu'est-ce que la Shahada?",
      contentType: "text",
      articleContentEn: `<h2>The Declaration of Faith</h2>
<p>The Shahada (الشهادة) is the Islamic declaration of faith and the first of the Five Pillars of Islam. It states: <strong>"Ash-hadu an la ilaha illa Allah, wa ash-hadu anna Muhammadan rasul Allah"</strong></p>
<p>This translates to: "I bear witness that there is no deity but Allah, and I bear witness that Muhammad is the messenger of Allah."</p>
<h3>The Two Parts</h3>
<ul>
<li><strong>La ilaha illa Allah</strong> - There is no god but Allah</li>
<li><strong>Muhammad rasul Allah</strong> - Muhammad is the messenger of Allah</li>
</ul>
<p>This declaration is the foundation of Islamic faith and must be recited with sincerity and understanding to enter Islam.</p>`,
      articleContentAr: `<h2>شهادة الإيمان</h2>
<p>الشهادة هي إعلان الإيمان الإسلامي والركن الأول من أركان الإسلام الخمسة. وهي: <strong>"أشهد أن لا إله إلا الله وأشهد أن محمداً رسول الله"</strong></p>
<h3>الجزءان</h3>
<ul>
<li><strong>لا إله إلا الله</strong> - لا معبود بحق إلا الله</li>
<li><strong>محمد رسول الله</strong> - محمد هو رسول الله</li>
</ul>
<p>هذا الإعلان هو أساس الإيمان الإسلامي ويجب أن يُقال بإخلاص وفهم للدخول في الإسلام.</p>`,
      articleContentFr: `<h2>La Déclaration de Foi</h2>
<p>La Shahada est la déclaration de foi islamique et le premier des Cinq Piliers de l'Islam. Elle déclare: <strong>"Ash-hadu an la ilaha illa Allah, wa ash-hadu anna Muhammadan rasul Allah"</strong></p>
<p>Cela se traduit par: "J'atteste qu'il n'y a de divinité qu'Allah, et j'atteste que Muhammad est le messager d'Allah."</p>
<h3>Les Deux Parties</h3>
<ul>
<li><strong>La ilaha illa Allah</strong> - Il n'y a de dieu qu'Allah</li>
<li><strong>Muhammad rasul Allah</strong> - Muhammad est le messager d'Allah</li>
</ul>`,
      isPublished: true,
      order: 1,
    },
    {
      id: "content-1-1-2",
      courseId: "course-1",
      parentId: "chapter-1-1",
      createdBy: adminUserId,
      nodeType: "chapter_content",
      depth: 2,
      titleEn: "The Importance of Tawheed",
      titleAr: "أهمية التوحيد",
      titleFr: "L'Importance du Tawheed",
      contentType: "text",
      articleContentEn: `<h2>Understanding Tawheed (Islamic Monotheism)</h2>
<p>Tawheed is the concept of monotheism in Islam, the belief in the oneness of Allah. It is the most fundamental concept in Islam and forms the essence of the Shahada.</p>
<h3>Categories of Tawheed</h3>
<ol>
<li><strong>Tawheed ar-Rububiyyah</strong> - Oneness of Lordship: Allah alone is the Creator, Sustainer, and Controller of all things.</li>
<li><strong>Tawheed al-Uluhiyyah</strong> - Oneness of Worship: All worship must be directed to Allah alone.</li>
<li><strong>Tawheed al-Asma wa as-Sifat</strong> - Oneness of Names and Attributes: Allah's names and attributes are unique to Him.</li>
</ol>`,
      articleContentAr: `<h2>فهم التوحيد</h2>
<p>التوحيد هو مفهوم الإيمان بإله واحد في الإسلام، الإيمان بوحدانية الله. وهو أهم مفهوم في الإسلام ويشكل جوهر الشهادة.</p>
<h3>أقسام التوحيد</h3>
<ol>
<li><strong>توحيد الربوبية</strong> - الله وحده هو الخالق والرازق والمدبر لكل شيء.</li>
<li><strong>توحيد الألوهية</strong> - جميع العبادات يجب أن تكون لله وحده.</li>
<li><strong>توحيد الأسماء والصفات</strong> - أسماء الله وصفاته فريدة له.</li>
</ol>`,
      articleContentFr: `<h2>Comprendre le Tawheed</h2>
<p>Le Tawheed est le concept du monothéisme en Islam, la croyance en l'unicité d'Allah. C'est le concept le plus fondamental en Islam.</p>
<h3>Catégories du Tawheed</h3>
<ol>
<li><strong>Tawheed ar-Rububiyyah</strong> - Unicité de la Seigneurie</li>
<li><strong>Tawheed al-Uluhiyyah</strong> - Unicité de l'Adoration</li>
<li><strong>Tawheed al-Asma wa as-Sifat</strong> - Unicité des Noms et Attributs</li>
</ol>`,
      isPublished: true,
      order: 2,
    },
    {
      id: "content-1-2-1",
      courseId: "course-1",
      parentId: "chapter-1-2",
      createdBy: adminUserId,
      nodeType: "chapter_content",
      depth: 2,
      titleEn: "Seven Conditions of the Shahada",
      titleAr: "شروط الشهادة السبعة",
      titleFr: "Les Sept Conditions de la Shahada",
      contentType: "text",
      articleContentEn: `<h2>The Seven Conditions</h2>
<p>For the Shahada to be valid, it must be pronounced with understanding of its conditions:</p>
<ol>
<li><strong>Knowledge (Al-'Ilm)</strong> - Understanding what the Shahada means</li>
<li><strong>Certainty (Al-Yaqeen)</strong> - Having no doubt about its truth</li>
<li><strong>Acceptance (Al-Qabool)</strong> - Accepting all its implications</li>
<li><strong>Submission (Al-Inqiyaad)</strong> - Acting upon its requirements</li>
<li><strong>Truthfulness (As-Sidq)</strong> - Saying it sincerely from the heart</li>
<li><strong>Sincerity (Al-Ikhlaas)</strong> - Directing worship only to Allah</li>
<li><strong>Love (Al-Mahabbah)</strong> - Loving Allah and His Messenger</li>
</ol>`,
      articleContentAr: `<h2>الشروط السبعة</h2>
<p>لكي تكون الشهادة صحيحة، يجب أن تُنطق مع فهم شروطها:</p>
<ol>
<li><strong>العلم</strong> - فهم ما تعنيه الشهادة</li>
<li><strong>اليقين</strong> - عدم الشك في صحتها</li>
<li><strong>القبول</strong> - قبول جميع لوازمها</li>
<li><strong>الانقياد</strong> - العمل بمقتضاها</li>
<li><strong>الصدق</strong> - قولها بإخلاص من القلب</li>
<li><strong>الإخلاص</strong> - توجيه العبادة لله وحده</li>
<li><strong>المحبة</strong> - محبة الله ورسوله</li>
</ol>`,
      articleContentFr: `<h2>Les Sept Conditions</h2>
<ol>
<li><strong>La Connaissance (Al-'Ilm)</strong></li>
<li><strong>La Certitude (Al-Yaqeen)</strong></li>
<li><strong>L'Acceptation (Al-Qabool)</strong></li>
<li><strong>La Soumission (Al-Inqiyaad)</strong></li>
<li><strong>La Véracité (As-Sidq)</strong></li>
<li><strong>La Sincérité (Al-Ikhlaas)</strong></li>
<li><strong>L'Amour (Al-Mahabbah)</strong></li>
</ol>`,
      isPublished: true,
      order: 1,
    },
    {
      id: "content-2-1-1",
      courseId: "course-1",
      parentId: "chapter-2-1",
      createdBy: adminUserId,
      nodeType: "chapter_content",
      depth: 2,
      titleEn: "Fajr - The Dawn Prayer",
      titleAr: "صلاة الفجر",
      titleFr: "Fajr - La Prière de l'Aube",
      contentType: "text",
      articleContentEn: `<h2>Fajr Prayer</h2>
<p>Fajr is the first of the five daily prayers, performed before sunrise. It consists of 2 rak'ahs (units of prayer).</p>
<h3>Time</h3>
<p>The time for Fajr begins at dawn (when the first light appears on the horizon) and ends at sunrise.</p>
<h3>Significance</h3>
<p>The Prophet Muhammad (peace be upon him) said: "Whoever prays Fajr is under the protection of Allah."</p>`,
      articleContentAr: `<h2>صلاة الفجر</h2>
<p>الفجر هي الصلاة الأولى من الصلوات الخمس اليومية، وتُؤدى قبل شروق الشمس. وتتكون من ركعتين.</p>
<h3>الوقت</h3>
<p>يبدأ وقت الفجر عند طلوع الفجر وينتهي عند شروق الشمس.</p>
<h3>الأهمية</h3>
<p>قال النبي محمد صلى الله عليه وسلم: "من صلى الفجر فهو في ذمة الله."</p>`,
      articleContentFr: `<h2>La Prière de Fajr</h2>
<p>Fajr est la première des cinq prières quotidiennes, effectuée avant le lever du soleil. Elle comprend 2 rak'ahs.</p>`,
      isPublished: true,
      order: 1,
    },
    {
      id: "content-3-1-1",
      courseId: "course-2",
      parentId: "chapter-3-1",
      createdBy: adminUserId,
      nodeType: "chapter_content",
      depth: 2,
      titleEn: "The Arabic Alphabet - Makhaarij",
      titleAr: "الحروف العربية - المخارج",
      titleFr: "L'Alphabet Arabe - Makhaarij",
      contentType: "text",
      articleContentEn: `<h2>Points of Articulation (Makhaarij)</h2>
<p>In Tajweed, understanding where each letter originates in the mouth and throat is essential for correct pronunciation.</p>
<h3>The Five Main Areas</h3>
<ol>
<li><strong>Al-Jawf (الجوف)</strong> - The empty space in the mouth and throat (for elongated letters)</li>
<li><strong>Al-Halq (الحلق)</strong> - The throat</li>
<li><strong>Al-Lisan (اللسان)</strong> - The tongue</li>
<li><strong>Ash-Shafataan (الشفتان)</strong> - The two lips</li>
<li><strong>Al-Khayshoom (الخيشوم)</strong> - The nasal passage</li>
</ol>`,
      articleContentAr: `<h2>مخارج الحروف</h2>
<p>في التجويد، فهم مكان خروج كل حرف من الفم والحلق أساسي للنطق الصحيح.</p>
<h3>المناطق الخمس الرئيسية</h3>
<ol>
<li><strong>الجوف</strong> - الفراغ في الفم والحلق</li>
<li><strong>الحلق</strong></li>
<li><strong>اللسان</strong></li>
<li><strong>الشفتان</strong></li>
<li><strong>الخيشوم</strong> - مجرى الأنف</li>
</ol>`,
      articleContentFr: `<h2>Points d'Articulation (Makhaarij)</h2>
<ol>
<li><strong>Al-Jawf</strong> - L'espace vide</li>
<li><strong>Al-Halq</strong> - La gorge</li>
<li><strong>Al-Lisan</strong> - La langue</li>
<li><strong>Ash-Shafataan</strong> - Les deux lèvres</li>
<li><strong>Al-Khayshoom</strong> - Le passage nasal</li>
</ol>`,
      isPublished: true,
      order: 1,
    },
  ];

  const quizzesData = [
    {
      id: "quiz-lesson-1",
      contentNodeId: "lesson-1",
      courseId: null,
      pathId: null,
      titleEn: "Shahada Understanding Quiz",
      titleAr: "اختبار فهم الشهادة",
      titleFr: "Quiz de Compréhension de la Shahada",
      passingScore: 70,
    },
    {
      id: "quiz-lesson-2",
      contentNodeId: "lesson-2",
      courseId: null,
      pathId: null,
      titleEn: "Prayer Basics Quiz",
      titleAr: "اختبار أساسيات الصلاة",
      titleFr: "Quiz des Bases de la Prière",
      passingScore: 70,
    },
    {
      id: "quiz-course-1",
      contentNodeId: null,
      courseId: "course-1",
      pathId: null,
      titleEn: "Five Pillars Final Exam",
      titleAr: "الاختبار النهائي لأركان الإسلام الخمسة",
      titleFr: "Examen Final des Cinq Piliers",
      passingScore: 80,
    },
  ];

  const questionsData = [
    {
      quizId: "quiz-lesson-1",
      difficultyLevel: 1,
      questionTextEn: "What does 'La ilaha illa Allah' mean?",
      questionTextAr: "ما معنى 'لا إله إلا الله'؟",
      questionTextFr: "Que signifie 'La ilaha illa Allah'?",
      optionsEn: ["There is no god but Allah", "Allah is great", "Praise be to Allah", "In the name of Allah"],
      optionsAr: ["لا إله إلا الله", "الله أكبر", "الحمد لله", "بسم الله"],
      optionsFr: ["Il n'y a de dieu qu'Allah", "Allah est grand", "Louange à Allah", "Au nom d'Allah"],
      correctAnswerIndex: 0,
    },
    {
      quizId: "quiz-lesson-1",
      difficultyLevel: 1,
      questionTextEn: "How many conditions are there for a valid Shahada?",
      questionTextAr: "كم عدد شروط الشهادة الصحيحة؟",
      questionTextFr: "Combien de conditions y a-t-il pour une Shahada valide?",
      optionsEn: ["Five", "Seven", "Three", "Ten"],
      optionsAr: ["خمسة", "سبعة", "ثلاثة", "عشرة"],
      optionsFr: ["Cinq", "Sept", "Trois", "Dix"],
      correctAnswerIndex: 1,
    },
    {
      quizId: "quiz-lesson-2",
      difficultyLevel: 1,
      questionTextEn: "What is the first prayer of the day?",
      questionTextAr: "ما هي أول صلاة في اليوم؟",
      questionTextFr: "Quelle est la première prière de la journée?",
      optionsEn: ["Fajr", "Dhuhr", "Maghrib", "Isha"],
      optionsAr: ["الفجر", "الظهر", "المغرب", "العشاء"],
      optionsFr: ["Fajr", "Dhuhr", "Maghrib", "Isha"],
      correctAnswerIndex: 0,
    },
    {
      quizId: "quiz-course-1",
      difficultyLevel: 2,
      questionTextEn: "What are the three categories of Tawheed?",
      questionTextAr: "ما هي أقسام التوحيد الثلاثة؟",
      questionTextFr: "Quelles sont les trois catégories du Tawheed?",
      optionsEn: ["Rububiyyah, Uluhiyyah, Asma wa Sifat", "Salah, Sawm, Hajj", "Iman, Islam, Ihsan", "Quran, Sunnah, Ijma"],
      optionsAr: ["الربوبية، الألوهية، الأسماء والصفات", "الصلاة، الصوم، الحج", "الإيمان، الإسلام، الإحسان", "القرآن، السنة، الإجماع"],
      optionsFr: ["Rububiyyah, Uluhiyyah, Asma wa Sifat", "Salah, Sawm, Hajj", "Iman, Islam, Ihsan", "Coran, Sunna, Ijma"],
      correctAnswerIndex: 0,
    },
  ];

  await db.insert(paths).values(pathsData);
  console.log("Inserted paths");

  await db.insert(courses).values(coursesData);
  console.log("Inserted courses");

  await db.insert(contentNodes).values(lessonsData);
  console.log("Inserted lessons");

  await db.insert(contentNodes).values(chaptersData);
  console.log("Inserted chapters");

  await db.insert(contentNodes).values(chapterContentsData);
  console.log("Inserted chapter contents");

  await db.insert(quizzes).values(quizzesData);
  console.log("Inserted quizzes");

  await db.insert(questions).values(questionsData);
  console.log("Inserted questions");

  console.log("Seed data completed successfully!");
}
