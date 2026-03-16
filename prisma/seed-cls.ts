import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import * as dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const labsData = [
  // ── GROUND FLOOR ─────────────────────────────────────────────────────────
  {
    name: 'Plant Propagation and Post-Harvest Lab',
    floor: 'GROUND FLOOR',
    labInCharge: 'Dr. Nazar Faried / Dr. Sami Ullah',
    equipment: [
      { srNo: 1,  name: 'Microwave Oven',                    model: 'HGN321008GB, Haier',                               quantity: 1 },
      { srNo: 2,  name: 'Hot Air Oven',                      model: 'Cat # SLN 32',                                      quantity: 1 },
      { srNo: 3,  name: 'Ethylene Generator',                model: 'Easy-Ripb Catalytic Generators LLC',                quantity: 1 },
      { srNo: 4,  name: 'Stand Mounted Digital Penetrometer',model: 'PCE-FM200',                                         quantity: 1 },
      { srNo: 5,  name: 'Autoclave',                         model: 'Model: RTA 85, Imported UK',                       quantity: 1 },
      { srNo: 6,  name: 'Laminar Air Flow',                  model: 'Model: BBS 1300 Bio Base, China',                  quantity: 1 },
      { srNo: 7,  name: 'CIRAS (CO₂/H₂O Gas Analyzer)',     model: 'CIRAS-3 Portable Co2/H2O Gas Analysis System',     quantity: 3 },
      { srNo: 8,  name: 'Weighing Balance',                  model: 'ELB-12K',                                          quantity: 1 },
    ],
  },
  {
    name: 'Seed and Plant Testing Lab',
    floor: 'GROUND FLOOR',
    labInCharge: 'Dr. Muhammad Amir Bakhtavar',
    equipment: [
      { srNo: 1,  name: 'Seed Germinator',           model: 'Model: KK240, Poland',                       quantity: 1 },
      { srNo: 2,  name: 'Seed Germinator',           model: 'Model: KK240, Poland',                       quantity: 1 },
      { srNo: 3,  name: 'Seed Germinator',           model: 'Model: HPP 260 with Stabilizer',             quantity: 1 },
      { srNo: 4,  name: 'Seed Germinator',           model: 'KK-750',                                     quantity: 1, notes: 'Currently at Climatology Lab' },
      { srNo: 5,  name: 'Glass Ware Dryer',          model: 'Model: UF450, Germany',                      quantity: 1 },
      { srNo: 6,  name: 'Refrigerated Shaking Incubator', model: 'Shellab Model: SSI10R-2, USA',          quantity: 2 },
      { srNo: 7,  name: '-80 °C Freezer',            model: 'Model: ULUF450',                             quantity: 4 },
      { srNo: 8,  name: '-20 °C Freezer',            model: 'Model: LF 300, Arctiko Denmark',             quantity: 1 },
      { srNo: 9,  name: '-40 °C Freezer',            model: 'Model: Frimed-SRL',                          quantity: 1 },
      { srNo: 10, name: 'Autoclave',                 model: 'Cat # SH-AC-100M',                           quantity: 1 },
      { srNo: 11, name: 'Three Series Baking Oven',  model: 'Model: ARF40H, China',                       quantity: 1 },
      { srNo: 12, name: 'Gas Cylinder',              model: 'Empty, For Gas',                             quantity: 2 },
      { srNo: 13, name: 'Water Distillery',          model: 'Double Distillery (POBEL 2 rods)',           quantity: 1 },
    ],
  },
  {
    name: 'NGS Lab',
    floor: 'GROUND FLOOR',
    labInCharge: 'Dr. Zulqurnain Khan / Dr. M. Faisal',
    equipment: [
      { srNo: 1, name: 'NGS System',          model: 'N5',                    quantity: 1 },
      { srNo: 2, name: 'qRT-PCR',             model: '',                      quantity: 1 },
      { srNo: 3, name: 'qPCR Vertical',       model: '',                      quantity: 1 },
      { srNo: 4, name: 'Electroporator',      model: 'Eppendorf',             quantity: 1 },
      { srNo: 5, name: 'Refrigerator',        model: '12 Cu, Haier',          quantity: 1 },
      { srNo: 6, name: 'Shaking Incubator',   model: 'Excella E-25R',         quantity: 1 },
      { srNo: 7, name: '-80 °C Freezer',      model: 'ULUF410',               quantity: 2 },
    ],
  },
  {
    name: 'GC-MS Lab',
    floor: 'GROUND FLOOR',
    labInCharge: 'Dr. Muhammad Asif Farooq',
    equipment: [
      { srNo: 1, name: 'GC-MS / Vacuum Filtration Apparatus', model: 'Agilent-8890', quantity: 1 },
      { srNo: 2, name: 'FTIR Spectrometer',                   model: 'Agilent Cary 630', quantity: 1 },
      { srNo: 3, name: 'PC',                                  model: 'Dell',             quantity: 1 },
      { srNo: 4, name: 'Printer',                             model: 'HP',               quantity: 1 },
    ],
  },
  {
    name: 'Food Processing & Nutrient Analytical Lab',
    floor: 'GROUND FLOOR',
    labInCharge: 'Mr. Muhammad Usman',
    equipment: [
      { srNo: 1,  name: 'Abrasive Peeler',             model: 'Pak Made',                             quantity: 1 },
      { srNo: 2,  name: 'Rose Head Juice Extractor',   model: 'Pak Made',                             quantity: 1 },
      { srNo: 3,  name: 'Cheese Vat',                  model: 'Pak Made',                             quantity: 1 },
      { srNo: 4,  name: 'Cheese Presser',              model: 'Pak Made',                             quantity: 1 },
      { srNo: 5,  name: 'Micro Mill',                  model: 'Pak Made',                             quantity: 2 },
      { srNo: 6,  name: 'Cream Separator',             model: 'Pak Made',                             quantity: 1 },
      { srNo: 7,  name: 'Water Distillery',            model: 'Ryapa F-16',                           quantity: 1 },
      { srNo: 8,  name: 'Muffle Furnace',              model: 'SNOL 8.0-1100 LHM01',                 quantity: 1 },
      { srNo: 9,  name: 'Grinder',                     model: 'Local',                                quantity: 1 },
      { srNo: 10, name: 'Double Door Refrigerator',    model: 'Haier',                                quantity: 1 },
      { srNo: 11, name: 'Soxhlet Apparatus',           model: 'Cat: 6003296, J.P. Selecta-Spain',    quantity: 1 },
      { srNo: 12, name: 'Kjeldahl Apparatus',          model: 'Ryapah',                               quantity: 2 },
      { srNo: 13, name: 'Kjeldahl Apparatus',          model: 'Behrotest',                            quantity: 1 },
      { srNo: 14, name: 'Chemical Fume Hood',          model: 'FHI-200',                              quantity: 1 },
      { srNo: 15, name: 'Analytical Weighing Balance', model: 'Cat # JJ124BC',                        quantity: 1 },
      { srNo: 16, name: 'Moisture Analyzer',           model: 'Adam',                                 quantity: 1 },
      { srNo: 17, name: 'Viscometer',                  model: 'VR-300',                               quantity: 1 },
      { srNo: 18, name: 'Farinograph',                 model: 'Brabender',                            quantity: 1 },
      { srNo: 19, name: 'Hot Plate Magnetic Stirrer',  model: 'Model: MS7-H550-S, China',            quantity: 1 },
      { srNo: 20, name: 'Garbar Mation',               model: '',                                     quantity: 1 },
      { srNo: 21, name: 'Cake Mixer',                  model: 'Local Made',                           quantity: 1 },
      { srNo: 22, name: 'Food Factory',                model: 'Westpoint',                            quantity: 1 },
    ],
  },

  // ── FIRST FLOOR ──────────────────────────────────────────────────────────
  {
    name: 'Insect Taxonomy Lab',
    floor: 'FIRST FLOOR',
    labInCharge: 'Dr. Unsar Naeem Ullah / Dr. M. Nadir Naqqash',
    equipment: [
      { srNo: 1,  name: 'Growth Chamber',              model: '',              quantity: 1 },
      { srNo: 2,  name: 'Microwave Oven',              model: 'Haier',         quantity: 1 },
      { srNo: 3,  name: 'Weighing Balance',            model: 'Kern',          quantity: 1 },
      { srNo: 4,  name: 'pH Meter',                    model: 'Ohaus',         quantity: 1 },
      { srNo: 5,  name: 'Analytical Weighing Balance', model: 'Kern',          quantity: 1 },
      { srNo: 6,  name: 'Humidifier',                  model: 'Boneco',        quantity: 1 },
      { srNo: 7,  name: 'Microscope',                  model: 'Bioblue',       quantity: 3 },
      { srNo: 8,  name: 'Digital Stereoscope',         model: 'Model: 1240',   quantity: 1 },
      { srNo: 9,  name: 'Zoom Stereo Microscope',      model: '',              quantity: 1 },
      { srNo: 10, name: 'E.C. Meter',                  model: 'Ohaus',         quantity: 2 },
      { srNo: 11, name: 'Electronic Aspirator',        model: 'Pak Made',      quantity: 2 },
      { srNo: 12, name: 'Insect Rearing Chamber',      model: '',              quantity: 1 },
      { srNo: 13, name: 'Data Logger (HOBO)',          model: 'Onset HOBO',    quantity: 2 },
      { srNo: 14, name: 'Solar Light Trap',            model: 'With battery backup', quantity: 1 },
      { srNo: 15, name: 'Solar Power Supply',          model: '',              quantity: 1 },
    ],
  },
  {
    name: 'Tissue Culture Lab',
    floor: 'FIRST FLOOR',
    labInCharge: 'Dr. Plosha Khanum',
    equipment: [
      { srNo: 1,  name: 'Autoclave',                   model: 'Digital 100 L, Model # SH-AC100M',    quantity: 1 },
      { srNo: 2,  name: 'Refrigerator',                model: 'Haier',                               quantity: 1 },
      { srNo: 3,  name: 'Hot Plate Magnetic Stirrer',  model: 'DLab MS7-H660-S',                     quantity: 1 },
      { srNo: 4,  name: 'pH Meter',                    model: 'Starter 3100C',                       quantity: 1 },
      { srNo: 5,  name: 'Electric Balance',            model: 'KERN',                                quantity: 1 },
      { srNo: 6,  name: 'Hot Air Oven',                model: 'POLIKO SLW 53',                       quantity: 1 },
      { srNo: 7,  name: 'Hot Air Oven',                model: 'Made in Germany',                     quantity: 1 },
      { srNo: 8,  name: 'Horizontal Laminar Flow Hood',model: 'Model: BBS 1300 Bio Base, China',     quantity: 2 },
      { srNo: 9,  name: 'Horizontal Laminar Flow Hood',model: 'RTVL-1312',                           quantity: 1 },
      { srNo: 10, name: 'Analytical Balance',          model: 'Cat # JJ 224BC',                      quantity: 1 },
      { srNo: 11, name: 'Cooled Incubator',            model: 'DGZLP 25082',                         quantity: 1 },
      { srNo: 12, name: 'Microwave Oven',              model: 'Haier',                               quantity: 1 },
    ],
  },
  {
    name: 'DNA Analysis Lab',
    floor: 'FIRST FLOOR',
    labInCharge: 'Dr. Ummara Waheed',
    equipment: [
      { srNo: 1,  name: 'UV Trans-Illuminator',         model: 'Model: MUV21-312, USA',               quantity: 1 },
      { srNo: 2,  name: 'Refrigerated Centrifuge',      model: 'Model: Z326K, Germany',               quantity: 1 },
      { srNo: 3,  name: 'Mini Refrigerated Centrifuge', model: 'High Speed Personal, Model: D2012',   quantity: 1 },
      { srNo: 4,  name: 'Microwave Oven',               model: 'HGN321008GB, Haier',                  quantity: 1 },
      { srNo: 5,  name: 'Top Loading Balance',          model: 'Ohaus',                               quantity: 1 },
      { srNo: 6,  name: 'Analytical Balance',           model: 'Cat # JJ 124BC',                      quantity: 1 },
      { srNo: 7,  name: 'Water Distillery',             model: 'Pobel, Spain',                        quantity: 1 },
      { srNo: 8,  name: 'Shaking Incubator',            model: 'Model: NB-205 LF, N-Biotek Korea',   quantity: 1 },
      { srNo: 9,  name: 'Gel Electrophoresis (Horizontal)', model: 'Model: Elite 300, USA',           quantity: 1 },
      { srNo: 10, name: 'Water Bath (3-in-1)',          model: 'Digital Fuzzy Control, Model: WB-11', quantity: 1 },
    ],
  },
  {
    name: 'Gene Cloning Lab',
    floor: 'FIRST FLOOR',
    labInCharge: 'Dr. M. Abu Baker',
    equipment: [
      { srNo: 1,  name: 'Digital Handheld Refractometer',     model: 'Model: Opti, Cat # 38, England',      quantity: 2 },
      { srNo: 2,  name: 'High Speed Refrigerated Centrifuge', model: 'Model: Z326K, Germany',               quantity: 1 },
      { srNo: 3,  name: 'Weather Station',                    model: 'Kestral',                             quantity: 1 },
      { srNo: 4,  name: 'GPS Recorder',                       model: 'Model: Oregon 650, Germany',          quantity: 1 },
      { srNo: 5,  name: 'Microplate Reader',                  model: 'Model: LT4500, Labtech UK',           quantity: 1 },
      { srNo: 6,  name: 'Leaf Porometer',                     model: '',                                    quantity: 2 },
      { srNo: 7,  name: 'Micro Centrifuge Machine',           model: 'High Speed Personal, Model: D2012',   quantity: 1 },
      { srNo: 8,  name: 'Refrigerator',                       model: 'Haier',                               quantity: 1 },
      { srNo: 9,  name: 'E.C. Meter',                         model: 'Bante',                               quantity: 3 },
      { srNo: 10, name: 'Analytical Balance',                 model: 'Cat # JJ 224BC',                      quantity: 1 },
      { srNo: 11, name: 'Tissue Lyser',                       model: '',                                    quantity: 1 },
      { srNo: 12, name: 'Cooled Incubator',                   model: 'Model # ST-2',                        quantity: 1 },
      { srNo: 13, name: 'Sonicator',                          model: 'Wise Clean',                          quantity: 1 },
      { srNo: 14, name: 'Adjustable Pipette Set',             model: '',                                    quantity: 2 },
      { srNo: 15, name: 'Data Logger',                        model: '',                                    quantity: 1 },
      { srNo: 16, name: 'Deionized Water System',             model: 'Wasser Lab',                          quantity: 1 },
      { srNo: 17, name: 'Thermometer',                        model: '',                                    quantity: 1 },
      { srNo: 18, name: 'Gel Documentation System',           model: 'Model: Omegafluor Plus',              quantity: 2 },
      { srNo: 19, name: 'Gel Electrophoresis (Horizontal)',   model: 'Model: Elite 300, USA',               quantity: 2 },
      { srNo: 20, name: 'Ice Flaking Machine',                model: 'EVERMED',                             quantity: 1 },
      { srNo: 21, name: 'Liquid Nitrogen Container',          model: 'Model: 1099.1, Germany',              quantity: 1 },
      { srNo: 22, name: 'Magnifying Glass (10×)',             model: '',                                    quantity: 1 },
      { srNo: 23, name: 'Microwave Oven',                     model: 'HGN321008GB, Haier',                  quantity: 1 },
      { srNo: 24, name: 'PCR Thermal Cycler',                 model: 'Lab Cycler',                          quantity: 2 },
      { srNo: 25, name: 'Self-Refilling Syringes',            model: 'Cat # 173.0502, 0.3–2 ml',           quantity: 4 },
      { srNo: 26, name: 'Soil Moisture Sensor',               model: 'EC-5',                                quantity: 1 },
      { srNo: 27, name: 'Ethylene Generator',                 model: 'Easy-Ripb Catalytic Generators LLC',  quantity: 1 },
      { srNo: 28, name: 'Nano Drop Spectrophotometer',        model: 'Model: Colibri, Germany',             quantity: 1 },
      { srNo: 29, name: 'Digital Stopwatch',                  model: '',                                    quantity: 10 },
      { srNo: 30, name: 'Digital Incubator Shaker',           model: 'Model: NB-205 LF, N-Biotek Korea',   quantity: 1 },
      { srNo: 31, name: 'Horizontal Laminar Flow Hood',       model: 'RTVL-1312',                           quantity: 1 },
    ],
  },
  {
    name: 'Analytical Lab',
    floor: 'FIRST FLOOR',
    labInCharge: 'Dr. M. Baqir Hussain',
    equipment: [
      { srNo: 1,  name: 'HPLC',                               model: 'Model: S1125G',                         quantity: 1 },
      { srNo: 2,  name: 'Centrifuge Machine',                 model: 'Model: Z326K, Germany',                 quantity: 1 },
      { srNo: 3,  name: 'Sonicator',                          model: 'Elma 30 H',                             quantity: 1 },
      { srNo: 4,  name: 'pH Meter',                           model: 'Starter 3100',                          quantity: 1 },
      { srNo: 5,  name: 'Rotary Evaporator',                  model: 'H50-500',                               quantity: 1 },
      { srNo: 6,  name: 'Atomic Absorption Spectrophotometer (AAS)', model: 'Nova 400P',                     quantity: 1 },
      { srNo: 7,  name: 'E.C. Meter',                         model: 'Starter 5000',                          quantity: 1 },
      { srNo: 8,  name: 'Microwave Oven',                     model: 'HGN321008GB, Haier',                    quantity: 1 },
      { srNo: 9,  name: 'Gas Cylinder',                       model: 'Empty, For Dissolved Acetylene Gas',    quantity: 1 },
      { srNo: 10, name: 'Spectrophotometer (UV/VIS)',          model: 'CF 7400S, Cecil Made in England',       quantity: 1 },
    ],
  },
  {
    name: 'Diagnostic Lab',
    floor: 'FIRST FLOOR',
    labInCharge: 'Dr. Muhammad Nadeem / Dr. Hasan Riaz',
    equipment: [
      { srNo: 1,  name: 'Horizontal Laminar Air Flow Hood',     model: 'RTVL-1312',                          quantity: 1 },
      { srNo: 2,  name: 'Digital Stereoscope',                  model: 'Model: 1240',                        quantity: 1 },
      { srNo: 3,  name: 'Microscope',                           model: 'Austria M',                          quantity: 1 },
      { srNo: 4,  name: 'Microscope',                           model: 'Euromax',                            quantity: 3 },
      { srNo: 5,  name: 'Cooling Incubator',                    model: 'Wise Cube',                          quantity: 1 },
      { srNo: 6,  name: 'Micro Refrigerated Centrifuge',        model: 'Centurian',                          quantity: 2 },
      { srNo: 7,  name: 'pH Meter',                             model: 'Starter 500',                        quantity: 2 },
      { srNo: 8,  name: 'Disease Specimen Boxes',               model: 'Local',                              quantity: 1 },
      { srNo: 9,  name: 'Zoom Stereo Microscope',               model: 'With Accessories SB 1903, Netherland', quantity: 1 },
      { srNo: 10, name: 'Stereoscope with Digital & Video Monitoring', model: 'With Accessories',            quantity: 1 },
      { srNo: 11, name: '-20 °C Refrigerator',                  model: 'Model: LF 300, Arctiko Denmark',     quantity: 1 },
      { srNo: 12, name: 'Microwave Oven',                       model: 'HGN321008GB, Haier',                 quantity: 1 },
      { srNo: 13, name: 'Vortex Mixer',                         model: 'Mode MX',                            quantity: 1 },
      { srNo: 14, name: 'Gel Electrophoresis (Horizontal)',     model: 'Model: Elite 300, USA',              quantity: 1 },
      { srNo: 15, name: 'Drying Oven',                          model: 'Cat # SLN 53',                       quantity: 1 },
      { srNo: 16, name: 'Refrigerator',                         model: 'Haier',                              quantity: 1 },
    ],
  },
  {
    name: 'Microbiology Lab',
    floor: 'FIRST FLOOR',
    labInCharge: 'Dr. Ali Haider',
    equipment: [
      { srNo: 1,  name: 'Microplate Photometer',            model: '',                                      quantity: 1 },
      { srNo: 2,  name: 'Incubator',                        model: 'Model # ST-2',                          quantity: 1 },
      { srNo: 3,  name: 'Hot Air Oven',                     model: 'Cat # SLN 53',                          quantity: 1 },
      { srNo: 4,  name: 'Water Bath',                       model: 'Model: WB-10, Polyscience-USA',         quantity: 1 },
      { srNo: 5,  name: 'Colony Counter',                   model: 'Model: Galaxy 230',                     quantity: 1 },
      { srNo: 6,  name: 'Microscope',                       model: 'Bio Blue',                              quantity: 2 },
      { srNo: 7,  name: 'Horizontal Laminar Air Flow Hood', model: 'RTVL-1312',                             quantity: 1 },
      { srNo: 8,  name: 'Weighing Balance',                 model: 'Cat # JJ 324BC',                        quantity: 1 },
      { srNo: 9,  name: 'Zoom Stereo Microscope',           model: '',                                      quantity: 1 },
      { srNo: 10, name: 'pH Meter',                         model: 'STATA3100',                             quantity: 1 },
      { srNo: 11, name: 'Orbital Shaking Incubator',        model: 'Model: NB-205 LF, N-Biotek Korea',     quantity: 1 },
      { srNo: 12, name: 'Acid-Base Titration Apparatus',    model: '',                                      quantity: 1 },
      { srNo: 13, name: 'Homogenizer',                      model: 'Model: HG-15D',                         quantity: 1 },
      { srNo: 14, name: 'Microquan Spectrophotometer',      model: 'Cat # HIPO MPP-96',                     quantity: 1 },
      { srNo: 15, name: 'Gel Documentation System',         model: 'Model: Clever',                         quantity: 1 },
      { srNo: 16, name: 'Double Beam Spectrophotometer',    model: 'Model: C-7200S, USA',                   quantity: 1 },
      { srNo: 17, name: 'Hot Plate',                        model: 'D Lab',                                 quantity: 2 },
    ],
  },
];

async function main() {
  console.log('🌱  Seeding CLS data…\n');

  let labCount = 0;
  let equipmentCount = 0;

  for (const labData of labsData) {
    const { equipment, ...labFields } = labData;

    const lab = await prisma.lab.upsert({
      where: { name: labFields.name },
      update: { ...labFields },
      create: { ...labFields },
    });

    labCount++;
    console.log(`  ✔  ${lab.floor} → ${lab.name}`);

    for (const eq of equipment) {
      await prisma.equipment.create({
        data: {
          srNo:     eq.srNo ?? null,
          name:     eq.name,
          model:    eq.model || null,
          quantity: eq.quantity,
          notes:    eq.notes ?? null,
          labId:    lab.id,
        },
      });
      equipmentCount++;
    }
    console.log(`       ${equipment.length} equipment items added`);
  }

  console.log(`\n✅  Seeding complete: ${labCount} labs, ${equipmentCount} equipment items.`);
}

main()
  .catch((e) => {
    console.error('❌  Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
