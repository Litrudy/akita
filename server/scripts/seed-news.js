'use strict';

/* Seed the two launch articles (from the company's official documents)
   into the news table. Safe to re-run: skips slugs that already exist.
   Usage: node scripts/seed-news.js  */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

const ARTICLES = [
  {
    slug: 'djibouti',
    position: 1,
    status: 'published',
    meta_label: 'JIB · DORALEH MULTIPURPOSE PORT',
    category_en: 'Network expansion',
    category_fr: 'Expansion du réseau',
    category_zh: '网络拓展',
    title_en: 'New business segment: Djibouti port cooperation',
    title_fr: 'Nouveau segment d’activité : coopération portuaire à Djibouti',
    title_zh: '新增业务版块：吉布提港口合作',
    subtitle_en: '',
    subtitle_fr: '',
    subtitle_zh: '',
    body_en: [
      'We are pleased to announce the launch of our new business segment in Djibouti through a strategic partnership with the local port group, jointly advancing multimodal transport and port-and-shipping development in the Horn of Africa. Leveraging the advanced infrastructure of the Doraleh Multipurpose Port (DMP), we now offer comprehensive port services covering container, bulk, breakbulk and RoRo operations.',
      'With six berths, 1,200 meters of quay line, a depth of 15.3 meters and seamless connection to the Djibouti–Addis Ababa railway, DMP significantly enhances cargo transit efficiency.',
      'This cooperation further strengthens our logistics network in East Africa, enabling faster, more stable and more competitive end-to-end solutions — accelerating the trade corridor between China and the African market.'
    ].join('\n\n'),
    body_fr: [
      'Nous sommes heureux d’annoncer le lancement de notre nouveau segment d’activité à Djibouti, dans le cadre d’un partenariat stratégique avec le groupe portuaire local, pour faire progresser ensemble le transport multimodal et le développement portuaire et maritime dans la Corne de l’Afrique. En nous appuyant sur les infrastructures avancées du port polyvalent de Doraleh (DMP), nous proposons désormais des services portuaires complets couvrant les opérations conteneurs, vrac, breakbulk et RoRo.',
      'Avec six postes à quai, 1 200 mètres de linéaire de quai, une profondeur de 15,3 mètres et une connexion directe au chemin de fer Djibouti–Addis-Abeba, le DMP améliore considérablement l’efficacité du transit des marchandises.',
      'Cette coopération renforce encore notre réseau logistique en Afrique de l’Est et nous permet d’offrir des solutions de bout en bout plus rapides, plus stables et plus compétitives — accélérant le corridor commercial entre la Chine et le marché africain.'
    ].join('\n\n'),
    body_zh: [
      '我们正式开拓吉布提业务版块，与当地港口集团建立战略合作关系，携手推进多式联运和非洲之角区域的港航发展。依托多雷勒多功能港（DMP）先进设施与卓越的吞吐能力，我们可为客户提供涵盖集装箱、散货、杂货、滚装等在内的全类型港口服务。',
      'DMP 拥有 6 个泊位、1,200 米码头线、15.3 米水深，并与吉-亚铁路无缝连接，可大幅提升货物中转效率。',
      '此次合作将进一步完善我们在东非的物流网络，为客户提供更高效、稳定且具竞争力的全链路解决方案，加速链接中国—非洲市场的商业通道。'
    ].join('\n\n'),
    facts: [
      '6 | 6 | 6 | Berths at DMP | Postes à quai au DMP | DMP 泊位数',
      '1,200 m | 1 200 m | 1,200 米 | Quay line | Linéaire de quai | 码头岸线',
      '15.3 m | 15,3 m | 15.3 米 | Water depth | Profondeur d’eau | 码头水深',
      'Rail | Rail | 铁路 | Djibouti–Addis Ababa link | Liaison Djibouti–Addis-Abeba | 吉布提—亚的斯亚贝巴铁路衔接'
    ].join('\n')
  },
  {
    slug: 'wbx',
    position: 2,
    status: 'published',
    meta_label: 'SHA · WBX WORLD BREAKBULK EXPO',
    category_en: 'Exhibitions & events',
    category_fr: 'Salons & événements',
    category_zh: '展会动态',
    title_en: 'AKITA GROUP to participate in WBX 2026 Shanghai',
    title_fr: 'AKITA GROUP participera au WBX 2026 à Shanghai',
    title_zh: '秋田集团确认参展 2026 上海 WBX 国际件杂货运输展',
    subtitle_en: '90-day countdown to the global breakbulk & project logistics event',
    subtitle_fr: 'J-90 avant le rendez-vous mondial du breakbulk et de la logistique de projet',
    subtitle_zh: '倒计时 90 天，共赴全球国际物流盛会',
    body_en: [
      'AKITA Group is pleased to confirm its participation in the WBX World Breakbulk Expo, to be held in Shanghai on March 19–20, 2026. With only 90 days remaining until the event, preparations are now well underway.',
      'WBX is one of the world’s leading exhibitions for breakbulk, project logistics and heavy-lift transportation, bringing together shipowners, port operators, EPC contractors and logistics service providers from around the globe — a key platform for industry exchange and international cooperation.',
      'At WBX 2026, AKITA Group will showcase its comprehensive capabilities in African port and shipping logistics, project logistics and heavy-equipment transportation — including its localized service network across Africa, proven experience in large-scale project execution, and integrated destination-port solutions. Through the WBX platform, the Group looks forward to engaging with global partners and exploring new opportunities in China–Africa logistics cooperation.',
      'Over the next 90 days, AKITA Group will continue to share updates related to the exhibition. We sincerely invite clients and partners worldwide to visit us at WBX 2026 and connect with us in person.'
    ].join('\n\n'),
    body_fr: [
      'Le Groupe AKITA a le plaisir de confirmer sa participation au WBX World Breakbulk Expo, qui se tiendra à Shanghai du 19 au 20 mars 2026. À seulement 90 jours de l’ouverture, les préparatifs avancent méthodiquement.',
      'Le WBX est l’un des principaux salons internationaux du breakbulk, de la logistique de projet et du transport de colis lourds. Il réunit armateurs, opérateurs portuaires, contractants d’ingénierie et prestataires logistiques du monde entier, et constitue une plateforme majeure d’échanges et de coopération du secteur.',
      'Au WBX 2026, le Groupe AKITA présentera ses capacités intégrées en logistique portuaire et maritime africaine, en logistique de projet et en transport d’équipements lourds — notamment son réseau de services localisé en Afrique, son expérience d’exécution de grands projets et ses solutions intégrées au port de destination. À travers la plateforme WBX, le Groupe souhaite approfondir les échanges avec ses partenaires mondiaux et explorer de nouvelles opportunités de coopération logistique Chine–Afrique.',
      'Au cours des 90 prochains jours, le Groupe AKITA partagera régulièrement les actualités liées au salon. Nous invitons sincèrement nos clients et partenaires du monde entier à venir nous rencontrer au WBX 2026.'
    ].join('\n\n'),
    body_zh: [
      '秋田集团正式确认，将参加于 2026 年 3 月 19–20 日在上海举办的 WBX World Breakbulk Expo。目前距离展会开幕仅剩 90 天，各项参展筹备工作正有序推进中。',
      'WBX 世界件杂货运输展是全球散货、工程物流与重型运输领域的重要国际展会，汇聚船东、港口运营商、工程承包商及物流服务商，是行业交流与合作的重要平台。',
      '本次参展，秋田集团将重点展示其在非洲港航物流、工程物流及重型设备运输领域的综合能力，包括在非洲属地化服务网络、大型项目物流执行经验以及目的港一体化解决方案。通过 WBX 平台，集团期待与全球合作伙伴深入交流，共同探索中非物流合作的新机遇。',
      '未来 90 天内，秋田集团将持续更新参展动态，诚邀全球客户与合作伙伴届时莅临展会，与我们面对面交流。'
    ].join('\n\n'),
    facts: [
      'Mar 19–20 | 19–20 mars | 3月19–20日 | 2026 · Shanghai | 2026 · Shanghai | 2026 年 · 上海',
      'WBX | WBX | WBX | World Breakbulk Expo | World Breakbulk Expo | 世界件杂货运输展',
      '90 | 90 | 90 | Day countdown underway | Jours avant l’ouverture | 天倒计时进行中'
    ].join('\n')
  }
];

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  for (const a of ARTICLES) {
    const [rows] = await conn.execute('SELECT id FROM news WHERE slug = ?', [a.slug]);
    if (rows.length) {
      console.log(`skip — "${a.slug}" already exists (id ${rows[0].id})`);
      continue;
    }
    await conn.execute(
      `INSERT INTO news (slug, position, status, meta_label,
         category_en, category_fr, category_zh,
         title_en, title_fr, title_zh,
         subtitle_en, subtitle_fr, subtitle_zh,
         body_en, body_fr, body_zh, facts, published_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, NOW())`,
      [a.slug, a.position, a.status, a.meta_label,
       a.category_en, a.category_fr, a.category_zh,
       a.title_en, a.title_fr, a.title_zh,
       a.subtitle_en, a.subtitle_fr, a.subtitle_zh,
       a.body_en, a.body_fr, a.body_zh, a.facts]);
    console.log(`seeded — "${a.slug}"`);
  }
  await conn.end();
}

main().catch(err => { console.error(err.message); process.exit(1); });
