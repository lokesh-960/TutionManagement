import requests
import json

BASE_URL = 'http://localhost:8000/api'

def run_test():
    print("--- Phase 2 Verification ---")

    # 1. List Branches
    print("\n1. Testing Branch List (Public)...")
    try:
        res = requests.get(f'{BASE_URL}/auth/branches/')
        if res.status_code == 200:
            print("SUCCESS: Branches listed:", len(res.json()))
        else:
            print("FAILED:", res.text)
    except Exception as e:
        print("FAILED:", e)

    # 2. Signup New Branch
    print("\n2. Testing Signup...")
    signup_data = {
        "branch_name": "Phase2 Branch",
        "username": "phase2admin",
        "password": "password123"
    }
    token = None
    try:
        # Check if user exists first to avoid error on re-run
        # We'll just try to login first
        login_res = requests.post(f'{BASE_URL}/auth/login/', json={"username": "phase2admin", "password": "password123"})
        if login_res.status_code == 200:
             print("User already exists, logging in...")
             token = login_res.json()['access']
        else:
            res = requests.post(f'{BASE_URL}/auth/signup/', json=signup_data)
            if res.status_code == 201:
                print("SUCCESS: Signup successful")
                token = res.json()['access']
            else:
                print("FAILED Signup:", res.text)
                return
    except Exception as e:
        print("FAILED:", e)
        return

    if not token:
        print("No token, aborting.")
        return

    headers = {'Authorization': f'Bearer {token}'}

    # 3. Check Profile (New Field)
    print("\n3. Testing Profile & Fee Due Day...")
    try:
        res = requests.get(f'{BASE_URL}/auth/profile/', headers=headers)
        if res.status_code == 200:
            data = res.json()
            if 'fee_due_day' in data:
                print(f"SUCCESS: fee_due_day is {data['fee_due_day']}")
            else:
                print("FAILED: fee_due_day missing")
        else:
            print("FAILED:", res.text)
    except Exception as e:
        print("FAILED:", e)

    # 4. Add Student with Gender
    print("\n4. Testing Add Student (Gender)...")
    student_data = {
        "name": "Phase2 Student",
        "gender": "Female",
        "standard": "10th",
        "parent_name": "Parent",
        "parent_phone": "9876543210",
        "monthly_fee": 1000,
        "join_date": "2023-01-01"
    }
    try:
        res = requests.post(f'{BASE_URL}/students/', json=student_data, headers=headers)
        if res.status_code == 201:
            print("SUCCESS: Student added")
            student_id = res.json()['id']
        else:
            print("FAILED Add Student:", res.text)
            return
    except Exception as e:
        print("FAILED:", e)
        return

    # 5. List Students & Verify
    print("\n5. Verifying Student Data...")
    try:
        res = requests.get(f'{BASE_URL}/students/', headers=headers)
        if res.status_code == 200:
            students = res.json()
            found = next((s for s in students if s['id'] == student_id), None)
            if found and found.get('gender') == 'Female':
                 print("SUCCESS: Student found with correct Gender")
            else:
                 print("FAILED: Student gender mismatch or not found")
        else:
            print("FAILED:", res.text)
    except Exception as e:
        print("FAILED:", e)

    # 6. Dashboard Logic
    print("\n6. Testing Dashboard...")
    try:
        res = requests.get(f'{BASE_URL}/dashboard/', headers=headers)
        if res.status_code == 200:
            dash = res.json()
            print("SUCCESS: Dashboard loaded")
            print(f"Due Count: {dash['due_count']}")
            # We expect due count to be at least 1 (the new student, if no fee paid)
            if dash['due_count'] >= 1:
                print("SUCCESS: Logic correctly identifies due student")
            else:
                print("WARNING: Logic might be missing due student (check logic)")
        else:
            print("FAILED:", res.text)
    except Exception as e:
        print("FAILED:", e)

if __name__ == '__main__':
    run_test()
