// DEMO unit-cost library. Structure follows NABARD PLP Annexure-4 unit costs
// and KVIC model project profiles; values are illustrative for Barabanki.

export interface ActivitySize {
  id: string
  label: { en: string; hi: string }
  capex: number
  workingCapital: number
  capacityRevenue: number // ₹ per month at full capacity, average month
  variableCostPct: number
  fixedMonthly: number
  labourNeeded: number // persons
  depYears: number
}

export type Channel = 'milkCentre' | 'local' | 'trader'

export interface Activity {
  code: string
  name: { en: string; hi: string }
  sector: { en: string; hi: string }
  sizes: ActivitySize[]
  seasonality: number[] // Jan..Dec index, mean ≈ 1
  rampYear1: number
  price: { item: { en: string; hi: string }; low: number; high: number; suggested: number; unit: { en: string; hi: string }; costPerUnit: number }
  channel: Channel
  spendPerHH: number // ₹/month a household spends on this, locally captured
  competitorsPer1000Median: number
  channels: { en: string; hi: string }[]
  plantation?: boolean
  localUnit: { en: string; hi: string; price: number }
  training: { en: string; hi: string }
  risks: { en: string; hi: string }[]
}

const L = (en: string, hi: string) => ({ en, hi })

export const ACTIVITIES: Activity[] = [
  {
    code: 'dairy',
    name: L('Dairy (cows)', 'डेयरी (गाय)'),
    sector: L('Animal husbandry', 'पशुपालन'),
    sizes: [
      { id: 'dairy-2', label: L('2 cows', '2 गाय'), capex: 190000, workingCapital: 20000, capacityRevenue: 16400, variableCostPct: 0.55, fixedMonthly: 800, labourNeeded: 1, depYears: 10 },
      { id: 'dairy-4', label: L('4 cows', '4 गाय'), capex: 355000, workingCapital: 35000, capacityRevenue: 32800, variableCostPct: 0.55, fixedMonthly: 1500, labourNeeded: 2, depYears: 10 },
      { id: 'dairy-6', label: L('6 cows', '6 गाय'), capex: 520000, workingCapital: 50000, capacityRevenue: 49200, variableCostPct: 0.57, fixedMonthly: 2400, labourNeeded: 3, depYears: 10 },
      { id: 'dairy-10', label: L('10 cows', '10 गाय'), capex: 900000, workingCapital: 100000, capacityRevenue: 82000, variableCostPct: 0.56, fixedMonthly: 4500, labourNeeded: 3, depYears: 10 },
    ],
    seasonality: [1.12, 1.1, 1.02, 0.9, 0.82, 0.8, 0.88, 0.95, 1.0, 1.08, 1.15, 1.18],
    rampYear1: 0.85,
    price: { item: L('Milk (3.5% fat)', 'दूध (3.5% फैट)'), low: 34, high: 44, suggested: 38, unit: L('litre', 'लीटर'), costPerUnit: 21 },
    channel: 'milkCentre',
    spendPerHH: 650,
    competitorsPer1000Median: 2.0,
    channels: [L('Milk collection centre (Parag / co-op)', 'दूध संग्रह केंद्र (पराग / सहकारी)'), L('Direct to households', 'सीधे घरों में'), L('Sweet shops in Dewa', 'देवा की मिठाई दुकानें')],
    localUnit: { en: 'litres of milk', hi: 'लीटर दूध', price: 38 },
    training: L('RSETI Barabanki, 10-day dairy course', 'RSETI बाराबंकी, 10 दिन डेयरी कोर्स'),
    risks: [L('Lean milk months Apr–Jun', 'अप्रैल–जून में दूध कम'), L('Animal disease (LSD, FMD)', 'पशु रोग (LSD, खुरपका)'), L('Fodder price spikes', 'चारे के दाम बढ़ना')],
  },
  {
    code: 'goat',
    name: L('Goat rearing', 'बकरी पालन'),
    sector: L('Animal husbandry', 'पशुपालन'),
    sizes: [
      { id: 'goat-10', label: L('10 goats + 1 buck', '10 बकरी + 1 बकरा'), capex: 110000, workingCapital: 10000, capacityRevenue: 9800, variableCostPct: 0.3, fixedMonthly: 300, labourNeeded: 1, depYears: 6 },
      { id: 'goat-20', label: L('20 goats + 1 buck', '20 बकरी + 1 बकरा'), capex: 205000, workingCapital: 18000, capacityRevenue: 19000, variableCostPct: 0.32, fixedMonthly: 600, labourNeeded: 1, depYears: 6 },
      { id: 'goat-40', label: L('40 goats + 2 bucks', '40 बकरी + 2 बकरे'), capex: 400000, workingCapital: 35000, capacityRevenue: 36000, variableCostPct: 0.36, fixedMonthly: 1500, labourNeeded: 2, depYears: 6 },
    ],
    seasonality: [0.8, 0.8, 0.9, 1.0, 1.6, 1.8, 0.8, 0.7, 0.8, 1.2, 0.9, 0.7],
    rampYear1: 0.75,
    price: { item: L('Live goat (kid, 6 months)', 'बकरी का बच्चा (6 माह)'), low: 3800, high: 6500, suggested: 4800, unit: L('animal', 'पशु'), costPerUnit: 1500 },
    channel: 'trader',
    spendPerHH: 120,
    competitorsPer1000Median: 1.5,
    channels: [L('Weekly haat', 'साप्ताहिक हाट'), L('Traders before Bakrid', 'बकरीद से पहले व्यापारी')],
    localUnit: { en: 'goat kids', hi: 'बकरी के बच्चे', price: 4800 },
    training: L('KVK Barabanki goat module', 'KVK बाराबंकी बकरी पालन'),
    risks: [L('Sales bunched around festivals', 'बिक्री त्योहारों पर निर्भर'), L('PPR disease', 'PPR रोग')],
  },
  {
    code: 'kirana',
    name: L('Kirana shop', 'किराना दुकान'),
    sector: L('Retail', 'खुदरा'),
    sizes: [
      { id: 'kirana-s', label: L('Small counter', 'छोटी दुकान'), capex: 35000, workingCapital: 85000, capacityRevenue: 78000, variableCostPct: 0.88, fixedMonthly: 1200, labourNeeded: 1, depYears: 8 },
      { id: 'kirana-m', label: L('Medium store', 'मध्यम दुकान'), capex: 90000, workingCapital: 210000, capacityRevenue: 180000, variableCostPct: 0.885, fixedMonthly: 3500, labourNeeded: 2, depYears: 8 },
    ],
    seasonality: [0.95, 0.95, 1.05, 1.0, 1.05, 0.9, 0.85, 0.9, 0.95, 1.15, 1.2, 1.05],
    rampYear1: 0.8,
    price: { item: L('Gross margin on sales', 'बिक्री पर मार्जिन'), low: 8, high: 15, suggested: 12, unit: L('%', '%'), costPerUnit: 0 },
    channel: 'local',
    spendPerHH: 2600,
    competitorsPer1000Median: 3.2,
    channels: [L('Walk-in customers', 'गाँव के ग्राहक'), L('ONDC seller app (Phase 3)', 'ONDC सेलर ऐप')],
    localUnit: { en: 'rupees of sales a day', hi: 'रुपये रोज़ की बिक्री', price: 1 },
    training: L('PM-DAKSH retail management', 'PM-DAKSH खुदरा प्रबंधन'),
    risks: [L('Many shops already nearby', 'पास में पहले से कई दुकानें'), L('Credit (udhaar) to customers', 'ग्राहकों को उधार')],
  },
  {
    code: 'tailoring',
    name: L('Tailoring', 'सिलाई'),
    sector: L('Service', 'सेवा'),
    sizes: [
      { id: 'tailor-1', label: L('1 motorised machine', '1 मोटर मशीन'), capex: 42000, workingCapital: 18000, capacityRevenue: 13500, variableCostPct: 0.28, fixedMonthly: 500, labourNeeded: 1, depYears: 7 },
      { id: 'tailor-2', label: L('2 machines + embroidery', '2 मशीन + कढ़ाई'), capex: 72000, workingCapital: 28000, capacityRevenue: 22000, variableCostPct: 0.3, fixedMonthly: 900, labourNeeded: 2, depYears: 7 },
      { id: 'tailor-4', label: L('Stitching centre (4 machines)', 'सिलाई केंद्र (4 मशीन)'), capex: 150000, workingCapital: 50000, capacityRevenue: 42000, variableCostPct: 0.34, fixedMonthly: 2500, labourNeeded: 4, depYears: 7 },
    ],
    seasonality: [1.2, 1.1, 0.9, 1.0, 1.1, 0.8, 0.7, 0.7, 0.9, 1.3, 1.3, 1.0],
    rampYear1: 0.7,
    price: { item: L('Blouse / suit stitching', 'ब्लाउज़ / सूट सिलाई'), low: 120, high: 350, suggested: 200, unit: L('piece', 'पीस'), costPerUnit: 45 },
    channel: 'local',
    spendPerHH: 260,
    competitorsPer1000Median: 1.4,
    channels: [L('Village women, school uniforms', 'गाँव की महिलाएँ, स्कूल यूनिफ़ॉर्म'), L('Wedding season orders', 'शादी के सीज़न के ऑर्डर')],
    localUnit: { en: 'blouses stitched', hi: 'ब्लाउज़ सिलाई', price: 200 },
    training: L('PM-DAKSH tailoring (3 months)', 'PM-DAKSH सिलाई प्रशिक्षण (3 माह)'),
    risks: [L('Monsoon months are slow', 'बरसात में काम कम'), L('Ready-made clothes competition', 'रेडीमेड कपड़ों से मुकाबला')],
  },
  {
    code: 'mobile',
    name: L('Mobile repair', 'मोबाइल रिपेयर'),
    sector: L('Service', 'सेवा'),
    sizes: [
      { id: 'mobile-s', label: L('Repair counter', 'रिपेयर काउंटर'), capex: 45000, workingCapital: 35000, capacityRevenue: 19000, variableCostPct: 0.4, fixedMonthly: 1500, labourNeeded: 1, depYears: 5 },
      { id: 'mobile-m', label: L('Repair + accessories + recharge', 'रिपेयर + एक्सेसरी + रिचार्ज'), capex: 80000, workingCapital: 100000, capacityRevenue: 44000, variableCostPct: 0.55, fixedMonthly: 2500, labourNeeded: 1, depYears: 5 },
    ],
    seasonality: [1, 1, 1, 1, 1, 1, 0.95, 0.95, 1, 1.1, 1.1, 0.9],
    rampYear1: 0.75,
    price: { item: L('Screen / charging-port repair', 'स्क्रीन / चार्जिंग पोर्ट रिपेयर'), low: 250, high: 1200, suggested: 450, unit: L('job', 'काम'), costPerUnit: 220 },
    channel: 'local',
    spendPerHH: 140,
    competitorsPer1000Median: 0.5,
    channels: [L('Walk-in, near bank / bus stop', 'बैंक / बस स्टॉप के पास'), L('Weekly haat stall', 'हाट पर स्टॉल')],
    localUnit: { en: 'repairs', hi: 'रिपेयर', price: 450 },
    training: L('RSETI mobile repairing (30 days)', 'RSETI मोबाइल रिपेयरिंग (30 दिन)'),
    risks: [L('Needs real skill, cannot learn on the job', 'हुनर ज़रूरी, काम करते-करते नहीं सीख सकते'), L('Spare parts only in Dewa / Lucknow', 'पुर्ज़े सिर्फ़ देवा / लखनऊ में')],
  },
  {
    code: 'tea',
    name: L('Tea & snacks stall', 'चाय-नाश्ता स्टॉल'),
    sector: L('Food', 'खाद्य'),
    sizes: [
      { id: 'tea-s', label: L('Tea stall', 'चाय की दुकान'), capex: 30000, workingCapital: 15000, capacityRevenue: 26000, variableCostPct: 0.6, fixedMonthly: 800, labourNeeded: 1, depYears: 5 },
      { id: 'tea-m', label: L('Tea + snacks + sweets', 'चाय + नाश्ता + मिठाई'), capex: 80000, workingCapital: 35000, capacityRevenue: 58000, variableCostPct: 0.62, fixedMonthly: 3000, labourNeeded: 2, depYears: 5 },
    ],
    seasonality: [1.2, 1.1, 1.0, 0.9, 0.8, 0.8, 0.85, 0.9, 0.95, 1.1, 1.2, 1.2],
    rampYear1: 0.8,
    price: { item: L('Cup of tea', 'एक कप चाय'), low: 8, high: 15, suggested: 10, unit: L('cup', 'कप'), costPerUnit: 4 },
    channel: 'local',
    spendPerHH: 190,
    competitorsPer1000Median: 1.8,
    channels: [L('Bus stop / bank queue', 'बस स्टॉप / बैंक की लाइन'), L('Haat days', 'हाट के दिन')],
    localUnit: { en: 'cups of tea', hi: 'कप चाय', price: 10 },
    training: L('FSSAI basic food-safety registration', 'FSSAI खाद्य सुरक्षा पंजीकरण'),
    risks: [L('Location decides everything', 'जगह सबसे ज़रूरी'), L('Summer afternoons slow', 'गर्मी में दोपहर को धंधा कम')],
  },
  {
    code: 'chakki',
    name: L('Atta chakki (flour mill)', 'आटा चक्की'),
    sector: L('Agro-processing', 'कृषि प्रसंस्करण'),
    sizes: [
      { id: 'chakki-1', label: L('Chakki (10 HP)', 'चक्की (10 HP)'), capex: 210000, workingCapital: 20000, capacityRevenue: 26000, variableCostPct: 0.38, fixedMonthly: 1800, labourNeeded: 1, depYears: 10 },
      { id: 'chakki-2', label: L('Chakki + oil expeller', 'चक्की + तेल कोल्हू'), capex: 420000, workingCapital: 60000, capacityRevenue: 62000, variableCostPct: 0.52, fixedMonthly: 3500, labourNeeded: 2, depYears: 10 },
    ],
    seasonality: [0.9, 0.9, 1.0, 1.3, 1.3, 1.1, 0.9, 0.85, 0.85, 0.95, 1.0, 0.95],
    rampYear1: 0.8,
    price: { item: L('Wheat grinding charge', 'गेहूँ पिसाई'), low: 2.5, high: 4, suggested: 3, unit: L('kg', 'किलो'), costPerUnit: 1.1 },
    channel: 'local',
    spendPerHH: 160,
    competitorsPer1000Median: 0.6,
    channels: [L('Village households after harvest', 'फ़सल के बाद गाँव के घर'), L('Packed atta to kirana shops', 'किराना को पैक आटा')],
    localUnit: { en: 'kg of wheat ground', hi: 'किलो गेहूँ पिसाई', price: 3 },
    training: L('DIC / KVIC unit training', 'DIC / KVIC प्रशिक्षण'),
    risks: [L('3-phase power cuts', '3-फेज़ बिजली कटौती'), L('Packaged atta in bigger villages', 'बड़े गाँवों में पैकेट आटा')],
  },
  {
    code: 'poultry',
    name: L('Poultry (broiler)', 'मुर्गी पालन (ब्रॉयलर)'),
    sector: L('Animal husbandry', 'पशुपालन'),
    sizes: [
      { id: 'poultry-500', label: L('500 birds / batch', '500 मुर्गी / बैच'), capex: 150000, workingCapital: 70000, capacityRevenue: 41000, variableCostPct: 0.8, fixedMonthly: 1000, labourNeeded: 1, depYears: 8 },
      { id: 'poultry-1000', label: L('1,000 birds / batch', '1,000 मुर्गी / बैच'), capex: 260000, workingCapital: 130000, capacityRevenue: 82000, variableCostPct: 0.81, fixedMonthly: 1800, labourNeeded: 2, depYears: 8 },
    ],
    seasonality: [1.1, 1.0, 1.0, 0.9, 0.8, 0.8, 0.8, 0.9, 1.0, 1.2, 1.3, 1.2],
    rampYear1: 0.75,
    price: { item: L('Live broiler', 'ज़िंदा ब्रॉयलर'), low: 85, high: 130, suggested: 105, unit: L('kg', 'किलो'), costPerUnit: 84 },
    channel: 'trader',
    spendPerHH: 350,
    competitorsPer1000Median: 0.3,
    channels: [L('Integrator buy-back contract', 'इंटीग्रेटर बाय-बैक'), L('Local meat shops', 'स्थानीय मीट दुकानें')],
    localUnit: { en: 'kg of chicken', hi: 'किलो चिकन', price: 105 },
    training: L('KVK poultry management', 'KVK मुर्गी पालन प्रशिक्षण'),
    risks: [L('Bird flu scares crash prices', 'बर्ड फ़्लू से दाम गिरते हैं'), L('Feed is 70% of cost', 'दाना 70% खर्च')],
  },
  {
    code: 'nursery',
    name: L('Fruit nursery (plantation)', 'फल नर्सरी (पौधारोपण)'),
    sector: L('Horticulture', 'बागवानी'),
    plantation: true,
    sizes: [
      { id: 'nursery-1', label: L('0.5 acre nursery', '0.5 एकड़ नर्सरी'), capex: 240000, workingCapital: 60000, capacityRevenue: 25000, variableCostPct: 0.36, fixedMonthly: 1200, labourNeeded: 2, depYears: 10 },
    ],
    seasonality: [0.5, 0.6, 0.8, 0.6, 0.5, 1.4, 2.2, 2.0, 1.4, 0.8, 0.6, 0.6],
    rampYear1: 0.45,
    price: { item: L('Grafted mango / guava sapling', 'कलमी आम / अमरूद पौधा'), low: 30, high: 80, suggested: 45, unit: L('sapling', 'पौधा'), costPerUnit: 16 },
    channel: 'trader',
    spendPerHH: 40,
    competitorsPer1000Median: 0.1,
    channels: [L('Horticulture dept. orders', 'उद्यान विभाग के ऑर्डर'), L('Farmers at monsoon', 'बरसात में किसान')],
    localUnit: { en: 'saplings', hi: 'पौधे', price: 45 },
    training: L('Horticulture dept. nursery training', 'उद्यान विभाग नर्सरी प्रशिक्षण'),
    risks: [L('Income only after first monsoon', 'पहली बरसात के बाद ही कमाई'), L('Waterlogging', 'जलभराव')],
  },
]

export const activityByCode = (c: string) => ACTIVITIES.find((a) => a.code === c)!

export const sizeCost = (s: ActivitySize) => s.capex + s.workingCapital
