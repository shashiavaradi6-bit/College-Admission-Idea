from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)
def test_health_marks_demo_data():
    response=client.get("/health")
    assert response.status_code == 200 and response.json()["data_mode"] == "demonstration"
def test_college_filter_and_detail():
    assert client.get("/api/v1/colleges", params={"state":"Karnataka"}).json()
    assert client.get("/api/v1/colleges/missing").status_code == 404
def test_rank_match_exact_dimensions_only():
    payload={"rank":1000,"exam":"KCET","year":2024,"category":"GM","quota":"State","round":2}
    rows=client.post("/api/v1/college-matches",json=payload).json()
    assert rows and all(x["college"]["data_status"] == "demonstration" for x in rows)
    by_id={x["college"]["id"]:x["tier"] for x in rows}
    assert by_id["rvce"] == "ambitious"  # rank 1000 is worse than closing rank 834
    assert by_id["pes"] == "safer"     # rank 1000 is better than closing rank 4821
    payload["year"]=2025
    assert client.post("/api/v1/college-matches",json=payload).json() == []

def test_nvidia_model_name_can_be_configured_without_live_call(monkeypatch):
    import openai
    captured={}
    class FakeCompletions:
        def create(self, **kwargs):
            captured.update(kwargs)
            return type("Response", (), {"choices":[type("Choice", (), {"message":type("Message", (), {"content":"Mock response"})()})()]})()
    class FakeClient:
        def __init__(self, **kwargs):
            captured["base_url"]=kwargs["base_url"]
            self.chat=type("Chat", (), {"completions":FakeCompletions()})()
    monkeypatch.setattr(openai, "OpenAI", FakeClient)
    monkeypatch.setenv("NVIDIA_API_KEY", "test-key")
    monkeypatch.delenv("NVIDIA_MODEL", raising=False)
    result=client.post("/api/v1/chat",json={"message":"Explain historical cutoffs"}).json()
    assert result["mode"] == "nvidia"
    assert captured["model"] == "nvidia/nemotron-3.5-lightning-30b-a3b"
    assert captured["base_url"] == "https://integrate.api.nvidia.com/v1"
def test_chat_graceful_without_key(monkeypatch):
    monkeypatch.delenv("NVIDIA_API_KEY",raising=False)
    response=client.post("/api/v1/chat",json={"message":"How do cutoffs work?"})
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "nvidia_not_configured"

def test_chat_retrieves_matching_records_and_labels_demo_data(monkeypatch):
    import openai
    captured={}
    class FakeCompletions:
        def create(self, **kwargs):
            captured.update(kwargs)
            return type("Response", (), {"choices":[type("Choice", (), {"message":type("Message", (), {"content":"These are demo records."})()})()]})()
    class FakeClient:
        def __init__(self, **kwargs):
            self.chat=type("Chat", (), {"completions":FakeCompletions()})()
    monkeypatch.setattr(openai, "OpenAI", FakeClient)
    monkeypatch.setenv("NVIDIA_API_KEY", "test-key")
    response=client.post("/api/v1/chat",json={"message":"Compare my options", "context":{"course":"Computer Science", "state":"Karnataka"}})
    assert response.status_code == 200
    payload=response.json()
    assert payload["mode"] == "nvidia"
    assert payload["sources"]
    assert all(source["status"] == "demonstration" for source in payload["sources"])
    system_message=next(item["content"] for item in captured["messages"] if item["role"] == "system")
    assert "Never invent colleges" in system_message
    assert "PES University" in system_message
    assert "R.V. College" in system_message
    assert "BMS College" not in system_message
    assert "Mysore" not in system_message

def test_ai_status_does_not_expose_secret(monkeypatch):
    monkeypatch.setenv("NVIDIA_API_KEY", "secret-value")
    response=client.get("/api/v1/ai/status")
    assert response.status_code == 200
    assert response.json()["configured"] is True
    assert "secret-value" not in response.text



def test_course_catalog_and_category_filter():
    catalog=client.get("/api/v1/courses").json()["categories"]
    assert any(course.startswith("BE / BTech") for course in catalog["Engineering & Technology"])
    assert any(course == "MBBS" for course in catalog["Medical & Healthcare"])
    assert any(course.startswith("BDS") for course in catalog["Medical & Healthcare"])
    assert any(course.startswith("BBA") for course in catalog["Business, Commerce & Management"])
    assert any(course.startswith("BCA") for course in catalog["Computer Applications & IT"])
    assert any(course.startswith("B.Com") for course in catalog["Business, Commerce & Management"])
    engineering=client.get("/api/v1/colleges",params={"category":"Engineering & Technology"}).json()
    medical=client.get("/api/v1/colleges",params={"category":"Medical & Healthcare"}).json()
    assert len(engineering)==4 and medical==[]
