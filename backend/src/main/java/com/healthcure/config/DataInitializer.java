package com.healthcure.config;

import com.healthcure.model.*;
import com.healthcure.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final RecordRepository recordRepository;
    private final AccessRepository accessRepository;
    private final AuditLogRepository auditLogRepository;
    private final DepartmentRepository departmentRepository;
    private final StaffRepository staffRepository;
    private final LabRepository labRepository;
    private final BillingRepository billingRepository;
    private final VitalsRepository vitalsRepository;
    private final DoctorScheduleRepository scheduleRepository;
    private final SettingsRepository settingsRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           PatientRepository patientRepository,
                           DoctorRepository doctorRepository,
                           AppointmentRepository appointmentRepository,
                           RecordRepository recordRepository,
                           AccessRepository accessRepository,
                           AuditLogRepository auditLogRepository,
                           DepartmentRepository departmentRepository,
                           StaffRepository staffRepository,
                           LabRepository labRepository,
                           BillingRepository billingRepository,
                           VitalsRepository vitalsRepository,
                           DoctorScheduleRepository scheduleRepository,
                           SettingsRepository settingsRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.recordRepository = recordRepository;
        this.accessRepository = accessRepository;
        this.auditLogRepository = auditLogRepository;
        this.departmentRepository = departmentRepository;
        this.staffRepository = staffRepository;
        this.labRepository = labRepository;
        this.billingRepository = billingRepository;
        this.vitalsRepository = vitalsRepository;
        this.scheduleRepository = scheduleRepository;
        this.settingsRepository = settingsRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Ensure the 10 Canonical Medical Departments exist
        List<Map<String, Object>> existingDepts = departmentRepository.findAll();
        if (existingDepts.isEmpty()) {
            departmentRepository.save("Cardiology & Vascular", "Comprehensive heart care, preventive screening and diagnostic ECG", "Dr. Rajesh Sharma");
            departmentRepository.save("Dermatology & Skin Health", "Clinical dermatology, skin barrier restoration, acne therapy and laser medicine", "Dr. Maya Patel");
            departmentRepository.save("General Medicine", "Primary healthcare exams, chronic disease management and wellness checkups", "Dr. Sarah Jenkins");
            departmentRepository.save("Gynecology & Women's Health", "Obstetric prenatal care, maternal wellness and gynecologic ultrasound", "Dr. Sunita Menon");
            departmentRepository.save("Neurology & Brain Sciences", "Neurological evaluations, cognitive disorders, epilepsy and stroke prevention", "Dr. Alexander Wright");
            departmentRepository.save("Oncology & Cancer Care", "Comprehensive oncology evaluations, cancer screenings and targeted therapy consultations", "Dr. Julian Thorne");
            departmentRepository.save("Ophthalmology & Vision Care", "Comprehensive eye examinations, cataract assessment and retinal diagnostics", "Dr. Michael Zhang");
            departmentRepository.save("Orthopedics & Joint", "Musculoskeletal rehabilitation, joint therapy and surgical consult", "Dr. David Chen");
            departmentRepository.save("Pediatrics & Family Care", "Infant and adolescent wellness, developmental tracking and immunizations", "Dr. Elena Rostova");
            departmentRepository.save("Psychiatry & Mental Health", "Evidence-based mental healthcare, mood disorders, anxiety and behavioral therapy", "Dr. Chloe Bennett");
            existingDepts = departmentRepository.findAll();
        }

        Map<String, Long> deptMap = new HashMap<>();
        for (Map<String, Object> d : existingDepts) {
            deptMap.put((String) d.get("name"), ((Number) d.get("id")).longValue());
        }

        // 2. Administrator User: Rakhi Chatterjee (Canonical Role: ADMIN)
        User savedAdmin;
        Optional<User> adminOpt = userRepository.findByEmail("admin@healthcure.local");
        if (adminOpt.isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@healthcure.local");
            admin.setPasswordHash(passwordEncoder.encode("Ra@170879"));
            admin.setRole("ADMIN");
            admin.setFirstName("Rakhi");
            admin.setLastName("Chatterjee");
            admin.setPhone("+91 9051579029");
            admin.setIsActive(true);
            admin.setIsVerified(true);
            savedAdmin = userRepository.save(admin);
        } else {
            savedAdmin = adminOpt.get();
            savedAdmin.setFirstName("Rakhi");
            savedAdmin.setLastName("Chatterjee");
            savedAdmin.setPasswordHash(passwordEncoder.encode("Ra@170879"));
            userRepository.save(savedAdmin);
        }

        // Also alias rakhi@healthcure.local
        if (userRepository.findByEmail("rakhi@healthcure.local").isEmpty()) {
            User rakhiUser = new User();
            rakhiUser.setEmail("rakhi@healthcure.local");
            rakhiUser.setPasswordHash(passwordEncoder.encode("Ra@170879"));
            rakhiUser.setRole("ADMIN");
            rakhiUser.setFirstName("Rakhi");
            rakhiUser.setLastName("Chatterjee");
            rakhiUser.setPhone("+91 9051579030");
            rakhiUser.setIsActive(true);
            rakhiUser.setIsVerified(true);
            userRepository.save(rakhiUser);
        }

        // 3. Seed at least 52 Demo Doctors across all 10 Medical Specialties
        Long cardioId = deptMap.getOrDefault("Cardiology & Vascular", 1L);
        Long dermId = deptMap.getOrDefault("Dermatology & Skin Health", 2L);
        Long genMedId = deptMap.getOrDefault("General Medicine", 3L);
        Long obgynId = deptMap.getOrDefault("Gynecology & Women's Health", 4L);
        Long neuroId = deptMap.getOrDefault("Neurology & Brain Sciences", 5L);
        Long oncId = deptMap.getOrDefault("Oncology & Cancer Care", 6L);
        Long ophthId = deptMap.getOrDefault("Ophthalmology & Vision Care", 7L);
        Long orthoId = deptMap.getOrDefault("Orthopedics & Joint", 8L);
        Long pedsId = deptMap.getOrDefault("Pediatrics & Family Care", 9L);
        Long psychId = deptMap.getOrDefault("Psychiatry & Mental Health", 10L);

        Doctor savedFirstDoc = null;

        // Group 1: Cardiology & Vascular - Demo Doctor: Dr. Debasis Mukhopadhyay
        Doctor d1 = seedDoctorIfMissing("doctor@healthcure.local", "Debasis", "Mukhopadhyay", "+91 9051579029",
                cardioId, "Cardiology & Vascular", "WB-MCI-2005-1206", "MBBS, MD, DM (Cardiology) - AIIMS New Delhi",
                19, 900.00, "Health & Cure Super Speciality Hospital, Kolkata", "Senior consultant cardiologist and clinical director with 19 years of clinical excellence in cardiovascular medicine and interventional care.");
        savedFirstDoc = d1;
        // Ensure name and password hash updated if already existing
        userRepository.findByEmail("doctor@healthcure.local").ifPresent(du -> {
            du.setFirstName("Debasis");
            du.setLastName("Mukhopadhyay");
            du.setPasswordHash(passwordEncoder.encode("De@120603"));
            userRepository.save(du);
        });

        // Also alias debasis@healthcure.local
        seedDoctorIfMissing("debasis@healthcure.local", "Debasis", "Mukhopadhyay", "+91 9051579031",
                cardioId, "Cardiology & Vascular", "WB-MCI-2005-1206-ALT", "MBBS, MD, DM (Cardiology)",
                19, 900.00, "Health & Cure Super Speciality Hospital, Kolkata", "Senior consultant cardiologist.");
        userRepository.findByEmail("debasis@healthcure.local").ifPresent(du -> {
            du.setPasswordHash(passwordEncoder.encode("De@120603"));
            userRepository.save(du);
        });

        seedDoctorIfMissing("priya.nair@healthcure.local", "Priya", "Nair", "+91 9051579029",
                cardioId, "Cardiology & Vascular", "WB-MCI-2014-8832", "MBBS, MD, DM (Cardiology) - Christian Medical College (CMC) Vellore",
                12, 800.00, "Health & Cure Advanced Heart Pavilion, Kolkata", "Cardiologist specializing in non-invasive cardiac imaging, transesophageal echocardiography, and preventive hypertension management.");

        seedDoctorIfMissing("amit.patel@healthcure.local", "Amit", "Patel", "+91 9051579029",
                cardioId, "Cardiology & Vascular", "WB-MCI-2012-7743", "MBBS, MD, DNB (Cardiology) - PGIMER Chandigarh",
                14, 900.00, "Health & Cure Heart Institute, Kolkata", "Cardiac electrophysiologist expert in arrhythmia ablation, CRT-D device implantations, and complex rhythm abnormalities.");

        seedDoctorIfMissing("sunita.sen@healthcure.local", "Sunita", "Sen", "+91 9051579029",
                cardioId, "Cardiology & Vascular", "WB-MCI-2016-6654", "MBBS, MD (Medicine), Post-Doc Cardiology - Medical College Kolkata",
                10, 750.00, "Health & Cure Cardiac Diagnostic Centre, Kolkata", "Preventive cardiologist managing lifestyle cardiovascular risk factors, lipidology, and stress test evaluations.");

        seedDoctorIfMissing("vikram.malhotra@healthcure.local", "Vikram", "Malhotra", "+91 9051579029",
                cardioId, "Cardiology & Vascular", "WB-MCI-2008-5565", "MBBS, MS, MCh (Cardiothoracic & Vascular) - KGMU Lucknow",
                18, 1200.00, "Health & Cure Vascular Pavilion, Kolkata", "Pioneering vascular surgeon specialized in endovascular aortic aneurysm repair, peripheral bypass, and varicose laser ablation.");

        // Group 2: Dermatology & Skin Health (5 Doctors)
        seedDoctorIfMissing("maya.patel@healthcure.local", "Maya", "Patel", "+91 9051579029",
                dermId, "Dermatology & Skin Health", "WB-MCI-2015-7712", "MBBS, MD (Dermatology & Venereology) - Medical College Kolkata",
                11, 750.00, "Health & Cure Skin & Laser Pavilion, Kolkata", "Clinical dermatologist dedicated to psoriasis management, chronic atopic dermatitis, autoimmune bullous diseases, and barrier therapy.");

        seedDoctorIfMissing("ananya.roy@healthcure.local", "Ananya", "Roy", "+91 9051579029",
                dermId, "Dermatology & Skin Health", "WB-MCI-2017-2231", "MBBS, MD (Dermatology) - AIIMS New Delhi",
                9, 800.00, "Health & Cure Aesthetic Dermatology Center, Kolkata", "Expert in laser scar revision, hyperpigmentation correction, phototherapy, and anti-aging dermatologic interventions.");

        seedDoctorIfMissing("suresh.kulkarni@healthcure.local", "Suresh", "Kulkarni", "+91 9051579029",
                dermId, "Dermatology & Skin Health", "WB-MCI-2011-3342", "MBBS, DVD, MD (Dermatology) - KEM Hospital Mumbai",
                15, 800.00, "Health & Cure Pediatric Skin Care Wing, Kolkata", "Specialized pediatric dermatologist treating infantile hemangiomas, atopic eczema, and genetic skin disorders.");

        seedDoctorIfMissing("deepa.swaminathan@healthcure.local", "Deepa", "Swaminathan", "+91 9051579029",
                dermId, "Dermatology & Skin Health", "WB-MCI-2018-4453", "MBBS, MD (Dermatology) - Madras Medical College (MMC)",
                8, 700.00, "Health & Cure Hair & Scalp Clinic, Kolkata", "Trichologist specializing in alopecia areata, androgenetic hair loss, PRP therapies, and inflammatory scalp conditions.");

        seedDoctorIfMissing("rohan.gupta@healthcure.local", "Rohan", "Gupta", "+91 9051579029",
                dermId, "Dermatology & Skin Health", "WB-MCI-2013-5564", "MBBS, MD (Dermatology) - PGIMER Chandigarh",
                13, 850.00, "Health & Cure Dermato-Surgery Suite, Kolkata", "Dermatosurgeon skilled in punch grafting for vitiligo, mole excision, nail surgery, and cryotherapy.");

        // Group 3: General Medicine (5 Doctors)
        seedDoctorIfMissing("sarah.jenkins@healthcure.local", "Sarah", "Jenkins", "+91 9051579029",
                genMedId, "General Medicine", "WB-MCI-2014-4412", "MBBS, MD (General Medicine) - Lady Hardinge Medical College",
                12, 600.00, "Health & Cure Ambulatory Care, Kolkata", "Primary healthcare physician specializing in chronic wellness, diabetes mellitus, essential hypertension, and routine adult health screenings.");

        seedDoctorIfMissing("rajesh.kothari@healthcure.local", "Rajesh", "Kothari", "+91 9051579029",
                genMedId, "General Medicine", "WB-MCI-2011-5521", "MBBS, MD (Internal Medicine) - IPGMER / SSKM Hospital Kolkata",
                15, 650.00, "Health & Cure Family Wellness Wing, Kolkata", "Senior internist focused on holistic family health, metabolic syndrome, diabetic neuropathy, and preventive adult immunizations.");

        seedDoctorIfMissing("kavita.deshmukh@healthcure.local", "Kavita", "Deshmukh", "+91 9051579029",
                genMedId, "General Medicine", "WB-MCI-2012-6632", "MBBS, MD (Medicine), DNB - AIIMS New Delhi",
                14, 700.00, "Health & Cure Infectious Disease Clinic, Kolkata", "Consultant physician managing tropical fevers, respiratory infections, vector-borne illnesses, and antimicrobial stewardship.");

        seedDoctorIfMissing("arvind.kumar@healthcure.local", "Arvind", "Kumar", "+91 9051579029",
                genMedId, "General Medicine", "WB-MCI-2006-7743", "MBBS, MD (General Medicine) - Grant Medical College Mumbai",
                20, 750.00, "Health & Cure Geriatric Care Center, Kolkata", "Geriatrician dedicated to comprehensive elderly care, polypharmacy review, mobility maintenance, and multi-system illness management.");

        seedDoctorIfMissing("meenakshi.sundaram@healthcure.local", "Meenakshi", "Sundaram", "+91 9051579029",
                genMedId, "General Medicine", "WB-MCI-2015-8854", "MBBS, MD (Medicine), DM (Endocrinology) - CMC Vellore",
                11, 800.00, "Health & Cure Endocrine & Metabolic Center, Kolkata", "Endocrinologist treating Type 1 and Type 2 diabetes, Hashimoto's thyroiditis, adrenal disorders, and osteoporosis.");

        // Group 4: Gynecology & Women's Health (5 Doctors)
        seedDoctorIfMissing("sunita.menon@healthcure.local", "Sunita", "Menon", "+91 9051579029",
                obgynId, "Gynecology & Women's Health", "WB-MCI-2010-1011", "MBBS, MS (Obstetrics & Gynecology) - AIIMS New Delhi",
                16, 800.00, "Health & Cure Women's Health Pavilion, Kolkata", "Senior obstetrician handling high-risk obstetrics, gestational diabetes, pre-eclampsia, and safe prenatal care.");

        seedDoctorIfMissing("ritu.bhattacharya@healthcure.local", "Ritu", "Bhattacharya", "+91 9051579029",
                obgynId, "Gynecology & Women's Health", "WB-MCI-2013-2122", "MBBS, MS (O&G), Fellowship in Gynae Laparoscopy - Kolkata",
                13, 850.00, "Health & Cure Women's Health Pavilion, Kolkata", "Laparoscopic surgeon specializing in minimally invasive myomectomy, ovarian cystectomy, and endometriosis surgery.");

        seedDoctorIfMissing("swati.das@healthcure.local", "Swati", "Das", "+91 9051579029",
                obgynId, "Gynecology & Women's Health", "WB-MCI-2016-3233", "MBBS, DGO, DNB (Obstetrics & Gynecology) - Manipal University",
                10, 900.00, "Health & Cure Fertility & Reproductive Center, Kolkata", "Reproductive medicine specialist guiding couples through infertility evaluations, ovulation tracking, and reproductive endocrinology.");

        seedDoctorIfMissing("manisha.joshi@healthcure.local", "Manisha", "Joshi", "+91 9051579029",
                obgynId, "Gynecology & Women's Health", "WB-MCI-2017-4344", "MBBS, MS (O&G) - KEM Hospital Mumbai",
                9, 700.00, "Health & Cure Youth & Adolescent Health Center, Kolkata", "Gynecologist focusing on adolescent menstrual health, polycystic ovarian syndrome (PCOS), and nutritional wellness.");

        seedDoctorIfMissing("sneha.reddy@healthcure.local", "Sneha", "Reddy", "+91 9051579029",
                obgynId, "Gynecology & Women's Health", "WB-MCI-2009-5455", "MBBS, MS (O&G), MRCOG (UK) - Osmania Medical College",
                17, 850.00, "Health & Cure Mature Women's Wellness Centre, Kolkata", "Urogynecologist treating pelvic organ prolapse, stress urinary incontinence, and perimenopausal wellness.");

        // Group 5: Neurology & Brain Sciences (5 Doctors)
        seedDoctorIfMissing("alexander.wright@healthcure.local", "Alexander", "Wright", "+91 9051579029",
                neuroId, "Neurology & Brain Sciences", "WB-MCI-2008-6611", "MBBS, MD (Medicine), DM (Neurology) - NIMHANS Bengaluru",
                18, 1000.00, "Health & Cure Neuroscience Institute, Kolkata", "Neurologist specializing in neurodegenerative diseases, Alzheimer's dementia, memory disorders, and cognitive neurorehabilitation.");

        seedDoctorIfMissing("sanjay.verma@healthcure.local", "Sanjay", "Verma", "+91 9051579029",
                neuroId, "Neurology & Brain Sciences", "WB-MCI-2011-7722", "MBBS, MD, DM (Neurology) - AIIMS New Delhi",
                15, 1000.00, "Health & Cure Comprehensive Stroke Center, Kolkata", "Lead neurovascular consultant directing acute stroke thrombolysis, secondary stroke prevention, and carotid Doppler analysis.");

        seedDoctorIfMissing("alok.mukherjee@healthcure.local", "Alok", "Mukherjee", "+91 9051579029",
                neuroId, "Neurology & Brain Sciences", "WB-MCI-2014-8833", "MBBS, MD, DM (Neurology) - PGIMER Chandigarh",
                12, 900.00, "Health & Cure Epilepsy Center, Kolkata", "Epileptologist providing video-EEG monitoring, drug-resistant epilepsy care, and sleep-related seizure evaluations.");

        seedDoctorIfMissing("pooja.iyer@healthcure.local", "Pooja", "Iyer", "+91 9051579029",
                neuroId, "Neurology & Brain Sciences", "WB-MCI-2015-9944", "MBBS, MD, DM (Neurology) - NIMHANS Bengaluru",
                11, 950.00, "Health & Cure Movement Disorders Clinic, Kolkata", "Movement disorder specialist treating Parkinson's disease, dystonia, essential tremor, and Deep Brain Stimulation (DBS) management.");

        seedDoctorIfMissing("abhinav.saxena@healthcure.local", "Abhinav", "Saxena", "+91 9051579029",
                neuroId, "Neurology & Brain Sciences", "WB-MCI-2016-1055", "MBBS, MD, DNB (Neurology) - Sree Chitra Tirunal Institute",
                10, 850.00, "Health & Cure Headache & Neuromuscular Center, Kolkata", "Neurologist specializing in chronic refractory migraine, botulinum toxin therapy for headaches, and myasthenia gravis.");

        // Group 6: Oncology & Cancer Care (5 Doctors)
        seedDoctorIfMissing("julian.thorne@healthcure.local", "Julian", "Thorne", "+91 9051579029",
                oncId, "Oncology & Cancer Care", "WB-MCI-2007-8822", "MBBS, MD (Medicine), DM (Medical Oncology) - Tata Memorial Hospital Mumbai",
                19, 1200.00, "Health & Cure Cancer Care Centre, Kolkata", "Consultant medical oncologist dedicated to genomic precision oncology, targeted therapy protocols, and compassionate cancer care.");

        seedDoctorIfMissing("rahul.banerjee@healthcure.local", "Rahul", "Banerjee", "+91 9051579029",
                oncId, "Oncology & Cancer Care", "WB-MCI-2010-9933", "MBBS, MS (Surgery), MCh (Surgical Oncology) - AIIMS New Delhi",
                16, 1100.00, "Health & Cure Surgical Oncology Wing, Kolkata", "Surgical oncologist specializing in breast-conserving cancer surgeries, sentinel lymph node dissection, and gastrointestinal tumors.");

        seedDoctorIfMissing("tanvi.chawla@healthcure.local", "Tanvi", "Chawla", "+91 9051579029",
                oncId, "Oncology & Cancer Care", "WB-MCI-2013-1044", "MBBS, MD (Radiation Oncology) - CMC Vellore",
                13, 950.00, "Health & Cure Advanced Radiation Pavilion, Kolkata", "Radiation oncologist utilizing modern IMRT, image-guided radiotherapy (IGRT), and stereotactic body radiation therapy (SBRT).");

        seedDoctorIfMissing("nitin.agarwal@healthcure.local", "Nitin", "Agarwal", "+91 9051579029",
                oncId, "Oncology & Cancer Care", "WB-MCI-2012-2155", "MBBS, MD, DM (Clinical Hematology) - PGIMER Chandigarh",
                14, 1200.00, "Health & Cure Bone Marrow Transplant Pavilion, Kolkata", "Hematologist treating acute leukemias, lymphomas, multiple myeloma, and autologous bone marrow transplantation.");

        seedDoctorIfMissing("aparna.nair@healthcure.local", "Aparna", "Nair", "+91 9051579029",
                oncId, "Oncology & Cancer Care", "WB-MCI-2014-3266", "MBBS, MS, Fellowship in Gynae Oncology - Tata Medical Center Kolkata",
                12, 1000.00, "Health & Cure Women's Cancer Screening Wing, Kolkata", "Gynecological oncologist focused on ovarian, cervical, and endometrial cancer detection, robotic cytoreduction, and colposcopy.");

        // Group 7: Ophthalmology & Vision Care (5 Doctors)
        seedDoctorIfMissing("michael.zhang@healthcure.local", "Michael", "Zhang", "+91 9051579029",
                ophthId, "Ophthalmology & Vision Care", "WB-MCI-2012-2022", "MBBS, MS (Ophthalmology) - Regional Institute of Ophthalmology Kolkata",
                14, 750.00, "Health & Cure Eye Care Centre, Kolkata", "Senior cataract and refractive surgeon performing micro-coaxial phacoemulsification, toric premium IOL implants, and LASIK vision correction.");

        seedDoctorIfMissing("gaurav.mehra@healthcure.local", "Gaurav", "Mehra", "+91 9051579029",
                ophthId, "Ophthalmology & Vision Care", "WB-MCI-2011-3133", "MBBS, MS, Fellowship in Retina - Sankara Nethralaya Chennai",
                15, 850.00, "Health & Cure Retina & Vitreous Clinic, Kolkata", "Vitreoretinal specialist managing diabetic macular edema, retinal detachment surgeries, and anti-VEGF intraocular injections.");

        seedDoctorIfMissing("sharmila.ghosh@healthcure.local", "Sharmila", "Ghosh", "+91 9051579029",
                ophthId, "Ophthalmology & Vision Care", "WB-MCI-2014-4244", "MBBS, MS (Ophthalmology), DNB - AIIMS New Delhi",
                12, 750.00, "Health & Cure Glaucoma Clinic, Kolkata", "Glaucoma specialist utilizing advanced automated perimetry, OCT optic nerve analysis, selective laser trabeculoplasty, and MIGS.");

        seedDoctorIfMissing("devendra.singh@healthcure.local", "Devendra", "Singh", "+91 9051579029",
                ophthId, "Ophthalmology & Vision Care", "WB-MCI-2013-5355", "MBBS, MS, Cornea Fellowship - LV Prasad Eye Institute Hyderabad",
                13, 800.00, "Health & Cure Cornea Center, Kolkata", "Corneal surgeon performing lamellar keratoplasty (DSAEK/DMEK), corneal cross-linking (C3R) for keratoconus, and dry eye care.");

        seedDoctorIfMissing("madhuri.dixit@healthcure.local", "Madhuri", "Dixit", "+91 9051579029",
                ophthId, "Ophthalmology & Vision Care", "WB-MCI-2015-6466", "MBBS, MS, Pediatric Ophthalmology - Aravind Eye Hospital",
                11, 700.00, "Health & Cure Pediatric Eye Wing, Kolkata", "Pediatric ophthalmologist managing strabismus / squint correction, amblyopia therapy, and congenital pediatric cataracts.");

        // Group 8: Orthopedics & Joint (5 Doctors)
        seedDoctorIfMissing("david.chen@healthcure.local", "David", "Chen", "+91 9051579029",
                orthoId, "Orthopedics & Joint", "WB-MCI-2009-8819", "MBBS, MS (Orthopedics) - AIIMS New Delhi",
                17, 950.00, "Health & Cure Orthopedic Pavilion, Kolkata", "Joint replacement surgeon specializing in robotic total knee and hip arthroplasty, unicompartmental knee resurfacing, and joint preservation.");

        seedDoctorIfMissing("anita.roy@healthcure.local", "Anita", "Roy", "+91 9051579029",
                orthoId, "Orthopedics & Joint", "WB-MCI-2012-7741", "MBBS, MS (Orthopedics), Spine Fellowship - Christian Medical College Vellore",
                14, 1000.00, "Health & Cure Spine Institute, Kolkata", "Spine surgeon skilled in minimally invasive microdiscectomy, lumbar spinal stabilization, and adolescent scoliosis correction.");

        seedDoctorIfMissing("harish.prasad@healthcure.local", "Harish", "Prasad", "+91 9051579029",
                orthoId, "Orthopedics & Joint", "WB-MCI-2014-8852", "MBBS, MS (Orthopedics) - King George's Medical University Lucknow",
                12, 850.00, "Health & Cure Sports Injury Clinic, Kolkata", "Sports medicine specialist treating arthroscopic ACL/PCL reconstructions, multi-ligament knee injuries, and shoulder labral tears.");

        seedDoctorIfMissing("tarun.sethi@healthcure.local", "Tarun", "Sethi", "+91 9051579029",
                orthoId, "Orthopedics & Joint", "WB-MCI-2015-9963", "MBBS, MS (Orthopedics) - PGIMER Chandigarh",
                11, 800.00, "Health & Cure Pediatric Orthopedics Wing, Kolkata", "Pediatric orthopedic surgeon treating congenital talipes equinovarus (clubfoot), developmental dysplasia of the hip, and limb deformities.");

        seedDoctorIfMissing("pradeep.rao@healthcure.local", "Pradeep", "Rao", "+91 9051579029",
                orthoId, "Orthopedics & Joint", "WB-MCI-2010-1074", "MBBS, MS (Orthopedics), DNB - Madras Medical College",
                16, 900.00, "Health & Cure Trauma Center, Kolkata", "Trauma and reconstructive surgeon managing complex peri-articular fractures, pelvic-acetabular trauma, and non-union bone complications.");

        // Group 9: Pediatrics & Family Care (5 Doctors)
        seedDoctorIfMissing("elena.rostova@healthcure.local", "Elena", "Rostova", "+91 9051579029",
                pedsId, "Pediatrics & Family Care", "WB-MCI-2011-2201", "MBBS, MD (Pediatrics) - Institute of Child Health Kolkata",
                15, 650.00, "Health & Cure Children's Health Center, Kolkata", "Compassionate pediatrician committed to newborn development, infant nutrition, childhood milestones, and systematic immunization programs.");

        seedDoctorIfMissing("vikram.sen@healthcure.local", "Vikram", "Sen", "+91 9051579029",
                pedsId, "Pediatrics & Family Care", "WB-MCI-2013-3310", "MBBS, MD (Pediatrics) - AIIMS New Delhi",
                13, 750.00, "Health & Cure Children's Respiratory Clinic, Kolkata", "Pediatric pulmonologist specializing in childhood asthma management, recurrent wheezing, respiratory allergies, and cystic fibrosis.");

        seedDoctorIfMissing("neha.kapoor@healthcure.local", "Neha", "Kapoor", "+91 9051579029",
                pedsId, "Pediatrics & Family Care", "WB-MCI-2014-4421", "MBBS, MD, DM (Neonatology) - PGIMER Chandigarh",
                12, 800.00, "Health & Cure Neonatal Intensive Care Pavilion, Kolkata", "Neonatologist caring for extremely low birth weight newborns, neonatal intensive care (NICU), and high-risk infant follow-up.");

        seedDoctorIfMissing("shalini.sengupta@healthcure.local", "Shalini", "Sengupta", "+91 9051579029",
                pedsId, "Pediatrics & Family Care", "WB-MCI-2016-5532", "MBBS, MD (Pediatrics) - Medical College Kolkata",
                10, 700.00, "Health & Cure Child Development Center, Kolkata", "Developmental pediatrician assessing attention deficit hyperactivity disorder (ADHD), autism spectrum, and behavioral delays.");

        seedDoctorIfMissing("ashok.nambiar@healthcure.local", "Ashok", "Nambiar", "+91 9051579029",
                pedsId, "Pediatrics & Family Care", "WB-MCI-2008-6643", "MBBS, DCH, MD (Pediatrics) - CMC Vellore",
                18, 750.00, "Health & Cure Family Wellness Wing, Kolkata", "Senior pediatrician managing acute pediatric infections, preventive adolescent healthcare, and pediatric lifestyle guidance.");

        // Group 10: Psychiatry & Mental Health (7 Doctors)
        seedDoctorIfMissing("chloe.bennett@healthcure.local", "Chloe", "Bennett", "+91 9051579029",
                psychId, "Psychiatry & Mental Health", "WB-MCI-2012-9931", "MBBS, MD (Psychiatry) - Central Institute of Psychiatry (CIP) Ranchi",
                14, 850.00, "Health & Cure Behavioral Health Wing, Kolkata", "Adult psychiatrist offering compassionate evidence-based treatment for major depressive disorder, generalized anxiety, and panic states.");

        seedDoctorIfMissing("siddharth.basu@healthcure.local", "Siddharth", "Basu", "+91 9051579029",
                psychId, "Psychiatry & Mental Health", "WB-MCI-2010-1142", "MBBS, MD (Psychiatry) - NIMHANS Bengaluru",
                16, 900.00, "Health & Cure Mind & Recovery Center, Kolkata", "Addiction psychiatrist leading medical detoxification, relapse prevention, behavioral modification, and dual diagnosis therapy.");

        seedDoctorIfMissing("vandana.hegde@healthcure.local", "Vandana", "Hegde", "+91 9051579029",
                psychId, "Psychiatry & Mental Health", "WB-MCI-2015-2253", "MBBS, MD (Psychiatry) - PGIMER Chandigarh",
                11, 800.00, "Health & Cure Child & Adolescent Mental Health, Kolkata", "Child psychiatrist treating adolescent depression, academic anxiety, obsessive-compulsive disorder (OCD), and family counseling.");

        seedDoctorIfMissing("indrani.chakraborty@healthcure.local", "Indrani", "Chakraborty", "+91 9051579029",
                psychId, "Psychiatry & Mental Health", "WB-MCI-2013-3364", "MBBS, MD (Psychiatry) - IPGMER / SSKM Hospital Kolkata",
                13, 800.00, "Health & Cure Senior Mental Health Clinic, Kolkata", "Geriatric psychiatrist managing late-life cognitive decline, depression in elderly patients, and caregiver supportive therapy.");

        seedDoctorIfMissing("kalyan.sundaram@healthcure.local", "Kalyan", "Sundaram", "+91 9051579029",
                psychId, "Psychiatry & Mental Health", "WB-MCI-2011-4475", "MBBS, MD (Psychiatry), DNB - AIIMS New Delhi",
                15, 850.00, "Health & Cure Neuropsychiatric Center, Kolkata", "Neuropsychiatrist treating sleep-wake rhythm disorders, psychosomatic illnesses, somatoform distress, and chronic stress conditions.");

        seedDoctorIfMissing("rashmi.ganguly@healthcure.local", "Rashmi", "Ganguly", "+91 9051579029",
                psychId, "Psychiatry & Mental Health", "WB-MCI-2016-5586", "MBBS, MD (Psychiatry) - Medical College Kolkata",
                10, 750.00, "Health & Cure Psychological Wellness Center, Kolkata", "Psychiatrist focused on cognitive behavioral psychotherapy for phobias, health anxiety, emotional resilience, and corporate burnout.");

        seedDoctorIfMissing("bimal.datta@healthcure.local", "Bimal", "Datta", "+91 9051579029",
                psychId, "Psychiatry & Mental Health", "WB-MCI-2009-6697", "MBBS, DPM, MD (Psychiatry) - R.G. Kar Medical College Kolkata",
                17, 800.00, "Health & Cure Behavioral Health Wing, Kolkata", "Senior clinician offering holistic family psychiatric care, stress management, marital counseling, and mood stability.");

        // 4. Seed Default Indian Patient (Debosmita Mukhopadhyay, password - 123456789)
        Optional<User> patientUserOpt = userRepository.findByEmail("patient@healthcure.local");
        Patient savedPatient;
        if (patientUserOpt.isEmpty()) {
            User patientUser = new User();
            patientUser.setEmail("patient@healthcure.local");
            patientUser.setPasswordHash(passwordEncoder.encode("123456789"));
            patientUser.setRole("PATIENT");
            patientUser.setFirstName("Debosmita");
            patientUser.setLastName("Mukhopadhyay");
            patientUser.setPhone("+91 9051579029");
            patientUser.setIsActive(true);
            patientUser.setIsVerified(true);
            User savedPatientUser = userRepository.save(patientUser);

            Patient patient = new Patient();
            patient.setUserId(savedPatientUser.getId());
            patient.setDateOfBirth(LocalDate.of(2003, 6, 12));
            patient.setGender("Female");
            patient.setBloodGroup("A+");
            patient.setAddress("Health & Cure Super Speciality Hospital Campus, Salt Lake Sector V, Kolkata, West Bengal - 700091, India");
            patient.setEmergencyContact("+91 9051579029");
            savedPatient = patientRepository.save(patient);
        } else {
            User pUser = patientUserOpt.get();
            pUser.setFirstName("Debosmita");
            pUser.setLastName("Mukhopadhyay");
            pUser.setPasswordHash(passwordEncoder.encode("123456789"));
            userRepository.save(pUser);
            savedPatient = patientRepository.findByUserId(pUser.getId()).orElse(null);
        }

        // Also alias debosmita@healthcure.local
        if (userRepository.findByEmail("debosmita@healthcure.local").isEmpty()) {
            User deboUser = new User();
            deboUser.setEmail("debosmita@healthcure.local");
            deboUser.setPasswordHash(passwordEncoder.encode("123456789"));
            deboUser.setRole("PATIENT");
            deboUser.setFirstName("Debosmita");
            deboUser.setLastName("Mukhopadhyay");
            deboUser.setPhone("+91 9051579032");
            deboUser.setIsActive(true);
            deboUser.setIsVerified(true);
            User savedDebo = userRepository.save(deboUser);

            Patient deboPat = new Patient();
            deboPat.setUserId(savedDebo.getId());
            deboPat.setDateOfBirth(LocalDate.of(2003, 6, 12));
            deboPat.setGender("Female");
            deboPat.setBloodGroup("A+");
            deboPat.setAddress("Health & Cure Super Speciality Hospital Campus, Salt Lake Sector V, Kolkata, West Bengal - 700091, India");
            deboPat.setEmergencyContact("+91 9051579029");
            patientRepository.save(deboPat);
        }

        if (savedPatient != null && savedFirstDoc != null) {
            // Patient Vitals
            vitalsRepository.save(savedPatient.getId(), "118/76", 68, 98.4, 14, 99, 22.4, 88.0);

            // Medical Records
            MedicalRecord record1 = new MedicalRecord();
            record1.setPatientId(savedPatient.getId());
            record1.setDoctorId(savedFirstDoc.getId());
            record1.setRecordType("REPORT");
            record1.setTitle("Comprehensive Cardiovascular Examination");
            record1.setDescription("Resting 12-lead ECG showed regular sinus rhythm at 68 bpm. Blood pressure: 118/76 mmHg. No signs of ischemia or conduction delay.");
            record1.setFileType("application/pdf");
            recordRepository.save(record1);

            MedicalRecord record2 = new MedicalRecord();
            record2.setPatientId(savedPatient.getId());
            record2.setDoctorId(savedFirstDoc.getId());
            record2.setRecordType("CONSULTATION");
            record2.setTitle("Annual Preventive Health Consultation");
            record2.setDescription("Patient is active and asymptomatic. Advised continuance of balanced dietary pattern and 150 minutes weekly aerobic activity.");
            record2.setFileType("text/plain");
            recordRepository.save(record2);

            // Month 1 Appointment (November 2026)
            Appointment appt = new Appointment();
            appt.setPatientId(savedPatient.getId());
            appt.setDoctorId(savedFirstDoc.getId());
            appt.setPatientName("Debosmita Mukhopadhyay");
            appt.setPatientEmail("patient@healthcure.local");
            appt.setPatientPhone("+91 9051579029");
            appt.setSpecialty("Cardiology & Vascular");
            appt.setConsultationType("In-Clinic Visit");
            appt.setTimeSlot("Morning (09:00 - 12:00)");
            appt.setPreferredDoctor("Dr. Rajesh Sharma");
            appt.setAppointmentDate(LocalDateTime.now().plusDays(4));
            appt.setStatus("CONFIRMED");
            appt.setReferenceCode("HC-DEMO-001");
            Appointment savedAppt = appointmentRepository.save(appt);

            // Month 2 Appointment (December 2026)
            Appointment apptDec = new Appointment();
            apptDec.setPatientId(savedPatient.getId());
            apptDec.setDoctorId(savedFirstDoc.getId());
            apptDec.setPatientName("Debosmita Mukhopadhyay");
            apptDec.setPatientEmail("patient@healthcure.local");
            apptDec.setPatientPhone("+91 9051579029");
            apptDec.setSpecialty("Dermatology & Skin Health");
            apptDec.setConsultationType("In-Clinic Visit");
            apptDec.setTimeSlot("Afternoon (12:00 - 15:00)");
            apptDec.setPreferredDoctor("Dr. Maya Patel");
            apptDec.setAppointmentDate(LocalDateTime.now().plusDays(33));
            apptDec.setStatus("CONFIRMED");
            apptDec.setReferenceCode("HC-DEMO-002");
            appointmentRepository.save(apptDec);

            // Month 3 Appointment (January 2027)
            Appointment apptJan = new Appointment();
            apptJan.setPatientId(savedPatient.getId());
            apptJan.setDoctorId(savedFirstDoc.getId());
            apptJan.setPatientName("Debosmita Mukhopadhyay");
            apptJan.setPatientEmail("patient@healthcure.local");
            apptJan.setPatientPhone("+91 9051579029");
            apptJan.setSpecialty("Neurology & Brain Sciences");
            apptJan.setConsultationType("Telemedicine Video");
            apptJan.setTimeSlot("Evening (15:00 - 18:00)");
            apptJan.setPreferredDoctor("Dr. Alexander Wright");
            apptJan.setAppointmentDate(LocalDateTime.now().plusDays(67));
            apptJan.setStatus("CONFIRMED");
            apptJan.setReferenceCode("HC-DEMO-003");
            appointmentRepository.save(apptJan);

            // Billing in Indian Rupees (₹)
            billingRepository.createInvoice(savedPatient.getId(), savedAppt.getId(), "HC-INV-2026-001", 850.00, "PAID", "UPI / Card", "Cardiology Consultation & Diagnostic Record Archive");

            // Active Consent Handshake
            AccessRequest access = new AccessRequest();
            access.setDoctorId(savedFirstDoc.getId());
            access.setPatientId(savedPatient.getId());
            access.setStatus("APPROVED");
            access.setReason("Pre-consultation cardiac medical history inspection");
            access.setRequestedAt(LocalDateTime.now().minusHours(24));
            access.setRespondedAt(LocalDateTime.now().minusHours(20));
            access.setExpiresAt(LocalDateTime.now().plusDays(6));
            accessRepository.save(access);
        }

        // 5. Diagnostic Laboratory Catalog in Indian Rupees (₹)
        if (labRepository.findAllTests().isEmpty()) {
            labRepository.saveTest("Complete Blood Count (CBC)", "Hematology", 250.00, "Measures red blood cells, white blood cells, and platelets.", "Fasting not strictly required.");
            labRepository.saveTest("Comprehensive Metabolic Panel (CMP)", "Biochemistry", 450.00, "Assesses kidney function, liver function, and electrolyte balances.", "10-12 hour fasting required.");
            labRepository.saveTest("Lipid Panel & Cholesterol Breakdown", "Cardiology & Vascular", 350.00, "Measures Total, HDL, LDL cholesterol, and Triglycerides.", "12 hour fasting required.");
            labRepository.saveTest("Resting 12-Lead Electrocardiogram (ECG)", "Cardiology & Vascular", 500.00, "Records electrical signals of the heart.", "Avoid caffeine 4 hours prior.");
        }

        // 6. Hospital Operational Staff
        staffRepository.save("EMP-101", "Ramesh Sen", "ramesh@healthcure.local", "Receptionist", cardioId, "+91 9051579029");
        staffRepository.save("EMP-102", "Sunita Paul", "sunita.paul@healthcure.local", "Nurse Coordinator", cardioId, "+91 9051579029");
        staffRepository.save("EMP-103", "Dipak Mandal", "dipak@healthcure.local", "Laboratory Technician", dermId, "+91 9051579029");

        // 7. System Settings
        settingsRepository.set("center_name", "Health & Cure Super Speciality Hospital, Kolkata");
        settingsRepository.set("emergency_phone", "+91 9051579029");
        settingsRepository.set("record_retention_years", "7");
        settingsRepository.set("consultation_buffer_minutes", "15");

        // 8. Audit Log
        auditLogRepository.log(savedAdmin.getId(), "SYSTEM_INIT", "PLATFORM", savedAdmin.getId(), "Health & Cure multi-specialty platform initialized with 50+ demo doctors across 10 canonical medical departments.", "127.0.0.1");
    }

    private Doctor seedDoctorIfMissing(String email, String firstName, String lastName, String phone,
                                       Long departmentId, String specialisation, String licenceNumber,
                                       String qualification, int experienceYears, double consultationFee,
                                       String hospitalAffiliation, String biography) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            Optional<Doctor> existingDoc = doctorRepository.findByUserId(existingUser.get().getId());
            if (existingDoc.isPresent()) {
                return existingDoc.get();
            }
        }

        User docUser = new User();
        docUser.setEmail(email);
        docUser.setPasswordHash(passwordEncoder.encode("Doctor@123"));
        docUser.setRole("DOCTOR");
        docUser.setFirstName(firstName);
        docUser.setLastName(lastName);
        docUser.setPhone(phone);
        docUser.setIsActive(true);
        docUser.setIsVerified(true);
        User savedUser = userRepository.save(docUser);

        Doctor doctor = new Doctor();
        doctor.setUserId(savedUser.getId());
        doctor.setDepartmentId(departmentId);
        doctor.setSpecialisation(specialisation);
        doctor.setLicenceNumber(licenceNumber);
        doctor.setQualification(qualification);
        doctor.setExperienceYears(experienceYears);
        doctor.setConsultationFee(consultationFee);
        doctor.setHospitalAffiliation(hospitalAffiliation);
        doctor.setBiography(biography);
        doctor.setVerifiedByAdmin(true);
        doctor.setVerifiedAt(LocalDateTime.now().minusMonths(experienceYears > 10 ? 8 : 4));
        Doctor savedDoctor = doctorRepository.save(doctor);

        scheduleRepository.save(savedDoctor.getId(), "Monday", "09:00", "17:00", 30);
        scheduleRepository.save(savedDoctor.getId(), "Wednesday", "09:00", "17:00", 30);
        scheduleRepository.save(savedDoctor.getId(), "Friday", "09:00", "15:00", 30);

        return savedDoctor;
    }
}
