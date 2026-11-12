import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://localhost:8080"

def post(url, data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(f"{BASE_URL}{url}", data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as res:
            return res.status, json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8")
    except Exception as e:
        return 0, str(e)

def get(url, token=None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(f"{BASE_URL}{url}", headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req) as res:
            return res.status, json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8")
    except Exception as e:
        return 0, str(e)

def options(url):
    req = urllib.request.Request(f"{BASE_URL}{url}", method="OPTIONS")
    req.add_header("Origin", "http://localhost:5173")
    req.add_header("Access-Control-Request-Method", "POST")
    req.add_header("Access-Control-Request-Headers", "authorization,content-type")
    try:
        with urllib.request.urlopen(req) as res:
            headers = dict(res.info())
            return res.status, headers
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers)
    except Exception as e:
        return 0, str(e)

results = []

def run_test(name, test_fn):
    try:
        success, msg = test_fn()
        results.append((name, success, msg))
        status = "PASSED" if success else "FAILED"
        print(f"[{status}] {name}: {msg}")
    except Exception as e:
        results.append((name, False, str(e)))
        print(f"[FAILED] {name}: {e}")

print("=== STARTING SYSTEM INTEGRATION TEST ===")

# 1. CORS Preflight
def test_cors():
    status, headers = options("/api/patient/dashboard")
    allow_origin = headers.get("access-control-allow-origin") or headers.get("Access-Control-Allow-Origin")
    allow_cred = headers.get("access-control-allow-credentials") or headers.get("Access-Control-Allow-Credentials")
    if status == 200 and allow_origin == "http://localhost:5173" and allow_cred == "true":
        return True, f"CORS preflight HTTP {status}, Origin={allow_origin}, Cred={allow_cred}"
    return False, f"CORS preflight status={status}, headers={headers}"
run_test("CORS Preflight Check", test_cors)

# 2. Public Endpoints
def test_public_endpoints():
    s1, r1 = get("/api/doctors/public")
    if s1 != 200:
        return False, f"/api/doctors/public returned {s1}"
    doc_count = len(r1) if isinstance(r1, list) else 0

    s2, r2 = get("/api/public/departments")
    if s2 != 200:
        return False, f"/api/public/departments returned {s2}"
    dept_count = len(r2) if isinstance(r2, list) else 0

    s3, r3 = get("/api/public/stats")
    if s3 != 200:
        return False, f"/api/public/stats returned {s3}"

    return True, f"Public endpoints ok (Doctors: {doc_count}, Departments: {dept_count})"
run_test("Public Endpoints", test_public_endpoints)

# 3. Patient Authentication & Workflow
patient_token = None
patient_id = None
def test_patient_auth_and_flow():
    global patient_token, patient_id
    # Login
    s, r = post("/api/auth/login", {"email": "patient@healthcure.local", "password": "Patient@123"})
    if s != 200:
        return False, f"Patient login failed with {s}: {r}"
    patient_token = r.get("token")
    patient_id = r.get("patientId")
    blood_group = r.get("bloodGroup")

    # Dashboard
    s_dash, r_dash = get("/api/patient/dashboard", patient_token)
    if s_dash != 200:
        return False, f"Patient dashboard returned {s_dash}"

    # Book Appointment
    book_data = {
        "doctorId": 1,
        "date": "2026-11-20",
        "timeSlot": "10:00 - 10:30 AM",
        "consultationType": "In-Clinic Visit",
        "notes": "E2E integration test appointment"
    }
    s_app, r_app = post("/api/appointments/book", book_data, patient_token)
    if s_app != 200:
        return False, f"Appointment booking returned {s_app}: {r_app}"

    # Book Lab Test
    lab_data = {
        "testName": "Lipid Profile",
        "category": "Cardiology & Vascular",
        "price": 600,
        "date": "2026-11-22",
        "slot": "09:00 - 10:00 AM"
    }
    s_lab, r_lab = post("/api/patient/lab-tests/book", lab_data, patient_token)
    if s_lab != 200:
        return False, f"Lab test booking returned {s_lab}: {r_lab}"

    # Add Vitals
    vitals_data = {
        "heartRate": 74,
        "systolic": 118,
        "diastolic": 78,
        "spO2": 99,
        "temperature": 98.4
    }
    s_vit, r_vit = post("/api/patient/vitals", vitals_data, patient_token)
    if s_vit != 200:
        return False, f"Vitals add returned {s_vit}: {r_vit}"

    return True, f"Patient logged in (PAT-{patient_id}, BG={blood_group}), dashboard loaded, appointment booked, lab booked, vitals recorded."
run_test("Patient Workflow", test_patient_auth_and_flow)

# 4. Doctor Authentication & Workflow
doctor_token = None
def test_doctor_flow():
    global doctor_token
    # Login
    s, r = post("/api/auth/login", {"email": "doctor@healthcure.local", "password": "Doctor@123"})
    if s != 200:
        return False, f"Doctor login failed with {s}: {r}"
    doctor_token = r.get("token")

    # Dashboard
    s_dash, r_dash = get("/api/doctor/dashboard", doctor_token)
    if s_dash != 200:
        return False, f"Doctor dashboard returned {s_dash}"

    # Appointments
    s_app, r_app = get("/api/doctor/appointments", doctor_token)
    if s_app != 200:
        return False, f"Doctor appointments returned {s_app}"

    # Patients list
    s_pts, r_pts = get("/api/doctor/patients", doctor_token)
    if s_pts != 200:
        return False, f"Doctor patients list returned {s_pts}"

    return True, f"Doctor logged in, dashboard loaded, {len(r_app)} appointments found, {len(r_pts)} patients found."
run_test("Doctor Workflow", test_doctor_flow)

# 5. Admin Authentication & Workflow
admin_token = None
def test_admin_flow():
    global admin_token
    # Login
    s, r = post("/api/auth/login", {"email": "admin@healthcure.local", "password": "Admin@123"})
    if s != 200:
        return False, f"Admin login failed with {s}: {r}"
    admin_token = r.get("token")

    # Dashboard
    s_dash, r_dash = get("/api/admin/dashboard", admin_token)
    if s_dash != 200:
        return False, f"Admin dashboard returned {s_dash}"

    # Add Staff
    staff_data = {
        "name": "Dr. Sarah Jenkins",
        "email": "sarah.jenkins@healthcure.local",
        "role": "DOCTOR",
        "department": "Cardiology & Vascular"
    }
    s_stf, r_stf = post("/api/admin/staff", staff_data, admin_token)
    if s_stf != 200:
        return False, f"Admin add staff returned {s_stf}: {r_stf}"

    # Add Lab Test
    lab_data = {
        "name": "Complete Blood Count (CBC)",
        "category": "Hematology",
        "price": 350,
        "turnaround": "12 hours"
    }
    s_lab, r_lab = post("/api/admin/lab-tests", lab_data, admin_token)
    if s_lab != 200:
        return False, f"Admin add lab test returned {s_lab}: {r_lab}"

    # Update Settings
    setting_data = {
        "systemName": "Health & Cure Super Specialty Hospital",
        "emergencyHotline": "+91 9051579029",
        "address": "Kolkata, West Bengal, India"
    }
    s_set, r_set = post("/api/admin/settings", setting_data, admin_token)
    if s_set != 200:
        return False, f"Admin update settings returned {s_set}: {r_set}"

    return True, f"Admin logged in, dashboard loaded, staff created, lab test registered, settings saved."
run_test("Admin Workflow", test_admin_flow)

print("\n=== SUMMARY ===")
all_passed = all(success for _, success, _ in results)
if all_passed:
    print("ALL TESTS PASSED SUCCESSFULLY!")
else:
    print("SOME TESTS FAILED!")
    sys.exit(1)
