alter table private.jeopardy_pvp_question_bank
    drop constraint if exists jeopardy_pvp_question_bank_category_points_key;

update private.jeopardy_pvp_question_bank
set
    clue = 'This substance donates hydrogen ions when dissolved in water.',
    accepted_answers = array['acid','acids'],
    correct_answer = 'acid'
where question_id = 'acids-200-1';

insert into private.jeopardy_pvp_question_bank
    (question_id, category, points, clue, accepted_answers, correct_answer)
values
    ('acids-200-2', 'Acids and Bases', 200, 'This substance accepts hydrogen ions or produces hydroxide ions in aqueous solution.', array['base','bases'], 'base'),
    ('acids-400-2', 'Acids and Bases', 400, 'This compound, with the chemical formula H₂O, is produced when hydrogen ions combine with hydroxide ions during neutralization.', array['water'], 'water'),
    ('acids-600-2', 'Acids and Bases', 600, 'This scale measures how acidic or basic an aqueous solution is, typically ranging from 0 to 14.', array['pH','pH scale'], 'pH'),
    ('acids-800-2', 'Acids and Bases', 800, 'This acid contains two ionizable hydrogen atoms that can be released in separate steps.', array['diprotic acid','diprotic acids','diprotic'], 'diprotic acid'),
    ('acids-1000-2', 'Acids and Bases', 1000, 'This substance changes color depending on the acidity or basicity of a solution.', array['acid-base indicator','acid base indicator','acidbase indicator'], 'acid-base indicator'),
    ('atomic-200-2', 'Atomic Structure', 200, 'This negatively charged subatomic particle is found outside the nucleus.', array['electron','electrons'], 'electron'),
    ('atomic-200-3', 'Atomic Structure', 200, 'This positively charged subatomic particle is located in the nucleus.', array['proton','protons'], 'proton'),
    ('atomic-400-2', 'Atomic Structure', 400, 'This dense central region of an atom contains protons and neutrons.', array['nucleus','atomic nucleus','nuclei'], 'nucleus'),
    ('atomic-400-3', 'Atomic Structure', 400, 'This whole-number value identifies an element based on the number of protons in its atoms.', array['atomic number'], 'atomic number'),
    ('atomic-600-2', 'Atomic Structure', 600, 'This quantity represents the mass of an individual atom and is largely determined by its protons and neutrons.', array['atomic mass','mass number'], 'atomic mass'),
    ('atomic-800-2', 'Atomic Structure', 800, 'Labeled s, p, d, and f, these divisions exist within an atom''s main energy levels.', array['subshells','subshell'], 'subshells'),
    ('atomic-1000-2', 'Atomic Structure', 1000, 'This type of ion forms when an atom gains electrons and becomes negatively charged.', array['anion','anions'], 'anion'),
    ('bonding-200-2', 'Chemical Bonding', 200, 'In this type of chemical bond, atoms achieve stability by sharing pairs of electrons.', array['covalent bond','covalent bonds','covalent'], 'covalent bond'),
    ('bonding-400-2', 'Chemical Bonding', 400, 'This property describes how strongly an atom attracts shared electrons toward itself in a chemical bond.', array['electronegativity'], 'electronegativity'),
    ('bonding-600-2', 'Chemical Bonding', 600, 'This type of covalent bond involves an equal or nearly equal sharing of electrons between atoms.', array['nonpolar covalent bond','nonpolar covalent bonds','nonpolar'], 'nonpolar covalent bond'),
    ('bonding-800-2', 'Chemical Bonding', 800, 'This type of bond usually occurs between nonmetals, which share electrons to form a stable arrangement. One example is Water', array['covalent bond','covalent bonds','covalent'], 'covalent bond'),
    ('bonding-1000-2', 'Chemical Bonding', 1000, 'These electrons are found in the outermost energy level of an atom and are involved in forming chemical bonds.', array['valence electrons','valence electron','valence'], 'valence electrons'),
    ('equations-200-2', 'Chemical Equations', 200, 'These are the substances produced by a chemical reaction.', array['products','product'], 'products'),
    ('equations-400-2', 'Chemical Equations', 400, 'This number is written before a chemical formula to indicate the relative amount of a substance in an equation.', array['coefficient','coefficients'], 'coefficient'),
    ('equations-600-2', 'Chemical Equations', 600, 'This represents the maximum amount of product that can be formed from the limiting reagent.', array['theoretical yield','theoretical yields','theoreticalyield'], 'theoretical yield'),
    ('equations-800-2', 'Chemical Equations', 800, 'This reactant is completely consumed first and determines how much product can be formed.', array['limiting reagent','limiting reagents'], 'limiting reagent'),
    ('equations-1000-2', 'Chemical Equations', 1000, 'This chemical equation has equal numbers of each type of atom on both sides, following the Law of Conservation of Mass.', array['balanced chemical equation','balanced chemical equations','balanced'], 'balanced chemical equation'),
    ('reactions-200-2', 'Chemical Reactions', 200, 'This type of reaction involves a single compound breaking down into two or more simpler substances.', array['decomposition','decomposition reaction','decomposition reactions'], 'decomposition'),
    ('reactions-400-2', 'Chemical Reactions', 400, 'This form of energy is released during many combustion reactions, causing the surroundings to become warmer.', array['heat','heat energy','thermal energy','thermal'], 'heat'),
    ('reactions-600-2', 'Chemical Reactions', 600, 'This form of energy released during combustion can be seen in the glow of flames rather than felt as warmth.', array['light','light energy'], 'light'),
    ('reactions-800-2', 'Chemical Reactions', 800, 'This type of reaction involves two compounds exchanging ions to form two new compounds.', array['double displacement','double displacement reaction','double displacement reactions','double replacement','double replacement reaction','double replacement reactions','metathesis','metathesis reaction','metathesis reactions'], 'double displacement'),
    ('reactions-1000-2', 'Chemical Reactions', 1000, 'This state is reached when the forward and reverse reactions occur at equal rates, keeping the concentrations of reactants and products constant.', array['chemical equilibrium','equilibrium'], 'chemical equilibrium'),
    ('gaslaws-200-2', 'Gas Laws', 200, 'This property refers to the amount of space occupied by a gas.', array['volume'], 'volume'),
    ('gaslaws-200-3', 'Gas Laws', 200, 'This physical quantity measures the average kinetic energy of gas particles.', array['temperature'], 'temperature'),
    ('gaslaws-400-2', 'Gas Laws', 400, 'This law describes the direct relationship between the volume and absolute temperature of a gas when pressure remains constant.', array['charles''s law','charless law','charles law','charles'' law','charles'], 'charles''s law'),
    ('gaslaws-400-3', 'Gas Laws', 400, 'This law states that the volume of a gas is directly proportional to its number of moles when temperature and pressure remain constant.', array['avogadro''s law','avogadros law','avogadro'], 'avogadro''s law'),
    ('gaslaws-600-2', 'Gas Laws', 600, 'This equation relates the pressure, volume, temperature, and number of moles of an ideal gas.', array['ideal gas law','ideal gas'], 'ideal gas law'),
    ('gaslaws-600-3', 'Gas Laws', 600, 'This law states that the rate of diffusion or effusion of a gas is inversely proportional to the square root of its molar mass.', array['graham''s law','grahams law','graham''s'], 'graham''s law'),
    ('gaslaws-800-2', 'Gas Laws', 800, 'This process describes the spreading of gas particles from an area of higher concentration to an area of lower concentration.', array['diffusion'], 'diffusion'),
    ('gaslaws-1000-2', 'Gas Laws', 1000, 'This law states that the total pressure of a mixture of nonreacting gases equals the sum of the partial pressures of each gas.', array['dalton''s law of partial pressures','dalton''s law','daltons law of partial pressures','daltons law','dalton''s','daltons'], 'dalton''s law of partial pressures'),
    ('genchem-200-2', 'General Chemistry', 200, 'This pure substance consists of only one type of atom and cannot be broken down into simpler substances by chemical means.', array['element','elements'], 'element'),
    ('genchem-200-3', 'General Chemistry', 200, 'This group of two or more atoms is held together by chemical bonds and can consist of atoms of the same or different elements.', array['molecule','molecules'], 'molecule'),
    ('genchem-400-2', 'General Chemistry', 400, 'This combination of two or more substances involves no chemical bonding between the substances, allowing them to retain their individual properties.', array['mixture','mixtures'], 'mixture'),
    ('genchem-600-2', 'General Chemistry', 600, 'This characteristic describes a substance''s ability to undergo a chemical change and form new substances.', array['chemical property','chemical properties','chemical'], 'chemical property'),
    ('genchem-800-2', 'General Chemistry', 800, 'This type of mixture has a nonuniform composition, with components that can often be distinguished.', array['heterogeneous mixture','heterogeneous','heterogeneous mixtures'], 'heterogeneous mixture'),
    ('genchem-1000-2', 'General Chemistry', 1000, 'Unlike an intensive property, this characteristic depends on the amount of matter present, such as mass or volume.', array['extensive property','extensive properties','extensive'], 'extensive property'),
    ('imf-200-2', 'Intermolecular Forces', 200, 'These forces hold atoms together within a molecule.', array['intramolecular','intramolecular force','intramolecular forces'], 'intramolecular'),
    ('imf-400-2', 'Intermolecular Forces', 400, 'This type of intermolecular force occurs when hydrogen bonded to nitrogen, oxygen, or fluorine is attracted to a nearby molecule.', array['hydrogen bonding','hydrogen bond','hydrogen bonds'], 'hydrogen bonding'),
    ('imf-600-2', 'Intermolecular Forces', 600, 'This intermolecular force occurs between an ion and the partially charged end of a polar molecule.', array['ion-dipole interaction','ion-dipole interactions','ion-dipole force','ion-dipole forces','ion dipole interaction','ion dipole interactions','ion dipole force','ion dipole forces'], 'ion-dipole interaction'),
    ('imf-800-2', 'Intermolecular Forces', 800, 'It is a pair of equal and opposite electric charges or magnetic poles separated by a small distance ', array['dipole','dipoles'], 'dipole'),
    ('imf-1000-2', 'Intermolecular Forces', 1000, 'This Dutch physicist is known for his work on the behavior of gases and liquids, and the intermolecular forces named after him.', array['johannes van der waals'], 'johannes van der waals'),
    ('measurements-200-2', 'Measurements', 200, 'This describes how close a measured value is to the accepted value.', array['accuracy'], 'accuracy'),
    ('measurements-200-3', 'Measurements', 200, 'This describes how closely repeated measurements agree with one another.', array['precision'], 'precision'),
    ('measurements-400-2', 'Measurements', 400, 'This SI base unit is used to measure the mass of an object.', array['kilogram','kilograms'], 'kilogram'),
    ('measurements-400-3', 'Measurements', 400, 'Represented by the symbol s, this SI base unit is used to measure the duration of an event.', array['second','seconds'], 'second'),
    ('measurements-600-2', 'Measurements', 600, 'This SI base unit represents the quantity of particles, such as atoms, molecules, and ions, in a substance.', array['mole','moles'], 'mole'),
    ('measurements-600-3', 'Measurements', 600, 'Represented by the symbol A, this SI base unit measures the flow of electric charge.', array['ampere','amperes'], 'ampere'),
    ('measurements-800-2', 'Measurements', 800, 'This SI base unit, represented by the symbol cd, is used to measure luminous intensity.', array['candela','candelas'], 'candela'),
    ('measurements-800-3', 'Measurements', 800, 'This SI base quantity, with the unit as the candela, is used to measure the intensity of light emitted in a particular direction.', array['luminous intensity'], 'luminous intensity'),
    ('measurements-1000-2', 'Measurements', 1000, 'This internationally recognized system provides the standard units used by scientists around the world.', array['international system of units','systeme international d''unites','systeme international d''units'], 'international system of units'),
    ('periodictable-200-2', 'Periodic Table', 200, 'These vertical columns of elements on the periodic table are also called families.', array['groups','group'], 'groups'),
    ('periodictable-200-3', 'Periodic Table', 200, 'These horizontal rows organize elements according to their increasing atomic numbers.', array['periods','period'], 'periods'),
    ('periodictable-400-2', 'Periodic Table', 400, '“These elements are generally poor conductors of heat and electricity and are found on the right side of the periodic table.', array['nonmetals','nonmetal'], 'nonmetals'),
    ('periodictable-400-3', 'Periodic Table', 400, 'This number identifies an element by indicating the number of protons in its nucleus.', array['atomic number','atomic numbers'], 'atomic number'),
    ('periodictable-600-2', 'Periodic Table', 600, 'These elements are found in Group 17 and are known for their high reactivity, especially when reacting with metals. One example of this is Chlorine', array['halogens','halogen'], 'halogens'),
    ('periodictable-800-2', 'Periodic Table', 800, 'These Group 2 elements are generally less reactive than alkali metals but still readily form positive ions.', array['alkaline earth metals','alkaline earth metal','alkaline earth'], 'alkaline earth metals'),
    ('periodictable-800-3', 'Periodic Table', 800, 'These elements occupy the central section of the periodic table, generally in Groups 3–12, and often have multiple oxidation states.', array['transition metals','transition metal','transition'], 'transition metals'),
    ('periodictable-1000-2', 'Periodic Table', 1000, 'Any of the two series of elements are displayed in separate rows below the main periodic table.', array['lanthanides and actinides','lanthanide and actinide','lanthanides','actinides','lanthanide','actinide'], 'lanthanides and actinides'),
    ('solutions-200-2', 'Solutions', 200, 'This substance dissolves the solute in a solution.', array['solvent','solvents'], 'solvent'),
    ('solutions-200-3', 'Solutions', 200, 'This is a homogeneous mixture consisting of a solute dissolved in a solvent.', array['solution','solutions'], 'solution'),
    ('solutions-400-2', 'Solutions', 400, 'This type of solution contains less dissolved solute than the maximum amount that can dissolve under given conditions.', array['unsaturated','unsaturated solution','unsaturated solutions'], 'unsaturated'),
    ('solutions-400-3', 'Solutions', 400, 'This type of solution contains more dissolved solute than a saturated solution normally holds under the same conditions.', array['supersaturated','supersaturated solution','supersaturated solutions'], 'supersaturated'),
    ('solutions-600-2', 'Solutions', 600, 'This concentration unit expresses the number of moles of solute per kilogram of solvent.', array['molality'], 'molality'),
    ('solutions-800-2', 'Solutions', 800, 'This process involves adding more solvent to a solution to decrease its concentration.', array['dilution'], 'dilution'),
    ('solutions-1000-2', 'Solutions', 1000, 'This type of mixture contains particles that are large enough to settle out over time and can often be separated through filtration.', array['suspension','suspensions'], 'suspension'),
    ('statesofmatter-200-2', 'States of Matter', 200, 'This state of matter has a definite volume but takes the shape of its container.', array['liquid','liquids'], 'liquid'),
    ('statesofmatter-200-3', 'States of Matter', 200, 'This state of matter has neither a definite shape nor a definite volume, allowing it to expand and fill its container.', array['gas','gases'], 'gas'),
    ('statesofmatter-400-2', 'States of Matter', 400, 'This phase change occurs when a liquid loses enough thermal energy for its particles to form a solid.', array['freezing'], 'freezing'),
    ('statesofmatter-400-3', 'States of Matter', 400, 'This phase change occurs when a solid gains enough energy to become a liquid.', array['melting'], 'melting'),
    ('statesofmatter-600-2', 'States of Matter', 600, 'This phase change occurs when a gas loses energy and changes into a liquid.', array['condensation'], 'condensation'),
    ('statesofmatter-800-2', 'States of Matter', 800, 'This phase change is the reverse of sublimation, as a gas changes directly into a solid.', array['deposition'], 'deposition'),
    ('statesofmatter-1000-2', 'States of Matter', 1000, 'He is widely known as the Father of Chemistry and is recognized for his contributions to early experimental chemistry and laboratory techniques.', array['antoinette lavoisier','jabir ibn hayyan'], 'jabir ibn hayyan'),
    ('thermochemistry-200-2', 'Thermochemistry', 200, 'This term refers to everything outside the system that can exchange energy with it.', array['surroundings','environment'], 'surroundings'),
    ('thermochemistry-200-3', 'Thermochemistry', 200, 'This branch of chemistry focuses on the heat absorbed or released during chemical reactions and physical changes.', array['thermochemistry'], 'thermochemistry'),
    ('thermochemistry-400-2', 'Thermochemistry', 400, 'This type of process absorbs heat from its surroundings into the system.', array['endothermic','endothermic process','endothermic processes','endothermic reaction'], 'endothermic'),
    ('thermochemistry-400-3', 'Thermochemistry', 400, 'This form of energy is transferred between objects or systems because of a difference in temperature.', array['heat'], 'heat'),
    ('thermochemistry-600-2', 'Thermochemistry', 600, 'This thermodynamic quantity represents the heat content of a system at constant pressure and is represented by the symbol H.', array['enthalpy'], 'enthalpy'),
    ('thermochemistry-600-3', 'Thermochemistry', 600, 'This is the SI unit used to measure energy, work, and heat.', array['joule','joules'], 'joule'),
    ('thermochemistry-800-2', 'Thermochemistry', 800, 'This unit of energy is defined as the amount of heat needed to raise the temperature of one gram of water by approximately one degree Celsius.', array['calorie','calories'], 'calorie'),
    ('thermochemistry-1000-2', 'Thermochemistry', 1000, 'This property describes the amount of heat required to raise the temperature of an entire object or substance by one degree Celsius.', array['heat','heat capacity'], 'heat capacity'),
    ('thermochemistry-1000-3', 'Thermochemistry', 1000, 'This property measures the amount of heat required to raise the temperature of one gram of a substance by one degree Celsius.', array['specific heat','specific heat capacity'], 'specific heat'),
on conflict (question_id) do update set
    category = excluded.category,
    points = excluded.points,
    clue = excluded.clue,
    accepted_answers = excluded.accepted_answers,
    correct_answer = excluded.correct_answer;

create or replace function public.jeopardy_pvp_action(p_user_id uuid, p_action text, p_payload jsonb default '{}'::jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
    v_profile public.profiles%rowtype;
    v_other public.profiles%rowtype;
    v_match public.jeopardy_pvp_matches%rowtype;
    v_queue private.jeopardy_pvp_queue%rowtype;
    v_question private.jeopardy_pvp_question_bank%rowtype;
    v_state jsonb;
    v_active jsonb;
    v_answer text;
    v_normalized text;
    v_position integer;
    v_other_player uuid;
    v_slot text;
    v_buzzer_slot text;
    v_done integer;
    v_awards jsonb;
    v_attempt_count integer;
begin
    if p_user_id is null or p_action not in (
        'queue', 'poll', 'ready', 'decline', 'select', 'buzz', 'answer', 'next', 'sync'
    ) then
        raise exception 'Invalid Jeopardy PvP request';
    end if;
    perform pg_advisory_xact_lock(hashtext('jeopardy-pvp-matchmaking'));

    select * into v_profile from public.profiles
    where id = p_user_id and role = 'student' and is_active = true;
    if not found then raise exception 'This account is not eligible for PvP'; end if;

    for v_match in
        select * from public.jeopardy_pvp_matches m
        where m.status = 'ready' and m.updated_at < now() - interval '3 minutes'
        for update
    loop
        update public.jeopardy_pvp_matches set status = 'cancelled',
            public_state = jsonb_set(public_state, '{status}', '"cancelled"'::jsonb),
            updated_at = now()
        where id = v_match.id;
        update private.jeopardy_pvp_queue set status = 'waiting', match_id = null,
            queued_at = now(), updated_at = now()
        where match_id = v_match.id and status = 'matched';
    end loop;
    for v_match in
        select * from public.jeopardy_pvp_matches m
        where m.status = 'in_progress' and m.updated_at < now() - interval '5 minutes'
        for update
    loop
        update public.jeopardy_pvp_matches set status = 'abandoned',
            public_state = jsonb_set(public_state, '{status}', '"abandoned"'::jsonb),
            updated_at = now()
        where id = v_match.id;
        delete from private.jeopardy_pvp_queue
        where user_id in (
            select user_id from private.jeopardy_pvp_match_members where match_id = v_match.id
        );
    end loop;
    delete from private.jeopardy_pvp_queue
    where status = 'waiting' and updated_at < now() - interval '3 minutes';

    if p_action in ('queue', 'poll', 'sync') then
        select * into v_queue from private.jeopardy_pvp_queue where user_id = p_user_id;
        if p_action = 'queue' then
            select * into v_match from public.jeopardy_pvp_matches
            where status in ('ready', 'in_progress')
              and exists (select 1 from private.jeopardy_pvp_match_members mm
                          where mm.match_id = id and mm.user_id = p_user_id)
            order by created_at desc limit 1;
            if found then
                select slot into v_slot from private.jeopardy_pvp_match_members
                where match_id = v_match.id and user_id = p_user_id;
                return jsonb_build_object('queueStatus', 'matched', 'matchId', v_match.id,
                    'status', v_match.status, 'state', v_match.public_state, 'playerSlot', v_slot);
            end if;
            if v_queue.user_id is not null and v_queue.status = 'matched' then
                select * into v_match from public.jeopardy_pvp_matches where id = v_queue.match_id;
                if found and v_match.status = 'ready' then
                    select slot into v_slot from private.jeopardy_pvp_match_members
                    where match_id = v_match.id and user_id = p_user_id;
                    update private.jeopardy_pvp_queue set updated_at = now() where user_id = p_user_id;
                    return jsonb_build_object('queueStatus', 'matched', 'matchId', v_match.id,
                        'status', v_match.status, 'state', v_match.public_state, 'playerSlot', v_slot);
                end if;
            end if;
            insert into private.jeopardy_pvp_queue(user_id, status)
            values (p_user_id, 'waiting')
            on conflict (user_id) do update set
                queued_at = case when private.jeopardy_pvp_queue.status = 'waiting'
                    then private.jeopardy_pvp_queue.queued_at else now() end,
                updated_at = now(),
                status = 'waiting',
                match_id = null;
            select q.* into v_queue from private.jeopardy_pvp_queue q
            where q.status = 'waiting' and q.user_id <> p_user_id
              and not exists (
                  select 1 from public.jeopardy_pvp_matches m
                  where m.status in ('ready', 'in_progress')
                    and exists (select 1 from private.jeopardy_pvp_match_members mm
                                where mm.match_id = m.id and mm.user_id = q.user_id)
              )
            order by q.queued_at for update skip locked limit 1;
            if found then
                select * into v_other from public.profiles
                where id = v_queue.user_id and role = 'student' and is_active = true;
                if found then
                    insert into public.jeopardy_pvp_matches (status, public_state)
                    values (
                        'ready',
                        jsonb_build_object(
                            'status', 'ready',
                            'players', jsonb_build_object(
                                'one', jsonb_build_object('name', v_other.display_name, 'ready', false, 'score', 0, 'correct', 0, 'incorrect', 0, 'base_xp', 0),
                                'two', jsonb_build_object('name', v_profile.display_name, 'ready', false, 'score', 0, 'correct', 0, 'incorrect', 0, 'base_xp', 0)
                            ),
                            'answered_positions', '[]'::jsonb,
                            'active', null,
                            'next_turn', 'one',
                            'unanswered', 0
                        )
                    ) returning * into v_match;
                    insert into private.jeopardy_pvp_match_members(match_id, user_id, slot)
                    values (v_match.id, v_queue.user_id, 'one'), (v_match.id, p_user_id, 'two');
                    insert into private.jeopardy_pvp_match_clues(match_id, position, question_id)
                    select v_match.id, row_number() over (order by p.points, cat.sort_order) - 1, q.question_id
                    from (values
                        ('Atomic Structure', 1), ('Periodic Table', 2), ('Chemical Bonding', 3),
                        ('Chemical Reactions', 4), ('Acids and Bases', 5)
                    ) as cat(category, sort_order)
                    cross join (values (200), (400), (600), (800), (1000)) as p(points)
                    join lateral (
                        select b.* from private.jeopardy_pvp_question_bank b
                        where b.category = cat.category and b.points = p.points
                        order by random() limit 1
                    ) q on true;
                    if (select count(*) from private.jeopardy_pvp_match_clues where match_id = v_match.id) <> 25 then
                        raise exception 'The PvP question board is incomplete';
                    end if;
                    update private.jeopardy_pvp_queue
                    set status = 'matched', match_id = v_match.id, updated_at = now()
                    where user_id in (v_queue.user_id, p_user_id);
                    return jsonb_build_object('queueStatus', 'matched', 'matchId', v_match.id,
                        'status', v_match.status, 'state', v_match.public_state, 'playerSlot',
                        case when p_user_id = v_queue.user_id then 'one' else 'two' end);
                end if;
            end if;
            return jsonb_build_object('queueStatus', 'searching');
        end if;

        if p_action in ('poll', 'sync') and p_payload ? 'matchId' then
            select * into v_match from public.jeopardy_pvp_matches
            where id = (p_payload ->> 'matchId')::uuid
              and exists (select 1 from private.jeopardy_pvp_match_members mm
                          where mm.match_id = id and mm.user_id = p_user_id);
            if found then
                select slot into v_slot from private.jeopardy_pvp_match_members
                where match_id = v_match.id and user_id = p_user_id;
                v_queue.match_id := v_match.id;
                v_queue.status := 'matched';
                v_queue.user_id := p_user_id;
            end if;
        end if;
        if v_queue.user_id is null then
            return jsonb_build_object('queueStatus', 'idle');
        end if;
        update private.jeopardy_pvp_queue set updated_at = now() where user_id = p_user_id;
        if v_queue.status = 'waiting' then
            return jsonb_build_object('queueStatus', 'searching');
        end if;
        select * into v_match from public.jeopardy_pvp_matches where id = v_queue.match_id;
        if not found then return jsonb_build_object('queueStatus', 'idle'); end if;
        if v_match.status in ('cancelled', 'abandoned') then
            select * into v_queue from private.jeopardy_pvp_queue where user_id = p_user_id;
            return jsonb_build_object('queueStatus', case when v_queue.status = 'waiting' then 'searching' else 'idle' end);
        end if;
        select slot into v_slot from private.jeopardy_pvp_match_members
        where match_id = v_match.id and user_id = p_user_id;
        v_state := v_match.public_state;
        if v_match.status = 'in_progress' and v_state ->> 'phase' in ('buzz', 'answer', 'steal')
           and jsonb_typeof(v_state -> 'active') = 'object'
           and (v_state #>> '{active,deadline}')::timestamptz < now() then
            v_active := v_state -> 'active';
            if v_state ->> 'phase' = 'answer' then
                v_buzzer_slot := v_state #>> '{active,buzzed_by}';
                v_state := jsonb_set(v_state, array['players', v_buzzer_slot, 'incorrect'],
                    to_jsonb(coalesce((v_state #>> array['players',v_buzzer_slot,'incorrect'])::integer,0)+1), true);
                v_state := jsonb_set(v_state, array['players', v_buzzer_slot, 'score'],
                    to_jsonb(coalesce((v_state #>> array['players',v_buzzer_slot,'score'])::integer,0)-(v_active ->> 'points')::integer), true);
                v_attempt_count := coalesce((v_active ->> 'attempts')::integer,0);
                if v_attempt_count = 0 then
                    v_state := jsonb_set(v_state, '{active,attempts}', '1'::jsonb, true);
                    v_state := jsonb_set(v_state, '{active,first_buzzer}', to_jsonb(v_buzzer_slot), true);
                    v_state := jsonb_set(v_state, '{active,buzzed_by}', 'null'::jsonb, true);
                    v_state := jsonb_set(v_state, '{active,deadline}', to_jsonb((now() + interval '10 seconds')::text), true);
                    v_state := jsonb_set(v_state, '{phase}', '"steal"'::jsonb, true);
                    select display_name into v_normalized from public.profiles
                    join private.jeopardy_pvp_match_members mm on mm.user_id = profiles.id
                    where mm.match_id = v_match.id and mm.slot = v_buzzer_slot;
                    v_state := jsonb_set(v_state, '{feedback}', to_jsonb(coalesce(v_normalized, 'Player') || ' timed out. Steal available.'), true);
                else
                    v_position := (v_active ->> 'position')::integer;
                    select q.* into v_question
                    from private.jeopardy_pvp_match_clues mc
                    join private.jeopardy_pvp_question_bank q on q.question_id = mc.question_id
                    where mc.match_id = v_match.id and mc.position = v_position;
                    v_state := jsonb_set(v_state, '{active,correct_answer}', to_jsonb(v_question.correct_answer), true);
                    v_state := jsonb_set(v_state, '{active,revealed}', 'true'::jsonb, true);
                    v_state := jsonb_set(v_state, '{active,was_correct}', 'false'::jsonb, true);
                    v_state := jsonb_set(v_state, '{phase}', '"result"'::jsonb, true);
                    v_state := jsonb_set(v_state, '{answered_positions}',
                        case when coalesce(v_state -> 'answered_positions','[]'::jsonb) @> to_jsonb(v_position)
                             then coalesce(v_state -> 'answered_positions','[]'::jsonb)
                             else coalesce(v_state -> 'answered_positions','[]'::jsonb) || to_jsonb(v_position) end, true);
                end if;
            else
                v_position := (v_active ->> 'position')::integer;
                select q.* into v_question
                from private.jeopardy_pvp_match_clues mc
                join private.jeopardy_pvp_question_bank q on q.question_id = mc.question_id
                where mc.match_id = v_match.id and mc.position = v_position;
                v_state := jsonb_set(v_state, '{active,correct_answer}', to_jsonb(v_question.correct_answer), true);
                v_state := jsonb_set(v_state, '{active,revealed}', 'true'::jsonb, true);
                v_state := jsonb_set(v_state, '{active,was_correct}', 'false'::jsonb, true);
                v_state := jsonb_set(v_state, '{phase}', '"result"'::jsonb, true);
                v_state := jsonb_set(v_state, '{unanswered}', to_jsonb(coalesce((v_state ->> 'unanswered')::integer,0)+1), true);
                v_state := jsonb_set(v_state, '{answered_positions}',
                    case when coalesce(v_state -> 'answered_positions','[]'::jsonb) @> to_jsonb(v_position)
                         then coalesce(v_state -> 'answered_positions','[]'::jsonb)
                         else coalesce(v_state -> 'answered_positions','[]'::jsonb) || to_jsonb(v_position) end, true);
            end if;
            update public.jeopardy_pvp_matches set public_state = v_state, updated_at = now()
            where id = v_match.id returning * into v_match;
        end if;
        return jsonb_build_object('queueStatus', 'matched', 'matchId', v_match.id,
            'status', v_match.status, 'state', v_match.public_state, 'playerSlot', v_slot);
    end if;

    select * into v_match from public.jeopardy_pvp_matches where id = (p_payload ->> 'matchId')::uuid;
    if not found then raise exception 'Match not found'; end if;
    select slot into v_slot from private.jeopardy_pvp_match_members
    where match_id = v_match.id and user_id = p_user_id;
    if v_slot is null then raise exception 'You are not in this match'; end if;
    v_state := v_match.public_state;

    if p_action = 'ready' then
        if v_match.status <> 'ready' then raise exception 'Match is no longer waiting for confirmation'; end if;
        v_state := jsonb_set(v_state, array['players', v_slot, 'ready'], 'true'::jsonb, true);
        if v_state #>> '{players,one,ready}' = 'true' and v_state #>> '{players,two,ready}' = 'true' then
            v_state := jsonb_set(v_state, '{status}', '"in_progress"'::jsonb, true);
            v_state := jsonb_set(v_state, '{start_at}', to_jsonb((now() + interval '3 seconds')::text), true);
            update public.jeopardy_pvp_matches
            set status = 'in_progress', started_at = now() + interval '3 seconds',
                public_state = v_state, updated_at = now()
            where id = v_match.id returning * into v_match;
        else
            update public.jeopardy_pvp_matches set public_state = v_state, updated_at = now()
            where id = v_match.id returning * into v_match;
        end if;
    elsif p_action = 'decline' then
        if v_match.status = 'ready' then
            update public.jeopardy_pvp_matches set status = 'cancelled',
                public_state = jsonb_set(public_state, '{status}', '"cancelled"'::jsonb),
                updated_at = now()
            where id = v_match.id returning * into v_match;
            delete from private.jeopardy_pvp_queue
            where user_id in (
                select user_id from private.jeopardy_pvp_match_members where match_id = v_match.id
            );
        elsif v_match.status = 'in_progress' then
            update public.jeopardy_pvp_matches set status = 'abandoned',
                public_state = jsonb_set(public_state, '{status}', '"abandoned"'::jsonb),
                updated_at = now()
            where id = v_match.id returning * into v_match;
            delete from private.jeopardy_pvp_queue
            where user_id in (
                select user_id from private.jeopardy_pvp_match_members where match_id = v_match.id
            );
        end if;
    elsif p_action = 'select' then
        if v_match.status <> 'in_progress' or v_match.started_at > now() then raise exception 'The game has not started yet'; end if;
        if v_state -> 'active' is not null and v_state -> 'active' <> 'null'::jsonb then raise exception 'Finish the current clue first'; end if;
        if v_state ->> 'next_turn' is not null and v_state ->> 'next_turn' <> v_slot then
            raise exception 'It is not your turn to choose a clue';
        end if;
        v_position := (p_payload ->> 'position')::integer;
        select q.* into v_question
        from private.jeopardy_pvp_match_clues mc
        join private.jeopardy_pvp_question_bank q on q.question_id = mc.question_id
        where mc.match_id = v_match.id and mc.position = v_position;
        if not found then raise exception 'That clue is not on this board'; end if;
        if coalesce(v_state -> 'answered_positions','[]'::jsonb) @> to_jsonb(v_position) then raise exception 'That clue has already been completed'; end if;
        v_active := jsonb_build_object(
            'position', v_position, 'category', v_question.category, 'points', v_question.points,
            'clue', v_question.clue, 'deadline', (now() + interval '30 seconds')::text,
            'attempts', 0, 'buzzed_by', null, 'first_buzzer', null, 'revealed', false,
            'selected_by', v_slot
        );
        v_state := jsonb_set(v_state, '{active}', v_active, true);
        v_state := jsonb_set(v_state, '{phase}', '"buzz"'::jsonb, true);
        v_state := v_state - 'feedback';
        update public.jeopardy_pvp_matches set public_state = v_state, updated_at = now()
        where id = v_match.id returning * into v_match;
    elsif p_action = 'buzz' then
        if v_match.status <> 'in_progress' or v_state -> 'active' is null or v_state -> 'active' = 'null'::jsonb then raise exception 'There is no active clue'; end if;
        if v_state ->> 'phase' not in ('buzz', 'steal') then raise exception 'The buzzer is closed'; end if;
        if (v_state #>> '{active,deadline}')::timestamptz <= now() then raise exception 'The buzzer time has expired'; end if;
        select user_id into v_other_player from private.jeopardy_pvp_match_members
        where match_id = v_match.id and slot <> v_slot;
        if v_state ->> 'phase' = 'steal'
           and v_state #>> '{active,first_buzzer}' = v_slot then
            raise exception 'The other player has the steal opportunity';
        end if;
        if v_state ->> 'phase' = 'buzz' then
            v_state := jsonb_set(v_state, '{active,first_buzzer}', to_jsonb(v_slot), true);
        end if;
        v_state := jsonb_set(v_state, '{phase}', '"answer"'::jsonb, true);
        v_state := jsonb_set(v_state, '{active,buzzed_by}', to_jsonb(v_slot), true);
        v_state := jsonb_set(v_state, '{active,deadline}', to_jsonb((now() + interval '10 seconds')::text), true);
        update public.jeopardy_pvp_matches set public_state = v_state, updated_at = now()
        where id = v_match.id returning * into v_match;
    elsif p_action = 'answer' then
        if v_match.status <> 'in_progress' or v_state ->> 'phase' <> 'answer'
           or v_state #>> '{active,buzzed_by}' <> v_slot
           or (v_state #>> '{active,deadline}')::timestamptz <= now() then
            raise exception 'You do not have the active answer turn';
        end if;
        if coalesce(jsonb_typeof(p_payload -> 'answer'), '') <> 'string'
           or coalesce(length(btrim(p_payload ->> 'answer')), 0) not between 1 and 120 then
            raise exception 'Enter a valid answer';
        end if;
        v_position := (v_state #>> '{active,position}')::integer;
        select q.* into v_question from private.jeopardy_pvp_match_clues mc
        join private.jeopardy_pvp_question_bank q on q.question_id = mc.question_id
        where mc.match_id = v_match.id and mc.position = v_position;
        v_answer := lower(regexp_replace(btrim(p_payload ->> 'answer'), '[^[:alnum:]]', '', 'g'));
        if exists (
            select 1 from unnest(v_question.accepted_answers) accepted(answer)
            where lower(regexp_replace(btrim(accepted.answer), '[^[:alnum:]]', '', 'g')) = v_answer
        ) then
            v_state := jsonb_set(v_state, array['players',v_slot,'correct'],
                to_jsonb(coalesce((v_state #>> array['players',v_slot,'correct'])::integer,0)+1), true);
            v_state := jsonb_set(v_state, array['players',v_slot,'score'],
                to_jsonb(coalesce((v_state #>> array['players',v_slot,'score'])::integer,0)+(v_state #>> '{active,points}')::integer), true);
            v_state := jsonb_set(v_state, array['players',v_slot,'base_xp'],
                to_jsonb(coalesce((v_state #>> array['players',v_slot,'base_xp'])::integer,0)
                    + 4 + (v_state #>> '{active,points}')::integer / 400), true);
            v_state := jsonb_set(v_state, '{active,correct_answer}', to_jsonb(v_question.correct_answer), true);
            v_state := jsonb_set(v_state, '{active,revealed}', 'true'::jsonb, true);
            v_state := jsonb_set(v_state, '{active,was_correct}', 'true'::jsonb, true);
            v_state := jsonb_set(v_state, '{phase}', '"result"'::jsonb, true);
            v_state := jsonb_set(v_state, '{answered_positions}',
                case when coalesce(v_state -> 'answered_positions','[]'::jsonb) @> to_jsonb(v_position)
                     then coalesce(v_state -> 'answered_positions','[]'::jsonb)
                     else coalesce(v_state -> 'answered_positions','[]'::jsonb) || to_jsonb(v_position) end, true);
        else
            v_state := jsonb_set(v_state, array['players',v_slot,'incorrect'],
                to_jsonb(coalesce((v_state #>> array['players',v_slot,'incorrect'])::integer,0)+1), true);
            v_state := jsonb_set(v_state, array['players',v_slot,'score'],
                to_jsonb(coalesce((v_state #>> array['players',v_slot,'score'])::integer,0)-(v_state #>> '{active,points}')::integer), true);
            v_attempt_count := coalesce((v_state #>> '{active,attempts}')::integer,0);
            if v_attempt_count = 0 then
                v_state := jsonb_set(v_state, '{active,attempts}', '1'::jsonb, true);
                v_state := jsonb_set(v_state, '{active,first_buzzer}', to_jsonb(v_slot), true);
                v_state := jsonb_set(v_state, '{active,buzzed_by}', 'null'::jsonb, true);
                v_state := jsonb_set(v_state, '{active,deadline}', to_jsonb((now() + interval '10 seconds')::text), true);
                v_state := jsonb_set(v_state, '{phase}', '"steal"'::jsonb, true);
                v_state := jsonb_set(v_state, '{feedback}', to_jsonb(v_profile.display_name || ' missed. Opponent can steal.'), true);
            else
                v_state := jsonb_set(v_state, '{active,correct_answer}', to_jsonb(v_question.correct_answer), true);
                v_state := jsonb_set(v_state, '{active,revealed}', 'true'::jsonb, true);
                v_state := jsonb_set(v_state, '{active,was_correct}', 'false'::jsonb, true);
                v_state := jsonb_set(v_state, '{phase}', '"result"'::jsonb, true);
                v_state := jsonb_set(v_state, '{answered_positions}',
                    case when coalesce(v_state -> 'answered_positions','[]'::jsonb) @> to_jsonb(v_position)
                         then coalesce(v_state -> 'answered_positions','[]'::jsonb)
                         else coalesce(v_state -> 'answered_positions','[]'::jsonb) || to_jsonb(v_position) end, true);
            end if;
        end if;
        update public.jeopardy_pvp_matches set public_state = v_state, updated_at = now()
        where id = v_match.id returning * into v_match;
    elsif p_action = 'next' then
        if v_match.status <> 'in_progress' or v_state ->> 'phase' <> 'result' then raise exception 'Resolve the current clue first'; end if;
        v_state := jsonb_set(v_state, '{active}', 'null'::jsonb, true);
        v_state := jsonb_set(v_state, '{next_turn}', to_jsonb(
            case
                when v_state #>> '{active,was_correct}' = 'true' and v_state #>> '{active,buzzed_by}' in ('one', 'two')
                    then v_state #>> '{active,buzzed_by}'
                when v_state #>> '{active,selected_by}' = 'one'
                    then 'two'
                when v_state #>> '{active,selected_by}' = 'two'
                    then 'one'
                else case when v_slot = 'one' then 'two' else 'one' end
            end
        ), true);
        v_state := v_state - 'phase' - 'feedback';
        select count(*) into v_done
        from (select distinct value from jsonb_array_elements_text(coalesce(v_state -> 'answered_positions','[]'::jsonb))) completed;
        if v_done >= 25 then
            v_awards := private.jeopardy_pvp_award_match(v_match.id, v_state);
            v_state := jsonb_set(v_state, '{status}', '"finished"'::jsonb, true);
            v_state := jsonb_set(v_state, '{awards}', v_awards, true);
            update public.jeopardy_pvp_matches set status = 'finished', finished_at = now(),
                public_state = v_state, updated_at = now() where id = v_match.id returning * into v_match;
            delete from private.jeopardy_pvp_queue where user_id in (
                select user_id from private.jeopardy_pvp_match_members where match_id = v_match.id
            );
        else
            update public.jeopardy_pvp_matches set public_state = v_state, updated_at = now()
            where id = v_match.id returning * into v_match;
        end if;
    end if;

    return jsonb_build_object('queueStatus', 'matched', 'matchId', v_match.id,
        'status', v_match.status, 'state', v_match.public_state,
        'awards', v_match.public_state -> 'awards', 'playerSlot', v_slot);
end;
$$;

revoke all on function public.jeopardy_pvp_action(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.jeopardy_pvp_action(uuid, text, jsonb) to service_role;
