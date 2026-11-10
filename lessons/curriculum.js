(function () {
    const option = (value, label) => ({ value, label });
    const question = (prompt, choices, answer, explanation, hint) => ({
        prompt,
        choices,
        answer,
        explanation,
        hint
    });

    window.CHEM_LESSONS = [
        {
            topic: "Measurements",
            slug: "measurements",
            icon: "📏",
            description: "Use measurements, units, and significant figures to communicate reliable chemical data.",
            why: "Chemistry uses measurements to connect observations to quantitative models. A result is useful only when its units and precision are clear.",
            objectives: ["Distinguish accuracy from precision.", "Convert quantities with dimensional analysis.", "Report calculated results with appropriate significant figures."],
            sections: [
                {
                    title: "Measurement and uncertainty",
                    reading: [
                        "A measurement combines a number with a unit. The number tells how many units; the unit tells what was measured. In a laboratory, every measured value has uncertainty because instruments have finite resolution.",
                        "Accuracy describes closeness to an accepted value. Precision describes agreement among repeated measurements. Repeating a poorly calibrated measurement can be precise without being accurate."
                    ],
                    principle: "Always record every certain digit and one estimated digit when the instrument scale allows it.",
                    example: {
                        prompt: "A balance reads 12.34 g for a sample whose accepted mass is 12.30 g. What does this single comparison tell you?",
                        steps: ["Find the absolute difference: |12.34 − 12.30| = 0.04 g.", "The small difference suggests this measurement is close to the accepted value, so it is accurate.", "One result cannot show repeatability; precision requires a set of repeated measurements."],
                        answer: "The result is close to the accepted value, but precision cannot be judged from one reading."
                    },
                    check: question("Which statement defines precision?", [option("a", "Closeness to the accepted value"), option("b", "Agreement among repeated measurements"), option("c", "Number of units in a quantity")], "b", "Precision concerns how closely repeated results agree. Accuracy concerns closeness to an accepted value."),
                    practice: question("Three readings are 8.21 g, 8.22 g, and 8.21 g. Which property is directly supported?", [option("a", "High precision"), option("b", "High accuracy, with no reference value"), option("c", "Zero uncertainty")], "a", "The readings agree closely, which supports precision. Without an accepted value, accuracy is unknown.", "Compare the readings with one another, not with a true value.")
                },
                {
                    title: "Units and dimensional analysis",
                    reading: [
                        "Dimensional analysis treats conversion factors as ratios equal to one. Arrange the ratio so the unwanted unit cancels, leaving the requested unit.",
                        "For example, 1 m = 100 cm gives both 100 cm/1 m and 1 m/100 cm. Choose the form that cancels the starting unit. Units should be carried through every line of a calculation."
                    ],
                    principle: "A valid calculation must have the requested unit after all unit cancellations.",
                    example: {
                        prompt: "Convert 2.50 km to metres.",
                        steps: ["Start with 2.50 km.", "Use 1000 m / 1 km so km cancels.", "2.50 km × (1000 m / 1 km) = 2500 m.", "The measured value has three significant figures; write 2.50 × 10³ m to show them unambiguously."],
                        answer: "2.50 × 10³ m"
                    },
                    check: question("Which factor converts 45.0 cm to metres?", [option("a", "1 m / 100 cm"), option("b", "100 cm / 1 m"), option("c", "1 cm / 100 m")], "a", "Multiplying by 1 m/100 cm cancels centimetres and leaves metres."),
                    practice: question("A liquid volume is 35.0 mL. Given 1 L = 1000 mL, what is the volume in litres?", [option("a", "0.0350 L"), option("b", "35 000 L"), option("c", "0.350 L")], "a", "35.0 mL × (1 L / 1000 mL) = 0.0350 L. The conversion factor is exact, so three significant figures remain.", "Choose a ratio with mL in the denominator.")
                },
                {
                    title: "Significant figures in calculations",
                    reading: [
                        "Significant figures communicate the precision supported by measured inputs. For multiplication and division, round to the fewest significant figures among the measured values. For addition and subtraction, round to the least precise decimal place.",
                        "Keep guard digits during intermediate steps and round only the final result. Exact counts and defined conversion factors do not limit significant figures."
                    ],
                    principle: "Multiplication/division → fewest significant figures; addition/subtraction → fewest decimal places.",
                    example: {
                        prompt: "Calculate the density of a 12.4 g sample with a volume of 5.0 mL.",
                        steps: ["Use density = mass / volume.", "12.4 g ÷ 5.0 mL = 2.48 g/mL before rounding.", "The volume has two significant figures, fewer than the mass.", "Round the result to two significant figures and retain the compound unit."],
                        answer: "2.5 g/mL"
                    },
                    check: question("How many significant figures should 4.56 × 1.4 have?", [option("a", "3"), option("b", "2"), option("c", "1")], "b", "The factor 1.4 has two significant figures, the fewest, so the product is reported with two."),
                    practice: question("What is 18.6 g + 2.31 g, rounded correctly?", [option("a", "20.91 g"), option("b", "20.9 g"), option("c", "21 g")], "b", "The least precise measurement is to the tenths place, so 20.91 g rounds to 20.9 g.", "For addition, use decimal places rather than total significant figures.")
                }
            ],
            challenge: [
                question("A 25.0 mL sample has a mass of 30.0 g. What is its density?", [option("a", "1.20 g/mL"), option("b", "0.833 g/mL"), option("c", "750 g/mL")], "a", "Density = m/V = 30.0 g ÷ 25.0 mL = 1.20 g/mL (three significant figures)."),
                question("Convert 0.250 kg to grams.", [option("a", "250 g"), option("b", "0.000250 g"), option("c", "25.0 g")], "a", "0.250 kg × 1000 g/kg = 250 g. In scientific notation, 2.50 × 10² g makes the three significant figures explicit."),
                question("What controls rounding for 7.24 + 1.3?", [option("a", "Fewest significant figures"), option("b", "Least precise decimal place"), option("c", "Largest value")], "b", "For addition, round to the least precise decimal place: 8.5.")
            ]
        },
        {
            topic: "Atomic Structure",
            slug: "atomic-structure",
            icon: "⚛",
            description: "Connect protons, neutrons, electrons, isotopes, and ions to atomic identity.",
            why: "Atomic structure explains why elements differ, why isotopes have different masses, and how atoms form charged ions.",
            objectives: ["Identify subatomic particles and their charges.", "Determine particle counts from isotope notation.", "Explain how electron changes form ions."],
            sections: [
                {
                    title: "The nucleus and electron cloud",
                    reading: [
                        "An atom has a compact nucleus containing protons and neutrons, surrounded by electrons. Protons have charge +1, electrons −1, and neutrons 0. Almost all atomic mass is concentrated in the nucleus.",
                        "The atomic number Z equals the number of protons and defines the element. In a neutral atom, electron count equals proton count, so total charge is zero."
                    ],
                    principle: "Element identity is set by proton number, not by neutron or electron number.",
                    example: {
                        prompt: "How many protons and electrons are in a neutral aluminum-27 atom? Aluminum has atomic number 13.",
                        steps: ["Atomic number 13 means the atom contains 13 protons.", "A neutral atom has equal positive and negative charge.", "Therefore it also contains 13 electrons. The isotope mass number is not needed for these counts."],
                        answer: "13 protons and 13 electrons"
                    },
                    check: question("Which change would turn a carbon atom into a different element?", [option("a", "Changing its neutron count"), option("b", "Changing its proton count"), option("c", "Changing its electron count")], "b", "Changing proton number changes atomic number and therefore changes the element."),
                    practice: question("A neutral atom has 17 protons. How many electrons does it have?", [option("a", "17"), option("b", "18"), option("c", "34")], "a", "Neutrality requires equal proton and electron counts.", "Neutral means total charge is zero.")
                },
                {
                    title: "Isotopes and mass number",
                    reading: [
                        "Isotopes are atoms of the same element with different numbers of neutrons. The mass number A is the whole-number total of protons and neutrons for one isotope.",
                        "In isotope notation, ²⁷₁₃Al has A = 27 and Z = 13. Its neutron count is A − Z = 14. The periodic-table atomic mass is usually a weighted average of naturally occurring isotope masses, not the mass number of one atom."
                    ],
                    principle: "Neutrons = mass number − atomic number.",
                    example: {
                        prompt: "Determine the protons, neutrons, and electrons in ³⁵₁₇Cl⁻.",
                        steps: ["The lower number gives Z = 17 protons.", "Neutrons = A − Z = 35 − 17 = 18.", "The 1− charge means one more electron than proton.", "Electrons = 17 + 1 = 18."],
                        answer: "17 protons, 18 neutrons, 18 electrons"
                    },
                    check: question("How many neutrons are in ²³₁₁Na?", [option("a", "11"), option("b", "12"), option("c", "23")], "b", "Neutrons = 23 − 11 = 12."),
                    practice: question("How many neutrons are in carbon-14? Carbon has atomic number 6.", [option("a", "6"), option("b", "8"), option("c", "14")], "b", "14 − 6 = 8 neutrons.", "Subtract atomic number from mass number.")
                },
                {
                    title: "Ions and charge",
                    reading: [
                        "An ion is an atom or group of atoms with a net charge because electrons have been transferred. Losing electrons produces a cation; gaining electrons produces an anion. The nucleus does not change in ordinary ion formation.",
                        "For an ion, charge in units of e equals protons minus electrons. A 2+ ion has two fewer electrons than protons; a 2− ion has two more."
                    ],
                    principle: "Ion charge = number of protons − number of electrons.",
                    example: {
                        prompt: "Find the electron count in Mg²⁺. Magnesium has atomic number 12.",
                        steps: ["A neutral Mg atom has 12 electrons.", "A 2+ charge means two electrons were lost.", "12 − 2 = 10 electrons."],
                        answer: "10 electrons"
                    },
                    check: question("When a neutral sulfur atom becomes S²⁻, what happens?", [option("a", "It gains two electrons"), option("b", "It loses two electrons"), option("c", "It gains two protons")], "a", "A 2− charge results from two additional electrons."),
                    practice: question("How many electrons are in Ca²⁺? Calcium has atomic number 20.", [option("a", "18"), option("b", "20"), option("c", "22")], "a", "A 2+ ion has lost two electrons: 20 − 2 = 18.", "Positive charge means fewer electrons than protons.")
                }
            ],
            challenge: [
                question("How many neutrons are in ⁴⁰₂₀Ca?", [option("a", "20"), option("b", "40"), option("c", "60")], "a", "40 − 20 = 20 neutrons."),
                question("How many electrons does O²⁻ have? Oxygen has Z = 8.", [option("a", "6"), option("b", "8"), option("c", "10")], "c", "O²⁻ has gained two electrons: 8 + 2 = 10."),
                question("What is the atomic number of an element with 15 protons?", [option("a", "15"), option("b", "30"), option("c", "Depends on its isotope")], "a", "Atomic number is defined as proton count.")
            ]
        },
        {
            topic: "Periodic Table",
            slug: "periodic-table",
            icon: "🧩",
            description: "Use periodic-table position and trends to predict element properties.",
            why: "The periodic table organizes recurring chemical behavior, helping chemists make reasoned predictions about unfamiliar elements.",
            objectives: ["Relate periods and groups to electron structure.", "Classify metals, nonmetals, and metalloids.", "Explain common atomic-radius and ionization-energy trends."],
            sections: [
                {
                    title: "Organization and families",
                    reading: [
                        "Elements are arranged by increasing atomic number. A horizontal row is a period; a vertical column is a group or family. Main-group elements in the same group often have similar valence-electron arrangements and therefore similar chemistry.",
                        "Group 1 elements are alkali metals, Group 2 are alkaline-earth metals, Group 17 are halogens, and Group 18 are noble gases. Hydrogen is unusual and should not be treated as a typical alkali metal."
                    ],
                    principle: "For main-group elements, group position is a useful guide to valence electrons and common ion charges.",
                    example: {
                        prompt: "Why do sodium and potassium commonly form +1 ions?",
                        steps: ["Both are in Group 1.", "Each has one valence electron outside a stable inner-shell arrangement.", "Losing that electron forms a positively charged ion, Na⁺ or K⁺."],
                        answer: "They each lose one valence electron and form +1 cations."
                    },
                    check: question("Elements in the same group tend to share which feature?", [option("a", "Similar valence-electron patterns"), option("b", "The same number of neutrons"), option("c", "The same atomic mass")], "a", "Similar valence-electron arrangements help explain similar chemical behavior."),
                    practice: question("Which family contains chlorine?", [option("a", "Halogens"), option("b", "Noble gases"), option("c", "Alkaline-earth metals")], "a", "Chlorine is in Group 17, the halogens.", "Find chlorine's vertical column.")
                },
                {
                    title: "Metals, nonmetals, and metalloids",
                    reading: [
                        "Most metals lie to the left and center of the periodic table. They generally conduct heat and electricity, are malleable, and tend to lose electrons in reactions. Nonmetals are mostly on the right and often gain or share electrons.",
                        "Metalloids lie near the stair-step boundary and show a mixture of properties; silicon is a familiar semiconductor. These are broad patterns, not guarantees for every element or compound."
                    ],
                    principle: "Periodic position suggests tendencies; bonding context and actual data determine specific behavior.",
                    example: {
                        prompt: "Predict the likely ion type for magnesium and explain the reasoning.",
                        steps: ["Magnesium is a Group 2 metal.", "Metals tend to lose electrons.", "Group 2 metals commonly lose two valence electrons.", "The predicted ion is Mg²⁺."],
                        answer: "Mg²⁺, a cation"
                    },
                    check: question("Which element is a metalloid commonly used in semiconductors?", [option("a", "Silicon"), option("b", "Sodium"), option("c", "Neon")], "a", "Silicon is a metalloid with important semiconductor applications."),
                    practice: question("Which behavior is most typical of a nonmetal in an ionic compound?", [option("a", "Gaining electrons"), option("b", "Losing all protons"), option("c", "Becoming a metal")], "a", "Nonmetals commonly gain electrons from metals to form anions.", "Consider which change gives a negative ion.")
                },
                {
                    title: "Periodic trends",
                    reading: [
                        "Across a period from left to right, effective nuclear charge generally increases while electrons are added to the same principal energy level. Atomic radius therefore tends to decrease, and first ionization energy tends to increase.",
                        "Down a group, added occupied energy levels place valence electrons farther from the nucleus and increase shielding. Atomic radius generally increases and first ionization energy generally decreases. These are broad trends with known exceptions."
                    ],
                    principle: "Across → smaller radius, usually higher ionization energy; down → larger radius, usually lower ionization energy.",
                    example: {
                        prompt: "Which atom is larger, Na or Cl, and why?",
                        steps: ["Na and Cl are in the same period.", "Moving across a period, effective nuclear attraction on the valence electrons increases.", "This draws the electron cloud inward, so sodium is larger than chlorine."],
                        answer: "Na is larger than Cl."
                    },
                    check: question("Which atom is generally larger, Li or K?", [option("a", "Li"), option("b", "K"), option("c", "They must be equal")], "b", "Radius generally increases down a group as additional occupied energy levels are added."),
                    practice: question("Which has the higher first ionization energy, F or I?", [option("a", "F"), option("b", "I"), option("c", "Cannot compare by position")], "a", "Ionization energy generally decreases down a group; fluorine is above iodine.", "Use the down-a-group trend.")
                }
            ],
            challenge: [
                question("Which pair is in the same chemical family?", [option("a", "F and Cl"), option("b", "Na and Mg"), option("c", "C and Ne")], "a", "Fluorine and chlorine are both Group 17 halogens."),
                question("What is the usual radius trend across a period from left to right?", [option("a", "Decreases"), option("b", "Increases"), option("c", "Remains exactly constant")], "a", "Increasing effective nuclear charge generally pulls the electron cloud inward."),
                question("Which element is most likely to form a 2+ ion?", [option("a", "Mg"), option("b", "Cl"), option("c", "Ne")], "a", "Magnesium is a Group 2 metal and commonly loses two electrons.")
            ]
        },
        {
            topic: "Chemical Bonding",
            slug: "chemical-bonding",
            icon: "🔗",
            description: "Explain ionic, covalent, and metallic bonding through electron behavior and structure.",
            why: "Bonding models explain how atoms form stable substances and help predict composition, structure, and properties.",
            objectives: ["Distinguish ionic and covalent bonding.", "Relate valence electrons to common formulas.", "Connect bonding type with bulk properties."],
            sections: [
                {
                    title: "Ionic bonding",
                    reading: [
                        "Ionic bonding is the electrostatic attraction between oppositely charged ions. In many ionic compounds, electrons transfer from a metal to a nonmetal, but the bond itself is the attraction among ions in an extended lattice.",
                        "An ionic formula represents the simplest whole-number ratio that makes total charge zero; it does not describe a separate molecule. Ionic solids are often brittle and conduct electricity when molten or dissolved, when ions can move."
                    ],
                    principle: "The total positive and negative charge in an ionic formula unit must balance to zero.",
                    example: {
                        prompt: "Determine the formula formed by Al³⁺ and O²⁻.",
                        steps: ["Find the least common multiple of charge magnitudes 3 and 2: it is 6.", "Two Al³⁺ ions give +6; three O²⁻ ions give −6.", "The charges cancel in the simplest 2:3 ratio."],
                        answer: "Al₂O₃"
                    },
                    check: question("Why does solid NaCl not conduct electricity as well as molten NaCl?", [option("a", "Its ions are fixed in the lattice"), option("b", "It has no charged particles"), option("c", "Its electrons disappear")], "a", "In the solid, ions are present but cannot move freely; in the melt, mobile ions carry charge."),
                    practice: question("What is the neutral formula for Mg²⁺ and Cl⁻?", [option("a", "MgCl₂"), option("b", "Mg₂Cl"), option("c", "MgCl")], "a", "Two chloride ions balance the +2 charge of one magnesium ion.", "Balance total charge, then use the simplest whole-number ratio.")
                },
                {
                    title: "Covalent bonding and Lewis structures",
                    reading: [
                        "A covalent bond forms when atoms share electron pairs. Lewis structures show valence electrons as dots and shared pairs as lines. Many main-group atoms tend toward an octet, while hydrogen follows a duet; this is a useful model, not an absolute law.",
                        "A single, double, or triple bond represents one, two, or three shared electron pairs. The correct Lewis structure accounts for all valence electrons and gives plausible formal charges."
                    ],
                    principle: "Count all valence electrons before placing bonds and lone pairs.",
                    example: {
                        prompt: "How many total valence electrons should be shown for H₂O?",
                        steps: ["Each H contributes 1 valence electron: 2 total.", "O contributes 6 valence electrons.", "Add them: 2 + 6 = 8 valence electrons.", "Two O–H bonds use 4 electrons; the remaining 4 form two lone pairs on oxygen."],
                        answer: "8 valence electrons"
                    },
                    check: question("How many electron pairs are shared in a C≡N triple bond?", [option("a", "1"), option("b", "2"), option("c", "3")], "c", "A triple bond consists of three shared electron pairs."),
                    practice: question("How many total valence electrons are in CO₂? C has 4 and each O has 6.", [option("a", "16"), option("b", "10"), option("c", "12")], "a", "4 + 2(6) = 16 total valence electrons.", "Add the valence contribution from every atom.")
                },
                {
                    title: "Metallic bonding and properties",
                    reading: [
                        "In the metallic-bonding model, metal atoms contribute valence electrons to a delocalized electron cloud around positive metal centers. The mobile electrons help metals conduct electricity and heat.",
                        "Metallic solids can often be shaped because layers of metal centers can shift while the attraction to the electron cloud remains. Alloys combine elements to modify properties such as strength or corrosion resistance."
                    ],
                    principle: "Mobile, delocalized electrons help explain metallic conductivity and malleability.",
                    example: {
                        prompt: "Why can copper wire conduct current in the solid state?",
                        steps: ["Copper is a metal with delocalized valence electrons.", "An applied electric field causes some of these mobile electrons to drift.", "Their motion transports charge through the solid."],
                        answer: "Mobile delocalized electrons carry charge through the metal."
                    },
                    check: question("Which bonding model best explains electrical conductivity in solid copper?", [option("a", "Metallic bonding"), option("b", "Ionic bonding"), option("c", "Hydrogen bonding")], "a", "Metallic solids contain mobile delocalized electrons."),
                    practice: question("Why is a metal often malleable rather than shattering like an ionic crystal?", [option("a", "Metal layers can shift while attraction persists"), option("b", "Metal atoms have no nuclei"), option("c", "All metallic bonds are weak")], "a", "The delocalized electron cloud can maintain attraction as layers shift.", "Think about what happens when layers move.")
                }
            ],
            challenge: [
                question("What is the simplest formula for Ca²⁺ and N³⁻?", [option("a", "Ca₃N₂"), option("b", "CaN"), option("c", "Ca₂N₃")], "a", "Three Ca²⁺ ions (+6) balance two N³⁻ ions (−6)."),
                question("What type of bond forms when nonmetal atoms share electron pairs?", [option("a", "Covalent"), option("b", "Ionic"), option("c", "Metallic")], "a", "Covalent bonds involve shared electron pairs."),
                question("When can an ionic compound conduct electricity?", [option("a", "When molten or dissolved and its ions can move"), option("b", "Only as a rigid solid"), option("c", "Never")], "a", "Mobile ions transport charge in a melt or aqueous solution.")
            ]
        },
        {
            topic: "IMF",
            slug: "intermolecular-forces",
            icon: "🧲",
            description: "Compare attractions between particles and predict their effects on physical properties.",
            why: "Intermolecular forces help explain boiling points, vapor pressure, viscosity, and why substances behave differently in the same state.",
            objectives: ["Distinguish intramolecular bonds from intermolecular forces.", "Identify dispersion, dipole–dipole, and hydrogen bonding.", "Relate attraction strength to phase-change trends."],
            sections: [
                {
                    title: "Intermolecular vs. intramolecular",
                    reading: [
                        "Intramolecular bonds hold atoms together within a molecule or extended substance. Intermolecular forces (IMFs) attract separate particles. Changing phase usually overcomes some intermolecular attraction without breaking the molecule's covalent bonds.",
                        "For molecular substances, stronger attractions generally require more energy to separate particles, leading to higher boiling points and lower vapor pressures at the same temperature."
                    ],
                    principle: "Boiling separates molecules from one another; it does not normally break their covalent bonds.",
                    example: {
                        prompt: "What is overcome when liquid water boils: O–H covalent bonds or attractions between water molecules?",
                        steps: ["Boiling changes liquid water into gaseous H₂O.", "Each H₂O molecule remains chemically intact in the gas.", "Therefore the phase change overcomes intermolecular attractions, not the O–H covalent bonds."],
                        answer: "Intermolecular attractions between H₂O molecules"
                    },
                    check: question("During ordinary boiling, which interaction is primarily overcome?", [option("a", "Intermolecular attraction"), option("b", "The covalent bonds within each molecule"), option("c", "Nuclear attraction")], "a", "A physical phase change separates intact molecules."),
                    practice: question("Which property tends to be higher when molecular attractions are stronger?", [option("a", "Boiling point"), option("b", "Vapor pressure"), option("c", "Volatility")], "a", "More energy is needed to separate particles, so boiling point tends to rise.", "Stronger attractions make escape from the liquid harder.")
                },
                {
                    title: "Three common molecular attractions",
                    reading: [
                        "London dispersion forces arise from temporary electron-density fluctuations and occur in all atoms and molecules. They become stronger as electron clouds become more polarizable and, for similar shapes, as surface contact increases.",
                        "Dipole–dipole attractions occur between polar molecules. Hydrogen bonding is a particularly strong dipole–dipole attraction when H is covalently bonded to N, O, or F and interacts with a lone pair on N, O, or F nearby."
                    ],
                    principle: "All molecules have dispersion forces; only polar molecules have permanent dipole–dipole attractions.",
                    example: {
                        prompt: "Which main IMF explains the unusually high boiling point of water compared with H₂S?",
                        steps: ["Water has O–H bonds, and oxygen is strongly electronegative.", "Water molecules form hydrogen bonds with neighboring molecules.", "H₂S does not meet the usual N–H, O–H, or F–H requirement for hydrogen bonding.", "Water's stronger attractions help explain its higher boiling point."],
                        answer: "Hydrogen bonding between water molecules"
                    },
                    check: question("Which molecule can form conventional hydrogen bonds with itself?", [option("a", "CH₃OH"), option("b", "CH₄"), option("c", "H₂S")], "a", "Methanol contains an O–H bond and oxygen lone pairs."),
                    practice: question("Which IMF is present in both nonpolar I₂ and polar H₂O?", [option("a", "London dispersion"), option("b", "Dipole–dipole only"), option("c", "Hydrogen bonding only")], "a", "London dispersion occurs in every atom and molecule.", "Choose the force that is universal.")
                },
                {
                    title: "Use IMFs to predict properties",
                    reading: [
                        "When comparing similar-sized molecular substances, stronger IMFs often mean a higher boiling point, greater viscosity, and lower vapor pressure. Molecular size and shape matter too, so compare like with like and consider all relevant forces.",
                        "A liquid's vapor pressure reflects how readily particles escape into the gas phase at a given temperature. More particles escape when attractions are weaker, so vapor pressure rises as temperature rises."
                    ],
                    principle: "At the same temperature: stronger attractions → lower vapor pressure and usually higher boiling point.",
                    example: {
                        prompt: "Between CH₄ and C₂H₆, which generally has the higher boiling point?",
                        steps: ["Both molecules are nonpolar, so dispersion forces are their main IMF.", "C₂H₆ has more electrons and a more polarizable electron cloud.", "Its dispersion forces are stronger, so more energy is needed to separate molecules."],
                        answer: "C₂H₆ generally has the higher boiling point."
                    },
                    check: question("At the same temperature, which liquid generally has the higher vapor pressure?", [option("a", "The one with weaker attractions"), option("b", "The one with stronger attractions"), option("c", "They must be identical")], "a", "Weaker attractions make it easier for particles to enter the vapor phase."),
                    practice: question("If a liquid's intermolecular attractions are strengthened, what happens to its volatility?", [option("a", "It decreases"), option("b", "It increases"), option("c", "It is guaranteed unchanged")], "a", "Stronger attractions make escape into the gas less favorable, lowering volatility.", "Volatility describes how readily a liquid vaporizes.")
                }
            ],
            challenge: [
                question("Which is the strongest relevant IMF between NH₃ molecules?", [option("a", "Hydrogen bonding"), option("b", "London dispersion only"), option("c", "Ionic bonding")], "a", "N–H bonds and nitrogen lone pairs allow hydrogen bonding."),
                question("Which has stronger dispersion forces, Ne or Xe?", [option("a", "Xe"), option("b", "Ne"), option("c", "They are equal")], "a", "Xenon has a larger, more polarizable electron cloud."),
                question("What generally happens to boiling point as intermolecular attraction strengthens?", [option("a", "It increases"), option("b", "It decreases"), option("c", "It becomes zero")], "a", "More energy is needed to separate the particles.")
            ]
        },
        {
            topic: "States of Matter",
            slug: "states-of-matter",
            icon: "🫧",
            description: "Use particle motion and energy to explain solids, liquids, gases, and phase changes.",
            why: "A particle model links macroscopic properties such as shape and compressibility to motion and spacing at the microscopic scale.",
            objectives: ["Compare particle arrangements in the three common states.", "Describe phase changes using energy flow.", "Distinguish temperature from heat transfer."],
            sections: [
                {
                    title: "Particle model of matter",
                    reading: [
                        "In a solid, particles are close together and mainly vibrate about fixed positions. A liquid's particles remain close but can move past one another. Gas particles are far apart and move freely, making gases compressible.",
                        "The average kinetic energy of particles is related to temperature. At the same temperature, particles of different substances do not necessarily have identical speeds because their masses differ."
                    ],
                    principle: "State depends on particle arrangement, motion, and the balance between kinetic energy and attractions.",
                    example: {
                        prompt: "Why can a gas be compressed much more than a liquid?",
                        steps: ["Gas particles are separated by relatively large empty spaces.", "Compression reduces the spacing between particles.", "Liquid particles are already close together, so there is much less empty space to reduce."],
                        answer: "Gas particles have much more space between them."
                    },
                    check: question("Which state has particles that move past one another while remaining close together?", [option("a", "Liquid"), option("b", "Solid"), option("c", "Gas only")], "a", "Liquid particles are close but mobile relative to one another."),
                    practice: question("Which state is generally easiest to compress?", [option("a", "Gas"), option("b", "Liquid"), option("c", "Solid")], "a", "Gas particles have substantial space between them.", "Consider where there is the most empty space.")
                },
                {
                    title: "Phase changes and energy",
                    reading: [
                        "Melting, vaporization, and sublimation are endothermic: the substance absorbs energy to overcome some particle attractions. Freezing, condensation, and deposition are exothermic: energy leaves the substance as attractions form.",
                        "During a pure substance's phase change at constant pressure, temperature remains constant while energy changes particle arrangement and potential energy. Between phase changes, added energy usually increases average kinetic energy and temperature."
                    ],
                    principle: "Endothermic phase changes absorb energy; exothermic phase changes release energy.",
                    example: {
                        prompt: "What happens to energy and temperature as pure ice melts at its melting point?",
                        steps: ["Melting is endothermic, so heat enters the ice–water system.", "The energy is used mainly to loosen the solid structure.", "At constant pressure, the temperature stays at the melting point until the phase change is complete."],
                        answer: "Energy is absorbed while temperature remains constant during melting."
                    },
                    check: question("Is condensation endothermic or exothermic for the substance?", [option("a", "Exothermic"), option("b", "Endothermic"), option("c", "Neither; no energy moves")], "a", "Gas particles release energy as they form the more strongly attracted liquid."),
                    practice: question("Which process absorbs energy from the surroundings?", [option("a", "Vaporization"), option("b", "Freezing"), option("c", "Deposition")], "a", "Vaporization requires energy to separate particles into the gas phase.", "Choose the change toward greater particle separation.")
                },
                {
                    title: "Heating curves and temperature",
                    reading: [
                        "A heating curve plots temperature against energy added. Sloped segments represent warming within one phase; flat segments represent phase changes at constant temperature. The energy for a phase change depends on amount and the substance's latent heat.",
                        "Heat q is energy transferred because of a temperature difference. It is not the same as temperature, which relates to average particle kinetic energy. For a temperature change within one phase, q = mcΔT."
                    ],
                    principle: "Use q = mcΔT only for a temperature change within a single phase; use phase-change energy for a plateau.",
                    example: {
                        prompt: "How much heat warms 50.0 g of water by 10.0 °C? Use c = 4.184 J g⁻¹ °C⁻¹.",
                        steps: ["Use q = mcΔT.", "q = (50.0 g)(4.184 J g⁻¹ °C⁻¹)(10.0 °C).", "Grams and degrees Celsius cancel, leaving joules.", "q = 2092 J; with three significant figures, q = 2.09 × 10³ J."],
                        answer: "2.09 × 10³ J absorbed"
                    },
                    check: question("What does a flat segment on a heating curve usually indicate?", [option("a", "A phase change"), option("b", "No energy is absorbed"), option("c", "The sample has no particles")], "a", "Energy changes particle arrangement during the phase change while temperature remains constant."),
                    practice: question("In q = mcΔT, what does c represent?", [option("a", "Specific heat capacity"), option("b", "Concentration"), option("c", "Final temperature")], "a", "Specific heat capacity is the energy needed per unit mass per degree temperature change.", "Look for the quantity with units such as J g⁻¹ °C⁻¹.")
                }
            ],
            challenge: [
                question("Which phase change is exothermic?", [option("a", "Freezing"), option("b", "Melting"), option("c", "Sublimation")], "a", "Freezing releases energy as particles form a more ordered solid."),
                question("Why does temperature stay constant during a pure substance's melting plateau?", [option("a", "Energy changes particle arrangement rather than average kinetic energy"), option("b", "The sample stops absorbing energy"), option("c", "The thermometer stops working")], "a", "Added energy is used to overcome attractions during the phase change."),
                question("A gas's high compressibility is mainly due to what?", [option("a", "Large spaces between particles"), option("b", "Particles having no mass"), option("c", "Strong covalent bonds between gas particles")], "a", "The particle model places gas particles far apart.")
            ]
        },
        {
            topic: "Chemical Equations",
            slug: "chemical-equations",
            icon: "🧮",
            description: "Read, balance, and interpret equations as conservation-based particle relationships.",
            why: "A balanced equation is the bridge between a reaction at the particle level and quantitative calculations in the laboratory.",
            objectives: ["Interpret symbols, coefficients, and state labels.", "Balance equations using conservation of atoms.", "Use balanced coefficients as mole ratios."],
            sections: [
                {
                    title: "Reading a chemical equation",
                    reading: [
                        "Reactants appear to the left of the arrow and products to the right. Coefficients show relative numbers of particles or moles. Subscripts are part of a chemical formula and describe the composition of each particle.",
                        "State symbols are (s), (l), (g), and (aq), meaning solid, liquid, gas, and dissolved in water. A catalyst or reaction condition may be written above the arrow."
                    ],
                    principle: "Changing a coefficient changes the amount; changing a subscript changes the substance.",
                    example: {
                        prompt: "Interpret 2H₂(g) + O₂(g) → 2H₂O(g).",
                        steps: ["The reactants are hydrogen gas and oxygen gas.", "Two H₂ molecules provide four H atoms; one O₂ provides two O atoms.", "The products are two H₂O molecules, containing four H and two O atoms total.", "The coefficients describe particle or mole ratios, not mass ratios."],
                        answer: "2 mol H₂ reacts with 1 mol O₂ to form 2 mol H₂O."
                    },
                    check: question("What does the coefficient 3 in 3CO₂ represent?", [option("a", "Three CO₂ particles or moles"), option("b", "Three oxygen atoms in each molecule"), option("c", "Three carbon atoms in each molecule")], "a", "A coefficient multiplies the entire formula unit."),
                    practice: question("In 2Al(s) + 3Cl₂(g) → 2AlCl₃(s), how many chlorine atoms are represented on each side?", [option("a", "6"), option("b", "3"), option("c", "2")], "a", "Three Cl₂ molecules contain six chlorine atoms; two AlCl₃ units also contain six.", "Multiply the coefficient by the subscript.")
                },
                {
                    title: "Balancing equations",
                    reading: [
                        "Chemical equations are balanced by changing coefficients so each element has the same atom count on both sides. This reflects conservation of atoms in a chemical reaction. Never change subscripts to balance an equation because doing so changes the reactants or products.",
                        "A reliable method is to count atoms, balance elements that appear in fewer compounds first, leave H and O for later when practical, then reduce coefficients to the smallest whole-number ratio and check every element."
                    ],
                    principle: "Balance atoms by adjusting coefficients only; the simplest whole-number coefficients are preferred.",
                    example: {
                        prompt: "Balance N₂ + H₂ → NH₃.",
                        steps: ["Start with N₂: two N atoms require 2NH₃ on the product side.", "That gives 6 H atoms in products, so use 3H₂.", "Check: 2 N and 6 H on each side."],
                        answer: "N₂ + 3H₂ → 2NH₃"
                    },
                    check: question("Which change is allowed when balancing an equation?", [option("a", "Changing a coefficient"), option("b", "Changing a formula subscript"), option("c", "Deleting a product")], "a", "Only coefficients may be changed without changing the chemical identities."),
                    practice: question("What coefficient belongs before O₂ in 2H₂ + O₂ → 2H₂O?", [option("a", "1"), option("b", "2"), option("c", "3")], "a", "One O₂ supplies the two oxygen atoms in 2H₂O.", "Count oxygen atoms after balancing hydrogen.")
                },
                {
                    title: "Equations as mole ratios",
                    reading: [
                        "Once balanced, coefficients give conversion ratios among substances. These ratios apply to particles and moles because each mole contains the same number of entities. They do not directly give gram ratios.",
                        "For 2H₂ + O₂ → 2H₂O, the mole ratio H₂:O₂:H₂O is 2:1:2. Use the ratio whose starting substance cancels and whose target substance remains."
                    ],
                    principle: "Convert to moles before applying equation coefficients to measured chemical amounts.",
                    example: {
                        prompt: "How many moles of water form from 3.0 mol H₂ with excess O₂?",
                        steps: ["Use the balanced equation 2H₂ + O₂ → 2H₂O.", "The ratio is 2 mol H₂O / 2 mol H₂.", "3.0 mol H₂ × (2 mol H₂O / 2 mol H₂) = 3.0 mol H₂O."],
                        answer: "3.0 mol H₂O"
                    },
                    check: question("In 2H₂ + O₂ → 2H₂O, what is the H₂:O₂ mole ratio?", [option("a", "2:1"), option("b", "1:2"), option("c", "2:2")], "a", "The coefficients show two moles of hydrogen for every one mole of oxygen."),
                    practice: question("How many moles of O₂ are needed for 4.0 mol H₂, with the equation 2H₂ + O₂ → 2H₂O?", [option("a", "2.0 mol"), option("b", "4.0 mol"), option("c", "8.0 mol")], "a", "4.0 mol H₂ × (1 mol O₂ / 2 mol H₂) = 2.0 mol O₂.", "Use the 1:2 O₂-to-H₂ coefficient ratio.")
                }
            ],
            challenge: [
                question("Which is a balanced equation for forming water?", [option("a", "2H₂ + O₂ → 2H₂O"), option("b", "H₂ + O₂ → H₂O"), option("c", "H₂ + 2O₂ → H₂O")], "a", "Both sides contain four H atoms and two O atoms."),
                question("What must never be changed to balance an equation?", [option("a", "A formula subscript"), option("b", "A coefficient"), option("c", "A state symbol")], "a", "Changing a subscript changes the identity of the substance."),
                question("For 2Al + 3Cl₂ → 2AlCl₃, how many moles of Cl₂ react with 4 mol Al?", [option("a", "6 mol"), option("b", "4 mol"), option("c", "2 mol")], "a", "The ratio is 3 mol Cl₂ per 2 mol Al; 4 mol Al requires 6 mol Cl₂.")
            ]
        },
        {
            topic: "Chemical Reactions",
            slug: "chemical-reactions",
            icon: "✨",
            description: "Classify common reactions and reason about reactants, products, and limiting amounts.",
            why: "Reaction patterns help predict products, while stoichiometry determines how much product can actually form.",
            objectives: ["Recognize common reaction patterns.", "Use activity and solubility ideas to predict products.", "Identify a limiting reactant and theoretical yield."],
            sections: [
                {
                    title: "Recognizing reaction patterns",
                    reading: [
                        "Synthesis combines substances into a product; decomposition breaks one compound into simpler substances. Single-replacement reactions exchange an element for another in a compound, while double-replacement reactions exchange ions between aqueous compounds.",
                        "Combustion of a hydrocarbon in sufficient oxygen typically produces carbon dioxide and water. A pattern is a prediction aid, not proof: products must also be chemically plausible and the equation balanced."
                    ],
                    principle: "Classify by how reactant particles are rearranged, then check whether the proposed products are reasonable.",
                    example: {
                        prompt: "Classify 2KClO₃(s) → 2KCl(s) + 3O₂(g).",
                        steps: ["There is one reactant compound.", "It forms two simpler products.", "This matches the decomposition pattern."],
                        answer: "Decomposition"
                    },
                    check: question("What pattern is A + BC → AC + B?", [option("a", "Single replacement"), option("b", "Synthesis"), option("c", "Decomposition")], "a", "An element replaces another element in a compound."),
                    practice: question("What reaction type is 2Mg + O₂ → 2MgO?", [option("a", "Synthesis"), option("b", "Double replacement"), option("c", "Decomposition")], "a", "Two reactants combine to make one compound.", "Look at the number and arrangement of reactants and products.")
                },
                {
                    title: "Aqueous reactions and net ionic ideas",
                    reading: [
                        "In a double-replacement reaction, ions exchange partners. A reaction is driven forward when it forms a precipitate, a gas, or a weak electrolyte such as water. Solubility rules help identify insoluble ionic products.",
                        "A complete ionic equation separates strong aqueous electrolytes into ions. Spectator ions appear unchanged on both sides and can be canceled to give the net ionic equation, which shows the particles undergoing chemical change."
                    ],
                    principle: "Only aqueous strong electrolytes are split into ions; solids, liquids, gases, and weak electrolytes remain intact.",
                    example: {
                        prompt: "Write the net ionic equation when aqueous AgNO₃ and NaCl form AgCl(s).",
                        steps: ["Molecular equation: AgNO₃(aq) + NaCl(aq) → AgCl(s) + NaNO₃(aq).", "Separate soluble salts: Ag⁺ + NO₃⁻ + Na⁺ + Cl⁻ → AgCl(s) + Na⁺ + NO₃⁻.", "Cancel spectator Na⁺ and NO₃⁻ ions."],
                        answer: "Ag⁺(aq) + Cl⁻(aq) → AgCl(s)"
                    },
                    check: question("Which product is evidence of a precipitation reaction?", [option("a", "An insoluble solid"), option("b", "A catalyst"), option("c", "A coefficient")], "a", "A precipitate is an insoluble solid formed from solution."),
                    practice: question("In Ag⁺ + NO₃⁻ + Na⁺ + Cl⁻ → AgCl(s) + Na⁺ + NO₃⁻, which ion is a spectator?", [option("a", "Na⁺"), option("b", "Ag⁺"), option("c", "Cl⁻")], "a", "Na⁺ appears unchanged on both sides and is canceled.", "A spectator ion is unchanged in the complete ionic equation.")
                },
                {
                    title: "Limiting reactants and yield",
                    reading: [
                        "The limiting reactant is consumed first and sets the maximum amount of product. Other reactants are in excess. Compare amounts by converting each reactant to the amount of the same product using the balanced equation; the smaller product amount identifies the limiting reactant.",
                        "Theoretical yield is the maximum predicted product. Actual yield is measured. Percent yield = (actual yield ÷ theoretical yield) × 100%, and a value below 100% can result from incomplete reaction, side reactions, or product loss."
                    ],
                    principle: "Determine the limiting reactant by calculating product from each reactant, not by comparing grams directly.",
                    example: {
                        prompt: "For 2H₂ + O₂ → 2H₂O, which limits when 3 mol H₂ reacts with 2 mol O₂?",
                        steps: ["3 mol H₂ can form 3 mol H₂O using the 2:2 ratio.", "2 mol O₂ can form 4 mol H₂O using the 1:2 ratio.", "Hydrogen predicts less product, so H₂ is limiting."],
                        answer: "H₂ is limiting; the theoretical yield is 3 mol H₂O."
                    },
                    check: question("What sets the theoretical yield?", [option("a", "The limiting reactant"), option("b", "The excess reactant only"), option("c", "The largest reactant mass")], "a", "The limiting reactant runs out first and fixes the maximum product amount."),
                    practice: question("If actual yield is 8.0 g and theoretical yield is 10.0 g, what is percent yield?", [option("a", "80%"), option("b", "125%"), option("c", "2.0%")], "a", "(8.0 g / 10.0 g) × 100% = 80%.", "Divide actual by theoretical, then multiply by 100%.")
                }
            ],
            challenge: [
                question("A single compound breaks into simpler substances. Which pattern is this?", [option("a", "Decomposition"), option("b", "Synthesis"), option("c", "Single replacement")], "a", "Decomposition has one compound reactant forming multiple products."),
                question("For 2H₂ + O₂ → 2H₂O, what limits if 1 mol H₂ reacts with 1 mol O₂?", [option("a", "H₂"), option("b", "O₂"), option("c", "Neither")], "a", "1 mol H₂ makes 1 mol H₂O; 1 mol O₂ could make 2 mol H₂O, so H₂ limits."),
                question("An experiment gives 6.0 g product from a 7.5 g theoretical yield. What is the percent yield?", [option("a", "80%"), option("b", "125%"), option("c", "1.5%")], "a", "6.0 ÷ 7.5 × 100% = 80%.")
            ]
        },
        {
            topic: "Gas Laws",
            slug: "gas-laws",
            icon: "🎈",
            description: "Relate gas pressure, volume, temperature, and amount with consistent units.",
            why: "Gas laws describe measurable changes in everyday systems such as breathing, tires, weather balloons, and reaction vessels.",
            objectives: ["Apply Boyle's and Charles's laws.", "Use Kelvin temperature in gas-law calculations.", "Apply the ideal gas law with consistent units."],
            sections: [
                {
                    title: "Pressure, volume, and temperature",
                    reading: [
                        "Gas pressure results from particle collisions with container walls. At fixed amount and temperature, Boyle's law states P₁V₁ = P₂V₂: pressure and volume vary inversely.",
                        "At fixed amount and pressure, Charles's law states V₁/T₁ = V₂/T₂. Temperature must be absolute (kelvin), because gas volume is proportional to absolute temperature in this model."
                    ],
                    principle: "Convert °C to K using T(K) = T(°C) + 273.15 before using gas laws.",
                    example: {
                        prompt: "A gas occupies 2.0 L at 100 kPa. What volume will it occupy at 200 kPa if temperature and amount stay constant?",
                        steps: ["Use Boyle's law: P₁V₁ = P₂V₂.", "V₂ = P₁V₁/P₂ = (100 kPa)(2.0 L)/(200 kPa).", "Pressure units cancel, leaving litres."],
                        answer: "1.0 L"
                    },
                    check: question("A gas is compressed at constant temperature. What happens to pressure?", [option("a", "It increases"), option("b", "It decreases"), option("c", "It must become zero")], "a", "At fixed temperature and amount, pressure and volume are inversely proportional."),
                    practice: question("What is 27.0 °C in kelvin?", [option("a", "300.2 K"), option("b", "246.2 K"), option("c", "27.0 K")], "a", "27.0 + 273.15 = 300.15 K, which rounds to 300.2 K.", "Add 273.15, not 273.15 multiplied by the Celsius temperature.")
                },
                {
                    title: "Combined gas law",
                    reading: [
                        "For a fixed amount of gas, pressure, volume, and absolute temperature are related by P₁V₁/T₁ = P₂V₂/T₂. Use it when more than one of those conditions changes.",
                        "Keep pressure and volume units consistent between the initial and final states. Since temperature appears as a ratio, use kelvin. Rearrange algebraically for the unknown before substituting."
                    ],
                    principle: "The combined gas law assumes the number of gas particles remains fixed.",
                    example: {
                        prompt: "A 1.50 L gas sample at 100 kPa and 300 K is heated to 360 K at constant pressure. Find its new volume.",
                        steps: ["Use V₁/T₁ = V₂/T₂ because pressure is constant.", "V₂ = V₁T₂/T₁ = (1.50 L)(360 K)/(300 K).", "Kelvin cancels; keep three significant figures."],
                        answer: "1.80 L"
                    },
                    check: question("Which temperature scale belongs in the combined gas law?", [option("a", "Kelvin"), option("b", "Celsius"), option("c", "Fahrenheit")], "a", "Gas-law temperature ratios require an absolute temperature scale."),
                    practice: question("At constant pressure, if kelvin temperature doubles, what happens to gas volume?", [option("a", "It doubles"), option("b", "It halves"), option("c", "It stays fixed")], "a", "Charles's law gives direct proportionality between volume and kelvin temperature.", "At constant pressure, V/T is constant.")
                },
                {
                    title: "The ideal gas law",
                    reading: [
                        "The ideal gas law, PV = nRT, relates pressure P, volume V, amount n, and absolute temperature T. A common value is R = 8.314 L·kPa·mol⁻¹·K⁻¹ when pressure is in kPa and volume in litres.",
                        "The ideal model works best at relatively low pressure and high temperature, where particle volume and attractions are less important. Real gases deviate more at high pressure and low temperature."
                    ],
                    principle: "Choose an R value whose units match the pressure and volume units in the problem.",
                    example: {
                        prompt: "Find the amount of gas in 2.46 L at 100.0 kPa and 300.0 K. Use R = 8.314 L·kPa·mol⁻¹·K⁻¹.",
                        steps: ["Rearrange PV = nRT to n = PV/RT.", "n = (100.0 kPa)(2.46 L) / [(8.314 L·kPa·mol⁻¹·K⁻¹)(300.0 K)].", "Litres, kPa, and kelvin cancel, leaving mol.", "n = 0.0986 mol to three significant figures."],
                        answer: "0.0986 mol"
                    },
                    check: question("Which condition generally makes a real gas least ideal?", [option("a", "High pressure and low temperature"), option("b", "Low pressure and high temperature"), option("c", "A large container at high temperature")], "a", "High pressure and low temperature magnify particle-volume and attraction effects."),
                    practice: question("In PV = nRT, which variable must be in kelvin?", [option("a", "T"), option("b", "P"), option("c", "n")], "a", "T is absolute temperature in kelvin.", "The gas-law temperature is not measured in °C.")
                }
            ],
            challenge: [
                question("Which relationship describes Boyle's law at fixed temperature?", [option("a", "P₁V₁ = P₂V₂"), option("b", "V₁/T₁ = V₂/T₂"), option("c", "PV = nRT only")], "a", "Boyle's law relates pressure and volume for a fixed amount at constant temperature."),
                question("A gas at 300 K occupies 2.0 L. At constant pressure, what volume at 600 K?", [option("a", "4.0 L"), option("b", "1.0 L"), option("c", "2.0 L")], "a", "At constant pressure, volume doubles when kelvin temperature doubles."),
                question("What is the SI unit for amount n?", [option("a", "mol"), option("b", "K"), option("c", "Pa")], "a", "The amount of substance is measured in moles.")
            ]
        },
        {
            topic: "Solutions",
            slug: "solutions",
            icon: "🧪",
            description: "Describe solution composition and calculate concentration and dilution.",
            why: "Solutions are central to laboratory analysis, biological chemistry, and preparing mixtures at a desired concentration.",
            objectives: ["Identify solute, solvent, and solution.", "Calculate molarity from amount and volume.", "Solve dilution problems using conservation of solute."],
            sections: [
                {
                    title: "Solutes, solvents, and solubility",
                    reading: [
                        "A solution is a homogeneous mixture. The solute is dispersed in the solvent, usually the component present in greater amount. In an aqueous solution, water is the solvent.",
                        "Whether substances mix depends on particle attractions and conditions such as temperature and pressure. Solubility is the maximum amount that dissolves under specified conditions; it is not the same as dissolution rate."
                    ],
                    principle: "A saturated solution contains the maximum dissolved concentration at the stated conditions; excess undissolved solute may coexist with it.",
                    example: {
                        prompt: "In salt water made by dissolving NaCl in water, identify the solute and solvent.",
                        steps: ["NaCl is the substance being dispersed.", "Water is the dissolving medium and is present in the greater amount.", "The homogeneous mixture is the solution."],
                        answer: "NaCl is the solute; water is the solvent."
                    },
                    check: question("What does saturated mean at a specified temperature?", [option("a", "The solution contains the maximum dissolved amount at equilibrium"), option("b", "The solute dissolves instantly"), option("c", "There is no solvent")], "a", "Saturation refers to the equilibrium solubility limit under stated conditions."),
                    practice: question("In a dilute aqueous sugar solution, what is the solvent?", [option("a", "Water"), option("b", "Sugar"), option("c", "The whole mixture is the solute")], "a", "Water is the solvent in an aqueous solution.", "Aqueous means water is the solvent.")
                },
                {
                    title: "Molarity",
                    reading: [
                        "Molarity M is amount of dissolved solute divided by total solution volume in litres: M = n/V. Its unit is mol·L⁻¹, often written M. Use solution volume, not solvent volume.",
                        "If mass is given, convert to moles using molar mass before calculating molarity. A solution's concentration describes composition; it does not say how much total solution is present."
                    ],
                    principle: "M = moles of solute / litres of solution.",
                    example: {
                        prompt: "Find the molarity of 0.200 mol NaCl in 0.500 L of solution.",
                        steps: ["Use M = n/V.", "M = 0.200 mol ÷ 0.500 L.", "M = 0.400 mol/L; both inputs have three significant figures."],
                        answer: "0.400 M NaCl"
                    },
                    check: question("What volume unit is used directly in the molarity equation M = n/V?", [option("a", "L of solution"), option("b", "g of solvent"), option("c", "mL of solute")], "a", "Molarity uses litres of total solution."),
                    practice: question("What is the molarity of 0.75 mol solute in 1.5 L solution?", [option("a", "0.50 M"), option("b", "2.0 M"), option("c", "1.1 M")], "a", "0.75 mol ÷ 1.5 L = 0.50 M.", "Divide amount in moles by solution volume in litres.")
                },
                {
                    title: "Dilution and solution preparation",
                    reading: [
                        "Dilution adds solvent without changing the amount of solute. Because n = MV, the initial and final solute amounts are equal: M₁V₁ = M₂V₂. Use matching volume units on both sides.",
                        "When preparing a solution from a solid, dissolve the measured solute and bring the total solution to the calibration mark. Adding a measured volume of solvent instead would not necessarily give the intended final volume."
                    ],
                    principle: "Dilution changes concentration and volume, but conserves solute amount.",
                    example: {
                        prompt: "What final volume of 0.500 M solution can be made from 25.0 mL of 2.00 M stock?",
                        steps: ["Use M₁V₁ = M₂V₂.", "V₂ = M₁V₁/M₂ = (2.00 M)(25.0 mL)/(0.500 M).", "Molarity cancels; the answer is in mL.", "V₂ = 100. mL to three significant figures."],
                        answer: "100. mL"
                    },
                    check: question("During dilution, what remains constant?", [option("a", "Moles of solute"), option("b", "Molarity"), option("c", "Solution volume")], "a", "Adding solvent changes volume and concentration but not the amount of solute."),
                    practice: question("A 1.0 M stock is diluted to twice its original volume. What is the new concentration?", [option("a", "0.50 M"), option("b", "2.0 M"), option("c", "1.0 M")], "a", "With fixed solute amount, doubling volume halves concentration.", "Use M₁V₁ = M₂V₂.")
                }
            ],
            challenge: [
                question("What is the molarity of 0.20 mol solute in 0.40 L solution?", [option("a", "0.50 M"), option("b", "2.0 M"), option("c", "0.080 M")], "a", "M = n/V = 0.20/0.40 = 0.50 M."),
                question("What is conserved when a solution is diluted?", [option("a", "Moles of solute"), option("b", "Molarity"), option("c", "Volume")], "a", "No solute is added or removed during dilution."),
                question("A solution has 2.0 mol solute in 1.0 L. What is its molarity?", [option("a", "2.0 M"), option("b", "0.50 M"), option("c", "3.0 M")], "a", "M = 2.0 mol ÷ 1.0 L = 2.0 M.")
            ]
        },
        {
            topic: "Acids and Bases",
            slug: "acids-and-bases",
            icon: "🧫",
            description: "Model acids, bases, pH, neutralization, and titration quantitatively.",
            why: "Acid–base chemistry explains biological buffers, water quality, household reactions, and many analytical methods.",
            objectives: ["Compare Arrhenius and Brønsted–Lowry models.", "Interpret pH on a logarithmic scale.", "Use stoichiometry in neutralization and titration."],
            sections: [
                {
                    title: "Acid–base models",
                    reading: [
                        "An Arrhenius acid increases H₃O⁺ concentration in water; an Arrhenius base increases OH⁻. The Brønsted–Lowry model is broader: an acid donates a proton and a base accepts one.",
                        "Strong and weak describe the extent of ionization, not concentration. A strong acid ionizes nearly completely in water; a weak acid establishes an equilibrium with much of the acid un-ionized."
                    ],
                    principle: "Strength is about ionization; concentration is about the amount per volume.",
                    example: {
                        prompt: "In NH₃ + H₂O ⇌ NH₄⁺ + OH⁻, identify the Brønsted–Lowry base.",
                        steps: ["A base accepts a proton.", "NH₃ becomes NH₄⁺, so NH₃ accepts H⁺ from water.", "Water donates the proton in this reaction."],
                        answer: "NH₃ is the base; H₂O is the acid."
                    },
                    check: question("What does a Brønsted–Lowry acid do?", [option("a", "Donates a proton"), option("b", "Accepts a proton"), option("c", "Must contain OH⁻")], "a", "A Brønsted–Lowry acid is a proton donor."),
                    practice: question("Is a concentrated weak acid necessarily strong?", [option("a", "No; strength and concentration are different"), option("b", "Yes, concentration defines strength"), option("c", "Only if it is heated")], "a", "A weak acid may be concentrated but still only partially ionizes.", "Separate extent of ionization from amount per volume.")
                },
                {
                    title: "pH and logarithmic scale",
                    reading: [
                        "For dilute aqueous solutions near 25 °C, pH = −log₁₀[H₃O⁺], where concentration is expressed in mol·L⁻¹. A one-unit pH change corresponds to a tenfold change in hydronium concentration.",
                        "At 25 °C, pH below 7 is acidic, pH 7 is neutral, and pH above 7 is basic. Neutral pH depends on temperature because water's ionization changes with temperature; pH 7 is not universal at every temperature."
                    ],
                    principle: "A lower pH means a greater hydronium concentration in the same stated conditions.",
                    example: {
                        prompt: "Find the pH when [H₃O⁺] = 1.0 × 10⁻³ M.",
                        steps: ["Use pH = −log₁₀[H₃O⁺].", "pH = −log₁₀(1.0 × 10⁻³).", "The logarithm is −3, so the negative sign gives pH 3.00.", "The two significant figures in concentration correspond to two decimal places in pH."],
                        answer: "pH = 3.00"
                    },
                    check: question("How does [H₃O⁺] change when pH decreases by one unit?", [option("a", "It increases tenfold"), option("b", "It decreases tenfold"), option("c", "It stays the same")], "a", "The pH scale is logarithmic: one lower pH means ten times greater hydronium concentration."),
                    practice: question("At 25 °C, is a solution with pH 9 acidic, neutral, or basic?", [option("a", "Basic"), option("b", "Neutral"), option("c", "Acidic")], "a", "At 25 °C, pH above 7 is basic.", "Compare with neutral pH at 25 °C.")
                },
                {
                    title: "Neutralization and titration",
                    reading: [
                        "In an acid–base neutralization, H₃O⁺ and OH⁻ form water: H₃O⁺ + OH⁻ → 2H₂O. The net ionic result is the same even when the acid and base are not both strong, but weak species may remain at equilibrium.",
                        "A titration uses a solution of known concentration to determine an unknown concentration. At the equivalence point, reactants have combined in the stoichiometric ratio from the balanced equation; the indicator endpoint is an experimental signal chosen to be close to that point."
                    ],
                    principle: "Use the balanced reaction ratio; MₐVₐ = MᵦVᵦ applies directly only for a 1:1 acid–base reaction.",
                    example: {
                        prompt: "What volume of 0.100 M NaOH neutralizes 25.0 mL of 0.100 M HCl?",
                        steps: ["The balanced reaction is HCl + NaOH → NaCl + H₂O, a 1:1 ratio.", "MₐVₐ = MᵦVᵦ.", "Vᵦ = (0.100 M)(25.0 mL)/(0.100 M) = 25.0 mL."],
                        answer: "25.0 mL NaOH"
                    },
                    check: question("At the equivalence point, what has been reached?", [option("a", "Stoichiometric amounts have reacted"), option("b", "The pH is always exactly 7"), option("c", "All water has evaporated")], "a", "Equivalence is defined by stoichiometric reaction amounts; pH depends on the acid and base."),
                    practice: question("How many moles of OH⁻ are in 20.0 mL of 0.150 M NaOH?", [option("a", "0.00300 mol"), option("b", "3.00 mol"), option("c", "0.0300 mol")], "a", "0.150 mol/L × 0.0200 L = 0.00300 mol.", "Convert mL to L before using n = MV.")
                }
            ],
            challenge: [
                question("What is the pH of 1.0 × 10⁻⁴ M H₃O⁺?", [option("a", "4.00"), option("b", "−4.00"), option("c", "10.0")], "a", "pH = −log₁₀(10⁻⁴) = 4.00."),
                question("A Brønsted–Lowry base is a proton…", [option("a", "Acceptor"), option("b", "Donor"), option("c", "Neutron")], "a", "A Brønsted–Lowry base accepts H⁺."),
                question("How many moles are in 0.0500 L of 0.200 M acid?", [option("a", "0.0100 mol"), option("b", "4.00 mol"), option("c", "0.250 mol")], "a", "n = MV = (0.200 mol/L)(0.0500 L) = 0.0100 mol.")
            ]
        },
        {
            topic: "Thermochemistry",
            slug: "thermochemistry",
            icon: "🌡️",
            description: "Track heat transfer, calorimetry, reaction enthalpy, and energy conservation.",
            why: "Thermochemistry quantifies energy changes in reactions and helps compare fuels, materials, and laboratory processes.",
            objectives: ["Distinguish system from surroundings.", "Determine heat using calorimetry.", "Interpret exothermic and endothermic enthalpy changes."],
            sections: [
                {
                    title: "Heat, work, and the system",
                    reading: [
                        "The system is the part being studied; everything else is the surroundings. Heat q is energy transferred because of a temperature difference. Energy entering the system gives q > 0; energy leaving gives q < 0.",
                        "An exothermic process releases heat from the system to the surroundings and has ΔH < 0 at constant pressure. An endothermic process absorbs heat and has ΔH > 0. The sign always depends on which system is defined."
                    ],
                    principle: "State the system before assigning signs to heat or enthalpy.",
                    example: {
                        prompt: "A reaction warms the surrounding solution. What is the sign of the reaction system's ΔH at constant pressure?",
                        steps: ["The surroundings gain heat.", "The reaction system loses that heat.", "Heat leaves the system, so the reaction is exothermic and ΔH is negative."],
                        answer: "ΔH < 0"
                    },
                    check: question("What is the sign of ΔH for an exothermic reaction system?", [option("a", "Negative"), option("b", "Positive"), option("c", "Always zero")], "a", "An exothermic system releases heat to the surroundings."),
                    practice: question("If a system absorbs 250 J of heat, what is q for the system?", [option("a", "+250 J"), option("b", "−250 J"), option("c", "0 J")], "a", "Heat entering the system is positive by convention.", "Use the system's perspective.")
                },
                {
                    title: "Calorimetry",
                    reading: [
                        "Calorimetry measures heat transfer from a temperature change. For a substance that remains in one phase, q = mcΔT, where m is mass, c is specific heat capacity, and ΔT = Tfinal − Tinitial.",
                        "In an insulated coffee-cup calorimeter, heat lost by the reacting system is approximately gained by the solution: qreaction + qsolution ≈ 0. Include the calorimeter itself when its heat capacity is provided."
                    ],
                    principle: "A sign check matters: a warming solution has qsolution > 0, so the reaction generally has qreaction < 0.",
                    example: {
                        prompt: "A 100.0 g solution warms from 20.0 °C to 24.0 °C. Find qsolution using c = 4.18 J g⁻¹ °C⁻¹.",
                        steps: ["ΔT = 24.0 − 20.0 = 4.0 °C.", "q = mcΔT = (100.0 g)(4.18 J g⁻¹ °C⁻¹)(4.0 °C).", "Mass and temperature units cancel, leaving joules.", "qsolution = 1672 J; with two significant figures from ΔT, qsolution = 1.7 × 10³ J."],
                        answer: "qsolution = +1.7 × 10³ J"
                    },
                    check: question("A solution's temperature rises during a reaction. What is the sign of qsolution?", [option("a", "Positive"), option("b", "Negative"), option("c", "Zero")], "a", "The solution absorbs heat as it warms."),
                    practice: question("What equation calculates heat for a temperature change with no phase change?", [option("a", "q = mcΔT"), option("b", "PV = nRT"), option("c", "M = n/V")], "a", "q = mcΔT relates mass, specific heat, and temperature change.", "Match heat, mass, and temperature variables.")
                },
                {
                    title: "Enthalpy and reaction quantities",
                    reading: [
                        "Enthalpy change ΔH is heat transferred at constant pressure. A thermochemical equation specifies a reaction as written; reversing it changes the sign of ΔH, and multiplying all coefficients multiplies ΔH by the same factor.",
                        "Molar enthalpy is energy per mole of reaction extent or substance, depending on how it is defined. Check the equation and units carefully before converting between heat and amount."
                    ],
                    principle: "Scale ΔH with the balanced equation coefficients and keep its sign tied to the reaction direction.",
                    example: {
                        prompt: "If 2H₂(g) + O₂(g) → 2H₂O(l) has ΔH = −572 kJ, what is ΔH for forming 1 mol H₂O(l)?",
                        steps: ["The equation forms 2 mol H₂O for −572 kJ.", "Divide both the reaction amount and enthalpy by 2.", "The process remains exothermic, so the sign remains negative."],
                        answer: "−286 kJ per mol H₂O formed"
                    },
                    check: question("If a thermochemical equation is reversed, what happens to ΔH?", [option("a", "Its sign reverses"), option("b", "It is unchanged"), option("c", "It doubles automatically")], "a", "Reversing the reaction reverses the direction of heat transfer."),
                    practice: question("If a reaction releases 50 kJ, is ΔH positive or negative for the system?", [option("a", "Negative"), option("b", "Positive"), option("c", "It depends only on temperature")], "a", "Heat released by the system corresponds to negative ΔH.", "Released means energy leaves the defined system.")
                }
            ],
            challenge: [
                question("A reaction absorbs heat from its surroundings. How is it classified?", [option("a", "Endothermic"), option("b", "Exothermic"), option("c", "Adiabatic by definition")], "a", "The system absorbs heat, so ΔH is positive for an endothermic process."),
                question("A 50.0 g sample warms 2.0 °C with c = 4.0 J g⁻¹ °C⁻¹. What is q?", [option("a", "400 J"), option("b", "100 J"), option("c", "0.10 J")], "a", "q = (50.0)(4.0)(2.0) = 400 J."),
                question("What happens to ΔH when a thermochemical equation is reversed?", [option("a", "The sign changes"), option("b", "The sign stays the same"), option("c", "It becomes zero")], "a", "Reversing a reaction reverses the heat change.")
            ]
        }
    ];

    const lessonIds = new Set();
    window.CHEM_LESSONS.forEach((lesson) => {
        if (lessonIds.has(lesson.slug) || lesson.sections.length < 2 || lesson.challenge.length < 1) {
            throw new Error(`Invalid lesson definition for ${lesson.topic}.`);
        }
        lessonIds.add(lesson.slug);
    });
})();
