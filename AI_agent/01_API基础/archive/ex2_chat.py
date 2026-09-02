import os
import json
import requests

BASE_URL = os.environ["LLM_BASE_URL"] 
API_KEY  = os.environ["LLM_API_KEY"]
MODEL    = os.environ["LLM_MODEL"]

def chat_with_llm(json_data):
    resp = requests.post(
        f"{BASE_URL}/chat/completions",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json=json_data,
        timeout=60
    )
    print(resp.status_code)
    print(json.dumps(resp.json(), ensure_ascii=False, indent=2))
    llm_back_json = resp.json().get("choices", [])
    message = llm_back_json[0].get("message", {})
    result = {
        "role": message.get("role"),
        "content": message.get("content")
    }
    json_data["messages"].append(result)
    

llm_json = {
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": "你是一个了解Palantir Foundry和Ontology的专家"},
                    {"role": "user", "content": "用一句话解释什么是 Foundry 和 Ontology"},
                ],
                # "max_tokens": 100,
            }

chat_with_llm(llm_json)
llm_json["messages"].append({"role": "user", "content": "请再详细解释一下 Foundry 和 Ontology"})
chat_with_llm(llm_json)
llm_json["messages"].append({"role": "user", "content": "我叫 Zoney, 你能帮我写一段介绍 Foundry 和 Ontology 的文案吗？"})
chat_with_llm(llm_json)
llm_json["messages"].append({"role": "user", "content": "请帮我写一段介绍 Foundry 和 Ontology 的文案，要求使用文言文风格"})
chat_with_llm(llm_json)
llm_json["messages"].append({"role": "user", "content": "我是谁？"})
chat_with_llm(llm_json)
llm_json["messages"].append({"role": "user", "content": "我今年100岁"})
chat_with_llm(llm_json)
llm_json["messages"].append({"role": "user", "content": "复述一下刚刚介绍Foundry 和 Ontology的文言文文案"})
chat_with_llm(llm_json)
llm_json["messages"].append({"role": "user", "content": "我多少岁"})
chat_with_llm(llm_json)
