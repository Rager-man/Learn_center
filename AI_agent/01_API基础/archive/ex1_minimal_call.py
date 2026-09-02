# 01_API基础/ex1_minimal_call.py —— 起步骨架
# 单轮最小调用：亲手拼出整个请求，看清每一层
import os
import json
import requests

BASE_URL = os.environ["LLM_BASE_URL"]   # §0 设置的环境变量
API_KEY  = os.environ["LLM_API_KEY"]
MODEL    = os.environ["LLM_MODEL"]

resp = requests.post(
    f"{BASE_URL}/chat/completions",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "model": MODEL,
        "messages": [
            {"role": "system", "content": "你是一个只用文言文回答的助手"},
            {"role": "user", "content": "用一句话解释什么是 token"},
        ],
        # "max_tokens": 100,
    },
    timeout=60,
)
print(resp.status_code)
print(json.dumps(resp.json(), ensure_ascii=False, indent=2))