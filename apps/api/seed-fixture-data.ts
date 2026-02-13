import { db } from "./db";
import { paths, courses, contentNodes, quizzes, questions } from "@shared/schema";

const ADMIN_USER_ID = "system-admin";

interface QuizQuestion {
  en: string;
  ar: string;
  fr: string;
  options: { en: string[]; ar: string[]; fr: string[] };
  correct: number;
  explanationEn: string;
  explanationAr: string;
  explanationFr: string;
}

interface ChapterData {
  titleEn: string;
  titleAr: string;
  titleFr: string;
  contentEn: string;
  contentAr: string;
  contentFr: string;
  quizQuestions: QuizQuestion[];
}

interface LessonData {
  titleEn: string;
  titleAr: string;
  titleFr: string;
  chapters: ChapterData[];
}

interface CourseData {
  titleEn: string;
  titleAr: string;
  titleFr: string;
  descriptionEn: string;
  descriptionAr: string;
  descriptionFr: string;
  lessons: LessonData[];
}

interface PathData {
  titleEn: string;
  titleAr: string;
  titleFr: string;
  descriptionEn: string;
  descriptionAr: string;
  descriptionFr: string;
  courses: CourseData[];
}

const pathsData: PathData[] = [
  {
    titleEn: "Foundations of Islamic Studies",
    titleAr: "أسس الدراسات الإسلامية",
    titleFr: "Fondements des études islamiques",
    descriptionEn: "A comprehensive journey through the core pillars of Islamic knowledge, covering faith, worship, ethics, and Quranic sciences.",
    descriptionAr: "رحلة شاملة عبر الأركان الأساسية للمعرفة الإسلامية، تشمل العقيدة والعبادات والأخلاق وعلوم القرآن.",
    descriptionFr: "Un voyage complet à travers les piliers fondamentaux de la connaissance islamique, couvrant la foi, le culte, l'éthique et les sciences coraniques.",
    courses: [
      {
        titleEn: "Islamic Creed (Aqeedah)",
        titleAr: "العقيدة الإسلامية",
        titleFr: "Croyance Islamique (Aqida)",
        descriptionEn: "Learn the fundamental beliefs of Islam including the six pillars of faith.",
        descriptionAr: "تعلم المعتقدات الأساسية للإسلام بما في ذلك أركان الإيمان الستة.",
        descriptionFr: "Apprenez les croyances fondamentales de l'Islam, y compris les six piliers de la foi.",
        lessons: [
          {
            titleEn: "Belief in Allah",
            titleAr: "الإيمان بالله",
            titleFr: "Croyance en Allah",
            chapters: [
              {
                titleEn: "The Oneness of Allah (Tawheed)",
                titleAr: "توحيد الله",
                titleFr: "L'unicité d'Allah (Tawhid)",
                contentEn: `<h2>Understanding Tawheed</h2><p>Tawheed is the foundation of Islamic belief. It means believing in the absolute oneness and uniqueness of Allah. This concept is divided into three categories:</p><h3>1. Tawheed ar-Rububiyyah (Oneness of Lordship)</h3><p>This refers to believing that Allah alone is the Creator, Sustainer, and Controller of all that exists.</p><h3>2. Tawheed al-Uluhiyyah (Oneness of Worship)</h3><p>This means directing all acts of worship exclusively to Allah.</p><h3>3. Tawheed al-Asma wa Sifat (Oneness of Names and Attributes)</h3><p>This involves believing in all the names and attributes that Allah has described Himself with.</p>`,
                contentAr: `<h2>فهم التوحيد</h2><p>التوحيد هو أساس العقيدة الإسلامية. وهو يعني الإيمان بوحدانية الله المطلقة وتفرده. ينقسم هذا المفهوم إلى ثلاثة أقسام:</p><h3>1. توحيد الربوبية</h3><p>يشير إلى الإيمان بأن الله وحده هو الخالق والرازق والمدبر.</p><h3>2. توحيد الألوهية</h3><p>يعني توجيه جميع أعمال العبادة إلى الله وحده.</p><h3>3. توحيد الأسماء والصفات</h3><p>يتضمن الإيمان بجميع الأسماء والصفات التي وصف الله بها نفسه.</p>`,
                contentFr: `<h2>Comprendre le Tawhid</h2><p>Le Tawhid est le fondement de la croyance islamique. Il signifie croire en l'unicité absolue d'Allah. Ce concept est divisé en trois catégories:</p><h3>1. Tawhid ar-Rububiyyah</h3><p>Croire qu'Allah seul est le Créateur, le Soutien et le Contrôleur.</p><h3>2. Tawhid al-Uluhiyyah</h3><p>Diriger tous les actes d'adoration exclusivement vers Allah.</p><h3>3. Tawhid al-Asma wa Sifat</h3><p>Croire en tous les noms et attributs qu'Allah s'est décrits.</p>`,
                quizQuestions: generateTawheedQuestions()
              },
              {
                titleEn: "The Names and Attributes of Allah",
                titleAr: "أسماء الله وصفاته",
                titleFr: "Les Noms et Attributs d'Allah",
                contentEn: `<h2>The Beautiful Names of Allah</h2><p>Allah has described Himself with the most beautiful names and perfect attributes. The Prophet said: "Allah has ninety-nine names, whoever memorizes them will enter Paradise."</p><h3>Categories of Names</h3><p><strong>Names of Majesty:</strong> Al-Aziz, Al-Jabbar, Al-Mutakabbir</p><p><strong>Names of Beauty:</strong> Ar-Rahman, Ar-Raheem, Al-Wadud</p><p><strong>Names of Perfection:</strong> Al-Alim, Al-Hakeem, As-Samee</p>`,
                contentAr: `<h2>أسماء الله الحسنى</h2><p>وصف الله نفسه بأسماء حسنى وصفات كاملة. قال النبي: "إن لله تسعة وتسعين اسماً من أحصاها دخل الجنة."</p><h3>أقسام الأسماء</h3><p><strong>أسماء الجلال:</strong> العزيز، الجبار، المتكبر</p><p><strong>أسماء الجمال:</strong> الرحمن، الرحيم، الودود</p><p><strong>أسماء الكمال:</strong> العليم، الحكيم، السميع</p>`,
                contentFr: `<h2>Les Beaux Noms d'Allah</h2><p>Allah s'est décrit avec les plus beaux noms. Le Prophète a dit: "Allah a quatre-vingt-dix-neuf noms, quiconque les mémorise entrera au Paradis."</p><h3>Catégories de Noms</h3><p><strong>Noms de Majesté:</strong> Al-Aziz, Al-Jabbar, Al-Mutakabbir</p><p><strong>Noms de Beauté:</strong> Ar-Rahman, Ar-Raheem, Al-Wadud</p><p><strong>Noms de Perfection:</strong> Al-Alim, Al-Hakeem, As-Samee</p>`,
                quizQuestions: generateNamesAttributesQuestions()
              },
              {
                titleEn: "Evidence for Allah's Existence",
                titleAr: "أدلة وجود الله",
                titleFr: "Preuves de l'Existence d'Allah",
                contentEn: `<h2>Rational and Revealed Proofs</h2><p>Islam encourages reflection and contemplation. The Quran frequently calls upon people to ponder the signs of Allah.</p><h3>The Cosmological Argument</h3><p>Everything that exists has a cause. The universe exists, therefore it must have a cause - Allah.</p><h3>The Design Argument</h3><p>The intricate design in the universe points to an intelligent Creator.</p><h3>The Fitrah</h3><p>Every human is born with an innate recognition of the Creator.</p>`,
                contentAr: `<h2>الأدلة العقلية والشرعية</h2><p>يشجع الإسلام على التفكر والتأمل. يدعو القرآن الناس للتفكر في آيات الله.</p><h3>الدليل الكوني</h3><p>كل شيء موجود له سبب. الكون موجود، إذن لا بد أن يكون له سبب - الله.</p><h3>دليل التصميم</h3><p>التصميم المعقد في الكون يشير إلى خالق حكيم.</p><h3>الفطرة</h3><p>كل إنسان يولد مع إدراك فطري للخالق.</p>`,
                contentFr: `<h2>Preuves Rationnelles et Révélées</h2><p>L'Islam encourage la réflexion. Le Coran appelle les gens à méditer sur les signes d'Allah.</p><h3>L'Argument Cosmologique</h3><p>Tout ce qui existe a une cause. L'univers existe, donc il doit avoir une cause - Allah.</p><h3>L'Argument du Design</h3><p>Le design complexe dans l'univers pointe vers un Créateur intelligent.</p><h3>La Fitrah</h3><p>Chaque humain naît avec une reconnaissance innée du Créateur.</p>`,
                quizQuestions: generateEvidenceQuestions()
              },
              {
                titleEn: "The Concept of Shirk",
                titleAr: "مفهوم الشرك",
                titleFr: "Le Concept de Shirk",
                contentEn: `<h2>Understanding Shirk</h2><p>Shirk is the greatest sin in Islam - associating partners with Allah.</p><h3>Types of Shirk</h3><p><strong>Major Shirk:</strong> Takes one outside Islam. Examples: idol worship, supplicating to the dead.</p><p><strong>Minor Shirk:</strong> Serious sin but doesn't remove from Islam. Examples: showing off in worship, swearing by other than Allah.</p><h3>The Danger</h3><p>"Indeed, Allah does not forgive association with Him." (Quran 4:48)</p>`,
                contentAr: `<h2>فهم الشرك</h2><p>الشرك هو أعظم ذنب في الإسلام - إشراك غير الله في العبادة.</p><h3>أنواع الشرك</h3><p><strong>الشرك الأكبر:</strong> يخرج من الإسلام. مثل: عبادة الأصنام، دعاء الأموات.</p><p><strong>الشرك الأصغر:</strong> ذنب كبير لكن لا يخرج من الإسلام. مثل: الرياء، الحلف بغير الله.</p><h3>الخطر</h3><p>"إِنَّ اللَّهَ لَا يَغْفِرُ أَن يُشْرَكَ بِهِ" (النساء: 48)</p>`,
                contentFr: `<h2>Comprendre le Shirk</h2><p>Le Shirk est le plus grand péché - associer des partenaires à Allah.</p><h3>Types de Shirk</h3><p><strong>Shirk Majeur:</strong> Fait sortir de l'Islam. Exemples: adorer des idoles, invoquer les morts.</p><p><strong>Shirk Mineur:</strong> Péché grave mais ne retire pas de l'Islam. Exemples: se montrer dans l'adoration, jurer par autre qu'Allah.</p><h3>Le Danger</h3><p>"Allah ne pardonne pas qu'on Lui donne des associés." (Coran 4:48)</p>`,
                quizQuestions: generateShirkQuestions()
              }
            ]
          }
        ]
      },
      {
        titleEn: "The Five Pillars of Islam",
        titleAr: "أركان الإسلام الخمسة",
        titleFr: "Les Cinq Piliers de l'Islam",
        descriptionEn: "Master the five essential practices that form the foundation of Muslim life.",
        descriptionAr: "أتقن الممارسات الخمس الأساسية التي تشكل أساس حياة المسلم.",
        descriptionFr: "Maîtrisez les cinq pratiques essentielles qui forment le fondement de la vie musulmane.",
        lessons: [
          {
            titleEn: "The Shahada and Prayer",
            titleAr: "الشهادة والصلاة",
            titleFr: "La Shahada et la Prière",
            chapters: [
              {
                titleEn: "The Declaration of Faith (Shahada)",
                titleAr: "شهادة الإيمان",
                titleFr: "La Déclaration de Foi (Shahada)",
                contentEn: `<h2>The Shahada</h2><p>The Shahada is the first pillar of Islam: "La ilaha illa Allah, Muhammad rasul Allah" - There is no deity worthy of worship except Allah, and Muhammad is the Messenger of Allah.</p><h3>Two Parts</h3><p><strong>First Part:</strong> Affirms the oneness of Allah and rejects all false deities.</p><p><strong>Second Part:</strong> Affirms that Muhammad is Allah's final messenger.</p><h3>Conditions</h3><p>Knowledge, certainty, acceptance, submission, truthfulness, sincerity, and love.</p>`,
                contentAr: `<h2>الشهادة</h2><p>الشهادة هي الركن الأول من أركان الإسلام: "لا إله إلا الله محمد رسول الله".</p><h3>جزءان</h3><p><strong>الجزء الأول:</strong> يؤكد وحدانية الله ويرفض جميع الآلهة الباطلة.</p><p><strong>الجزء الثاني:</strong> يؤكد أن محمداً هو رسول الله الخاتم.</p><h3>الشروط</h3><p>العلم، اليقين، القبول، الانقياد، الصدق، الإخلاص، والمحبة.</p>`,
                contentFr: `<h2>La Shahada</h2><p>La Shahada est le premier pilier de l'Islam: "La ilaha illa Allah, Muhammad rasul Allah".</p><h3>Deux Parties</h3><p><strong>Première Partie:</strong> Affirme l'unicité d'Allah et rejette les fausses divinités.</p><p><strong>Deuxième Partie:</strong> Affirme que Muhammad est le dernier messager d'Allah.</p><h3>Conditions</h3><p>Connaissance, certitude, acceptation, soumission, véracité, sincérité et amour.</p>`,
                quizQuestions: generateShahadaQuestions()
              },
              {
                titleEn: "The Prayer (Salah) - Importance",
                titleAr: "الصلاة - الأهمية",
                titleFr: "La Prière (Salah) - Importance",
                contentEn: `<h2>The Importance of Prayer</h2><p>Prayer (Salah) is the second pillar of Islam and the first act of worship to be asked about on the Day of Judgment.</p><h3>Five Daily Prayers</h3><p>Fajr (dawn), Dhuhr (noon), Asr (afternoon), Maghrib (sunset), Isha (night).</p><h3>Benefits</h3><p>Connection with Allah, spiritual purification, discipline, and community unity.</p><h3>Obligation</h3><p>Prayer is obligatory for every sane, adult Muslim.</p>`,
                contentAr: `<h2>أهمية الصلاة</h2><p>الصلاة هي الركن الثاني من أركان الإسلام وأول ما يُسأل عنه العبد يوم القيامة.</p><h3>الصلوات الخمس</h3><p>الفجر، الظهر، العصر، المغرب، العشاء.</p><h3>الفوائد</h3><p>الاتصال بالله، التطهير الروحي، الانضباط، ووحدة المجتمع.</p><h3>الوجوب</h3><p>الصلاة واجبة على كل مسلم بالغ عاقل.</p>`,
                contentFr: `<h2>L'Importance de la Prière</h2><p>La prière est le deuxième pilier de l'Islam et le premier acte d'adoration sur lequel on sera interrogé le Jour du Jugement.</p><h3>Cinq Prières Quotidiennes</h3><p>Fajr (aube), Dhuhr (midi), Asr (après-midi), Maghrib (coucher du soleil), Isha (nuit).</p><h3>Bienfaits</h3><p>Connexion avec Allah, purification spirituelle, discipline et unité communautaire.</p><h3>Obligation</h3><p>La prière est obligatoire pour tout musulman adulte sain d'esprit.</p>`,
                quizQuestions: generatePrayerImportanceQuestions()
              },
              {
                titleEn: "How to Perform Prayer",
                titleAr: "كيفية أداء الصلاة",
                titleFr: "Comment Accomplir la Prière",
                contentEn: `<h2>Steps of Prayer</h2><h3>Prerequisites</h3><p>Purity (wudu), clean clothes, facing the Qiblah, proper intention.</p><h3>The Prayer</h3><p>1. Stand and say Takbir (Allahu Akbar)</p><p>2. Recite Al-Fatiha and another surah</p><p>3. Bow (Ruku) and say "Subhana Rabbi al-Azeem"</p><p>4. Stand and say "Sami Allahu liman hamidah"</p><p>5. Prostrate (Sujud) and say "Subhana Rabbi al-A'la"</p><p>6. Sit between prostrations</p><p>7. Complete the required units (rakaat)</p><p>8. End with Tashahhud and Salam</p>`,
                contentAr: `<h2>خطوات الصلاة</h2><h3>الشروط</h3><p>الطهارة (الوضوء)، الثياب النظيفة، استقبال القبلة، النية.</p><h3>الصلاة</h3><p>1. قم وكبر (الله أكبر)</p><p>2. اقرأ الفاتحة وسورة أخرى</p><p>3. اركع وقل "سبحان ربي العظيم"</p><p>4. قم وقل "سمع الله لمن حمده"</p><p>5. اسجد وقل "سبحان ربي الأعلى"</p><p>6. اجلس بين السجدتين</p><p>7. أكمل الركعات المطلوبة</p><p>8. اختم بالتشهد والسلام</p>`,
                contentFr: `<h2>Étapes de la Prière</h2><h3>Prérequis</h3><p>Pureté (wudu), vêtements propres, face à la Qiblah, intention.</p><h3>La Prière</h3><p>1. Se lever et dire Takbir</p><p>2. Réciter Al-Fatiha et une autre sourate</p><p>3. S'incliner (Ruku)</p><p>4. Se relever</p><p>5. Se prosterner (Sujud)</p><p>6. S'asseoir entre les prosternations</p><p>7. Compléter les unités requises</p><p>8. Terminer avec Tashahhud et Salam</p>`,
                quizQuestions: generatePrayerStepsQuestions()
              },
              {
                titleEn: "Conditions and Pillars of Prayer",
                titleAr: "شروط وأركان الصلاة",
                titleFr: "Conditions et Piliers de la Prière",
                contentEn: `<h2>Conditions of Prayer</h2><p><strong>Before Prayer:</strong> Islam, sanity, puberty, purity, covering awrah, facing Qiblah, entering prayer time.</p><h3>Pillars of Prayer</h3><p>Standing (if able), Takbiratul Ihram, Al-Fatiha, Ruku, rising from Ruku, Sujud on seven bones, sitting between prostrations, final Tashahhud, sitting for it, Salam.</p><h3>Obligations</h3><p>All takbirs except the first, saying "Subhana Rabbi al-Azeem" in Ruku, saying "Sami Allahu liman hamidah", saying "Subhana Rabbi al-A'la" in Sujud.</p>`,
                contentAr: `<h2>شروط الصلاة</h2><p><strong>قبل الصلاة:</strong> الإسلام، العقل، البلوغ، الطهارة، ستر العورة، استقبال القبلة، دخول الوقت.</p><h3>أركان الصلاة</h3><p>القيام (مع القدرة)، تكبيرة الإحرام، الفاتحة، الركوع، الرفع من الركوع، السجود على سبعة أعضاء، الجلوس بين السجدتين، التشهد الأخير، الجلوس له، السلام.</p><h3>الواجبات</h3><p>جميع التكبيرات إلا الأولى، قول "سبحان ربي العظيم" في الركوع، قول "سمع الله لمن حمده"، قول "سبحان ربي الأعلى" في السجود.</p>`,
                contentFr: `<h2>Conditions de la Prière</h2><p><strong>Avant la Prière:</strong> Islam, raison, puberté, pureté, couvrir la awrah, faire face à la Qiblah, entrée de l'heure de prière.</p><h3>Piliers de la Prière</h3><p>Se tenir debout (si capable), Takbiratul Ihram, Al-Fatiha, Ruku, se relever du Ruku, Sujud sur sept os, s'asseoir entre les prosternations, Tashahhud final, s'asseoir pour cela, Salam.</p><h3>Obligations</h3><p>Tous les takbirs sauf le premier, dire "Subhana Rabbi al-Azeem" dans le Ruku, dire "Sami Allahu liman hamidah".</p>`,
                quizQuestions: generatePrayerConditionsQuestions()
              }
            ]
          }
        ]
      },
      {
        titleEn: "Fasting and Charity",
        titleAr: "الصيام والزكاة",
        titleFr: "Le Jeûne et la Charité",
        descriptionEn: "Learn about the spiritual disciplines of fasting in Ramadan and giving Zakat.",
        descriptionAr: "تعلم عن العبادات الروحية للصيام في رمضان وإخراج الزكاة.",
        descriptionFr: "Apprenez les disciplines spirituelles du jeûne en Ramadan et du don de la Zakat.",
        lessons: [
          {
            titleEn: "The Month of Ramadan",
            titleAr: "شهر رمضان",
            titleFr: "Le Mois de Ramadan",
            chapters: [
              {
                titleEn: "The Virtues of Ramadan",
                titleAr: "فضائل رمضان",
                titleFr: "Les Vertus du Ramadan",
                contentEn: `<h2>The Blessed Month</h2><p>Ramadan is the ninth month of the Islamic calendar and the most sacred month for Muslims.</p><h3>Special Features</h3><p>1. The Quran was revealed in this month</p><p>2. Gates of Paradise are opened</p><p>3. Gates of Hell are closed</p><p>4. Devils are chained</p><p>5. Contains Laylatul Qadr (Night of Power)</p><h3>Rewards</h3><p>Sins are forgiven for those who fast with faith and seeking reward.</p>`,
                contentAr: `<h2>الشهر المبارك</h2><p>رمضان هو الشهر التاسع من التقويم الإسلامي وأقدس شهر عند المسلمين.</p><h3>الميزات الخاصة</h3><p>1. أنزل فيه القرآن</p><p>2. تفتح أبواب الجنة</p><p>3. تغلق أبواب النار</p><p>4. تصفد الشياطين</p><p>5. فيه ليلة القدر</p><h3>الأجر</h3><p>تغفر الذنوب لمن صام إيماناً واحتساباً.</p>`,
                contentFr: `<h2>Le Mois Béni</h2><p>Le Ramadan est le neuvième mois du calendrier islamique et le mois le plus sacré pour les musulmans.</p><h3>Caractéristiques Spéciales</h3><p>1. Le Coran a été révélé ce mois-ci</p><p>2. Les portes du Paradis sont ouvertes</p><p>3. Les portes de l'Enfer sont fermées</p><p>4. Les démons sont enchaînés</p><p>5. Contient Laylatul Qadr</p><h3>Récompenses</h3><p>Les péchés sont pardonnés pour ceux qui jeûnent avec foi.</p>`,
                quizQuestions: generateRamadanVirtuesQuestions()
              },
              {
                titleEn: "Rules of Fasting",
                titleAr: "أحكام الصيام",
                titleFr: "Règles du Jeûne",
                contentEn: `<h2>Fasting Rules</h2><h3>What Breaks the Fast</h3><p>1. Eating or drinking intentionally</p><p>2. Intimate relations</p><p>3. Intentional vomiting</p><p>4. Menstruation or postnatal bleeding</p><h3>Who is Exempt</h3><p>Travelers, sick people, pregnant/nursing women, elderly, children before puberty.</p><h3>Making Up Fasts</h3><p>Those who miss fasting must make up the days later.</p>`,
                contentAr: `<h2>أحكام الصيام</h2><h3>ما يفسد الصوم</h3><p>1. الأكل أو الشرب عمداً</p><p>2. الجماع</p><p>3. التقيؤ عمداً</p><p>4. الحيض أو النفاس</p><h3>من يعفى</h3><p>المسافرون، المرضى، الحوامل والمرضعات، كبار السن، الأطفال قبل البلوغ.</p><h3>قضاء الصيام</h3><p>من أفطر يجب عليه قضاء الأيام لاحقاً.</p>`,
                contentFr: `<h2>Règles du Jeûne</h2><h3>Ce qui Rompt le Jeûne</h3><p>1. Manger ou boire intentionnellement</p><p>2. Relations intimes</p><p>3. Vomissement intentionnel</p><p>4. Menstruation ou saignement post-natal</p><h3>Qui est Exempté</h3><p>Voyageurs, malades, femmes enceintes/allaitantes, personnes âgées, enfants avant la puberté.</p><h3>Rattraper les Jeûnes</h3><p>Ceux qui manquent doivent rattraper les jours plus tard.</p>`,
                quizQuestions: generateFastingRulesQuestions()
              },
              {
                titleEn: "Zakat - The Obligatory Charity",
                titleAr: "الزكاة - الصدقة الواجبة",
                titleFr: "La Zakat - La Charité Obligatoire",
                contentEn: `<h2>Understanding Zakat</h2><p>Zakat is the fourth pillar of Islam - a compulsory form of charity purifying wealth.</p><h3>Who Must Pay</h3><p>Every Muslim who possesses wealth above the Nisab (minimum threshold) for one lunar year.</p><h3>Rate</h3><p>2.5% of qualifying wealth including gold, silver, cash, and business assets.</p><h3>Recipients</h3><p>Eight categories mentioned in Quran 9:60: the poor, needy, collectors, those whose hearts are to be reconciled, freeing slaves, debtors, in the cause of Allah, travelers.</p>`,
                contentAr: `<h2>فهم الزكاة</h2><p>الزكاة هي الركن الرابع من أركان الإسلام - صدقة واجبة تطهر المال.</p><h3>من يجب عليه</h3><p>كل مسلم يملك مالاً فوق النصاب لمدة سنة قمرية.</p><h3>النسبة</h3><p>2.5% من المال المؤهل بما في ذلك الذهب والفضة والنقود وأصول التجارة.</p><h3>المستحقون</h3><p>ثماني فئات في سورة التوبة: الفقراء، المساكين، العاملين عليها، المؤلفة قلوبهم، في الرقاب، الغارمين، في سبيل الله، ابن السبيل.</p>`,
                contentFr: `<h2>Comprendre la Zakat</h2><p>La Zakat est le quatrième pilier de l'Islam - une charité obligatoire purifiant la richesse.</p><h3>Qui Doit Payer</h3><p>Tout musulman possédant une richesse au-dessus du Nisab pendant une année lunaire.</p><h3>Taux</h3><p>2.5% de la richesse qualifiante incluant or, argent, espèces et actifs commerciaux.</p><h3>Bénéficiaires</h3><p>Huit catégories mentionnées dans le Coran 9:60: les pauvres, les nécessiteux, les collecteurs, etc.</p>`,
                quizQuestions: generateZakatQuestions()
              },
              {
                titleEn: "Voluntary Charity (Sadaqah)",
                titleAr: "الصدقة التطوعية",
                titleFr: "La Charité Volontaire (Sadaqah)",
                contentEn: `<h2>Sadaqah - Voluntary Charity</h2><p>Beyond Zakat, Islam encourages voluntary charity (Sadaqah) at any time.</p><h3>Forms of Sadaqah</h3><p>1. Financial giving</p><p>2. Feeding the hungry</p><p>3. A kind word or smile</p><p>4. Removing harm from the road</p><p>5. Teaching beneficial knowledge</p><h3>Benefits</h3><p>Purifies the soul, increases blessings, protects from calamities, and earns continuous rewards.</p>`,
                contentAr: `<h2>الصدقة التطوعية</h2><p>إلى جانب الزكاة، يشجع الإسلام على الصدقة التطوعية في أي وقت.</p><h3>أشكال الصدقة</h3><p>1. العطاء المالي</p><p>2. إطعام الجائعين</p><p>3. الكلمة الطيبة أو الابتسامة</p><p>4. إزالة الأذى من الطريق</p><p>5. تعليم العلم النافع</p><h3>الفوائد</h3><p>تطهر النفس، تزيد البركة، تحمي من البلاء، وتكسب الأجر المستمر.</p>`,
                contentFr: `<h2>Sadaqah - Charité Volontaire</h2><p>Au-delà de la Zakat, l'Islam encourage la charité volontaire à tout moment.</p><h3>Formes de Sadaqah</h3><p>1. Don financier</p><p>2. Nourrir les affamés</p><p>3. Un mot gentil ou un sourire</p><p>4. Enlever un obstacle du chemin</p><p>5. Enseigner un savoir bénéfique</p><h3>Bienfaits</h3><p>Purifie l'âme, augmente les bénédictions, protège des calamités.</p>`,
                quizQuestions: generateSadaqahQuestions()
              }
            ]
          }
        ]
      },
      {
        titleEn: "The Pilgrimage (Hajj)",
        titleAr: "الحج",
        titleFr: "Le Pèlerinage (Hajj)",
        descriptionEn: "Understand the fifth pillar of Islam - the sacred journey to Makkah.",
        descriptionAr: "فهم الركن الخامس من أركان الإسلام - الرحلة المقدسة إلى مكة.",
        descriptionFr: "Comprendre le cinquième pilier de l'Islam - le voyage sacré à La Mecque.",
        lessons: [
          {
            titleEn: "Understanding Hajj",
            titleAr: "فهم الحج",
            titleFr: "Comprendre le Hajj",
            chapters: [
              {
                titleEn: "The Obligation of Hajj",
                titleAr: "وجوب الحج",
                titleFr: "L'Obligation du Hajj",
                contentEn: `<h2>The Fifth Pillar</h2><p>Hajj is the pilgrimage to Makkah, required once in a lifetime for those who are able.</p><h3>Conditions</h3><p>1. Being Muslim</p><p>2. Being sane</p><p>3. Being adult</p><p>4. Being free</p><p>5. Financial and physical ability</p><p>6. Safe journey</p><h3>Time</h3><p>Hajj occurs during Dhul Hijjah (8th-13th), the last month of the Islamic calendar.</p>`,
                contentAr: `<h2>الركن الخامس</h2><p>الحج هو الرحلة إلى مكة، واجب مرة في العمر لمن استطاع.</p><h3>الشروط</h3><p>1. الإسلام</p><p>2. العقل</p><p>3. البلوغ</p><p>4. الحرية</p><p>5. الاستطاعة المالية والبدنية</p><p>6. أمن الطريق</p><h3>الوقت</h3><p>يقع الحج في ذي الحجة (8-13)، آخر شهر في التقويم الإسلامي.</p>`,
                contentFr: `<h2>Le Cinquième Pilier</h2><p>Le Hajj est le pèlerinage à La Mecque, requis une fois dans la vie pour ceux qui peuvent.</p><h3>Conditions</h3><p>1. Être musulman</p><p>2. Être sain d'esprit</p><p>3. Être adulte</p><p>4. Être libre</p><p>5. Capacité financière et physique</p><p>6. Voyage sûr</p><h3>Temps</h3><p>Le Hajj a lieu pendant Dhul Hijjah (8-13).</p>`,
                quizQuestions: generateHajjObligationQuestions()
              },
              {
                titleEn: "The Rites of Hajj",
                titleAr: "مناسك الحج",
                titleFr: "Les Rites du Hajj",
                contentEn: `<h2>Hajj Rituals</h2><h3>Day 1 (8th Dhul Hijjah)</h3><p>Enter Ihram, go to Mina, pray five prayers.</p><h3>Day 2 (9th Dhul Hijjah - Day of Arafah)</h3><p>Stand at Arafah from noon to sunset - the most important pillar.</p><h3>Day 3 (10th Dhul Hijjah - Eid)</h3><p>Stone Jamarat al-Aqaba, sacrifice animal, shave head, Tawaf al-Ifadah.</p><h3>Days 4-6</h3><p>Stay in Mina, stone all three Jamarat each day, Tawaf al-Wada before leaving.</p>`,
                contentAr: `<h2>مناسك الحج</h2><h3>اليوم الأول (8 ذو الحجة)</h3><p>الإحرام، الذهاب إلى منى، صلاة الصلوات الخمس.</p><h3>اليوم الثاني (9 ذو الحجة - يوم عرفة)</h3><p>الوقوف بعرفة من الظهر إلى الغروب - أهم ركن.</p><h3>اليوم الثالث (10 ذو الحجة - العيد)</h3><p>رمي جمرة العقبة، ذبح الأضحية، حلق الرأس، طواف الإفاضة.</p><h3>الأيام 4-6</h3><p>البقاء في منى، رمي الجمرات الثلاث كل يوم، طواف الوداع قبل المغادرة.</p>`,
                contentFr: `<h2>Rituels du Hajj</h2><h3>Jour 1 (8 Dhul Hijjah)</h3><p>Entrer en Ihram, aller à Mina, prier cinq prières.</p><h3>Jour 2 (9 Dhul Hijjah - Jour d'Arafah)</h3><p>Se tenir à Arafah de midi au coucher du soleil - le pilier le plus important.</p><h3>Jour 3 (10 Dhul Hijjah - Eid)</h3><p>Lapider Jamarat al-Aqaba, sacrifier un animal, se raser la tête, Tawaf al-Ifadah.</p><h3>Jours 4-6</h3><p>Rester à Mina, lapider les trois Jamarat chaque jour, Tawaf al-Wada avant de partir.</p>`,
                quizQuestions: generateHajjRitesQuestions()
              },
              {
                titleEn: "Umrah - The Lesser Pilgrimage",
                titleAr: "العمرة - الحج الأصغر",
                titleFr: "Umrah - Le Petit Pèlerinage",
                contentEn: `<h2>Understanding Umrah</h2><p>Umrah is the lesser pilgrimage that can be performed at any time of the year.</p><h3>Steps of Umrah</h3><p>1. Enter Ihram at the Miqat</p><p>2. Perform Tawaf (7 circuits around the Kaaba)</p><p>3. Pray 2 rakaat at Maqam Ibrahim</p><p>4. Perform Sa'i (walking between Safa and Marwah 7 times)</p><p>5. Shave or cut hair</p><h3>Difference from Hajj</h3><p>Umrah doesn't include standing at Arafah, staying at Mina and Muzdalifah, or stoning the Jamarat.</p>`,
                contentAr: `<h2>فهم العمرة</h2><p>العمرة هي الحج الأصغر ويمكن أداؤها في أي وقت من السنة.</p><h3>خطوات العمرة</h3><p>1. الإحرام من الميقات</p><p>2. الطواف (7 أشواط حول الكعبة)</p><p>3. صلاة ركعتين عند مقام إبراهيم</p><p>4. السعي (المشي بين الصفا والمروة 7 مرات)</p><p>5. حلق أو قص الشعر</p><h3>الفرق عن الحج</h3><p>العمرة لا تشمل الوقوف بعرفة أو البقاء بمنى ومزدلفة أو رمي الجمرات.</p>`,
                contentFr: `<h2>Comprendre Umrah</h2><p>Umrah est le petit pèlerinage qui peut être effectué à tout moment de l'année.</p><h3>Étapes de Umrah</h3><p>1. Entrer en Ihram au Miqat</p><p>2. Effectuer le Tawaf (7 tours autour de la Kaaba)</p><p>3. Prier 2 rakaat au Maqam Ibrahim</p><p>4. Effectuer le Sa'i (marcher entre Safa et Marwah 7 fois)</p><p>5. Se raser ou couper les cheveux</p><h3>Différence avec le Hajj</h3><p>Umrah n'inclut pas Arafah, Mina, Muzdalifah ou lapider les Jamarat.</p>`,
                quizQuestions: generateUmrahQuestions()
              },
              {
                titleEn: "The Sacred Sites",
                titleAr: "المواقع المقدسة",
                titleFr: "Les Sites Sacrés",
                contentEn: `<h2>Sacred Sites in Hajj</h2><h3>The Kaaba</h3><p>The first house of worship built by Prophet Ibrahim. Muslims face it in prayer and perform Tawaf around it.</p><h3>Mount Arafah</h3><p>Where pilgrims gather on the 9th of Dhul Hijjah. The Prophet gave his Farewell Sermon here.</p><h3>Muzdalifah</h3><p>Where pilgrims stay the night after Arafah and collect pebbles for stoning.</p><h3>Mina</h3><p>Where pilgrims stay during the days of Tashreeq and perform the stoning of the Jamarat.</p>`,
                contentAr: `<h2>المواقع المقدسة في الحج</h2><h3>الكعبة</h3><p>أول بيت عبادة بناه النبي إبراهيم. يتوجه إليها المسلمون في الصلاة ويطوفون حولها.</p><h3>جبل عرفة</h3><p>حيث يجتمع الحجاج في التاسع من ذي الحجة. ألقى النبي هنا خطبة الوداع.</p><h3>مزدلفة</h3><p>حيث يبيت الحجاج بعد عرفة ويجمعون الحصى للرمي.</p><h3>منى</h3><p>حيث يقيم الحجاج أيام التشريق ويرمون الجمرات.</p>`,
                contentFr: `<h2>Sites Sacrés du Hajj</h2><h3>La Kaaba</h3><p>La première maison d'adoration construite par le Prophète Ibrahim. Les musulmans lui font face dans la prière.</p><h3>Mont Arafah</h3><p>Où les pèlerins se rassemblent le 9 Dhul Hijjah. Le Prophète a donné son Sermon d'Adieu ici.</p><h3>Muzdalifah</h3><p>Où les pèlerins passent la nuit après Arafah et collectent des cailloux.</p><h3>Mina</h3><p>Où les pèlerins séjournent pendant les jours de Tashreeq et lapident les Jamarat.</p>`,
                quizQuestions: generateSacredSitesQuestions()
              }
            ]
          }
        ]
      },
      {
        titleEn: "Islamic Ethics and Manners",
        titleAr: "الأخلاق والآداب الإسلامية",
        titleFr: "Éthique et Manières Islamiques",
        descriptionEn: "Develop noble character traits and learn the manners taught by Prophet Muhammad.",
        descriptionAr: "طور صفات الشخصية النبيلة وتعلم الآداب التي علمها النبي محمد.",
        descriptionFr: "Développez des traits de caractère nobles et apprenez les manières enseignées par le Prophète Muhammad.",
        lessons: [
          {
            titleEn: "Character Development",
            titleAr: "تطوير الشخصية",
            titleFr: "Développement du Caractère",
            chapters: [
              {
                titleEn: "Truthfulness and Honesty",
                titleAr: "الصدق والأمانة",
                titleFr: "Véracité et Honnêteté",
                contentEn: `<h2>The Importance of Truth</h2><p>The Prophet said: "Truthfulness leads to righteousness, and righteousness leads to Paradise."</p><h3>Forms of Truthfulness</h3><p>1. Truth in speech - saying what is accurate</p><p>2. Truth in actions - doing what you say</p><p>3. Truth in intentions - being sincere</p><h3>Benefits</h3><p>Builds trust, strengthens relationships, brings peace of mind, and earns Allah's pleasure.</p>`,
                contentAr: `<h2>أهمية الصدق</h2><p>قال النبي: "الصدق يهدي إلى البر والبر يهدي إلى الجنة."</p><h3>أشكال الصدق</h3><p>1. الصدق في القول - قول ما هو صحيح</p><p>2. الصدق في الفعل - فعل ما تقول</p><p>3. الصدق في النية - الإخلاص</p><h3>الفوائد</h3><p>يبني الثقة، يقوي العلاقات، يجلب راحة البال، ويكسب رضا الله.</p>`,
                contentFr: `<h2>L'Importance de la Vérité</h2><p>Le Prophète a dit: "La véracité mène à la droiture, et la droiture mène au Paradis."</p><h3>Formes de Véracité</h3><p>1. Vérité dans la parole</p><p>2. Vérité dans les actions</p><p>3. Vérité dans les intentions</p><h3>Bienfaits</h3><p>Construit la confiance, renforce les relations, apporte la paix d'esprit.</p>`,
                quizQuestions: generateTruthfulnessQuestions()
              },
              {
                titleEn: "Patience and Gratitude",
                titleAr: "الصبر والشكر",
                titleFr: "Patience et Gratitude",
                contentEn: `<h2>Patience (Sabr)</h2><p>Patience is mentioned over 90 times in the Quran. It involves enduring hardship, avoiding sins, and persisting in worship.</p><h3>Types of Patience</h3><p>1. Patience in obedience to Allah</p><p>2. Patience in avoiding sins</p><p>3. Patience with Allah's decree</p><h2>Gratitude (Shukr)</h2><p>Being thankful to Allah increases blessings: "If you are grateful, I will surely increase you." (Quran 14:7)</p>`,
                contentAr: `<h2>الصبر</h2><p>ذُكر الصبر أكثر من 90 مرة في القرآن. يشمل تحمل المشقة، وتجنب المعاصي، والمثابرة على العبادة.</p><h3>أنواع الصبر</h3><p>1. الصبر على طاعة الله</p><p>2. الصبر عن المعاصي</p><p>3. الصبر على قضاء الله</p><h2>الشكر</h2><p>الشكر لله يزيد النعم: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ" (إبراهيم: 7)</p>`,
                contentFr: `<h2>Patience (Sabr)</h2><p>La patience est mentionnée plus de 90 fois dans le Coran. Elle implique endurer les difficultés, éviter les péchés et persister dans l'adoration.</p><h3>Types de Patience</h3><p>1. Patience dans l'obéissance à Allah</p><p>2. Patience à éviter les péchés</p><p>3. Patience avec le décret d'Allah</p><h2>Gratitude (Shukr)</h2><p>Être reconnaissant envers Allah augmente les bénédictions.</p>`,
                quizQuestions: generatePatienceGratitudeQuestions()
              },
              {
                titleEn: "Humility and Modesty",
                titleAr: "التواضع والحياء",
                titleFr: "Humilité et Modestie",
                contentEn: `<h2>Humility (Tawadu)</h2><p>The Prophet said: "Whoever is humble for Allah's sake, Allah will elevate them."</p><h3>Signs of Humility</h3><p>1. Not looking down on others</p><p>2. Accepting truth from anyone</p><p>3. Being easy-going with people</p><h2>Modesty (Haya)</h2><p>The Prophet said: "Modesty is a branch of faith." It involves shame from doing wrong and preserving dignity.</p>`,
                contentAr: `<h2>التواضع</h2><p>قال النبي: "من تواضع لله رفعه الله."</p><h3>علامات التواضع</h3><p>1. عدم احتقار الآخرين</p><p>2. قبول الحق من أي شخص</p><p>3. السهولة مع الناس</p><h2>الحياء</h2><p>قال النبي: "الحياء شعبة من الإيمان." يشمل الخجل من فعل الخطأ وحفظ الكرامة.</p>`,
                contentFr: `<h2>Humilité (Tawadu)</h2><p>Le Prophète a dit: "Quiconque est humble pour Allah, Allah l'élèvera."</p><h3>Signes d'Humilité</h3><p>1. Ne pas mépriser les autres</p><p>2. Accepter la vérité de quiconque</p><p>3. Être facile à vivre</p><h2>Modestie (Haya)</h2><p>Le Prophète a dit: "La modestie est une branche de la foi."</p>`,
                quizQuestions: generateHumilityQuestions()
              },
              {
                titleEn: "Rights of Others",
                titleAr: "حقوق الآخرين",
                titleFr: "Droits des Autres",
                contentEn: `<h2>Fulfilling Rights</h2><p>Islam emphasizes fulfilling the rights of others, including:</p><h3>Rights of Parents</h3><p>Obedience, kindness, respect, and caring for them in old age.</p><h3>Rights of Neighbors</h3><p>Not harming them, being kind, and sharing food.</p><h3>Rights of Muslims</h3><p>Returning greetings, visiting the sick, following funerals, accepting invitations, and saying "yarhamuk Allah" when someone sneezes.</p>`,
                contentAr: `<h2>أداء الحقوق</h2><p>يؤكد الإسلام على أداء حقوق الآخرين، بما في ذلك:</p><h3>حقوق الوالدين</h3><p>الطاعة، الإحسان، الاحترام، ورعايتهما في الكبر.</p><h3>حقوق الجيران</h3><p>عدم إيذائهم، الإحسان إليهم، ومشاركة الطعام.</p><h3>حقوق المسلمين</h3><p>رد السلام، عيادة المريض، اتباع الجنائز، إجابة الدعوة، والتشميت عند العطاس.</p>`,
                contentFr: `<h2>Accomplir les Droits</h2><p>L'Islam souligne l'accomplissement des droits des autres:</p><h3>Droits des Parents</h3><p>Obéissance, bonté, respect et prendre soin d'eux dans la vieillesse.</p><h3>Droits des Voisins</h3><p>Ne pas leur nuire, être gentil et partager la nourriture.</p><h3>Droits des Musulmans</h3><p>Répondre aux salutations, visiter les malades, suivre les funérailles.</p>`,
                quizQuestions: generateRightsQuestions()
              }
            ]
          }
        ]
      }
    ]
  },
  {
    titleEn: "Arabic Language Fundamentals",
    titleAr: "أساسيات اللغة العربية",
    titleFr: "Fondamentaux de la Langue Arabe",
    descriptionEn: "Master the Arabic language from alphabet to advanced grammar, enabling you to understand the Quran and Islamic texts.",
    descriptionAr: "أتقن اللغة العربية من الحروف إلى القواعد المتقدمة، لتمكينك من فهم القرآن والنصوص الإسلامية.",
    descriptionFr: "Maîtrisez la langue arabe de l'alphabet à la grammaire avancée, vous permettant de comprendre le Coran et les textes islamiques.",
    courses: [
      {
        titleEn: "Arabic Alphabet and Pronunciation",
        titleAr: "الحروف العربية والنطق",
        titleFr: "Alphabet Arabe et Prononciation",
        descriptionEn: "Learn the 28 letters of Arabic, their sounds, and how to connect them.",
        descriptionAr: "تعلم الحروف العربية الـ 28، وأصواتها، وكيفية ربطها.",
        descriptionFr: "Apprenez les 28 lettres de l'arabe, leurs sons et comment les connecter.",
        lessons: [
          {
            titleEn: "Introduction to Arabic Letters",
            titleAr: "مقدمة في الحروف العربية",
            titleFr: "Introduction aux Lettres Arabes",
            chapters: [
              {
                titleEn: "The First Group of Letters",
                titleAr: "المجموعة الأولى من الحروف",
                titleFr: "Le Premier Groupe de Lettres",
                contentEn: `<h2>Arabic Alphabet Overview</h2><p>Arabic has 28 letters, written from right to left. Each letter has different forms based on its position.</p><h3>Letters 1-7</h3><p><strong>Alif (ا):</strong> A tall vertical line</p><p><strong>Ba (ب):</strong> A boat shape with one dot below</p><p><strong>Ta (ت):</strong> Like Ba with two dots above</p><p><strong>Tha (ث):</strong> Like Ba with three dots above</p><p><strong>Jim (ج):</strong> A curved letter with a dot in the middle</p><p><strong>Ha (ح):</strong> Like Jim but without the dot</p><p><strong>Kha (خ):</strong> Like Ha with a dot above</p>`,
                contentAr: `<h2>نظرة عامة على الحروف العربية</h2><p>العربية تحتوي على 28 حرفاً، تُكتب من اليمين إلى اليسار. لكل حرف أشكال مختلفة حسب موقعه.</p><h3>الحروف 1-7</h3><p><strong>الألف (ا):</strong> خط عمودي طويل</p><p><strong>الباء (ب):</strong> شكل القارب مع نقطة تحت</p><p><strong>التاء (ت):</strong> مثل الباء مع نقطتين فوق</p><p><strong>الثاء (ث):</strong> مثل الباء مع ثلاث نقاط فوق</p><p><strong>الجيم (ج):</strong> حرف منحني مع نقطة في الوسط</p><p><strong>الحاء (ح):</strong> مثل الجيم بدون نقطة</p><p><strong>الخاء (خ):</strong> مثل الحاء مع نقطة فوق</p>`,
                contentFr: `<h2>Aperçu de l'Alphabet Arabe</h2><p>L'arabe a 28 lettres, écrites de droite à gauche. Chaque lettre a des formes différentes selon sa position.</p><h3>Lettres 1-7</h3><p><strong>Alif (ا):</strong> Une ligne verticale haute</p><p><strong>Ba (ب):</strong> Forme de bateau avec un point en dessous</p><p><strong>Ta (ت):</strong> Comme Ba avec deux points au-dessus</p><p><strong>Tha (ث):</strong> Comme Ba avec trois points au-dessus</p><p><strong>Jim (ج):</strong> Lettre courbée avec un point au milieu</p><p><strong>Ha (ح):</strong> Comme Jim mais sans point</p><p><strong>Kha (خ):</strong> Comme Ha avec un point au-dessus</p>`,
                quizQuestions: generateArabicLetters1Questions()
              },
              {
                titleEn: "The Second Group of Letters",
                titleAr: "المجموعة الثانية من الحروف",
                titleFr: "Le Deuxième Groupe de Lettres",
                contentEn: `<h2>Letters 8-14</h2><p><strong>Dal (د):</strong> A curved letter open on one side</p><p><strong>Dhal (ذ):</strong> Like Dal with a dot above</p><p><strong>Ra (ر):</strong> A small curved letter</p><p><strong>Zay (ز):</strong> Like Ra with a dot above</p><p><strong>Sin (س):</strong> Three teeth connected</p><p><strong>Shin (ش):</strong> Like Sin with three dots above</p><p><strong>Sad (ص):</strong> A rounded letter with a tail</p>`,
                contentAr: `<h2>الحروف 8-14</h2><p><strong>الدال (د):</strong> حرف منحني مفتوح من جهة</p><p><strong>الذال (ذ):</strong> مثل الدال مع نقطة فوق</p><p><strong>الراء (ر):</strong> حرف صغير منحني</p><p><strong>الزاي (ز):</strong> مثل الراء مع نقطة فوق</p><p><strong>السين (س):</strong> ثلاث أسنان متصلة</p><p><strong>الشين (ش):</strong> مثل السين مع ثلاث نقاط فوق</p><p><strong>الصاد (ص):</strong> حرف مستدير مع ذيل</p>`,
                contentFr: `<h2>Lettres 8-14</h2><p><strong>Dal (د):</strong> Lettre courbée ouverte d'un côté</p><p><strong>Dhal (ذ):</strong> Comme Dal avec un point au-dessus</p><p><strong>Ra (ر):</strong> Petite lettre courbée</p><p><strong>Zay (ز):</strong> Comme Ra avec un point au-dessus</p><p><strong>Sin (س):</strong> Trois dents connectées</p><p><strong>Shin (ش):</strong> Comme Sin avec trois points au-dessus</p><p><strong>Sad (ص):</strong> Lettre arrondie avec une queue</p>`,
                quizQuestions: generateArabicLetters2Questions()
              },
              {
                titleEn: "The Third Group of Letters",
                titleAr: "المجموعة الثالثة من الحروف",
                titleFr: "Le Troisième Groupe de Lettres",
                contentEn: `<h2>Letters 15-21</h2><p><strong>Dad (ض):</strong> Like Sad with a dot above</p><p><strong>Ta (ط):</strong> A vertical line with a loop</p><p><strong>Dha (ظ):</strong> Like Ta with a dot above</p><p><strong>Ayn (ع):</strong> A unique letter with a round shape</p><p><strong>Ghayn (غ):</strong> Like Ayn with a dot above</p><p><strong>Fa (ف):</strong> A loop with a dot above</p><p><strong>Qaf (ق):</strong> Like Fa with two dots above</p>`,
                contentAr: `<h2>الحروف 15-21</h2><p><strong>الضاد (ض):</strong> مثل الصاد مع نقطة فوق</p><p><strong>الطاء (ط):</strong> خط عمودي مع حلقة</p><p><strong>الظاء (ظ):</strong> مثل الطاء مع نقطة فوق</p><p><strong>العين (ع):</strong> حرف فريد بشكل مستدير</p><p><strong>الغين (غ):</strong> مثل العين مع نقطة فوق</p><p><strong>الفاء (ف):</strong> حلقة مع نقطة فوق</p><p><strong>القاف (ق):</strong> مثل الفاء مع نقطتين فوق</p>`,
                contentFr: `<h2>Lettres 15-21</h2><p><strong>Dad (ض):</strong> Comme Sad avec un point au-dessus</p><p><strong>Ta (ط):</strong> Ligne verticale avec une boucle</p><p><strong>Dha (ظ):</strong> Comme Ta avec un point au-dessus</p><p><strong>Ayn (ع):</strong> Lettre unique de forme ronde</p><p><strong>Ghayn (غ):</strong> Comme Ayn avec un point au-dessus</p><p><strong>Fa (ف):</strong> Boucle avec un point au-dessus</p><p><strong>Qaf (ق):</strong> Comme Fa avec deux points au-dessus</p>`,
                quizQuestions: generateArabicLetters3Questions()
              },
              {
                titleEn: "The Final Group of Letters",
                titleAr: "المجموعة الأخيرة من الحروف",
                titleFr: "Le Dernier Groupe de Lettres",
                contentEn: `<h2>Letters 22-28</h2><p><strong>Kaf (ك):</strong> A curved letter with a small stroke</p><p><strong>Lam (ل):</strong> A vertical line with a curve at top</p><p><strong>Mim (م):</strong> A closed loop with a tail</p><p><strong>Nun (ن):</strong> A bowl shape with a dot above</p><p><strong>Ha (ه):</strong> Various shapes depending on position</p><p><strong>Waw (و):</strong> A hook shape</p><p><strong>Ya (ي):</strong> A line curving below with two dots</p>`,
                contentAr: `<h2>الحروف 22-28</h2><p><strong>الكاف (ك):</strong> حرف منحني مع خط صغير</p><p><strong>اللام (ل):</strong> خط عمودي مع انحناء في الأعلى</p><p><strong>الميم (م):</strong> حلقة مغلقة مع ذيل</p><p><strong>النون (ن):</strong> شكل الوعاء مع نقطة فوق</p><p><strong>الهاء (ه):</strong> أشكال مختلفة حسب الموقع</p><p><strong>الواو (و):</strong> شكل الخطاف</p><p><strong>الياء (ي):</strong> خط منحني للأسفل مع نقطتين</p>`,
                contentFr: `<h2>Lettres 22-28</h2><p><strong>Kaf (ك):</strong> Lettre courbée avec un petit trait</p><p><strong>Lam (ل):</strong> Ligne verticale avec courbe en haut</p><p><strong>Mim (م):</strong> Boucle fermée avec queue</p><p><strong>Nun (ن):</strong> Forme de bol avec point au-dessus</p><p><strong>Ha (ه):</strong> Formes variées selon la position</p><p><strong>Waw (و):</strong> Forme de crochet</p><p><strong>Ya (ي):</strong> Ligne courbant en bas avec deux points</p>`,
                quizQuestions: generateArabicLetters4Questions()
              }
            ]
          }
        ]
      },
      {
        titleEn: "Arabic Vowels and Diacritics",
        titleAr: "الحركات والتشكيل",
        titleFr: "Voyelles Arabes et Diacritiques",
        descriptionEn: "Learn the vowel marks (harakat) that give letters their sounds.",
        descriptionAr: "تعلم علامات الحركات التي تعطي الحروف أصواتها.",
        descriptionFr: "Apprenez les marques de voyelles (harakat) qui donnent aux lettres leurs sons.",
        lessons: [
          {
            titleEn: "Short and Long Vowels",
            titleAr: "الحركات القصيرة والطويلة",
            titleFr: "Voyelles Courtes et Longues",
            chapters: [
              {
                titleEn: "Short Vowels (Harakat)",
                titleAr: "الحركات القصيرة",
                titleFr: "Voyelles Courtes (Harakat)",
                contentEn: `<h2>The Three Short Vowels</h2><p><strong>Fatha (ـَ):</strong> A small diagonal line above the letter, produces "a" sound.</p><p><strong>Kasra (ـِ):</strong> A small diagonal line below the letter, produces "i" sound.</p><p><strong>Damma (ـُ):</strong> A small waw shape above the letter, produces "u" sound.</p><h3>Sukun (ـْ)</h3><p>A small circle above a letter indicating no vowel - the letter is silent.</p>`,
                contentAr: `<h2>الحركات الثلاث القصيرة</h2><p><strong>الفتحة (ـَ):</strong> خط مائل صغير فوق الحرف، ينتج صوت "أ".</p><p><strong>الكسرة (ـِ):</strong> خط مائل صغير تحت الحرف، ينتج صوت "إ".</p><p><strong>الضمة (ـُ):</strong> شكل واو صغير فوق الحرف، ينتج صوت "أُ".</p><h3>السكون (ـْ)</h3><p>دائرة صغيرة فوق الحرف تدل على عدم وجود حركة - الحرف ساكن.</p>`,
                contentFr: `<h2>Les Trois Voyelles Courtes</h2><p><strong>Fatha (ـَ):</strong> Ligne diagonale au-dessus, produit le son "a".</p><p><strong>Kasra (ـِ):</strong> Ligne diagonale en dessous, produit le son "i".</p><p><strong>Damma (ـُ):</strong> Forme de petit waw au-dessus, produit le son "u".</p><h3>Sukun (ـْ)</h3><p>Petit cercle indiquant pas de voyelle.</p>`,
                quizQuestions: generateShortVowelsQuestions()
              },
              {
                titleEn: "Long Vowels",
                titleAr: "الحركات الطويلة",
                titleFr: "Voyelles Longues",
                contentEn: `<h2>Elongating Vowel Sounds</h2><p>Long vowels are created by combining short vowels with specific letters:</p><p><strong>Long A (آ):</strong> Fatha + Alif = "aa" sound</p><p><strong>Long I (ي):</strong> Kasra + Ya = "ee" sound</p><p><strong>Long U (و):</strong> Damma + Waw = "oo" sound</p><h3>Examples</h3><p>كِتَاب (kitaab - book), كَرِيم (kareem - generous), رَسُول (rasool - messenger)</p>`,
                contentAr: `<h2>إطالة أصوات الحركات</h2><p>الحركات الطويلة تُنشأ بدمج الحركات القصيرة مع حروف محددة:</p><p><strong>المد بالألف (آ):</strong> فتحة + ألف = صوت "آ"</p><p><strong>المد بالياء (ي):</strong> كسرة + ياء = صوت "إي"</p><p><strong>المد بالواو (و):</strong> ضمة + واو = صوت "أو"</p><h3>أمثلة</h3><p>كِتَاب، كَرِيم، رَسُول</p>`,
                contentFr: `<h2>Allonger les Sons des Voyelles</h2><p>Les voyelles longues sont créées en combinant voyelles courtes avec des lettres spécifiques:</p><p><strong>Long A (آ):</strong> Fatha + Alif = son "aa"</p><p><strong>Long I (ي):</strong> Kasra + Ya = son "ee"</p><p><strong>Long U (و):</strong> Damma + Waw = son "oo"</p><h3>Exemples</h3><p>كِتَاب (kitaab - livre), كَرِيم (kareem - généreux)</p>`,
                quizQuestions: generateLongVowelsQuestions()
              },
              {
                titleEn: "Tanween (Nunation)",
                titleAr: "التنوين",
                titleFr: "Tanween (Nunation)",
                contentEn: `<h2>What is Tanween?</h2><p>Tanween adds an "n" sound to the end of words. It's written as double vowel marks.</p><p><strong>Fathatan (ـً):</strong> Double fatha, produces "an" sound</p><p><strong>Kasratan (ـٍ):</strong> Double kasra, produces "in" sound</p><p><strong>Dammatan (ـٌ):</strong> Double damma, produces "un" sound</p><h3>Usage</h3><p>Tanween appears on indefinite nouns and adjectives at the end of sentences.</p>`,
                contentAr: `<h2>ما هو التنوين؟</h2><p>التنوين يضيف صوت "ن" في نهاية الكلمات. يُكتب كحركتين مزدوجتين.</p><p><strong>تنوين الفتح (ـً):</strong> فتحتان، ينتج صوت "أَن"</p><p><strong>تنوين الكسر (ـٍ):</strong> كسرتان، ينتج صوت "إِن"</p><p><strong>تنوين الضم (ـٌ):</strong> ضمتان، ينتج صوت "أُن"</p><h3>الاستخدام</h3><p>التنوين يظهر على الأسماء والصفات النكرة في نهاية الجمل.</p>`,
                contentFr: `<h2>Qu'est-ce que le Tanween?</h2><p>Le Tanween ajoute un son "n" à la fin des mots. Il s'écrit comme des marques de voyelles doubles.</p><p><strong>Fathatan (ـً):</strong> Double fatha, produit le son "an"</p><p><strong>Kasratan (ـٍ):</strong> Double kasra, produit le son "in"</p><p><strong>Dammatan (ـٌ):</strong> Double damma, produit le son "un"</p><h3>Usage</h3><p>Le Tanween apparaît sur les noms et adjectifs indéfinis.</p>`,
                quizQuestions: generateTanweenQuestions()
              },
              {
                titleEn: "Shadda (Gemination)",
                titleAr: "الشدة (التشديد)",
                titleFr: "Shadda (Gémination)",
                contentEn: `<h2>The Shadda Sign</h2><p>Shadda (ـّ) indicates that a letter is doubled or emphasized. The letter is pronounced twice.</p><h3>How it Works</h3><p>When you see shadda, think of two letters: first with sukun, second with a vowel.</p><p>Example: محمَّد (Muhammad) - the mim with shadda is like مْمَ</p><h3>Importance in Quran</h3><p>Pronouncing shadda correctly is essential for proper Quranic recitation.</p>`,
                contentAr: `<h2>علامة الشدة</h2><p>الشدة (ـّ) تدل على أن الحرف مضعّف أو مشدد. الحرف يُنطق مرتين.</p><h3>كيف تعمل</h3><p>عندما ترى الشدة، فكر في حرفين: الأول ساكن، والثاني متحرك.</p><p>مثال: محمَّد - الميم المشددة مثل مْمَ</p><h3>الأهمية في القرآن</h3><p>نطق الشدة بشكل صحيح ضروري للتلاوة الصحيحة.</p>`,
                contentFr: `<h2>Le Signe Shadda</h2><p>La Shadda (ـّ) indique qu'une lettre est doublée ou accentuée.</p><h3>Comment ça Marche</h3><p>Quand vous voyez shadda, pensez à deux lettres: première avec sukun, deuxième avec voyelle.</p><p>Exemple: محمَّد (Muhammad)</p><h3>Importance dans le Coran</h3><p>Prononcer la shadda correctement est essentiel pour la récitation coranique.</p>`,
                quizQuestions: generateShaddaQuestions()
              }
            ]
          }
        ]
      },
      {
        titleEn: "Basic Arabic Grammar",
        titleAr: "قواعد اللغة العربية الأساسية",
        titleFr: "Grammaire Arabe de Base",
        descriptionEn: "Learn the fundamentals of Arabic sentence structure and word types.",
        descriptionAr: "تعلم أساسيات بنية الجملة العربية وأنواع الكلمات.",
        descriptionFr: "Apprenez les fondamentaux de la structure des phrases arabes et des types de mots.",
        lessons: [
          {
            titleEn: "Word Types in Arabic",
            titleAr: "أنواع الكلمات في العربية",
            titleFr: "Types de Mots en Arabe",
            chapters: [
              {
                titleEn: "The Noun (Al-Ism)",
                titleAr: "الاسم",
                titleFr: "Le Nom (Al-Ism)",
                contentEn: `<h2>What is a Noun (Ism)?</h2><p>In Arabic, a noun (ism) is a word that refers to a person, place, thing, or idea, without indicating time.</p><h3>Signs of a Noun</h3><p>1. Accepts the definite article "Al" (ال)</p><p>2. Can have tanween</p><p>3. Can be preceded by a preposition</p><h3>Examples</h3><p>كتاب (kitab - book), مسجد (masjid - mosque), رجل (rajul - man)</p>`,
                contentAr: `<h2>ما هو الاسم؟</h2><p>في العربية، الاسم هو كلمة تدل على إنسان أو مكان أو شيء أو فكرة، دون الدلالة على زمن.</p><h3>علامات الاسم</h3><p>1. يقبل "ال" التعريف</p><p>2. يقبل التنوين</p><p>3. يمكن أن يسبقه حرف جر</p><h3>أمثلة</h3><p>كتاب، مسجد، رجل</p>`,
                contentFr: `<h2>Qu'est-ce qu'un Nom (Ism)?</h2><p>En arabe, un nom (ism) est un mot qui désigne une personne, un lieu, une chose ou une idée, sans indiquer le temps.</p><h3>Signes d'un Nom</h3><p>1. Accepte l'article défini "Al"</p><p>2. Peut avoir tanween</p><p>3. Peut être précédé d'une préposition</p><h3>Exemples</h3><p>كتاب (kitab - livre), مسجد (masjid - mosquée)</p>`,
                quizQuestions: generateNounQuestions()
              },
              {
                titleEn: "The Verb (Al-Fi'l)",
                titleAr: "الفعل",
                titleFr: "Le Verbe (Al-Fi'l)",
                contentEn: `<h2>What is a Verb (Fi'l)?</h2><p>A verb indicates an action or state that occurs in a specific time.</p><h3>Types of Verbs</h3><p><strong>Past (Madi):</strong> كَتَبَ (kataba - he wrote)</p><p><strong>Present (Mudari):</strong> يَكْتُبُ (yaktubu - he writes)</p><p><strong>Command (Amr):</strong> اُكْتُبْ (uktub - write!)</p><h3>Signs of a Verb</h3><p>Can be preceded by "قد" (qad), "س" (sa), or "سوف" (sawfa)</p>`,
                contentAr: `<h2>ما هو الفعل؟</h2><p>الفعل يدل على حدث أو حالة تحدث في زمن معين.</p><h3>أنواع الأفعال</h3><p><strong>الماضي:</strong> كَتَبَ</p><p><strong>المضارع:</strong> يَكْتُبُ</p><p><strong>الأمر:</strong> اُكْتُبْ</p><h3>علامات الفعل</h3><p>يمكن أن يسبقه "قد"، "س"، أو "سوف"</p>`,
                contentFr: `<h2>Qu'est-ce qu'un Verbe (Fi'l)?</h2><p>Un verbe indique une action ou un état qui se produit dans un temps spécifique.</p><h3>Types de Verbes</h3><p><strong>Passé (Madi):</strong> كَتَبَ (kataba - il a écrit)</p><p><strong>Présent (Mudari):</strong> يَكْتُبُ (yaktubu - il écrit)</p><p><strong>Impératif (Amr):</strong> اُكْتُبْ (uktub - écris!)</p>`,
                quizQuestions: generateVerbQuestions()
              },
              {
                titleEn: "The Particle (Al-Harf)",
                titleAr: "الحرف",
                titleFr: "La Particule (Al-Harf)",
                contentEn: `<h2>What is a Particle (Harf)?</h2><p>Particles are words that have meaning only when connected to other words.</p><h3>Common Particles</h3><p><strong>Prepositions:</strong> في (in), على (on), من (from), إلى (to)</p><p><strong>Conjunctions:</strong> و (and), ف (then), أو (or), لكن (but)</p><p><strong>Other:</strong> إن (indeed), لا (no/not), ما (what/not)</p>`,
                contentAr: `<h2>ما هو الحرف؟</h2><p>الحروف هي كلمات لها معنى فقط عندما تتصل بكلمات أخرى.</p><h3>الحروف الشائعة</h3><p><strong>حروف الجر:</strong> في، على، من، إلى</p><p><strong>حروف العطف:</strong> و، ف، أو، لكن</p><p><strong>أخرى:</strong> إن، لا، ما</p>`,
                contentFr: `<h2>Qu'est-ce qu'une Particule (Harf)?</h2><p>Les particules sont des mots qui n'ont de sens que lorsqu'ils sont connectés à d'autres mots.</p><h3>Particules Communes</h3><p><strong>Prépositions:</strong> في (dans), على (sur), من (de), إلى (à)</p><p><strong>Conjonctions:</strong> و (et), ف (puis), أو (ou), لكن (mais)</p>`,
                quizQuestions: generateParticleQuestions()
              },
              {
                titleEn: "Gender in Arabic",
                titleAr: "المذكر والمؤنث",
                titleFr: "Le Genre en Arabe",
                contentEn: `<h2>Masculine and Feminine</h2><p>Every noun in Arabic is either masculine or feminine.</p><h3>Signs of Feminine</h3><p>1. Ta Marbuta (ة): مدرسة (school), طالبة (female student)</p><p>2. Alif Mamduda (اء): صحراء (desert)</p><p>3. Alif Maqsura (ى): حُبلى (pregnant)</p><h3>Natural Gender</h3><p>Some words are feminine without these endings: أم (mother), شمس (sun), أرض (earth)</p>`,
                contentAr: `<h2>المذكر والمؤنث</h2><p>كل اسم في العربية إما مذكر أو مؤنث.</p><h3>علامات التأنيث</h3><p>1. التاء المربوطة (ة): مدرسة، طالبة</p><p>2. الألف الممدودة (اء): صحراء</p><p>3. الألف المقصورة (ى): حُبلى</p><h3>التأنيث الطبيعي</h3><p>بعض الكلمات مؤنثة بدون هذه العلامات: أم، شمس، أرض</p>`,
                contentFr: `<h2>Masculin et Féminin</h2><p>Chaque nom en arabe est soit masculin soit féminin.</p><h3>Signes du Féminin</h3><p>1. Ta Marbuta (ة): مدرسة (école), طالبة (étudiante)</p><p>2. Alif Mamduda (اء): صحراء (désert)</p><p>3. Alif Maqsura (ى): حُبلى (enceinte)</p><h3>Genre Naturel</h3><p>Certains mots sont féminins sans ces terminaisons: أم (mère), شمس (soleil)</p>`,
                quizQuestions: generateGenderQuestions()
              }
            ]
          }
        ]
      },
      {
        titleEn: "Common Arabic Vocabulary",
        titleAr: "المفردات العربية الشائعة",
        titleFr: "Vocabulaire Arabe Courant",
        descriptionEn: "Build your Arabic vocabulary with essential words for daily life and Islamic terms.",
        descriptionAr: "ابنِ مفرداتك العربية بالكلمات الأساسية للحياة اليومية والمصطلحات الإسلامية.",
        descriptionFr: "Construisez votre vocabulaire arabe avec des mots essentiels pour la vie quotidienne et les termes islamiques.",
        lessons: [
          {
            titleEn: "Essential Daily Words",
            titleAr: "الكلمات اليومية الأساسية",
            titleFr: "Mots Quotidiens Essentiels",
            chapters: [
              {
                titleEn: "Greetings and Responses",
                titleAr: "التحيات والردود",
                titleFr: "Salutations et Réponses",
                contentEn: `<h2>Common Greetings</h2><p><strong>السلام عليكم</strong> (As-salamu alaykum) - Peace be upon you</p><p><strong>وعليكم السلام</strong> (Wa alaykum as-salam) - And upon you peace</p><p><strong>صباح الخير</strong> (Sabah al-khayr) - Good morning</p><p><strong>مساء الخير</strong> (Masa' al-khayr) - Good evening</p><h3>Other Phrases</h3><p><strong>كيف حالك</strong> (Kayf haluk) - How are you?</p><p><strong>الحمد لله</strong> (Alhamdulillah) - Praise be to Allah</p><p><strong>جزاك الله خيرا</strong> (Jazak Allahu khairan) - May Allah reward you</p>`,
                contentAr: `<h2>التحيات الشائعة</h2><p><strong>السلام عليكم</strong> - تحية الإسلام</p><p><strong>وعليكم السلام</strong> - الرد على السلام</p><p><strong>صباح الخير</strong> - تحية الصباح</p><p><strong>مساء الخير</strong> - تحية المساء</p><h3>عبارات أخرى</h3><p><strong>كيف حالك</strong> - للسؤال عن الحال</p><p><strong>الحمد لله</strong> - للشكر</p><p><strong>جزاك الله خيرا</strong> - للدعاء بالخير</p>`,
                contentFr: `<h2>Salutations Communes</h2><p><strong>السلام عليكم</strong> (As-salamu alaykum) - La paix soit sur vous</p><p><strong>وعليكم السلام</strong> - Et sur vous la paix</p><p><strong>صباح الخير</strong> - Bonjour (matin)</p><p><strong>مساء الخير</strong> - Bonsoir</p><h3>Autres Phrases</h3><p><strong>كيف حالك</strong> - Comment allez-vous?</p><p><strong>الحمد لله</strong> - Louange à Allah</p>`,
                quizQuestions: generateGreetingsQuestions()
              },
              {
                titleEn: "Numbers and Time",
                titleAr: "الأرقام والوقت",
                titleFr: "Nombres et Temps",
                contentEn: `<h2>Arabic Numbers 1-10</h2><p>١ واحد (wahid), ٢ اثنان (ithnan), ٣ ثلاثة (thalatha), ٤ أربعة (arba'a), ٥ خمسة (khamsa), ٦ ستة (sitta), ٧ سبعة (sab'a), ٨ ثمانية (thamaniya), ٩ تسعة (tis'a), ١٠ عشرة (ashara)</p><h3>Time Words</h3><p><strong>يوم</strong> (yawm - day), <strong>أسبوع</strong> (usbu' - week), <strong>شهر</strong> (shahr - month), <strong>سنة</strong> (sana - year)</p><p><strong>صباح</strong> (sabah - morning), <strong>مساء</strong> (masa' - evening)</p>`,
                contentAr: `<h2>الأرقام العربية 1-10</h2><p>١ واحد، ٢ اثنان، ٣ ثلاثة، ٤ أربعة، ٥ خمسة، ٦ ستة، ٧ سبعة، ٨ ثمانية، ٩ تسعة، ١٠ عشرة</p><h3>كلمات الوقت</h3><p><strong>يوم</strong>، <strong>أسبوع</strong>، <strong>شهر</strong>، <strong>سنة</strong></p><p><strong>صباح</strong>، <strong>مساء</strong></p>`,
                contentFr: `<h2>Nombres Arabes 1-10</h2><p>١ واحد (un), ٢ اثنان (deux), ٣ ثلاثة (trois), ٤ أربعة (quatre), ٥ خمسة (cinq), ٦ ستة (six), ٧ سبعة (sept), ٨ ثمانية (huit), ٩ تسعة (neuf), ١٠ عشرة (dix)</p><h3>Mots de Temps</h3><p><strong>يوم</strong> (jour), <strong>أسبوع</strong> (semaine), <strong>شهر</strong> (mois), <strong>سنة</strong> (année)</p>`,
                quizQuestions: generateNumbersQuestions()
              },
              {
                titleEn: "Family Members",
                titleAr: "أفراد العائلة",
                titleFr: "Membres de la Famille",
                contentEn: `<h2>Family Vocabulary</h2><p><strong>أب</strong> (ab - father), <strong>أم</strong> (umm - mother)</p><p><strong>ابن</strong> (ibn - son), <strong>بنت</strong> (bint - daughter)</p><p><strong>أخ</strong> (akh - brother), <strong>أخت</strong> (ukht - sister)</p><p><strong>جد</strong> (jadd - grandfather), <strong>جدة</strong> (jadda - grandmother)</p><p><strong>عم</strong> (amm - paternal uncle), <strong>خال</strong> (khal - maternal uncle)</p><p><strong>زوج</strong> (zawj - husband), <strong>زوجة</strong> (zawja - wife)</p>`,
                contentAr: `<h2>مفردات العائلة</h2><p><strong>أب</strong>، <strong>أم</strong></p><p><strong>ابن</strong>، <strong>بنت</strong></p><p><strong>أخ</strong>، <strong>أخت</strong></p><p><strong>جد</strong>، <strong>جدة</strong></p><p><strong>عم</strong>، <strong>خال</strong></p><p><strong>زوج</strong>، <strong>زوجة</strong></p>`,
                contentFr: `<h2>Vocabulaire de la Famille</h2><p><strong>أب</strong> (père), <strong>أم</strong> (mère)</p><p><strong>ابن</strong> (fils), <strong>بنت</strong> (fille)</p><p><strong>أخ</strong> (frère), <strong>أخت</strong> (sœur)</p><p><strong>جد</strong> (grand-père), <strong>جدة</strong> (grand-mère)</p><p><strong>زوج</strong> (mari), <strong>زوجة</strong> (épouse)</p>`,
                quizQuestions: generateFamilyQuestions()
              },
              {
                titleEn: "Islamic Terms",
                titleAr: "المصطلحات الإسلامية",
                titleFr: "Termes Islamiques",
                contentEn: `<h2>Essential Islamic Vocabulary</h2><p><strong>الله</strong> (Allah - God)</p><p><strong>قرآن</strong> (Quran - The Holy Book)</p><p><strong>صلاة</strong> (Salah - Prayer)</p><p><strong>مسجد</strong> (Masjid - Mosque)</p><p><strong>رسول</strong> (Rasul - Messenger)</p><p><strong>نبي</strong> (Nabi - Prophet)</p><p><strong>جنة</strong> (Jannah - Paradise)</p><p><strong>حلال</strong> (Halal - Permissible)</p><p><strong>حرام</strong> (Haram - Forbidden)</p>`,
                contentAr: `<h2>المفردات الإسلامية الأساسية</h2><p><strong>الله</strong>، <strong>قرآن</strong>، <strong>صلاة</strong></p><p><strong>مسجد</strong>، <strong>رسول</strong>، <strong>نبي</strong></p><p><strong>جنة</strong>، <strong>حلال</strong>، <strong>حرام</strong></p>`,
                contentFr: `<h2>Vocabulaire Islamique Essentiel</h2><p><strong>الله</strong> (Allah - Dieu)</p><p><strong>قرآن</strong> (Coran)</p><p><strong>صلاة</strong> (Prière)</p><p><strong>مسجد</strong> (Mosquée)</p><p><strong>رسول</strong> (Messager)</p><p><strong>جنة</strong> (Paradis)</p><p><strong>حلال</strong> (Permis)</p><p><strong>حرام</strong> (Interdit)</p>`,
                quizQuestions: generateIslamicTermsQuestions()
              }
            ]
          }
        ]
      },
      {
        titleEn: "Reading Practice",
        titleAr: "تدريب القراءة",
        titleFr: "Pratique de Lecture",
        descriptionEn: "Practice reading Arabic texts including Quranic verses and hadith.",
        descriptionAr: "تدرب على قراءة النصوص العربية بما في ذلك الآيات القرآنية والأحاديث.",
        descriptionFr: "Pratiquez la lecture de textes arabes, y compris des versets coraniques et des hadiths.",
        lessons: [
          {
            titleEn: "Reading Simple Texts",
            titleAr: "قراءة النصوص البسيطة",
            titleFr: "Lecture de Textes Simples",
            chapters: [
              {
                titleEn: "Short Quranic Verses",
                titleAr: "آيات قرآنية قصيرة",
                titleFr: "Versets Coraniques Courts",
                contentEn: `<h2>Surah Al-Ikhlas</h2><p><strong>قُلْ هُوَ اللَّهُ أَحَدٌ</strong> (Say: He is Allah, the One)</p><p><strong>اللَّهُ الصَّمَدُ</strong> (Allah, the Eternal)</p><p><strong>لَمْ يَلِدْ وَلَمْ يُولَدْ</strong> (He neither begets nor was begotten)</p><p><strong>وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ</strong> (And there is none comparable to Him)</p><h3>Vocabulary</h3><p>أحد (One), الصمد (Eternal/Self-Sufficient), يلد (beget), كفو (comparable)</p>`,
                contentAr: `<h2>سورة الإخلاص</h2><p><strong>قُلْ هُوَ اللَّهُ أَحَدٌ</strong></p><p><strong>اللَّهُ الصَّمَدُ</strong></p><p><strong>لَمْ يَلِدْ وَلَمْ يُولَدْ</strong></p><p><strong>وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ</strong></p><h3>المفردات</h3><p>أحد، الصمد، يلد، كفو</p>`,
                contentFr: `<h2>Sourate Al-Ikhlas</h2><p><strong>قُلْ هُوَ اللَّهُ أَحَدٌ</strong> (Dis: Il est Allah, l'Unique)</p><p><strong>اللَّهُ الصَّمَدُ</strong> (Allah, l'Éternel)</p><p><strong>لَمْ يَلِدْ وَلَمْ يُولَدْ</strong> (Il n'a pas engendré et n'a pas été engendré)</p><p><strong>وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ</strong> (Et nul n'est égal à Lui)</p>`,
                quizQuestions: generateQuranicReadingQuestions()
              },
              {
                titleEn: "Short Prophetic Sayings",
                titleAr: "أحاديث نبوية قصيرة",
                titleFr: "Paroles Prophétiques Courtes",
                contentEn: `<h2>Famous Short Hadiths</h2><p><strong>الدِّينُ النَّصِيحَةُ</strong> (The religion is sincere advice)</p><p><strong>المُسْلِمُ مَنْ سَلِمَ المُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ</strong> (A Muslim is one from whose tongue and hand other Muslims are safe)</p><p><strong>لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ</strong> (None of you truly believes until he loves for his brother what he loves for himself)</p>`,
                contentAr: `<h2>أحاديث قصيرة مشهورة</h2><p><strong>الدِّينُ النَّصِيحَةُ</strong></p><p><strong>المُسْلِمُ مَنْ سَلِمَ المُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ</strong></p><p><strong>لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ</strong></p>`,
                contentFr: `<h2>Hadiths Courts Célèbres</h2><p><strong>الدِّينُ النَّصِيحَةُ</strong> (La religion est le conseil sincère)</p><p><strong>المُسْلِمُ مَنْ سَلِمَ المُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ</strong> (Un musulman est celui dont les autres musulmans sont à l'abri de sa langue et de sa main)</p>`,
                quizQuestions: generateHadithReadingQuestions()
              },
              {
                titleEn: "Daily Supplications (Duas)",
                titleAr: "الأدعية اليومية",
                titleFr: "Invocations Quotidiennes (Duas)",
                contentEn: `<h2>Essential Daily Duas</h2><p><strong>Before Eating:</strong> بِسْمِ اللهِ (In the name of Allah)</p><p><strong>After Eating:</strong> الحَمْدُ لِلَّهِ (Praise be to Allah)</p><p><strong>Before Sleeping:</strong> بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا (In Your name, O Allah, I die and I live)</p><p><strong>Upon Waking:</strong> الحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا (Praise be to Allah who gave us life after death)</p>`,
                contentAr: `<h2>الأدعية اليومية الأساسية</h2><p><strong>قبل الأكل:</strong> بِسْمِ اللهِ</p><p><strong>بعد الأكل:</strong> الحَمْدُ لِلَّهِ</p><p><strong>قبل النوم:</strong> بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا</p><p><strong>عند الاستيقاظ:</strong> الحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا</p>`,
                contentFr: `<h2>Duas Quotidiennes Essentielles</h2><p><strong>Avant de Manger:</strong> بِسْمِ اللهِ (Au nom d'Allah)</p><p><strong>Après Manger:</strong> الحَمْدُ لِلَّهِ (Louange à Allah)</p><p><strong>Avant de Dormir:</strong> بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا</p><p><strong>Au Réveil:</strong> الحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا</p>`,
                quizQuestions: generateDuaQuestions()
              },
              {
                titleEn: "Common Arabic Phrases",
                titleAr: "العبارات العربية الشائعة",
                titleFr: "Phrases Arabes Courantes",
                contentEn: `<h2>Phrases for Various Occasions</h2><p><strong>إن شاء الله</strong> (In sha Allah - If Allah wills)</p><p><strong>ما شاء الله</strong> (Ma sha Allah - What Allah has willed)</p><p><strong>سبحان الله</strong> (Subhan Allah - Glory be to Allah)</p><p><strong>الله أكبر</strong> (Allahu Akbar - Allah is the Greatest)</p><p><strong>لا حول ولا قوة إلا بالله</strong> (There is no power except with Allah)</p><p><strong>استغفر الله</strong> (Astaghfirullah - I seek Allah's forgiveness)</p>`,
                contentAr: `<h2>عبارات للمناسبات المختلفة</h2><p><strong>إن شاء الله</strong> - للمستقبل</p><p><strong>ما شاء الله</strong> - للإعجاب</p><p><strong>سبحان الله</strong> - للتسبيح</p><p><strong>الله أكبر</strong> - للتكبير</p><p><strong>لا حول ولا قوة إلا بالله</strong> - للاستعانة</p><p><strong>استغفر الله</strong> - للاستغفار</p>`,
                contentFr: `<h2>Phrases pour Diverses Occasions</h2><p><strong>إن شاء الله</strong> (Si Allah le veut)</p><p><strong>ما شاء الله</strong> (Ce qu'Allah a voulu)</p><p><strong>سبحان الله</strong> (Gloire à Allah)</p><p><strong>الله أكبر</strong> (Allah est le Plus Grand)</p><p><strong>استغفر الله</strong> (Je demande pardon à Allah)</p>`,
                quizQuestions: generatePhrasesQuestions()
              }
            ]
          }
        ]
      }
    ]
  }
];

function generateTawheedQuestions(): QuizQuestion[] {
  return [
    { en: "What is Tawheed?", ar: "ما هو التوحيد؟", fr: "Qu'est-ce que le Tawhid?", options: { en: ["Belief in multiple gods", "Belief in the absolute oneness of Allah", "Belief in prophets", "Belief in angels"], ar: ["الإيمان بآلهة متعددة", "الإيمان بوحدانية الله المطلقة", "الإيمان بالأنبياء", "الإيمان بالملائكة"], fr: ["Croyance en plusieurs dieux", "Croyance en l'unicité absolue d'Allah", "Croyance aux prophètes", "Croyance aux anges"] }, correct: 1, explanationEn: "Tawheed means believing in the absolute oneness of Allah.", explanationAr: "التوحيد يعني الإيمان بوحدانية الله المطلقة.", explanationFr: "Le Tawhid signifie croire en l'unicité absolue d'Allah." },
    { en: "How many categories is Tawheed divided into?", ar: "إلى كم قسم ينقسم التوحيد؟", fr: "En combien de catégories le Tawhid est-il divisé?", options: { en: ["Two", "Three", "Four", "Five"], ar: ["اثنين", "ثلاثة", "أربعة", "خمسة"], fr: ["Deux", "Trois", "Quatre", "Cinq"] }, correct: 1, explanationEn: "Tawheed is divided into three categories.", explanationAr: "التوحيد ينقسم إلى ثلاثة أقسام.", explanationFr: "Le Tawhid est divisé en trois catégories." },
    { en: "What does Tawheed ar-Rububiyyah mean?", ar: "ماذا يعني توحيد الربوبية؟", fr: "Que signifie Tawhid ar-Rububiyyah?", options: { en: ["Oneness of Worship", "Oneness of Lordship", "Oneness of Names", "Oneness of Actions"], ar: ["توحيد العبادة", "توحيد الربوبية", "توحيد الأسماء", "توحيد الأفعال"], fr: ["Unicité de l'Adoration", "Unicité de la Seigneurie", "Unicité des Noms", "Unicité des Actions"] }, correct: 1, explanationEn: "Tawheed ar-Rububiyyah means believing Allah alone is the Creator and Sustainer.", explanationAr: "توحيد الربوبية يعني الإيمان بأن الله وحده هو الخالق والرازق.", explanationFr: "Tawhid ar-Rububiyyah signifie croire qu'Allah seul est le Créateur et le Soutien." },
    { en: "What is Tawheed al-Uluhiyyah about?", ar: "عن ماذا يتحدث توحيد الألوهية؟", fr: "De quoi parle Tawhid al-Uluhiyyah?", options: { en: ["Allah's creation", "Directing worship to Allah alone", "Allah's names", "The prophets"], ar: ["خلق الله", "توجيه العبادة لله وحده", "أسماء الله", "الأنبياء"], fr: ["La création d'Allah", "Diriger l'adoration vers Allah seul", "Les noms d'Allah", "Les prophètes"] }, correct: 1, explanationEn: "It means directing all worship exclusively to Allah.", explanationAr: "يعني توجيه جميع أعمال العبادة إلى الله وحده.", explanationFr: "Cela signifie diriger toute adoration exclusivement vers Allah." },
    { en: "What does 'La ilaha illa Allah' mean?", ar: "ماذا تعني 'لا إله إلا الله'؟", fr: "Que signifie 'La ilaha illa Allah'?", options: { en: ["Allah is great", "There is no deity worthy of worship except Allah", "Praise be to Allah", "Allah is merciful"], ar: ["الله أكبر", "لا معبود بحق إلا الله", "الحمد لله", "الله رحيم"], fr: ["Allah est grand", "Il n'y a de divinité digne d'adoration qu'Allah", "Louange à Allah", "Allah est miséricordieux"] }, correct: 1, explanationEn: "It means there is no deity worthy of worship except Allah.", explanationAr: "تعني لا معبود بحق إلا الله.", explanationFr: "Cela signifie qu'il n'y a de divinité digne d'adoration qu'Allah." },
    { en: "What does Tawheed al-Asma wa Sifat involve?", ar: "ماذا يتضمن توحيد الأسماء والصفات؟", fr: "Que comprend Tawhid al-Asma wa Sifat?", options: { en: ["Creating new names", "Believing in Allah's names as described in Quran", "Comparing Allah to creation", "Denying attributes"], ar: ["ابتداع أسماء جديدة", "الإيمان بأسماء الله كما وردت في القرآن", "تشبيه الله بالمخلوقات", "إنكار الصفات"], fr: ["Créer de nouveaux noms", "Croire aux noms d'Allah tels que décrits dans le Coran", "Comparer Allah à la création", "Nier les attributs"] }, correct: 1, explanationEn: "It involves believing in Allah's names as described in Quran and Sunnah.", explanationAr: "يتضمن الإيمان بأسماء الله كما وردت في القرآن والسنة.", explanationFr: "Cela implique de croire aux noms d'Allah tels que décrits dans le Coran et la Sunna." },
    { en: "Who has partners in His dominion according to Tawheed?", ar: "من له شركاء في ملكه حسب التوحيد؟", fr: "Qui a des partenaires dans Son domaine selon le Tawhid?", options: { en: ["Angels", "Prophets", "No one - Allah has no partners", "Saints"], ar: ["الملائكة", "الأنبياء", "لا أحد - الله ليس له شريك", "الأولياء"], fr: ["Les anges", "Les prophètes", "Personne - Allah n'a pas de partenaires", "Les saints"] }, correct: 2, explanationEn: "Allah has no partners in His dominion.", explanationAr: "الله ليس له شريك في ملكه.", explanationFr: "Allah n'a pas de partenaires dans Son domaine." },
    { en: "What should all devotional acts be directed to?", ar: "إلى من يجب أن توجه جميع الأعمال التعبدية؟", fr: "Vers qui tous les actes de dévotion doivent-ils être dirigés?", options: { en: ["To prophets", "To saints", "To Allah alone", "To angels"], ar: ["للأنبياء", "للأولياء", "لله وحده", "للملائكة"], fr: ["Aux prophètes", "Aux saints", "À Allah seul", "Aux anges"] }, correct: 2, explanationEn: "All devotional acts must be directed to Allah alone.", explanationAr: "يجب أن توجه جميع الأعمال التعبدية إلى الله وحده.", explanationFr: "Tous les actes de dévotion doivent être dirigés vers Allah seul." },
    { en: "What is the foundation of Islamic belief?", ar: "ما هو أساس العقيدة الإسلامية؟", fr: "Quel est le fondement de la croyance islamique?", options: { en: ["Prayer", "Fasting", "Tawheed", "Pilgrimage"], ar: ["الصلاة", "الصيام", "التوحيد", "الحج"], fr: ["La prière", "Le jeûne", "Le Tawhid", "Le pèlerinage"] }, correct: 2, explanationEn: "Tawheed is the foundation of Islamic belief.", explanationAr: "التوحيد هو أساس العقيدة الإسلامية.", explanationFr: "Le Tawhid est le fondement de la croyance islamique." },
    { en: "How should we understand Allah's attributes?", ar: "كيف يجب أن نفهم صفات الله؟", fr: "Comment devons-nous comprendre les attributs d'Allah?", options: { en: ["By comparing them to humans", "Without denial or distortion", "By denying some", "By creating our own interpretation"], ar: ["بمقارنتها بصفات البشر", "دون إنكار أو تحريف", "بإنكار بعضها", "بابتداع تفسيرنا الخاص"], fr: ["En les comparant aux humains", "Sans déni ou distorsion", "En niant certains", "En créant notre propre interprétation"] }, correct: 1, explanationEn: "We should believe in Allah's attributes without denial or distortion.", explanationAr: "يجب أن نؤمن بصفات الله دون إنكار أو تحريف.", explanationFr: "Nous devons croire aux attributs d'Allah sans déni ou distorsion." },
    { en: "What acts are included in worship (Ibadah)?", ar: "ما هي الأعمال المشمولة في العبادة؟", fr: "Quels actes sont inclus dans l'adoration?", options: { en: ["Only prayer", "Only fasting", "Prayer, fasting, supplication, and all devotional acts", "Only pilgrimage"], ar: ["الصلاة فقط", "الصيام فقط", "الصلاة والصيام والدعاء وجميع الأعمال التعبدية", "الحج فقط"], fr: ["Seulement la prière", "Seulement le jeûne", "La prière, le jeûne, l'invocation et tous les actes de dévotion", "Seulement le pèlerinage"] }, correct: 2, explanationEn: "Worship includes prayer, fasting, supplication, and all devotional acts.", explanationAr: "العبادة تشمل الصلاة والصيام والدعاء وجميع الأعمال التعبدية.", explanationFr: "L'adoration comprend la prière, le jeûne, l'invocation et tous les actes de dévotion." },
    { en: "What is the declaration of faith called?", ar: "ماذا تسمى شهادة الإيمان؟", fr: "Comment appelle-t-on la déclaration de foi?", options: { en: ["Salat", "Shahada", "Zakat", "Sawm"], ar: ["الصلاة", "الشهادة", "الزكاة", "الصوم"], fr: ["Salat", "Shahada", "Zakat", "Sawm"] }, correct: 1, explanationEn: "The declaration of faith is called Shahada.", explanationAr: "تسمى شهادة الإيمان بالشهادة.", explanationFr: "La déclaration de foi s'appelle Shahada." },
    { en: "Who is the Creator according to Tawheed ar-Rububiyyah?", ar: "من هو الخالق حسب توحيد الربوبية؟", fr: "Qui est le Créateur selon Tawhid ar-Rububiyyah?", options: { en: ["Angels", "Prophets", "Allah alone", "Nature"], ar: ["الملائكة", "الأنبياء", "الله وحده", "الطبيعة"], fr: ["Les anges", "Les prophètes", "Allah seul", "La nature"] }, correct: 2, explanationEn: "According to Tawheed ar-Rububiyyah, Allah alone is the Creator.", explanationAr: "حسب توحيد الربوبية، الله وحده هو الخالق.", explanationFr: "Selon Tawhid ar-Rububiyyah, Allah seul est le Créateur." },
    { en: "What sources describe Allah's names?", ar: "ما هي المصادر التي تصف أسماء الله؟", fr: "Quelles sources décrivent les noms d'Allah?", options: { en: ["Only the Quran", "Only the Sunnah", "The Quran and authentic Sunnah", "Human reasoning"], ar: ["القرآن فقط", "السنة فقط", "القرآن والسنة الصحيحة", "العقل البشري"], fr: ["Seulement le Coran", "Seulement la Sunna", "Le Coran et la Sunna authentique", "Le raisonnement humain"] }, correct: 2, explanationEn: "Allah's names are described in the Quran and authentic Sunnah.", explanationAr: "أسماء الله موصوفة في القرآن والسنة الصحيحة.", explanationFr: "Les noms d'Allah sont décrits dans le Coran et la Sunna authentique." },
    { en: "What does 'Sustainer' mean in Tawheed?", ar: "ماذا يعني 'الرازق' في التوحيد؟", fr: "Que signifie 'Soutien' dans le Tawhid?", options: { en: ["One who creates", "One who provides and maintains all existence", "One who destroys", "One who judges"], ar: ["الذي يخلق", "الذي يرزق ويحفظ كل الوجود", "الذي يدمر", "الذي يحكم"], fr: ["Celui qui crée", "Celui qui pourvoit et maintient toute existence", "Celui qui détruit", "Celui qui juge"] }, correct: 1, explanationEn: "Sustainer means the One who provides and maintains all existence.", explanationAr: "الرازق يعني الذي يرزق ويحفظ كل الوجود.", explanationFr: "Soutien signifie Celui qui pourvoit et maintient toute existence." },
    { en: "Can worship be directed to anyone other than Allah?", ar: "هل يمكن توجيه العبادة لغير الله؟", fr: "L'adoration peut-elle être dirigée vers quelqu'un d'autre qu'Allah?", options: { en: ["Yes, to prophets", "Yes, to saints", "No, only to Allah", "Yes, to angels"], ar: ["نعم، للأنبياء", "نعم، للأولياء", "لا، لله وحده", "نعم، للملائكة"], fr: ["Oui, aux prophètes", "Oui, aux saints", "Non, seulement à Allah", "Oui, aux anges"] }, correct: 2, explanationEn: "Worship can only be directed to Allah.", explanationAr: "العبادة يجب أن توجه لله وحده.", explanationFr: "L'adoration ne peut être dirigée que vers Allah." },
    { en: "What is the opposite of Tawheed?", ar: "ما هو عكس التوحيد؟", fr: "Quel est l'opposé du Tawhid?", options: { en: ["Iman (Faith)", "Shirk (Polytheism)", "Ihsan (Excellence)", "Tawbah (Repentance)"], ar: ["الإيمان", "الشرك", "الإحسان", "التوبة"], fr: ["Iman (Foi)", "Shirk (Polythéisme)", "Ihsan (Excellence)", "Tawbah (Repentance)"] }, correct: 1, explanationEn: "Shirk is the opposite of Tawheed.", explanationAr: "الشرك هو عكس التوحيد.", explanationFr: "Le Shirk est l'opposé du Tawhid." },
    { en: "What does 'Controller' mean in Tawheed ar-Rububiyyah?", ar: "ماذا يعني 'المدبر' في توحيد الربوبية؟", fr: "Que signifie 'Contrôleur' dans Tawhid ar-Rububiyyah?", options: { en: ["One who creates", "One who manages all affairs", "One who worships", "One who prays"], ar: ["الذي يخلق", "الذي يدير جميع الشؤون", "الذي يعبد", "الذي يصلي"], fr: ["Celui qui crée", "Celui qui gère toutes les affaires", "Celui qui adore", "Celui qui prie"] }, correct: 1, explanationEn: "Controller means the One who manages all affairs of creation.", explanationAr: "المدبر يعني الذي يدير جميع شؤون الخلق.", explanationFr: "Contrôleur signifie Celui qui gère toutes les affaires de la création." },
    { en: "Why is Tawheed the most important concept?", ar: "لماذا يعتبر التوحيد أهم مفهوم؟", fr: "Pourquoi le Tawhid est-il le concept le plus important?", options: { en: ["It's mentioned rarely", "It's the foundation of all beliefs", "It's optional", "It's only for scholars"], ar: ["لأنه يذكر نادراً", "لأنه أساس جميع المعتقدات", "لأنه اختياري", "لأنه للعلماء فقط"], fr: ["Il est rarement mentionné", "Il est le fondement de toutes les croyances", "Il est facultatif", "Il est réservé aux savants"] }, correct: 1, explanationEn: "Tawheed is the foundation of all Islamic beliefs.", explanationAr: "التوحيد هو أساس جميع المعتقدات الإسلامية.", explanationFr: "Le Tawhid est le fondement de toutes les croyances islamiques." },
    { en: "What are the three categories of Tawheed?", ar: "ما هي الأقسام الثلاثة للتوحيد؟", fr: "Quelles sont les trois catégories du Tawhid?", options: { en: ["Prayer, Fasting, Charity", "Rububiyyah, Uluhiyyah, Asma wa Sifat", "Faith, Action, Intention", "Creation, Destruction, Sustenance"], ar: ["الصلاة، الصيام، الزكاة", "الربوبية، الألوهية، الأسماء والصفات", "الإيمان، العمل، النية", "الخلق، الإفناء، الرزق"], fr: ["Prière, Jeûne, Charité", "Rububiyyah, Uluhiyyah, Asma wa Sifat", "Foi, Action, Intention", "Création, Destruction, Subsistance"] }, correct: 1, explanationEn: "The three categories are Rububiyyah, Uluhiyyah, and Asma wa Sifat.", explanationAr: "الأقسام الثلاثة هي الربوبية والألوهية والأسماء والصفات.", explanationFr: "Les trois catégories sont Rububiyyah, Uluhiyyah et Asma wa Sifat." }
  ];
}

function generateNamesAttributesQuestions(): QuizQuestion[] {
  return Array(20).fill(null).map((_, i) => ({
    en: `Names and Attributes Question ${i + 1}`,
    ar: `سؤال الأسماء والصفات ${i + 1}`,
    fr: `Question sur les Noms et Attributs ${i + 1}`,
    options: { en: ["Option A", "Option B", "Option C", "Option D"], ar: ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"], fr: ["Option A", "Option B", "Option C", "Option D"] },
    correct: i % 4,
    explanationEn: "This is the correct answer.",
    explanationAr: "هذه هي الإجابة الصحيحة.",
    explanationFr: "C'est la bonne réponse."
  }));
}

function generateEvidenceQuestions(): QuizQuestion[] {
  return Array(20).fill(null).map((_, i) => ({
    en: `Evidence for Allah's Existence Question ${i + 1}`,
    ar: `سؤال أدلة وجود الله ${i + 1}`,
    fr: `Question sur les Preuves de l'Existence d'Allah ${i + 1}`,
    options: { en: ["Option A", "Option B", "Option C", "Option D"], ar: ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"], fr: ["Option A", "Option B", "Option C", "Option D"] },
    correct: i % 4,
    explanationEn: "This is the correct answer.",
    explanationAr: "هذه هي الإجابة الصحيحة.",
    explanationFr: "C'est la bonne réponse."
  }));
}

function generateShirkQuestions(): QuizQuestion[] {
  return Array(20).fill(null).map((_, i) => ({
    en: `Shirk Concept Question ${i + 1}`,
    ar: `سؤال مفهوم الشرك ${i + 1}`,
    fr: `Question sur le Concept de Shirk ${i + 1}`,
    options: { en: ["Option A", "Option B", "Option C", "Option D"], ar: ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"], fr: ["Option A", "Option B", "Option C", "Option D"] },
    correct: i % 4,
    explanationEn: "This is the correct answer.",
    explanationAr: "هذه هي الإجابة الصحيحة.",
    explanationFr: "C'est la bonne réponse."
  }));
}

function generateShahadaQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generatePrayerImportanceQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generatePrayerStepsQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generatePrayerConditionsQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateRamadanVirtuesQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateFastingRulesQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateZakatQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateSadaqahQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateHajjObligationQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateHajjRitesQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateUmrahQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateSacredSitesQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateTruthfulnessQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generatePatienceGratitudeQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateHumilityQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateRightsQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateArabicLetters1Questions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateArabicLetters2Questions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateArabicLetters3Questions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateArabicLetters4Questions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateShortVowelsQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateLongVowelsQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateTanweenQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateShaddaQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateNounQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateVerbQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateParticleQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateGenderQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateGreetingsQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateNumbersQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateFamilyQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateIslamicTermsQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateQuranicReadingQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateHadithReadingQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generateDuaQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }
function generatePhrasesQuestions(): QuizQuestion[] { return generateNamesAttributesQuestions(); }

async function seedFixtureData() {
  console.log("Starting fixture data seeding...");
  
  let pathOrder = 0;
  for (const pathData of pathsData) {
    console.log(`Creating path: ${pathData.titleEn}`);
    
    const [createdPath] = await db.insert(paths).values({
      createdBy: ADMIN_USER_ID,
      titleEn: pathData.titleEn,
      titleAr: pathData.titleAr,
      titleFr: pathData.titleFr,
      descriptionEn: pathData.descriptionEn,
      descriptionAr: pathData.descriptionAr,
      descriptionFr: pathData.descriptionFr,
      isPublished: true,
      order: pathOrder++
    }).returning();
    
    let courseOrder = 0;
    for (const courseData of pathData.courses) {
      console.log(`  Creating course: ${courseData.titleEn}`);
      
      const [createdCourse] = await db.insert(courses).values({
        pathId: createdPath.id,
        createdBy: ADMIN_USER_ID,
        titleEn: courseData.titleEn,
        titleAr: courseData.titleAr,
        titleFr: courseData.titleFr,
        descriptionEn: courseData.descriptionEn,
        descriptionAr: courseData.descriptionAr,
        descriptionFr: courseData.descriptionFr,
        isPublished: true,
        order: courseOrder++
      }).returning();
      
      let lessonOrder = 0;
      for (const lessonData of courseData.lessons) {
        console.log(`    Creating lesson: ${lessonData.titleEn}`);
        
        const [createdLesson] = await db.insert(contentNodes).values({
          courseId: createdCourse.id,
          createdBy: ADMIN_USER_ID,
          nodeType: "lesson",
          depth: 0,
          titleEn: lessonData.titleEn,
          titleAr: lessonData.titleAr,
          titleFr: lessonData.titleFr,
          isPublished: true,
          order: lessonOrder++
        }).returning();
        
        let chapterOrder = 0;
        for (const chapterData of lessonData.chapters) {
          console.log(`      Creating chapter: ${chapterData.titleEn}`);
          
          const [createdChapter] = await db.insert(contentNodes).values({
            courseId: createdCourse.id,
            parentId: createdLesson.id,
            createdBy: ADMIN_USER_ID,
            nodeType: "chapter",
            depth: 1,
            titleEn: chapterData.titleEn,
            titleAr: chapterData.titleAr,
            titleFr: chapterData.titleFr,
            isPublished: true,
            order: chapterOrder++
          }).returning();
          
          await db.insert(contentNodes).values({
            courseId: createdCourse.id,
            parentId: createdChapter.id,
            createdBy: ADMIN_USER_ID,
            nodeType: "chapter_content",
            depth: 2,
            titleEn: chapterData.titleEn,
            titleAr: chapterData.titleAr,
            titleFr: chapterData.titleFr,
            contentType: "text",
            articleContentEn: chapterData.contentEn,
            articleContentAr: chapterData.contentAr,
            articleContentFr: chapterData.contentFr,
            isPublished: true,
            order: 0
          });
          
          const [createdQuiz] = await db.insert(quizzes).values({
            contentNodeId: createdChapter.id,
            courseId: createdCourse.id,
            titleEn: `Quiz: ${chapterData.titleEn}`,
            titleAr: `اختبار: ${chapterData.titleAr}`,
            titleFr: `Quiz: ${chapterData.titleFr}`,
            passingScore: 70,
            quizLevel: chapterOrder
          }).returning();
          
          let questionOrder = 0;
          for (const q of chapterData.quizQuestions) {
            await db.insert(questions).values({
              quizId: createdQuiz.id,
              difficultyLevel: 1,
              questionTextEn: q.en,
              questionTextAr: q.ar,
              questionTextFr: q.fr,
              optionsEn: q.options.en,
              optionsAr: q.options.ar,
              optionsFr: q.options.fr,
              correctAnswerIndex: q.correct,
              explanationEn: q.explanationEn,
              explanationAr: q.explanationAr,
              explanationFr: q.explanationFr,
              order: questionOrder++
            });
          }
          
          console.log(`        Created ${chapterData.quizQuestions.length} quiz questions`);
        }
      }
    }
  }
  
  console.log("Fixture data seeding completed!");
  process.exit(0);
}

seedFixtureData().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
