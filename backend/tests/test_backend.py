"""Backend tests for e-HUFFAZ AL-AKHYAR API"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://e-huffaz.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"
SHARED_PASSWORD = "akhyar2026"
EXPECTED_TOKEN = "ehuffaz-akhyar-2026-token"
HALAQAH_IDS = ["haikal", "syafiq", "amir", "atiqah", "nawwar"]


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/auth/login", json={"password": SHARED_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Auth ----------
class TestAuth:
    def test_login_success(self):
        r = requests.post(f"{API}/auth/login", json={"password": SHARED_PASSWORD}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["token"] == EXPECTED_TOKEN
        assert "message" in data

    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login", json={"password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_protected_without_token(self):
        r = requests.get(f"{API}/buletin", timeout=15)
        assert r.status_code == 401

    def test_protected_with_bad_token(self):
        r = requests.get(f"{API}/buletin", headers={"Authorization": "Bearer bad"}, timeout=15)
        assert r.status_code == 401


# ---------- Halaqahs & Students ----------
class TestHalaqahs:
    def test_get_halaqahs_public(self):
        r = requests.get(f"{API}/halaqahs", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 5
        ids = [h["id"] for h in data]
        assert set(ids) == set(HALAQAH_IDS)
        for h in data:
            assert "name" in h and "teacher" in h
            assert "_id" not in h

    def test_get_students_requires_auth(self):
        r = requests.get(f"{API}/halaqahs/haikal/students", timeout=15)
        assert r.status_code == 401

    def test_get_students_haikal(self, auth_headers):
        r = requests.get(f"{API}/halaqahs/haikal/students", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # header should be filtered
        for s in data:
            assert s["nama"].strip().lower() not in ("nama pelajar", "nama", "bil")
            assert "_id" not in s
            assert s["halaqah_id"] == "haikal"

    def test_get_students_invalid_halaqah(self, auth_headers):
        r = requests.get(f"{API}/halaqahs/unknown/students", headers=auth_headers, timeout=15)
        assert r.status_code == 404

    def test_add_extra_student(self, auth_headers):
        payload = {"nama": "TEST_Pelajar Tambahan"}
        r = requests.post(f"{API}/halaqahs/haikal/students", json=payload, headers=auth_headers, timeout=15)
        assert r.status_code == 200
        doc = r.json()
        assert doc["nama"] == "TEST_Pelajar Tambahan"
        assert doc["source"] == "db"
        assert doc["halaqah_id"] == "haikal"
        assert doc["id"].startswith("db_")

        # Verify persistence
        r2 = requests.get(f"{API}/halaqahs/haikal/students", headers=auth_headers, timeout=30)
        assert r2.status_code == 200
        names = [s["nama"] for s in r2.json()]
        assert "TEST_Pelajar Tambahan" in names


# ---------- Buletin CRUD ----------
class TestBuletin:
    def test_buletin_crud(self, auth_headers):
        payload = {"tajuk": "TEST_Tajuk", "memo": "TEST memo", "penghantar": "TEST Pengirim", "tarikh": "2026-01-15"}
        r = requests.post(f"{API}/buletin", json=payload, headers=auth_headers, timeout=15)
        assert r.status_code == 200
        created = r.json()
        assert created["tajuk"] == "TEST_Tajuk"
        assert "id" in created and "_id" not in created
        bid = created["id"]

        r2 = requests.get(f"{API}/buletin", headers=auth_headers, timeout=15)
        assert r2.status_code == 200
        items = r2.json()
        assert any(b["id"] == bid for b in items)
        assert all("_id" not in b for b in items)

        r3 = requests.delete(f"{API}/buletin/{bid}", headers=auth_headers, timeout=15)
        assert r3.status_code == 200
        assert r3.json().get("ok") is True

        r4 = requests.delete(f"{API}/buletin/{bid}", headers=auth_headers, timeout=15)
        assert r4.status_code == 404


# ---------- Tasmi ----------
class TestTasmi:
    created_ids = []

    def test_create_tasmi(self, auth_headers):
        payload = {
            "halaqah_id": "haikal", "student_id": "TEST_s1", "student_nama": "TEST_Ali",
            "tarikh": "2026-01-15", "mod": "hafazan_baru", "juzuk_surah": "Juz 1",
            "muka_surat": "1", "keputusan": "mumtaz"
        }
        r = requests.post(f"{API}/tasmi", json=payload, headers=auth_headers, timeout=15)
        assert r.status_code == 200, r.text
        doc = r.json()
        assert doc["mod"] == "hafazan_baru"
        assert doc["keputusan"] == "mumtaz"
        assert "id" in doc and "_id" not in doc
        TestTasmi.created_ids.append(doc["id"])

        # Add more for analytics
        for mod, kep in [("murajaah", "jayyid"), ("hafazan_baru", "daif"),
                         ("tilawah", "mumtaz"), ("hafazan_baru", "gagal_hantar"),
                         ("hafazan_baru", "tidak_hadir")]:
            p = {**payload, "mod": mod, "keputusan": kep}
            rr = requests.post(f"{API}/tasmi", json=p, headers=auth_headers, timeout=15)
            assert rr.status_code == 200
            TestTasmi.created_ids.append(rr.json()["id"])

    def test_list_tasmi_filters(self, auth_headers):
        r = requests.get(f"{API}/tasmi", params={"halaqah_id": "haikal"}, headers=auth_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert all(t["halaqah_id"] == "haikal" for t in data)
        assert all("_id" not in t for t in data)

        r2 = requests.get(f"{API}/tasmi", params={"halaqah_id": "haikal", "mod": "hafazan_baru", "month": "2026-01"}, headers=auth_headers, timeout=15)
        assert r2.status_code == 200
        for t in r2.json():
            assert t["mod"] == "hafazan_baru"
            assert t["tarikh"].startswith("2026-01")

        r3 = requests.get(f"{API}/tasmi", params={"student_id": "TEST_s1"}, headers=auth_headers, timeout=15)
        assert r3.status_code == 200
        assert all(t["student_id"] == "TEST_s1" for t in r3.json())

    def test_delete_tasmi(self, auth_headers):
        if not TestTasmi.created_ids:
            pytest.skip("no records created")
        rid = TestTasmi.created_ids[0]
        r = requests.delete(f"{API}/tasmi/{rid}", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        r2 = requests.delete(f"{API}/tasmi/{rid}", headers=auth_headers, timeout=15)
        assert r2.status_code == 404


# ---------- Analytics ----------
class TestAnalytics:
    def test_pending_halaqahs(self, auth_headers):
        r = requests.get(f"{API}/analytics/pending-halaqahs", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "tarikh" in d and "pending" in d
        assert d["jumlah_total"] == 5
        assert isinstance(d["pending"], list)

    def test_top_students(self, auth_headers):
        r = requests.get(f"{API}/analytics/top-students", params={"month": "2026-01"}, headers=auth_headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "hafazan_baru" in d and "murajaah" in d
        assert isinstance(d["hafazan_baru"], list)

    def test_top_halaqahs(self, auth_headers):
        r = requests.get(f"{API}/analytics/top-halaqahs", params={"month": "2026-01"}, headers=auth_headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d, list)
        assert len(d) == 5
        for h in d:
            for k in ["halaqah_id", "name", "hafazan_baru", "murajaah", "mumtaz", "jayyid", "daif", "total"]:
                assert k in h

    def test_overall(self, auth_headers):
        r = requests.get(f"{API}/analytics/overall", params={"month": "2026-01"}, headers=auth_headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        for k in ["hantar", "tidak_hantar", "tidak_hadir", "total"]:
            assert k in d
            assert isinstance(d[k], int)

    def test_weak_students(self, auth_headers):
        r = requests.get(f"{API}/analytics/weak-students", params={"month": "2026-01"}, headers=auth_headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        for k in ["kerap_gagal", "kerap_tidak_hadir", "kerap_daif"]:
            assert k in d and isinstance(d[k], list)

    def test_halaqah_report(self, auth_headers):
        r = requests.get(f"{API}/analytics/halaqah-report", params={"halaqah_id": "haikal", "month": "2026-01"}, headers=auth_headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["halaqah_id"] == "haikal"
        assert d["month"] == "2026-01"
        assert "summary" in d and "records" in d
        for k in ["hafazan_baru", "murajaah", "mumtaz", "jayyid", "daif", "gagal_hantar", "tidak_hadir", "total"]:
            assert k in d["summary"]

    def test_student_performance(self, auth_headers):
        r = requests.get(f"{API}/analytics/student-performance", params={"halaqah_id": "haikal"}, headers=auth_headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d, list)
        for s in d:
            assert "student_id" in s and "daily" in s
            assert isinstance(s["daily"], list)


# ---------- Cleanup ----------
def test_zz_cleanup(auth_headers):
    # delete remaining test tasmi records
    r = requests.get(f"{API}/tasmi", params={"student_id": "TEST_s1"}, headers=auth_headers, timeout=15)
    if r.status_code == 200:
        for t in r.json():
            requests.delete(f"{API}/tasmi/{t['id']}", headers=auth_headers, timeout=15)
    # delete test buletin if any leftover
    rb = requests.get(f"{API}/buletin", headers=auth_headers, timeout=15)
    if rb.status_code == 200:
        for b in rb.json():
            if b.get("tajuk", "").startswith("TEST_"):
                requests.delete(f"{API}/buletin/{b['id']}", headers=auth_headers, timeout=15)
